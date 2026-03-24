package store

import (
	"clinic-backend/model"

	"gorm.io/gorm"
)

type AdminStore struct {
	db *gorm.DB
}

func NewAdminStore(db *gorm.DB) *AdminStore {
	return &AdminStore{db: db}
}

func (s *AdminStore) FindByUsername(username string) (*model.AdminUser, error) {
	var admin model.AdminUser
	err := s.db.Where("username = ?", username).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}
