package services

import (
	"errors"
	"math-backend/internal/models"
	"math-backend/internal/repositories"
	"math-backend/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(name, email, password string) (*models.User, error)
	Login(email, password, jwtSecret string) (string, *models.User, error)
}

type authService struct {
	repo repositories.UserRepository
}

func NewAuthService(r repositories.UserRepository) AuthService {
	return &authService{repo: r}
}

func (s *authService) Register(name, email, password string) (*models.User, error) {
	// Check if already exists
	if _, err := s.repo.FindByEmail(email); err == nil {
		return nil, errors.New("email already in use")
	}

	// Hash password
	hashedByte, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Name:     name,
		Email:    email,
		Password: string(hashedByte),
	}

	err = s.repo.Create(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *authService) Login(email, password, jwtSecret string) (string, *models.User, error) {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return "", nil, errors.New("invalid email or password")
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", nil, errors.New("invalid email or password")
	}

	// Generate JWT
	token, err := utils.GenerateToken(user.ID, user.Email, jwtSecret)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}
