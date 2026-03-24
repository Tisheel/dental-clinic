package handler

import (
	"encoding/json"
	"net/http"

	"clinic-backend/auth"
	"clinic-backend/service"
	"clinic-backend/store"
)

type AuthHandler struct {
	authService *service.AuthService
	adminStore  *store.AdminStore
}

func NewAuthHandler(authService *service.AuthService, adminStore *store.AdminStore) *AuthHandler {
	return &AuthHandler{authService: authService, adminStore: adminStore}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		writeError(w, err.Error(), http.StatusUnauthorized)
		return
	}

	writeJSON(w, resp, http.StatusOK)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r)
	if claims == nil {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	admin, err := h.adminStore.FindByUsername(claims.Username)
	if err != nil {
		writeError(w, "admin not found", http.StatusNotFound)
		return
	}

	writeJSON(w, map[string]interface{}{
		"id":       admin.ID,
		"username": admin.Username,
		"name":     admin.Name,
	}, http.StatusOK)
}
