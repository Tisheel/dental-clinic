package service

import (
	"errors"
	"time"

	"clinic-backend/model"
	"clinic-backend/store"
)

type CampaignService struct {
	campaignStore *store.CampaignStore
}

func NewCampaignService(campaignStore *store.CampaignStore) *CampaignService {
	return &CampaignService{campaignStore: campaignStore}
}

func (s *CampaignService) Create(c *model.Campaign) error {
	c.Status = model.CampaignStatusDraft
	return s.campaignStore.Create(c)
}

func (s *CampaignService) GetByID(id uint) (*model.Campaign, error) {
	return s.campaignStore.GetByID(id)
}

func (s *CampaignService) List() ([]model.Campaign, error) {
	return s.campaignStore.List()
}

func (s *CampaignService) Update(id uint, req *model.Campaign) (*model.Campaign, error) {
	existing, err := s.campaignStore.GetByID(id)
	if err != nil {
		return nil, err
	}
	if existing.Status != model.CampaignStatusDraft {
		return nil, errors.New("only draft campaigns can be edited")
	}

	existing.Name = req.Name
	existing.Subject = req.Subject
	existing.EmailBody = req.EmailBody
	existing.WhatsAppBody = req.WhatsAppBody
	existing.Channel = req.Channel
	existing.ScheduledAt = req.ScheduledAt
	existing.FilterServiceID = req.FilterServiceID
	existing.FilterStatus = req.FilterStatus
	existing.FilterDateFrom = req.FilterDateFrom
	existing.FilterDateTo = req.FilterDateTo

	if err := s.campaignStore.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *CampaignService) Delete(id uint) error {
	c, err := s.campaignStore.GetByID(id)
	if err != nil {
		return err
	}
	if c.Status == model.CampaignStatusRunning {
		return errors.New("cannot delete a running campaign")
	}
	return s.campaignStore.Delete(id)
}

func (s *CampaignService) Schedule(id uint) (*model.Campaign, error) {
	c, err := s.campaignStore.GetByID(id)
	if err != nil {
		return nil, err
	}
	if c.Status != model.CampaignStatusDraft {
		return nil, errors.New("only draft campaigns can be scheduled")
	}
	if c.ScheduledAt == nil {
		now := time.Now()
		c.ScheduledAt = &now
	}

	// Populate recipients from filters
	if err := s.campaignStore.PopulateRecipients(c); err != nil {
		return nil, err
	}

	c.Status = model.CampaignStatusScheduled
	if err := s.campaignStore.Update(c); err != nil {
		return nil, err
	}

	// Reload with recipients
	return s.campaignStore.GetByID(id)
}

func (s *CampaignService) PreviewRecipients(id uint) ([]model.CampaignRecipient, error) {
	c, err := s.campaignStore.GetByID(id)
	if err != nil {
		return nil, err
	}
	return s.campaignStore.PreviewRecipients(c)
}

func (s *CampaignService) PreviewRecipientsFromFilters(serviceID uint, status, dateFrom, dateTo string) ([]model.CampaignRecipient, error) {
	c := &model.Campaign{
		FilterStatus: status,
	}
	if serviceID > 0 {
		c.FilterServiceID = &serviceID
	}
	if dateFrom != "" {
		t, err := time.Parse("2006-01-02", dateFrom)
		if err == nil {
			c.FilterDateFrom = &t
		}
	}
	if dateTo != "" {
		t, err := time.Parse("2006-01-02", dateTo)
		if err == nil {
			c.FilterDateTo = &t
		}
	}
	return s.campaignStore.PreviewRecipients(c)
}

func (s *CampaignService) AddRecipient(campaignID uint, r *model.CampaignRecipient) error {
	c, err := s.campaignStore.GetByID(campaignID)
	if err != nil {
		return err
	}
	if c.Status != model.CampaignStatusDraft {
		return errors.New("can only add recipients to draft campaigns")
	}
	r.CampaignID = campaignID
	r.Status = model.RecipientPending
	return s.campaignStore.AddRecipient(r)
}

func (s *CampaignService) DeleteRecipient(campaignID, recipientID uint) error {
	return s.campaignStore.DeleteRecipient(campaignID, recipientID)
}

func (s *CampaignService) GetRecipientStats(campaignID uint) (total, sent, failed, skipped int64) {
	return s.campaignStore.GetRecipientStats(campaignID)
}
