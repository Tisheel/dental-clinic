package model

import "time"

type DentalService struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:200;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Duration    int       `gorm:"not null;default:30" json:"duration"`
	Price       float64   `gorm:"type:decimal(10,2);not null" json:"price"`
	Active      bool      `gorm:"default:true" json:"active"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
