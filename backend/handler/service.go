package handler

import (
	"encoding/json"
	"net/http"

	"clinic-backend/model"
	"clinic-backend/store"
)

type ServiceHandler struct {
	serviceStore *store.ServiceStore
}

func NewServiceHandler(serviceStore *store.ServiceStore) *ServiceHandler {
	return &ServiceHandler{serviceStore: serviceStore}
}

func (h *ServiceHandler) ListActive(w http.ResponseWriter, r *http.Request) {
	services, err := h.serviceStore.ListActive()
	if err != nil {
		writeError(w, "failed to fetch services", http.StatusInternalServerError)
		return
	}
	writeJSON(w, services, http.StatusOK)
}

func (h *ServiceHandler) ListAll(w http.ResponseWriter, r *http.Request) {
	services, err := h.serviceStore.ListAll()
	if err != nil {
		writeError(w, "failed to fetch services", http.StatusInternalServerError)
		return
	}
	writeJSON(w, services, http.StatusOK)
}

func (h *ServiceHandler) Create(w http.ResponseWriter, r *http.Request) {
	var svc model.DentalService
	if err := json.NewDecoder(r.Body).Decode(&svc); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if svc.Name == "" || svc.Price <= 0 || svc.Duration <= 0 {
		writeError(w, "name, price, and duration are required", http.StatusBadRequest)
		return
	}

	svc.Active = true
	if err := h.serviceStore.Create(&svc); err != nil {
		writeError(w, "failed to create service", http.StatusInternalServerError)
		return
	}
	writeJSON(w, svc, http.StatusCreated)
}

func (h *ServiceHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	existing, err := h.serviceStore.GetByID(id)
	if err != nil {
		writeError(w, "service not found", http.StatusNotFound)
		return
	}

	var req model.DentalService
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name != "" {
		existing.Name = req.Name
	}
	if req.Description != "" {
		existing.Description = req.Description
	}
	if req.Duration > 0 {
		existing.Duration = req.Duration
	}
	if req.Price > 0 {
		existing.Price = req.Price
	}

	if err := h.serviceStore.Update(existing); err != nil {
		writeError(w, "failed to update service", http.StatusInternalServerError)
		return
	}
	writeJSON(w, existing, http.StatusOK)
}

func (h *ServiceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	if err := h.serviceStore.SetActive(id, false); err != nil {
		writeError(w, "failed to deactivate service", http.StatusInternalServerError)
		return
	}
	writeJSON(w, map[string]string{"message": "service deactivated"}, http.StatusOK)
}

func (h *ServiceHandler) Activate(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	if err := h.serviceStore.SetActive(id, true); err != nil {
		writeError(w, "failed to activate service", http.StatusInternalServerError)
		return
	}
	writeJSON(w, map[string]string{"message": "service activated"}, http.StatusOK)
}
