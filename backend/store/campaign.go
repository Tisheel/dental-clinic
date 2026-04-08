package store

import (
	"strings"

	"clinic-backend/model"

	"gorm.io/gorm"
)

type CampaignStore struct {
	db *gorm.DB
}

func NewCampaignStore(db *gorm.DB) *CampaignStore {
	return &CampaignStore{db: db}
}

func (s *CampaignStore) Create(c *model.Campaign) error {
	return s.db.Create(c).Error
}

func (s *CampaignStore) GetByID(id uint) (*model.Campaign, error) {
	var c model.Campaign
	err := s.db.Preload("Recipients").First(&c, id).Error
	return &c, err
}

func (s *CampaignStore) List() ([]model.Campaign, error) {
	var campaigns []model.Campaign
	err := s.db.Order("created_at desc").Find(&campaigns).Error
	return campaigns, err
}

func (s *CampaignStore) Update(c *model.Campaign) error {
	return s.db.Save(c).Error
}

func (s *CampaignStore) Delete(id uint) error {
	// Delete recipients first, then campaign
	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("campaign_id = ?", id).Delete(&model.CampaignRecipient{}).Error; err != nil {
			return err
		}
		return tx.Delete(&model.Campaign{}, id).Error
	})
}

func (s *CampaignStore) AddRecipient(r *model.CampaignRecipient) error {
	return s.db.Create(r).Error
}

func (s *CampaignStore) DeleteRecipient(campaignID, recipientID uint) error {
	return s.db.Where("id = ? AND campaign_id = ?", recipientID, campaignID).Delete(&model.CampaignRecipient{}).Error
}

// PreviewRecipients returns deduplicated patients matching the campaign filters
func (s *CampaignStore) PreviewRecipients(c *model.Campaign) ([]model.CampaignRecipient, error) {
	query := s.db.Model(&model.Appointment{}).
		Select("MAX(user_name) as name, LOWER(TRIM(email)) as email, TRIM(phone_number) as phone").
		Group("LOWER(TRIM(email)), TRIM(phone_number)")

	if c.FilterServiceID != nil && *c.FilterServiceID > 0 {
		query = query.Where("service_id = ?", *c.FilterServiceID)
	}
	if c.FilterStatus != "" {
		query = query.Where("status = ?", c.FilterStatus)
	}
	if c.FilterDateFrom != nil {
		query = query.Where("slot >= ?", *c.FilterDateFrom)
	}
	if c.FilterDateTo != nil {
		query = query.Where("slot <= ?", *c.FilterDateTo)
	}

	var recipients []model.CampaignRecipient
	err := query.Find(&recipients).Error
	return recipients, err
}

// PopulateRecipients fills the campaign_recipients table from filters + keeps any manually added ones
func (s *CampaignStore) PopulateRecipients(campaign *model.Campaign) error {
	filtered, err := s.PreviewRecipients(campaign)
	if err != nil {
		return err
	}

	// Get existing manual recipients
	var existing []model.CampaignRecipient
	s.db.Where("campaign_id = ?", campaign.ID).Find(&existing)

	// Build a set of existing email+phone to avoid duplicates (normalized)
	seen := make(map[string]bool)
	for _, r := range existing {
		seen[strings.ToLower(strings.TrimSpace(r.Email))+"|"+strings.TrimSpace(r.Phone)] = true
	}

	var toAdd []model.CampaignRecipient
	for _, r := range filtered {
		key := strings.ToLower(strings.TrimSpace(r.Email)) + "|" + strings.TrimSpace(r.Phone)
		if !seen[key] {
			seen[key] = true
			toAdd = append(toAdd, model.CampaignRecipient{
				CampaignID: campaign.ID,
				Name:       r.Name,
				Email:      r.Email,
				Phone:      r.Phone,
				Status:     model.RecipientPending,
			})
		}
	}

	if len(toAdd) > 0 {
		return s.db.CreateInBatches(&toAdd, 100).Error
	}
	return nil
}

// GetRecipientStats returns sent/failed/skipped/pending counts for a campaign
func (s *CampaignStore) GetRecipientStats(campaignID uint) (total, sent, failed, skipped int64) {
	s.db.Model(&model.CampaignRecipient{}).Where("campaign_id = ?", campaignID).Count(&total)
	s.db.Model(&model.CampaignRecipient{}).Where("campaign_id = ? AND status = ?", campaignID, model.RecipientSent).Count(&sent)
	s.db.Model(&model.CampaignRecipient{}).Where("campaign_id = ? AND status = ?", campaignID, model.RecipientFailed).Count(&failed)
	s.db.Model(&model.CampaignRecipient{}).Where("campaign_id = ? AND status = ?", campaignID, model.RecipientSkipped).Count(&skipped)
	return
}
