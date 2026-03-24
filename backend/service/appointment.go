package service

import (
	"errors"
	"fmt"
	"time"

	"clinic-backend/model"
	"clinic-backend/store"
)

type AppointmentService struct {
	appointmentStore *store.AppointmentStore
	serviceStore     *store.ServiceStore
}

func NewAppointmentService(apptStore *store.AppointmentStore, svcStore *store.ServiceStore) *AppointmentService {
	return &AppointmentService{appointmentStore: apptStore, serviceStore: svcStore}
}

type BookingRequest struct {
	UserName    string `json:"userName"`
	PhoneNumber string `json:"phoneNumber"`
	Email       string `json:"email"`
	Slot        string `json:"slot"`
	ServiceID   uint   `json:"serviceId"`
	Notes       string `json:"notes"`
}

func (s *AppointmentService) Book(req BookingRequest) (*model.Appointment, error) {
	if req.UserName == "" || req.PhoneNumber == "" || req.Slot == "" || req.ServiceID == 0 {
		return nil, errors.New("userName, phoneNumber, slot, and serviceId are required")
	}

	svc, err := s.serviceStore.GetByID(req.ServiceID)
	if err != nil {
		return nil, errors.New("invalid service")
	}

	slotTime, err := time.ParseInLocation("2006-01-02T15:04", req.Slot, time.Local)
	if err != nil {
		return nil, errors.New("invalid slot format, use YYYY-MM-DDTHH:MM")
	}

	if slotTime.Before(time.Now()) {
		return nil, errors.New("cannot book a slot in the past")
	}

	appt := &model.Appointment{
		UserName:    req.UserName,
		PhoneNumber: req.PhoneNumber,
		Email:       req.Email,
		Slot:        slotTime,
		Duration:    svc.Duration,
		ServiceID:   req.ServiceID,
		Status:      model.StatusPending,
		Notes:       req.Notes,
	}

	if err := s.appointmentStore.Create(appt); err != nil {
		return nil, fmt.Errorf("failed to create appointment: %w", err)
	}

	appt.Service = *svc
	return appt, nil
}

func (s *AppointmentService) GetByID(id uint) (*model.Appointment, error) {
	return s.appointmentStore.GetByID(id)
}

func (s *AppointmentService) List(filter store.AppointmentFilter) (*store.AppointmentListResult, error) {
	return s.appointmentStore.List(filter)
}

func (s *AppointmentService) UpdateStatus(id uint, status, notes string) (*model.Appointment, error) {
	appt, err := s.appointmentStore.GetByID(id)
	if err != nil {
		return nil, errors.New("appointment not found")
	}

	validStatuses := map[string]bool{
		model.StatusPending:   true,
		model.StatusConfirmed: true,
		model.StatusCompleted: true,
		model.StatusCancelled: true,
	}
	if status != "" {
		if !validStatuses[status] {
			return nil, errors.New("invalid status")
		}
		appt.Status = status
	}
	if notes != "" {
		appt.Notes = notes
	}

	if err := s.appointmentStore.Update(appt); err != nil {
		return nil, fmt.Errorf("failed to update appointment: %w", err)
	}

	return appt, nil
}

type SlotInfo struct {
	Time      string `json:"time"`
	Available bool   `json:"available"`
}

func (s *AppointmentService) GetAvailableSlots(date string, serviceID uint) ([]SlotInfo, error) {
	svc, err := s.serviceStore.GetByID(serviceID)
	if err != nil {
		return nil, errors.New("invalid service")
	}

	booked, err := s.appointmentStore.GetBookedSlots(date, serviceID)
	if err != nil {
		return nil, err
	}

	bookedTimes := make(map[string]bool)
	for _, appt := range booked {
		startSlot := appt.Slot
		endSlot := appt.Slot.Add(time.Duration(appt.Duration) * time.Minute)
		for t := startSlot; t.Before(endSlot); t = t.Add(30 * time.Minute) {
			bookedTimes[t.Format("15:04")] = true
		}
	}

	startHour := 9
	endHour := 18
	duration := svc.Duration
	var slots []SlotInfo

	parsedDate, err := time.ParseInLocation("2006-01-02", date, time.Local)
	if err != nil {
		return nil, errors.New("invalid date format, use YYYY-MM-DD")
	}

	for hour := startHour; hour < endHour; hour++ {
		for minute := 0; minute < 60; minute += 30 {
			slotTime := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), hour, minute, 0, 0, time.Local)
			endTime := slotTime.Add(time.Duration(duration) * time.Minute)

			if endTime.Hour() > endHour || (endTime.Hour() == endHour && endTime.Minute() > 0) {
				continue
			}

			available := true
			for t := slotTime; t.Before(endTime); t = t.Add(30 * time.Minute) {
				if bookedTimes[t.Format("15:04")] {
					available = false
					break
				}
			}

			slots = append(slots, SlotInfo{
				Time:      fmt.Sprintf("%02d:%02d", hour, minute),
				Available: available,
			})
		}
	}

	return slots, nil
}

type DashboardStats struct {
	TodayTotal   int64 `json:"todayTotal"`
	TodayPending int64 `json:"todayPending"`
	WeekTotal    int64 `json:"weekTotal"`
}

func (s *AppointmentService) GetDashboardStats() (*DashboardStats, error) {
	today := time.Now()

	todayTotal, err := s.appointmentStore.CountByDateAndStatus(today, "")
	if err != nil {
		return nil, err
	}

	todayPending, err := s.appointmentStore.CountByDateAndStatus(today, model.StatusPending)
	if err != nil {
		return nil, err
	}

	weekStart := today
	for weekStart.Weekday() != time.Monday {
		weekStart = weekStart.AddDate(0, 0, -1)
	}

	var weekTotal int64
	for i := 0; i < 7; i++ {
		day := weekStart.AddDate(0, 0, i)
		count, err := s.appointmentStore.CountByDateAndStatus(day, "")
		if err != nil {
			return nil, err
		}
		weekTotal += count
	}

	return &DashboardStats{
		TodayTotal:   todayTotal,
		TodayPending: todayPending,
		WeekTotal:    weekTotal,
	}, nil
}
