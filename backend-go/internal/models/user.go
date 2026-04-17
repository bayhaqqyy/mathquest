package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Email         string         `gorm:"uniqueIndex;not null" json:"email"`
	Name          string         `json:"name"`
	Password      string         `gorm:"not null" json:"-"` // never return password in JSON
	XP            int            `gorm:"default:0" json:"xp"`
	Level         int            `gorm:"default:1" json:"level"`
	Streak        int            `gorm:"default:0" json:"streak"`
	TotalSolved   int            `gorm:"default:0" json:"total_solved"`
	TotalAccuracy   float64          `gorm:"default:0.0" json:"accuracy"` // e.g., 85.5%
	TopicProgresses []TopicProgress  `gorm:"foreignKey:UserID" json:"topic_progresses"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
	DeletedAt       gorm.DeletedAt   `gorm:"index" json:"-"`
}

type Session struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index" json:"user_id"`
	Topic     string    `json:"topic"`
	Score     int       `json:"score"`
	TimeSpent int       `json:"time_spent"` // in seconds
	CreatedAt time.Time `json:"created_at"`
}
