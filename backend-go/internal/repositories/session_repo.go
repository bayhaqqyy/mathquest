package repositories

import (
	"math-backend/internal/models"

	"gorm.io/gorm"
)

type SessionRepository interface {
	Create(session *models.Session) error
	GetByUserID(userID uint) ([]models.Session, error)
}

type sessionRepo struct {
	db *gorm.DB
}

func NewSessionRepository(db *gorm.DB) SessionRepository {
	return &sessionRepo{db: db}
}

func (r *sessionRepo) Create(session *models.Session) error {
	return r.db.Create(session).Error
}

func (r *sessionRepo) GetByUserID(userID uint) ([]models.Session, error) {
	var sessions []models.Session
	err := r.db.Where("user_id = ?", userID).Order("created_at desc").Find(&sessions).Error
	return sessions, err
}
