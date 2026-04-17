package controllers

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"math-backend/internal/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProblemController struct {
	config config.Config
}

func NewProblemController(cfg config.Config) *ProblemController {
	return &ProblemController{config: cfg}
}

type ProblemRequest struct {
	Topic string `json:"topic"`
}

type EngineRequest struct {
	Topic      string `json:"topic"`
	Difficulty int    `json:"difficulty"`
}

func (c *ProblemController) GenerateProblem(ctx *gin.Context) {
	var req ProblemRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Forward request to Python Engine Service
	engineReq := EngineRequest{
		Topic:      req.Topic,
		Difficulty: 1, // Default for now
	}

	engineJSON, _ := json.Marshal(engineReq)

	// Call the Python Server using config URL
	engineURL := c.config.EngineAPIURL + "/api/engine/generate"
	resp, err := http.Post(engineURL, "application/json", bytes.NewBuffer(engineJSON))
	
	if err != nil {
		ctx.JSON(http.StatusServiceUnavailable, gin.H{"error": "Math engine is unavailable. Ensure python service is running."})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		ctx.JSON(resp.StatusCode, gin.H{"error": "Math engine returned an error"})
		return
	}

	// Parse the response from Python
	bodyBytes, _ := ioutil.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(bodyBytes, &result)

	// Return the generated problem to React
	ctx.JSON(http.StatusOK, result)
}
