package sender

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"gorm.io/gorm"
)

type WhatsAppSender struct {
	db         *gorm.DB
	httpClient *http.Client
}

func NewWhatsAppSender(db *gorm.DB) *WhatsAppSender {
	return &WhatsAppSender{
		db:         db,
		httpClient: &http.Client{},
	}
}

type waMessage struct {
	MessagingProduct string  `json:"messaging_product"`
	To               string  `json:"to"`
	Type             string  `json:"type"`
	Text             *waText `json:"text,omitempty"`
}

type waText struct {
	Body string `json:"body"`
}

func (s *WhatsAppSender) IsConfigured() bool {
	return s.getConfig("whatsapp_phone_number_id") != "" && s.getConfig("whatsapp_access_token") != ""
}

func (s *WhatsAppSender) Send(to, message string) error {
	phoneNumberID := s.getConfig("whatsapp_phone_number_id")
	if phoneNumberID == "" {
		return fmt.Errorf("whatsapp: %w", ErrNotConfigured)
	}

	accessToken := s.getConfig("whatsapp_access_token")
	if accessToken == "" {
		return fmt.Errorf("whatsapp: %w", ErrNotConfigured)
	}

	msg := waMessage{
		MessagingProduct: "whatsapp",
		To:               to,
		Type:             "text",
		Text:             &waText{Body: message},
	}

	body, _ := json.Marshal(msg)
	url := fmt.Sprintf("https://graph.facebook.com/v21.0/%s/messages", phoneNumberID)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("whatsapp: failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("whatsapp: request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("whatsapp: API error %d: %s", resp.StatusCode, string(respBody))
	}

	log.Printf("whatsapp: message sent to %s", to)
	return nil
}

func (s *WhatsAppSender) getConfig(key string) string {
	var value string
	s.db.Raw("SELECT config_value FROM notification_configs WHERE config_key = ?", key).Scan(&value)
	return value
}
