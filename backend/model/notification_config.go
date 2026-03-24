package model

import "time"

type NotificationConfig struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ConfigKey   string    `gorm:"size:100;not null;uniqueIndex" json:"configKey"`
	ConfigValue string    `gorm:"type:text;not null" json:"configValue"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
