package controllers

import (
	"math-backend/internal/repositories"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userRepo   repositories.UserRepository
}

func NewUserController(ur repositories.UserRepository) *UserController {
	return &UserController{userRepo: ur}
}

func (c *UserController) GetMe(ctx *gin.Context) {
	// Extract userID injected by auth_middleware
	userIDRaw, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized context"})
		return
	}
	userID := userIDRaw.(uint)

	// Fetch user from DB
	user, err := c.userRepo.FindByID(userID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Calculate overall Level purely based on XP (MathQuest logic)
	// Example: Every 200 XP = 1 Level
	newLevel := (user.XP / 200) + 1
	if newLevel > user.Level {
		user.Level = newLevel
		c.userRepo.Update(user) // Update silent save
	}

	// Return User Profile Stats
	ctx.JSON(http.StatusOK, gin.H{
		"data": user,
	})
}
