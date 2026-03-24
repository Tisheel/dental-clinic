package handler

import (
	"encoding/json"
	"net/http"

	"clinic-backend/store"
)

type NotificationHandler struct {
	configStore *store.NotificationConfigStore
}

func NewNotificationHandler(configStore *store.NotificationConfigStore) *NotificationHandler {
	return &NotificationHandler{configStore: configStore}
}

func (h *NotificationHandler) GetConfig(w http.ResponseWriter, r *http.Request) {
	configs, err := h.configStore.GetAll()
	if err != nil {
		writeError(w, "failed to fetch config", http.StatusInternalServerError)
		return
	}

	result := make(map[string]string)
	for _, c := range configs {
		result[c.ConfigKey] = c.ConfigValue
	}

	writeJSON(w, result, http.StatusOK)
}

func (h *NotificationHandler) UpdateConfig(w http.ResponseWriter, r *http.Request) {
	var configs map[string]string
	if err := json.NewDecoder(r.Body).Decode(&configs); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	for key, value := range configs {
		if err := h.configStore.Set(key, value); err != nil {
			writeError(w, "failed to update config: "+key, http.StatusInternalServerError)
			return
		}
	}

	writeJSON(w, map[string]string{"message": "configuration updated"}, http.StatusOK)
}
