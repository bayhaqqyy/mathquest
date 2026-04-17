package main

import (
	"fmt"
	"log"

	"math-backend/internal/config"
	"math-backend/internal/controllers"
	"math-backend/internal/database"
	"math-backend/internal/models"
	"math-backend/internal/repositories"
	"math-backend/internal/routes"
	"math-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Load config
	cfg := config.LoadConfig()

	// 2. Initialize Database Connection & Migrations
	database.ConnectDB(cfg.DatabaseURL)
	database.AutoMigrate(&models.User{}, &models.Session{}, &models.TopicProgress{})

	// 3. Setup Repositories
	userRepo := repositories.NewUserRepository(database.DB)
	sessionRepo := repositories.NewSessionRepository(database.DB)

	// 4. Setup Services
	authService := services.NewAuthService(userRepo)

	// 5. Setup Controllers
	authController := controllers.NewAuthController(authService, cfg)
	problemController := controllers.NewProblemController(cfg)
	userController := controllers.NewUserController(userRepo)
	sessionController := controllers.NewSessionController(sessionRepo, userRepo)

	// 6. Setup Gin App Router
	router := gin.Default()

	// CORS Setup
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	// Init Routes
	routes.SetupRoutes(router, authController, problemController, userController, sessionController, cfg)

	// 7. Start Server
	fmt.Printf("🚀 MathQuest Core Backend running on port %s\n", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
