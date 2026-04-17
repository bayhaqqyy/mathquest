package routes

import (
	"math-backend/internal/config"
	"math-backend/internal/controllers"
	"math-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	r *gin.Engine,
	authController *controllers.AuthController,
	problemController *controllers.ProblemController,
	userController *controllers.UserController,
	sessionController *controllers.SessionController,
	cfg config.Config,
) {
	api := r.Group("/api")

	// Public Routes
	api.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	auth := api.Group("/auth")
	{
		auth.POST("/register", authController.Register)
		auth.POST("/login", authController.Login)
	}

	problems := api.Group("/problems")
	{
		// In production, this should ideally be protected
		problems.POST("/generate", problemController.GenerateProblem)
	}

	// Protected Routes
	protected := api.Group("")
	protected.Use(middleware.RequireAuth(cfg))
	{
		protected.GET("/users/me", userController.GetMe)
		protected.POST("/sessions/result", sessionController.SubmitResult)
	}
}
