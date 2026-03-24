package store

import (
	"clinic-backend/model"

	"gorm.io/gorm"
)

type BlogStore struct {
	db *gorm.DB
}

func NewBlogStore(db *gorm.DB) *BlogStore {
	return &BlogStore{db: db}
}

func (s *BlogStore) ListPublished() ([]model.BlogPost, error) {
	var posts []model.BlogPost
	err := s.db.Where("published = ?", true).Order("created_at DESC").Find(&posts).Error
	return posts, err
}

func (s *BlogStore) ListAll() ([]model.BlogPost, error) {
	var posts []model.BlogPost
	err := s.db.Order("created_at DESC").Find(&posts).Error
	return posts, err
}

func (s *BlogStore) GetByID(id uint) (*model.BlogPost, error) {
	var post model.BlogPost
	err := s.db.First(&post, id).Error
	if err != nil {
		return nil, err
	}
	return &post, nil
}

func (s *BlogStore) GetBySlug(slug string) (*model.BlogPost, error) {
	var post model.BlogPost
	err := s.db.Where("slug = ? AND published = ?", slug, true).First(&post).Error
	if err != nil {
		return nil, err
	}
	return &post, nil
}

func (s *BlogStore) Create(post *model.BlogPost) error {
	return s.db.Create(post).Error
}

func (s *BlogStore) Update(post *model.BlogPost) error {
	return s.db.Save(post).Error
}

func (s *BlogStore) Delete(id uint) error {
	return s.db.Delete(&model.BlogPost{}, id).Error
}
