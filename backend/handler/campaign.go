package handler

import (
	"encoding/json"
	"net/http"

	"clinic-backend/model"
	"clinic-backend/service"
)

type CampaignHandler struct {
	campaignSvc *service.CampaignService
}

func NewCampaignHandler(campaignSvc *service.CampaignService) *CampaignHandler {
	return &CampaignHandler{campaignSvc: campaignSvc}
}

func (h *CampaignHandler) List(w http.ResponseWriter, r *http.Request) {
	campaigns, err := h.campaignSvc.List()
	if err != nil {
		writeError(w, "failed to fetch campaigns", http.StatusInternalServerError)
		return
	}

	// Attach stats to each campaign
	type campaignWithStats struct {
		model.Campaign
		TotalRecipients   int64 `json:"totalRecipients"`
		SentRecipients    int64 `json:"sentRecipients"`
		FailedRecipients  int64 `json:"failedRecipients"`
		SkippedRecipients int64 `json:"skippedRecipients"`
	}

	var result []campaignWithStats
	for _, c := range campaigns {
		total, sent, failed, skipped := h.campaignSvc.GetRecipientStats(c.ID)
		result = append(result, campaignWithStats{
			Campaign:          c,
			TotalRecipients:   total,
			SentRecipients:    sent,
			FailedRecipients:  failed,
			SkippedRecipients: skipped,
		})
	}

	writeJSON(w, result, http.StatusOK)
}

func (h *CampaignHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	campaign, err := h.campaignSvc.GetByID(id)
	if err != nil {
		writeError(w, "campaign not found", http.StatusNotFound)
		return
	}

	total, sent, failed, skipped := h.campaignSvc.GetRecipientStats(id)

	writeJSON(w, map[string]interface{}{
		"campaign":          campaign,
		"totalRecipients":   total,
		"sentRecipients":    sent,
		"failedRecipients":  failed,
		"skippedRecipients": skipped,
	}, http.StatusOK)
}

func (h *CampaignHandler) Create(w http.ResponseWriter, r *http.Request) {
	var campaign model.Campaign
	if err := json.NewDecoder(r.Body).Decode(&campaign); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if campaign.Name == "" {
		writeError(w, "campaign name is required", http.StatusBadRequest)
		return
	}

	if err := h.campaignSvc.Create(&campaign); err != nil {
		writeError(w, "failed to create campaign", http.StatusInternalServerError)
		return
	}

	writeJSON(w, campaign, http.StatusCreated)
}

func (h *CampaignHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")

	var req model.Campaign
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	updated, err := h.campaignSvc.Update(id, &req)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, updated, http.StatusOK)
}

func (h *CampaignHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	if err := h.campaignSvc.Delete(id); err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}
	writeJSON(w, map[string]string{"message": "campaign deleted"}, http.StatusOK)
}

func (h *CampaignHandler) Schedule(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	campaign, err := h.campaignSvc.Schedule(id)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}
	writeJSON(w, campaign, http.StatusOK)
}

func (h *CampaignHandler) PreviewRecipients(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	recipients, err := h.campaignSvc.PreviewRecipients(id)
	if err != nil {
		writeError(w, "failed to preview recipients", http.StatusInternalServerError)
		return
	}
	writeJSON(w, map[string]interface{}{
		"count":      len(recipients),
		"recipients": recipients,
	}, http.StatusOK)
}

func (h *CampaignHandler) PreviewRecipientsFromFilters(w http.ResponseWriter, r *http.Request) {
	recipients, err := h.campaignSvc.PreviewRecipientsFromFilters(
		queryParamUint(r, "serviceId"),
		r.URL.Query().Get("status"),
		r.URL.Query().Get("dateFrom"),
		r.URL.Query().Get("dateTo"),
	)
	if err != nil {
		writeError(w, "failed to preview recipients", http.StatusInternalServerError)
		return
	}
	writeJSON(w, map[string]interface{}{
		"count":      len(recipients),
		"recipients": recipients,
	}, http.StatusOK)
}

func (h *CampaignHandler) AddRecipient(w http.ResponseWriter, r *http.Request) {
	campaignID := urlParamUint(r, "id")

	var recipient model.CampaignRecipient
	if err := json.NewDecoder(r.Body).Decode(&recipient); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.campaignSvc.AddRecipient(campaignID, &recipient); err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, recipient, http.StatusCreated)
}

func (h *CampaignHandler) DeleteRecipient(w http.ResponseWriter, r *http.Request) {
	campaignID := urlParamUint(r, "id")
	recipientID := urlParamUint(r, "rid")

	if err := h.campaignSvc.DeleteRecipient(campaignID, recipientID); err != nil {
		writeError(w, "failed to remove recipient", http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]string{"message": "recipient removed"}, http.StatusOK)
}
