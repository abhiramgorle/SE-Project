package tests

import (
	"bytes"
	"encoding/json"
	"geofence/internal/database"
	"geofence/internal/handlers"
	"geofence/internal/models"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
)

func TestCreateContent(t *testing.T) {
	// Set up test database
	setupTestDB()
	
	// First create a test user
	user := models.User{
		Username: "contentuser",
		Email:    "content@example.com",
		Password: "password123",
	}
	database.DB.Create(&user)
	
	// Create a test geofence
	geofence := models.Geofence{
		Name:        "Content Test Geofence",
		Description: "Test Description",
		Latitude:    37.7749,
		Longitude:   -122.4194,
		Radius:      100,
		UserID:      user.ID,
	}
	database.DB.Create(&geofence)
	
	// Test content data
	content := models.Content{
		Title:       "Test Content",
		Description: "Test Content Description",
		Type:        "text",
		GeofenceID:  geofence.ID,
	}
	
	// Convert to JSON
	jsonData, _ := json.Marshal(content)
	
	// Create request
	req, _ := http.NewRequest("POST", "/api/contents", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	
	// Create response recorder
	rr := httptest.NewRecorder()
	
	// Call handler directly
	handlers.CreateContent(rr, req)
	
	// Check status code
	assert.Equal(t, http.StatusCreated, rr.Code)
	
	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	// Verify content was created in the database
	var count int64
	database.DB.Model(&models.Content{}).Count(&count)
	assert.Equal(t, int64(1), count)
}

func TestGetContents(t *testing.T) {
	// Set up test database
	setupTestDB()
	
	// Create a test user and geofence
	user := models.User{
		Username: "contentuser",
		Email:    "content@example.com",
		Password: "password123",
	}
	database.DB.Create(&user)
	
	geofence := models.Geofence{
		Name:        "Content Test Geofence",
		Description: "Test Description",
		Latitude:    37.7749,
		Longitude:   -122.4194,
		Radius:      100,
		UserID:      user.ID,
	}
	database.DB.Create(&geofence)
	
	// Create test content items
	contents := []models.Content{
		{
			Title:       "Content 1",
			Description: "Description 1",
			Type:        "text",
			GeofenceID:  geofence.ID,
		},
		{
			Title:       "Content 2",
			Description: "Description 2",
			Type:        "image",
			URL:         "http://example.com/image.jpg",
			GeofenceID:  geofence.ID,
		},
	}
	
	for _, c := range contents {
		database.DB.Create(&c)
	}
	
	// Create request
	req, _ := http.NewRequest("GET", "/api/contents?geofence_id="+strconv.Itoa(int(geofence.ID)), nil)
	
	// Create response recorder
	rr := httptest.NewRecorder()
	
	// Call handler directly
	handlers.GetContents(rr, req)
	
	// Check status code
	assert.Equal(t, http.StatusOK, rr.Code)
	
	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	// Check we have 2 content items
	if data, ok := response["data"].([]interface{}); ok {
		assert.Equal(t, 2, len(data))
	}
}

func TestGetContent(t *testing.T) {
	// Set up test database
	setupTestDB()
	
	// Create a test user and geofence
	user := models.User{
		Username: "contentuser",
		Email:    "content@example.com",
		Password: "password123",
	}
	database.DB.Create(&user)
	
	geofence := models.Geofence{
		Name:        "Content Test Geofence",
		Description: "Test Description",
		Latitude:    37.7749,
		Longitude:   -122.4194,
		Radius:      100,
		UserID:      user.ID,
	}
	database.DB.Create(&geofence)
	
	// Create test content
	content := models.Content{
		Title:       "Test Content",
		Description: "Test Content Description",
		Type:        "text",
		GeofenceID:  geofence.ID,
	}
	database.DB.Create(&content)
	
	// Create request
	req, _ := http.NewRequest("GET", "/api/contents/"+strconv.Itoa(int(content.ID)), nil)
	req = mux.SetURLVars(req, map[string]string{"id": strconv.Itoa(int(content.ID))})
	
	// Create response recorder
	rr := httptest.NewRecorder()
	
	// Call handler directly
	handlers.GetContent(rr, req)
	
	// Check status code
	assert.Equal(t, http.StatusOK, rr.Code)
	
	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	// Check content details
	if data, ok := response["data"].(map[string]interface{}); ok {
		assert.Equal(t, "Test Content", data["title"])
	}
}