package handler

import (
	"encoding/json"
	"net/http"

	"clinic-backend/service"
	"clinic-backend/store"
)

type AppointmentHandler struct {
	apptService     *service.AppointmentService
	notificationSvc *service.NotificationService
}

func NewAppointmentHandler(apptService *service.AppointmentService, notifSvc *service.NotificationService) *AppointmentHandler {
	return &AppointmentHandler{apptService: apptService, notificationSvc: notifSvc}
}

func (h *AppointmentHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req service.BookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	appt, err := h.apptService.Book(req)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}

	h.notificationSvc.SendBookingConfirmation(appt)

	writeJSON(w, appt, http.StatusCreated)
}

func (h *AppointmentHandler) GetConfirmation(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	appt, err := h.apptService.GetByID(id)
	if err != nil {
		writeError(w, "appointment not found", http.StatusNotFound)
		return
	}
	writeJSON(w, appt, http.StatusOK)
}

func (h *AppointmentHandler) GetAvailableSlots(w http.ResponseWriter, r *http.Request) {
	date := r.URL.Query().Get("date")
	serviceID := queryParamUint(r, "service_id")

	if date == "" || serviceID == 0 {
		writeError(w, "date and service_id are required", http.StatusBadRequest)
		return
	}

	slots, err := h.apptService.GetAvailableSlots(date, serviceID)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}
	writeJSON(w, slots, http.StatusOK)
}

func (h *AppointmentHandler) List(w http.ResponseWriter, r *http.Request) {
	filter := store.AppointmentFilter{
		Date:      r.URL.Query().Get("date"),
		DateFrom:  r.URL.Query().Get("date_from"),
		DateTo:    r.URL.Query().Get("date_to"),
		Status:    r.URL.Query().Get("status"),
		ServiceID: queryParamUint(r, "service_id"),
		Page:      queryParamInt(r, "page", 1),
		Limit:     queryParamInt(r, "limit", 20),
	}

	result, err := h.apptService.List(filter)
	if err != nil {
		writeError(w, "failed to fetch appointments", http.StatusInternalServerError)
		return
	}
	writeJSON(w, result, http.StatusOK)
}

func (h *AppointmentHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	appt, err := h.apptService.GetByID(id)
	if err != nil {
		writeError(w, "appointment not found", http.StatusNotFound)
		return
	}
	writeJSON(w, appt, http.StatusOK)
}

func (h *AppointmentHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")

	var req struct {
		Status string `json:"status"`
		Notes  string `json:"notes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	oldAppt, _ := h.apptService.GetByID(id)
	oldStatus := ""
	if oldAppt != nil {
		oldStatus = oldAppt.Status
	}

	appt, err := h.apptService.UpdateStatus(id, req.Status, req.Notes)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.Status != "" && req.Status != oldStatus {
		h.notificationSvc.SendStatusUpdate(appt, req.Status)
	}

	writeJSON(w, appt, http.StatusOK)
}

func (h *AppointmentHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
	stats, err := h.apptService.GetDashboardStats()
	if err != nil {
		writeError(w, "failed to get dashboard stats", http.StatusInternalServerError)
		return
	}
	writeJSON(w, stats, http.StatusOK)
}
