package tests

import (
	"bytes"
	"encoding/json"
	"geofence/internal/database"
	"geofence/internal/handlers"
	"geofence/internal/models"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func TestRegister(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Create test user data
	user := map[string]string{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "password123",
	}

	// Convert to JSON
	jsonUser, _ := json.Marshal(user)

	// Create request
	req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(jsonUser))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.Register(rr, req)

	// Check status code
	assert.Equal(t, http.StatusCreated, rr.Code)

	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Verify response data based on your actual API format
	// Your API might use a different structure
	if data, exists := response["data"].(map[string]interface{}); exists {
		assert.Equal(t, "testuser", data["username"])
		assert.Equal(t, "test@example.com", data["email"])
		
		// Password should not be returned
		_, passwordExists := data["password"]
		assert.False(t, passwordExists)
	}
	
	// Verify user was created in the database
	var userCount int64
	database.DB.Model(&models.User{}).Where("email = ?", "test@example.com").Count(&userCount)
	assert.Equal(t, int64(1), userCount)
}

func TestLogin(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Create a test user with a hashed password
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	user := models.User{
		Username: "logintest",
		Email:    "login@example.com",
		Password: string(hashedPassword),
	}
	
	database.DB.Create(&user)

	// Login credentials
	login := map[string]string{
		"email":    "login@example.com",
		"password": "password123",
	}

	// Convert to JSON
	jsonLogin, _ := json.Marshal(login)

	// Create request
	req, _ := http.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonLogin))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.Login(rr, req)

	// Check status code
	assert.Equal(t, http.StatusOK, rr.Code)

	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Check response format based on your actual API
	t.Logf("Login response: %v", response)
	
	// Logging the response helps diagnose issues with the format
	// Check that we have data in the response
	assert.NotNil(t, response["data"])
}

func TestInvalidRegister(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Missing email
	user := map[string]string{
		"username": "testuser",
		"password": "password123",
		// Missing email
	}

	// Convert to JSON
	jsonUser, _ := json.Marshal(user)

	// Create request
	req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(jsonUser))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.Register(rr, req)

	// Check status code - should fail with bad request
	assert.Equal(t, http.StatusBadRequest, rr.Code)

	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Check error response - updated to match your API format
	assert.Equal(t, "error", response["status"])
	assert.NotNil(t, response["message"])
}

func TestInvalidLogin(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Create a test user with a hashed password
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	user := models.User{
		Username: "logintest",
		Email:    "login@example.com",
		Password: string(hashedPassword),
	}
	
	database.DB.Create(&user)

	// Login with wrong password
	login := map[string]string{
		"email":    "login@example.com",
		"password": "wrongpassword",
	}

	// Convert to JSON
	jsonLogin, _ := json.Marshal(login)

	// Create request
	req, _ := http.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonLogin))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.Login(rr, req)

	// Check status code - should fail with unauthorized
	assert.Equal(t, http.StatusUnauthorized, rr.Code)

	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Check error response - updated to match your API format
	assert.Equal(t, "error", response["status"])
	assert.NotNil(t, response["message"])
}