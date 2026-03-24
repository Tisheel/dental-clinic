package service

import (
	"errors"
	"fmt"

	"clinic-backend/model"
	"clinic-backend/store"
)

type InvoiceService struct {
	invoiceStore     *store.InvoiceStore
	appointmentStore *store.AppointmentStore
}

func NewInvoiceService(invStore *store.InvoiceStore, apptStore *store.AppointmentStore) *InvoiceService {
	return &InvoiceService{invoiceStore: invStore, appointmentStore: apptStore}
}

func (s *InvoiceService) Generate(appointmentID uint) (*model.Invoice, error) {
	appt, err := s.appointmentStore.GetByID(appointmentID)
	if err != nil {
		return nil, errors.New("appointment not found")
	}

	if appt.Status != model.StatusCompleted {
		return nil, errors.New("can only generate invoice for completed appointments")
	}

	existing, err := s.invoiceStore.GetByAppointmentID(appointmentID)
	if err == nil && existing != nil {
		return existing, nil
	}

	count, _ := s.invoiceStore.Count()
	invoiceNumber := fmt.Sprintf("INV-%d-%04d", appt.Slot.Year(), count+1)

	amount := appt.Service.Price
	tax := amount * 0.18
	total := amount + tax

	invoice := &model.Invoice{
		AppointmentID: appointmentID,
		InvoiceNumber: invoiceNumber,
		Amount:        amount,
		Tax:           tax,
		Total:         total,
	}

	if err := s.invoiceStore.Create(invoice); err != nil {
		return nil, fmt.Errorf("failed to create invoice: %w", err)
	}

	return s.invoiceStore.GetByID(invoice.ID)
}

func (s *InvoiceService) GetByID(id uint) (*model.Invoice, error) {
	return s.invoiceStore.GetByID(id)
}

func (s *InvoiceService) GetByInvoiceNumber(invoiceNumber string) (*model.Invoice, error) {
	return s.invoiceStore.GetByInvoiceNumber(invoiceNumber)
}

func (s *InvoiceService) List() ([]model.Invoice, error) {
	return s.invoiceStore.List()
}
