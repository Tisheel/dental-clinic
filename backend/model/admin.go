package model

import "time"

type AdminUser struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"size:100;not null;uniqueIndex" json:"username"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	Name      string    `gorm:"size:200;not null" json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
