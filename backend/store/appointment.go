package store

import (
	"time"

	"clinic-backend/model"

	"gorm.io/gorm"
)

type AppointmentStore struct {
	db *gorm.DB
}

func NewAppointmentStore(db *gorm.DB) *AppointmentStore {
	return &AppointmentStore{db: db}
}

func (s *AppointmentStore) Create(appt *model.Appointment) error {
	return s.db.Create(appt).Error
}

func (s *AppointmentStore) GetByID(id uint) (*model.Appointment, error) {
	var appt model.Appointment
	err := s.db.Preload("Service").First(&appt, id).Error
	if err != nil {
		return nil, err
	}
	return &appt, nil
}

func (s *AppointmentStore) Update(appt *model.Appointment) error {
	return s.db.Save(appt).Error
}

type AppointmentFilter struct {
	Date      string
	DateFrom  string
	DateTo    string
	Status    string
	ServiceID uint
	Page      int
	Limit     int
}

type AppointmentListResult struct {
	Appointments []model.Appointment `json:"appointments"`
	Total        int64               `json:"total"`
	Page         int                 `json:"page"`
	Limit        int                 `json:"limit"`
}

func (s *AppointmentStore) List(filter AppointmentFilter) (*AppointmentListResult, error) {
	query := s.db.Model(&model.Appointment{}).Preload("Service")

	if filter.Date != "" {
		query = query.Where("DATE(slot) = ?", filter.Date)
	}
	if filter.DateFrom != "" {
		query = query.Where("DATE(slot) >= ?", filter.DateFrom)
	}
	if filter.DateTo != "" {
		query = query.Where("DATE(slot) <= ?", filter.DateTo)
	}
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if filter.ServiceID > 0 {
		query = query.Where("service_id = ?", filter.ServiceID)
	}

	var total int64
	query.Count(&total)

	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 {
		filter.Limit = 20
	}

	var appointments []model.Appointment
	err := query.Order("slot DESC").
		Offset((filter.Page - 1) * filter.Limit).
		Limit(filter.Limit).
		Find(&appointments).Error

	return &AppointmentListResult{
		Appointments: appointments,
		Total:        total,
		Page:         filter.Page,
		Limit:        filter.Limit,
	}, err
}

func (s *AppointmentStore) GetBookedSlots(date string, serviceID uint) ([]model.Appointment, error) {
	var appointments []model.Appointment
	err := s.db.Where("DATE(slot) = ? AND status != ?", date, model.StatusCancelled).
		Find(&appointments).Error
	return appointments, err
}

func (s *AppointmentStore) CountByDateAndStatus(date time.Time, status string) (int64, error) {
	var count int64
	query := s.db.Model(&model.Appointment{}).Where("DATE(slot) = ?", date.Format("2006-01-02"))
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Count(&count).Error
	return count, err
}
