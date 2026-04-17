package controllers

import (
	"math-backend/internal/models"
	"math-backend/internal/repositories"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type SessionController struct {
	sessionRepo repositories.SessionRepository
	userRepo    repositories.UserRepository
}

func NewSessionController(sr repositories.SessionRepository, ur repositories.UserRepository) *SessionController {
	return &SessionController{sessionRepo: sr, userRepo: ur}
}

type SessionResultInput struct {
	Topic         string  `json:"topic" binding:"required"`
	TotalProblems int     `json:"total_problems" binding:"required"`
	CorrectCount  int     `json:"correct_count"`
	TimeSpent     int     `json:"time_spent"` // in seconds
}

func (c *SessionController) SubmitResult(ctx *gin.Context) {
	userIDRaw, _ := ctx.Get("userID")
	userID := userIDRaw.(uint)

	var input SessionResultInput
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Calculate Score & XP
	score := 0
	if input.TotalProblems > 0 {
		score = (input.CorrectCount * 100) / input.TotalProblems
	}

	// Base XP: 10 per correct answer, Bonus XP for high score
	gainedXP := input.CorrectCount * 10
	if score == 100 {
		gainedXP += 20 // perfection bonus
	}

	// 2. Save Session Data
	session := &models.Session{
		UserID:    userID,
		Topic:     input.Topic,
		Score:     score,
		TimeSpent: input.TimeSpent,
	}
	if err := c.sessionRepo.Create(session); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}

	// 3. Update User Global Accumulative Stats
	user, _ := c.userRepo.FindByID(userID)
	if user != nil {
		user.XP += gainedXP
		
		// Recalculate Global Accuracy (Moving Average roughly)
		prevTotal := user.TotalSolved
		user.TotalSolved += input.TotalProblems
		
		
		if user.TotalSolved > 0 {
			// Back-calculate total historical corrects, add new, then find new average
			pastCorrects := (user.TotalAccuracy / 100.0) * float64(prevTotal)
			newTotalCorrects := pastCorrects + float64(input.CorrectCount)
			user.TotalAccuracy = (newTotalCorrects / float64(user.TotalSolved)) * 100.0
		}
		
		c.userRepo.Update(user)

		// 4. Update Topic Specific Progress
		// 1 correct answer = 5% progress in that specific topic
		if input.Topic != "" && input.CorrectCount > 0 {
			topicProgressGain := input.CorrectCount * 5
			topicIDLower := strings.ToLower(input.Topic)
			c.userRepo.UpsertTopicProgress(userID, topicIDLower, topicProgressGain)
		}
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message":   "Session saved successfully",
		"gained_xp": gainedXP,
		"new_level": (user.XP / 200) + 1,
	})
}
