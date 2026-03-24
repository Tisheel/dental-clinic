package store

import (
	"clinic-backend/model"

	"gorm.io/gorm"
)

type InvoiceStore struct {
	db *gorm.DB
}

func NewInvoiceStore(db *gorm.DB) *InvoiceStore {
	return &InvoiceStore{db: db}
}

func (s *InvoiceStore) Create(inv *model.Invoice) error {
	return s.db.Create(inv).Error
}

func (s *InvoiceStore) GetByID(id uint) (*model.Invoice, error) {
	var inv model.Invoice
	err := s.db.Preload("Appointment.Service").First(&inv, id).Error
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (s *InvoiceStore) GetByAppointmentID(appointmentID uint) (*model.Invoice, error) {
	var inv model.Invoice
	err := s.db.Preload("Appointment.Service").Where("appointment_id = ?", appointmentID).First(&inv).Error
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (s *InvoiceStore) List() ([]model.Invoice, error) {
	var invoices []model.Invoice
	err := s.db.Preload("Appointment.Service").Order("generated_at DESC").Find(&invoices).Error
	return invoices, err
}

func (s *InvoiceStore) GetByInvoiceNumber(invoiceNumber string) (*model.Invoice, error) {
	var inv model.Invoice
	err := s.db.Preload("Appointment.Service").Where("invoice_number = ?", invoiceNumber).First(&inv).Error
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (s *InvoiceStore) Count() (int64, error) {
	var count int64
	err := s.db.Model(&model.Invoice{}).Count(&count).Error
	return count, err
}
