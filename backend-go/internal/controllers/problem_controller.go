package controllers

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"time"

	"math-backend/internal/config"

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
	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Post(engineURL, "application/json", bytes.NewBuffer(engineJSON))
	
	if err != nil {
		ctx.JSON(http.StatusServiceUnavailable, gin.H{"error": "Generator soal terlalu lama merespons atau engine tidak tersedia. Coba lagi."})
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := ioutil.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		var engineError map[string]interface{}
		if err := json.Unmarshal(bodyBytes, &engineError); err == nil {
			if detail, ok := engineError["detail"].(string); ok && detail != "" {
				ctx.JSON(resp.StatusCode, gin.H{"error": detail})
				return
			}
		}
		ctx.JSON(resp.StatusCode, gin.H{"error": "Generator soal gagal membuat soal. Coba lagi."})
		return
	}

	// Parse the response from Python
	var result map[string]interface{}
	json.Unmarshal(bodyBytes, &result)

	// Return the generated problem to React
	ctx.JSON(http.StatusOK, result)
}
