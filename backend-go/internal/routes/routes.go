package routes

import (
	"math-backend/internal/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	r *gin.Engine,
	authController *controllers.AuthController,
	problemController *controllers.ProblemController,
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
		// Still public for now, but in future can wrap with JWT middleware
		problems.POST("/generate", problemController.GenerateProblem)
	}
}
