package model

import "time"

const (
	CampaignStatusDraft     = "draft"
	CampaignStatusScheduled = "scheduled"
	CampaignStatusRunning   = "running"
	CampaignStatusCompleted = "completed"
	CampaignStatusFailed    = "failed"

	ChannelEmail    = "email"
	ChannelWhatsApp = "whatsapp"
	ChannelBoth     = "both"

	RecipientPending = "pending"
	RecipientSent    = "sent"
	RecipientFailed  = "failed"
	RecipientSkipped = "skipped"
)

type Campaign struct {
	ID              uint                `gorm:"primaryKey" json:"id"`
	Name            string              `gorm:"size:200;not null" json:"name"`
	Subject         string              `gorm:"size:500" json:"subject"`
	EmailBody       string              `gorm:"type:text" json:"emailBody"`
	WhatsAppBody    string              `gorm:"type:text" json:"whatsappBody"`
	Channel         string              `gorm:"type:varchar(20);not null;default:'email'" json:"channel"`
	Status          string              `gorm:"type:varchar(20);not null;default:'draft';index" json:"status"`
	ScheduledAt     *time.Time          `json:"scheduledAt"`
	CompletedAt     *time.Time          `json:"completedAt"`
	FilterServiceID *uint               `json:"filterServiceId"`
	FilterStatus    string              `gorm:"size:50" json:"filterStatus"`
	FilterDateFrom  *time.Time          `json:"filterDateFrom"`
	FilterDateTo    *time.Time          `json:"filterDateTo"`
	Recipients      []CampaignRecipient `gorm:"foreignKey:CampaignID" json:"recipients,omitempty"`
	CreatedAt       time.Time           `json:"createdAt"`
	UpdatedAt       time.Time           `json:"updatedAt"`
}

type CampaignRecipient struct {
	ID         uint       `gorm:"primaryKey" json:"id"`
	CampaignID uint       `gorm:"not null;index" json:"campaignId"`
	Name       string     `gorm:"size:200" json:"name"`
	Email      string     `gorm:"size:200" json:"email"`
	Phone      string     `gorm:"size:20" json:"phone"`
	Status     string     `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	Error      string     `gorm:"type:text" json:"error,omitempty"`
	SentAt     *time.Time `json:"sentAt,omitempty"`
}
