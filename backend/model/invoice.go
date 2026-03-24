package model

import "time"

type Invoice struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	AppointmentID uint        `gorm:"not null;uniqueIndex" json:"appointmentId"`
	Appointment   Appointment `gorm:"foreignKey:AppointmentID" json:"appointment,omitempty"`
	InvoiceNumber string      `gorm:"size:50;not null;uniqueIndex" json:"invoiceNumber"`
	Amount        float64     `gorm:"type:decimal(10,2);not null" json:"amount"`
	Tax           float64     `gorm:"type:decimal(10,2);default:0" json:"tax"`
	Total         float64     `gorm:"type:decimal(10,2);not null" json:"total"`
	GeneratedAt   time.Time   `gorm:"autoCreateTime" json:"generatedAt"`
}
