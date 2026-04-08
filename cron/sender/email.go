package sender

import (
	"errors"
	"fmt"
	"log"
	"net/smtp"

	"gorm.io/gorm"
)

var ErrNotConfigured = errors.New("not configured")

type EmailSender struct {
	db *gorm.DB
}

func NewEmailSender(db *gorm.DB) *EmailSender {
	return &EmailSender{db: db}
}

func (s *EmailSender) IsConfigured() bool {
	return s.getConfig("smtp_host") != ""
}

func (s *EmailSender) Send(to, subject, htmlBody string) error {
	host := s.getConfig("smtp_host")
	if host == "" {
		return fmt.Errorf("email: %w", ErrNotConfigured)
	}

	port := s.getConfig("smtp_port")
	username := s.getConfig("smtp_username")
	password := s.getConfig("smtp_password")
	from := s.getConfig("smtp_from")

	if port == "" {
		port = "587"
	}
	if from == "" {
		from = username
	}

	auth := smtp.PlainAuth("", username, password, host)

	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		from, to, subject, htmlBody)

	addr := fmt.Sprintf("%s:%s", host, port)
	if err := smtp.SendMail(addr, auth, from, []string{to}, []byte(msg)); err != nil {
		return fmt.Errorf("email send failed: %w", err)
	}

	log.Printf("email sent to %s: %s", to, subject)
	return nil
}

func (s *EmailSender) getConfig(key string) string {
	var value string
	s.db.Raw("SELECT config_value FROM notification_configs WHERE config_key = ?", key).Scan(&value)
	return value
}
