package store

import (
	"clinic-backend/model"

	"gorm.io/gorm"
)

type NotificationConfigStore struct {
	db *gorm.DB
}

func NewNotificationConfigStore(db *gorm.DB) *NotificationConfigStore {
	return &NotificationConfigStore{db: db}
}

func (s *NotificationConfigStore) GetAll() ([]model.NotificationConfig, error) {
	var configs []model.NotificationConfig
	err := s.db.Find(&configs).Error
	return configs, err
}

func (s *NotificationConfigStore) Get(key string) (string, error) {
	var cfg model.NotificationConfig
	err := s.db.Where("config_key = ?", key).First(&cfg).Error
	if err != nil {
		return "", err
	}
	return cfg.ConfigValue, nil
}

func (s *NotificationConfigStore) Set(key, value string) error {
	var cfg model.NotificationConfig
	result := s.db.Where("config_key = ?", key).First(&cfg)
	if result.Error == gorm.ErrRecordNotFound {
		cfg = model.NotificationConfig{ConfigKey: key, ConfigValue: value}
		return s.db.Create(&cfg).Error
	}
	cfg.ConfigValue = value
	return s.db.Save(&cfg).Error
}
