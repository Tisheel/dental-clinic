package model

import "time"

const (
	StatusPending   = "pending"
	StatusConfirmed = "confirmed"
	StatusCompleted = "completed"
	StatusCancelled = "cancelled"
)

type Appointment struct {
	ID          uint          `gorm:"primaryKey" json:"id"`
	UserName    string        `gorm:"size:200;not null" json:"userName"`
	PhoneNumber string        `gorm:"size:20;not null;index" json:"phoneNumber"`
	Email       string        `gorm:"size:200" json:"email"`
	Slot        time.Time     `gorm:"not null;index" json:"slot"`
	Duration    int           `gorm:"not null;default:30" json:"duration"`
	ServiceID   uint          `gorm:"not null" json:"serviceId"`
	Service     DentalService `gorm:"foreignKey:ServiceID" json:"service,omitempty"`
	Status      string        `gorm:"type:varchar(20);default:'pending';index" json:"status"`
	Notes       string        `gorm:"type:text" json:"notes"`
	CreatedAt   time.Time     `json:"createdAt"`
	UpdatedAt   time.Time     `json:"updatedAt"`
}
