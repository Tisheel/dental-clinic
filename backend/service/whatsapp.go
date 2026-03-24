package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"clinic-backend/store"
)

type WhatsAppService struct {
	configStore *store.NotificationConfigStore
	httpClient  *http.Client
}

func NewWhatsAppService(configStore *store.NotificationConfigStore) *WhatsAppService {
	return &WhatsAppService{
		configStore: configStore,
		httpClient:  &http.Client{},
	}
}

type whatsAppMessage struct {
	MessagingProduct string      `json:"messaging_product"`
	To               string      `json:"to"`
	Type             string      `json:"type"`
	Template         *waTemplate `json:"template,omitempty"`
	Text             *waText     `json:"text,omitempty"`
}

type waTemplate struct {
	Name       string        `json:"name"`
	Language   waLang        `json:"language"`
	Components []waComponent `json:"components,omitempty"`
}

type waLang struct {
	Code string `json:"code"`
}

type waComponent struct {
	Type       string        `json:"type"`
	Parameters []waParameter `json:"parameters,omitempty"`
}

type waParameter struct {
	Type string `json:"type"`
	Text string `json:"text,omitempty"`
}

type waText struct {
	Body string `json:"body"`
}

func (s *WhatsAppService) SendTemplate(to, templateName string, params []string) error {
	phoneNumberID, err := s.configStore.Get("whatsapp_phone_number_id")
	if err != nil || phoneNumberID == "" {
		log.Println("whatsapp: not configured, skipping")
		return nil
	}

	accessToken, err := s.configStore.Get("whatsapp_access_token")
	if err != nil || accessToken == "" {
		log.Println("whatsapp: access token not configured, skipping")
		return nil
	}

	var parameters []waParameter
	for _, p := range params {
		parameters = append(parameters, waParameter{Type: "text", Text: p})
	}

	msg := whatsAppMessage{
		MessagingProduct: "whatsapp",
		To:               to,
		Type:             "template",
		Template: &waTemplate{
			Name:     templateName,
			Language: waLang{Code: "en"},
			Components: []waComponent{
				{Type: "body", Parameters: parameters},
			},
		},
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

	log.Printf("whatsapp: template '%s' sent to %s", templateName, to)
	return nil
}

func (s *WhatsAppService) SendText(to, message string) error {
	phoneNumberID, err := s.configStore.Get("whatsapp_phone_number_id")
	if err != nil || phoneNumberID == "" {
		log.Println("whatsapp: not configured, skipping")
		return nil
	}

	accessToken, err := s.configStore.Get("whatsapp_access_token")
	if err != nil || accessToken == "" {
		log.Println("whatsapp: access token not configured, skipping")
		return nil
	}

	msg := whatsAppMessage{
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

	log.Printf("whatsapp: text message sent to %s", to)
	return nil
}
