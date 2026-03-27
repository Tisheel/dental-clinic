package processor

import (
	"log"
	"strings"
	"time"

	"campaign-cron/sender"

	"gorm.io/gorm"
)

// Campaign mirrors the backend model (read-only in cron)
type Campaign struct {
	ID           uint `gorm:"primaryKey"`
	Name         string
	Subject      string
	EmailBody    string
	WhatsAppBody string `gorm:"column:whats_app_body"`
	Channel      string
	Status       string
	ScheduledAt  *time.Time
	CompletedAt  *time.Time
}

func (Campaign) TableName() string { return "campaigns" }

type Recipient struct {
	ID         uint `gorm:"primaryKey"`
	CampaignID uint
	Name       string
	Email      string
	Phone      string
	Status     string
	Error      string
	SentAt     *time.Time
}

func (Recipient) TableName() string { return "campaign_recipients" }

type Processor struct {
	db       *gorm.DB
	email    *sender.EmailSender
	whatsapp *sender.WhatsAppSender
}

func New(db *gorm.DB, email *sender.EmailSender, whatsapp *sender.WhatsAppSender) *Processor {
	return &Processor{db: db, email: email, whatsapp: whatsapp}
}

func (p *Processor) Run() {
	log.Println("cron: checking for scheduled campaigns...")

	var campaigns []Campaign
	p.db.Where("status = ? AND scheduled_at <= ?", "scheduled", time.Now()).Find(&campaigns)

	if len(campaigns) == 0 {
		log.Println("cron: no campaigns to process")
		return
	}

	for _, c := range campaigns {
		p.processCampaign(c)
	}
}

func (p *Processor) processCampaign(c Campaign) {
	log.Printf("cron: processing campaign #%d '%s' (channel: %s)", c.ID, c.Name, c.Channel)

	// Validate credentials before starting
	if err := p.validateCredentials(c.Channel); err != nil {
		log.Printf("cron: campaign #%d failed — %s", c.ID, err)
		now := time.Now()
		p.db.Model(&Campaign{}).Where("id = ?", c.ID).Updates(map[string]interface{}{
			"status":       "failed",
			"completed_at": now,
		})
		// Mark all pending recipients as failed
		p.db.Model(&Recipient{}).Where("campaign_id = ? AND status = ?", c.ID, "pending").Updates(map[string]interface{}{
			"status":  "failed",
			"error":   err.Error(),
			"sent_at": now,
		})
		return
	}

	// Mark as running
	p.db.Model(&Campaign{}).Where("id = ?", c.ID).Update("status", "running")

	var recipients []Recipient
	p.db.Where("campaign_id = ? AND status = ?", c.ID, "pending").Find(&recipients)

	if len(recipients) == 0 {
		log.Printf("cron: campaign #%d has no pending recipients, marking completed", c.ID)
		now := time.Now()
		p.db.Model(&Campaign{}).Where("id = ?", c.ID).Updates(map[string]interface{}{
			"status":       "completed",
			"completed_at": now,
		})
		return
	}

	// Deduplicate: track which email/phone combos we've already sent to in this run
	sentEmails := make(map[string]bool)
	sentPhones := make(map[string]bool)

	for _, r := range recipients {
		p.sendToRecipient(c, r, sentEmails, sentPhones)
	}

	// Check if all done (no more pending)
	var pendingCount int64
	p.db.Model(&Recipient{}).Where("campaign_id = ? AND status = ?", c.ID, "pending").Count(&pendingCount)

	if pendingCount == 0 {
		now := time.Now()
		p.db.Model(&Campaign{}).Where("id = ?", c.ID).Updates(map[string]interface{}{
			"status":       "completed",
			"completed_at": now,
		})
		log.Printf("cron: campaign #%d completed", c.ID)
	} else {
		// Still has pending recipients, set back to scheduled for next run
		p.db.Model(&Campaign{}).Where("id = ?", c.ID).Update("status", "scheduled")
		log.Printf("cron: campaign #%d has %d remaining recipients, will continue next run", c.ID, pendingCount)
	}
}

func (p *Processor) validateCredentials(channel string) error {
	var missing []string

	if channel == "email" || channel == "both" {
		if !p.email.IsConfigured() {
			missing = append(missing, "SMTP/email not configured")
		}
	}
	if channel == "whatsapp" || channel == "both" {
		if !p.whatsapp.IsConfigured() {
			missing = append(missing, "WhatsApp not configured")
		}
	}

	if len(missing) > 0 {
		return &configError{msg: strings.Join(missing, "; ")}
	}
	return nil
}

type configError struct {
	msg string
}

func (e *configError) Error() string {
	return e.msg
}

func (p *Processor) sendToRecipient(c Campaign, r Recipient, sentEmails, sentPhones map[string]bool) {
	var emailErr, waErr error
	emailSent := false
	whatsappSent := false
	emailDup := false
	phoneDup := false

	email := strings.TrimSpace(strings.ToLower(r.Email))
	phone := strings.TrimSpace(r.Phone)

	if c.Channel == "email" || c.Channel == "both" {
		if email != "" {
			if sentEmails[email] {
				emailDup = true
			} else {
				emailErr = p.email.Send(r.Email, c.Subject, c.EmailBody)
				if emailErr == nil {
					emailSent = true
					sentEmails[email] = true
				}
			}
		}
	}

	if c.Channel == "whatsapp" || c.Channel == "both" {
		if phone != "" {
			if sentPhones[phone] {
				phoneDup = true
			} else {
				waErr = p.whatsapp.Send(r.Phone, c.WhatsAppBody)
				if waErr == nil {
					whatsappSent = true
					sentPhones[phone] = true
				}
			}
		}
	}

	now := time.Now()
	anySent := emailSent || whatsappSent
	anyErr := emailErr != nil || waErr != nil

	// Build reasons for missing contact info
	var reasons []string
	if (c.Channel == "email" || c.Channel == "both") && email == "" {
		reasons = append(reasons, "no email address")
	}
	if (c.Channel == "whatsapp" || c.Channel == "both") && phone == "" {
		reasons = append(reasons, "no phone number")
	}
	if emailDup {
		reasons = append(reasons, "duplicate email "+email)
	}
	if phoneDup {
		reasons = append(reasons, "duplicate phone "+phone)
	}

	// Everything was skipped (no contact info or all duplicates)
	if !anySent && !anyErr {
		errMsg := "skipped: " + strings.Join(reasons, "; ")
		p.db.Model(&Recipient{}).Where("id = ?", r.ID).Updates(map[string]interface{}{
			"status":  "skipped",
			"error":   errMsg,
			"sent_at": now,
		})
		log.Printf("cron: skipped %s: %s", r.Name, errMsg)
		return
	}

	// At least one channel had an error
	if anyErr {
		errMsg := ""
		if emailErr != nil {
			errMsg += "email: " + emailErr.Error()
		}
		if waErr != nil {
			if errMsg != "" {
				errMsg += "; "
			}
			errMsg += "whatsapp: " + waErr.Error()
		}
		for _, reason := range reasons {
			errMsg += "; " + reason
		}
		p.db.Model(&Recipient{}).Where("id = ?", r.ID).Updates(map[string]interface{}{
			"status":  "failed",
			"error":   errMsg,
			"sent_at": now,
		})
		log.Printf("cron: failed to send to %s: %s", r.Name, errMsg)
		return
	}

	// All attempted channels succeeded
	p.db.Model(&Recipient{}).Where("id = ?", r.ID).Updates(map[string]interface{}{
		"status":  "sent",
		"sent_at": now,
	})
	log.Printf("cron: sent to %s", r.Name)
}
