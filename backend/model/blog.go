package model

import "time"

type BlogPost struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Title           string    `gorm:"size:300;not null" json:"title"`
	Slug            string    `gorm:"size:300;not null;uniqueIndex" json:"slug"`
	Summary         string    `gorm:"size:500" json:"summary"`
	Content         string    `gorm:"type:longtext;not null" json:"content"`
	Image           string    `gorm:"size:500" json:"image"`
	MetaTitle       string    `gorm:"size:300" json:"metaTitle"`
	MetaDescription string    `gorm:"size:500" json:"metaDescription"`
	MetaKeywords    string    `gorm:"size:500" json:"metaKeywords"`
	Author          string    `gorm:"size:200" json:"author"`
	Published       bool      `gorm:"default:false" json:"published"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}
