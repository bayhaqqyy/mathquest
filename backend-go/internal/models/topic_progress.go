package models

import (
	"time"

	"gorm.io/gorm"
)

// TopicProgress tracks the progress of a specific user in a specific math topic
type TopicProgress struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"index" json:"user_id"`
	TopicID   string         `gorm:"index" json:"topic_id"` // e.g. "aljabar", "geometri"
	Progress  int            `gorm:"default:0" json:"progress"` // percentage 0-100
	Unlocked  bool           `gorm:"default:false" json:"unlocked"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
