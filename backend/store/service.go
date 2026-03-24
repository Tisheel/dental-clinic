package store

import (
	"clinic-backend/model"

	"gorm.io/gorm"
)

type ServiceStore struct {
	db *gorm.DB
}

func NewServiceStore(db *gorm.DB) *ServiceStore {
	return &ServiceStore{db: db}
}

func (s *ServiceStore) ListActive() ([]model.DentalService, error) {
	var services []model.DentalService
	err := s.db.Where("active = ?", true).Order("name").Find(&services).Error
	return services, err
}

func (s *ServiceStore) ListAll() ([]model.DentalService, error) {
	var services []model.DentalService
	err := s.db.Order("name").Find(&services).Error
	return services, err
}

func (s *ServiceStore) GetByID(id uint) (*model.DentalService, error) {
	var svc model.DentalService
	err := s.db.First(&svc, id).Error
	if err != nil {
		return nil, err
	}
	return &svc, nil
}

func (s *ServiceStore) Create(svc *model.DentalService) error {
	return s.db.Create(svc).Error
}

func (s *ServiceStore) Update(svc *model.DentalService) error {
	return s.db.Save(svc).Error
}

func (s *ServiceStore) SetActive(id uint, active bool) error {
	return s.db.Model(&model.DentalService{}).Where("id = ?", id).Update("active", active).Error
}
