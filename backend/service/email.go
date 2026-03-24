package service

import (
	"fmt"
	"log"
	"net/smtp"

	"clinic-backend/store"
)

type EmailService struct {
	configStore *store.NotificationConfigStore
}

func NewEmailService(configStore *store.NotificationConfigStore) *EmailService {
	return &EmailService{configStore: configStore}
}

func (s *EmailService) Send(to, subject, htmlBody string) error {
	host, err := s.configStore.Get("smtp_host")
	if err != nil || host == "" {
		log.Println("email: SMTP not configured, skipping")
		return nil
	}

	port, _ := s.configStore.Get("smtp_port")
	username, _ := s.configStore.Get("smtp_username")
	password, _ := s.configStore.Get("smtp_password")
	from, _ := s.configStore.Get("smtp_from")

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
	err = smtp.SendMail(addr, auth, from, []string{to}, []byte(msg))
	if err != nil {
		return fmt.Errorf("email send failed: %w", err)
	}

	log.Printf("email sent to %s: %s", to, subject)
	return nil
}
