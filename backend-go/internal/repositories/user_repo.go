package repositories

import (
	"math-backend/internal/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	Create(user *models.User) error
	FindByEmail(email string) (*models.User, error)
	FindByID(id uint) (*models.User, error)
	Update(user *models.User) error
	UpsertTopicProgress(userID uint, topicID string, increment int) error
}

type userRepo struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *userRepo) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.Preload("TopicProgresses").First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) UpsertTopicProgress(userID uint, topicID string, increment int) error {
	var tp models.TopicProgress
	err := r.db.Where("user_id = ? AND topic_id = ?", userID, topicID).First(&tp).Error
	if err != nil {
		// Not found, create new
		tp = models.TopicProgress{
			UserID:   userID,
			TopicID:  topicID,
			Progress: increment,
		}
		if tp.Progress > 100 {
			tp.Progress = 100
		}
		return r.db.Create(&tp).Error
	}

	// Update existing
	tp.Progress += increment
	if tp.Progress > 100 {
		tp.Progress = 100
	}
	return r.db.Save(&tp).Error
}

func (r *userRepo) Update(user *models.User) error {
	return r.db.Save(user).Error
}
