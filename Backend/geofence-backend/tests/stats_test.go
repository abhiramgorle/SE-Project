package tests

import (
	"encoding/json"
	"geofence/internal/database"
	"geofence/internal/handlers"
	"geofence/internal/models"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetUserStats(t *testing.T) {
	// Set up test database
	setupTestDB()
	
	// Create a test user
	user := models.User{
		Username: "statsuser",
		Email:    "stats@example.com",
		Password: "password123",
	}
	
	database.DB.Create(&user)
	
	// Create test geofences for the user
	geofences := []models.Geofence{
		{
			Name:        "Geofence 1",
			Description: "Description 1",
			Latitude:    37.7749,
			Longitude:   -122.4194,
			Radius:      100,
			UserID:      user.ID,
		},
		{
			Name:        "Geofence 2",
			Description: "Description 2",
			Latitude:    37.7750,
			Longitude:   -122.4195,
			Radius:      150,
			UserID:      user.ID,
		},
	}
	
	for _, g := range geofences {
		database.DB.Create(&g)
	}
	
	// Create test content items
	content := models.Content{
		Title:       "Test Content",
		Description: "Test Description",
		Type:        "text",
		GeofenceID:  geofences[0].ID,
	}
	
	database.DB.Create(&content)

	// Create request
	req, _ := http.NewRequest("GET", "/api/stats/user?user_id="+strconv.Itoa(int(user.ID)), nil)

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.GetUserStats(rr, req)

	// Check status code
	assert.Equal(t, http.StatusOK, rr.Code)
	
	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	// Log response for debugging
	t.Logf("User stats response: %v", response)
	
	// Check response data
	assert.NotNil(t, response["data"])
	
	// Get the data field and check stats
	if data, ok := response["data"].(map[string]interface{}); ok {
		assert.Equal(t, float64(2), data["geofence_count"])
		assert.Equal(t, float64(1), data["content_count"])
	}
}

func TestGetSystemStats(t *testing.T) {
	// Set up test database
	setupTestDB()
	
	// Create some test users
	users := []models.User{
		{
			Username: "user1",
			Email:    "user1@example.com",
			Password: "password123",
		},
		{
			Username: "user2",
			Email:    "user2@example.com",
			Password: "password123",
		},
	}
	
	for _, u := range users {
		database.DB.Create(&u)
	}
	
	// Create some test geofences
	geofences := []models.Geofence{
		{
			Name:        "Geofence 1",
			Description: "Description 1",
			Latitude:    37.7749,
			Longitude:   -122.4194,
			Radius:      100,
			UserID:      users[0].ID,
		},
		{
			Name:        "Geofence 2",
			Description: "Description 2",
			Latitude:    37.7750,
			Longitude:   -122.4195,
			Radius:      150,
			UserID:      users[1].ID,
		},
	}
	
	for _, g := range geofences {
		database.DB.Create(&g)
	}

	// Create request
	req, _ := http.NewRequest("GET", "/api/stats/system", nil)

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.GetSystemStats(rr, req)

	// Check status code
	assert.Equal(t, http.StatusOK, rr.Code)
	
	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	// Log response for debugging
	t.Logf("System stats response: %v", response)
	
	// Check response data
	assert.NotNil(t, response["data"])
	
	// Check system stats
	if data, ok := response["data"].(map[string]interface{}); ok {
		assert.Equal(t, float64(2), data["user_count"])
		assert.Equal(t, float64(2), data["geofence_count"])
	}
}

func TestGetUserStatsMissingUserID(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Create request with missing user_id
	req, _ := http.NewRequest("GET", "/api/stats/user", nil)

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.GetUserStats(rr, req)

	// Check status code - should fail with bad request
	assert.Equal(t, http.StatusBadRequest, rr.Code)
	
	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	// Log response for debugging
	t.Logf("Missing user ID response: %v", response)
	
	// Check error message
	assert.NotNil(t, response["error"])
}

func TestGetUserStatsInvalidUserID(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Create request with invalid user_id
	req, _ := http.NewRequest("GET", "/api/stats/user?user_id=invalid", nil)

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.GetUserStats(rr, req)

	// Check status code - should fail with bad request
	assert.Equal(t, http.StatusBadRequest, rr.Code)
	
	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	// Log response for debugging
	t.Logf("Invalid user ID response: %v", response)
	
	// Check error message
	assert.NotNil(t, response["error"])
}