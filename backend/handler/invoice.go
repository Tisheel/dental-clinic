package handler

import (
	"net/http"

	"clinic-backend/service"

	"github.com/go-chi/chi/v5"
)

type InvoiceHandler struct {
	invoiceService *service.InvoiceService
}

func NewInvoiceHandler(invoiceService *service.InvoiceService) *InvoiceHandler {
	return &InvoiceHandler{invoiceService: invoiceService}
}

func (h *InvoiceHandler) Generate(w http.ResponseWriter, r *http.Request) {
	appointmentID := urlParamUint(r, "id")

	invoice, err := h.invoiceService.Generate(appointmentID)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, invoice, http.StatusCreated)
}

func (h *InvoiceHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	invoice, err := h.invoiceService.GetByID(id)
	if err != nil {
		writeError(w, "invoice not found", http.StatusNotFound)
		return
	}
	writeJSON(w, invoice, http.StatusOK)
}

func (h *InvoiceHandler) GetByNumber(w http.ResponseWriter, r *http.Request) {
	number := chi.URLParam(r, "number")
	if number == "" {
		writeError(w, "invoice number is required", http.StatusBadRequest)
		return
	}
	invoice, err := h.invoiceService.GetByInvoiceNumber(number)
	if err != nil {
		writeError(w, "invoice not found", http.StatusNotFound)
		return
	}
	writeJSON(w, invoice, http.StatusOK)
}

func (h *InvoiceHandler) List(w http.ResponseWriter, r *http.Request) {
	invoices, err := h.invoiceService.List()
	if err != nil {
		writeError(w, "failed to fetch invoices", http.StatusInternalServerError)
		return
	}
	writeJSON(w, invoices, http.StatusOK)
}
