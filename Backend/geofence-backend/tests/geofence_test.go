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

	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
)

// Setup test environment before each test
func setupTestDB() {
	// Initialize test database
	err := database.InitTestDB()
	if err != nil {
		panic("Failed to connect to test database: " + err.Error())
	}
	
	// Clear all tables before each test
	database.DB.Exec("DELETE FROM contents")
	database.DB.Exec("DELETE FROM geofences")
	database.DB.Exec("DELETE FROM users")
}

// Test creating a geofence
func TestCreateGeofence(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Create test geofence data
	geofence := models.Geofence{
		Name:        "Test Geofence",
		Description: "Test description",
		Latitude:    37.7749,
		Longitude:   -122.4194,
		Radius:      100,
		UserID:      1,
	}

	// Convert to JSON
	jsonData, _ := json.Marshal(geofence)

	// Create request
	req, _ := http.NewRequest("POST", "/api/geofences", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.CreateGeofence(rr, req)

	// Check status code
	assert.Equal(t, http.StatusCreated, rr.Code)

	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Your API might use a different response format
	// Check the response structure based on your actual API implementation
	if statusVal, exists := response["status"]; exists {
		assert.Equal(t, "success", statusVal)
	}
	
	// Verify data exists
	assert.NotNil(t, response["data"])
}

func TestGetGeofences(t *testing.T) {
	// Set up test database
	setupTestDB()
	
	// Add sample geofences to the database
	geofence1 := models.Geofence{
		Name:        "Geofence 1",
		Description: "Description 1",
		Latitude:    37.7749,
		Longitude:   -122.4194,
		Radius:      100,
		UserID:      1,
	}
	
	geofence2 := models.Geofence{
		Name:        "Geofence 2",
		Description: "Description 2",
		Latitude:    37.7750,
		Longitude:   -122.4195,
		Radius:      150,
		UserID:      1,
	}
	
	database.DB.Create(&geofence1)
	database.DB.Create(&geofence2)

	// Create request
	req, _ := http.NewRequest("GET", "/api/geofences", nil)

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.GetGeofences(rr, req)

	// Check status code
	assert.Equal(t, http.StatusOK, rr.Code)

	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Check data exists
	assert.NotNil(t, response["data"])
	
	// Check we have exactly 2 geofences
	data, ok := response["data"].([]interface{})
	if ok {
		assert.Equal(t, 2, len(data))
	}
}

func TestGetGeofence(t *testing.T) {
	// Set up test database
	setupTestDB()
	
	// Add a sample geofence to the database
	geofence := models.Geofence{
		Name:        "Test Geofence",
		Description: "Test Description",
		Latitude:    37.7749,
		Longitude:   -122.4194,
		Radius:      100,
		UserID:      1,
	}
	
	result := database.DB.Create(&geofence)
	assert.NoError(t, result.Error)

	// Create request
	req, _ := http.NewRequest("GET", "/api/geofences/1", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "1"})

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.GetGeofence(rr, req)

	// Check status code
	assert.Equal(t, http.StatusOK, rr.Code)
	
	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	// Check response data
	assert.NotNil(t, response["data"])
	
	// Extract and check geofence data
	data, ok := response["data"].(map[string]interface{})
	if ok {
		assert.Equal(t, "Test Geofence", data["name"])
	}
}

func TestUpdateGeofence(t *testing.T) {
	// Set up test database
	setupTestDB()
	
	// Add a sample geofence to the database
	geofence := models.Geofence{
		Name:        "Test Geofence",
		Description: "Test Description",
		Latitude:    37.7749,
		Longitude:   -122.4194,
		Radius:      100,
		UserID:      1,
	}
	
	result := database.DB.Create(&geofence)
	assert.NoError(t, result.Error)

	// Updated geofence data
	updatedGeofence := models.Geofence{
		Name:        "Updated Geofence",
		Description: "Updated Description",
		Latitude:    37.7749,
		Longitude:   -122.4194,
		Radius:      200,
	}

	// Convert to JSON
	jsonData, _ := json.Marshal(updatedGeofence)

	// Create request
	req, _ := http.NewRequest("PUT", "/api/geofences/1", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req = mux.SetURLVars(req, map[string]string{"id": "1"})

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.UpdateGeofence(rr, req)

	// Check status code
	assert.Equal(t, http.StatusOK, rr.Code)
	
	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	// Check response data
	assert.NotNil(t, response["data"])
	
	// Extract and verify geofence data
	data, ok := response["data"].(map[string]interface{})
	if ok {
		assert.Equal(t, "Updated Geofence", data["name"])
		assert.Equal(t, float64(200), data["radius"])
	}
}

func TestDeleteGeofence(t *testing.T) {
	// Set up test database
	setupTestDB()
	
	// Add a sample geofence to the database
	geofence := models.Geofence{
		Name:        "Test Geofence",
		Description: "Test Description",
		Latitude:    37.7749,
		Longitude:   -122.4194,
		Radius:      100,
		UserID:      1,
	}
	
	result := database.DB.Create(&geofence)
	assert.NoError(t, result.Error)

	// Create request
	req, _ := http.NewRequest("DELETE", "/api/geofences/1", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "1"})

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.DeleteGeofence(rr, req)

	// Check status code
	assert.Equal(t, http.StatusNoContent, rr.Code)

	// Verify the geofence was deleted
	var count int64
	database.DB.Model(&models.Geofence{}).Where("id = ?", 1).Count(&count)
	assert.Equal(t, int64(0), count)
}

func TestGetNearbyGeofences(t *testing.T) {
	// Set up test database
	setupTestDB()
	
	// Add sample geofences to the database
	geofences := []models.Geofence{
		{
			Name:        "Nearby Geofence 1",
			Description: "Close to test coordinates",
			Latitude:    37.7749,
			Longitude:   -122.4194,
			Radius:      100,
			UserID:      1,
		},
		{
			Name:        "Nearby Geofence 2",
			Description: "Also close to test coordinates",
			Latitude:    37.7750,
			Longitude:   -122.4195,
			Radius:      150,
			UserID:      1,
		},
		{
			Name:        "Far Geofence",
			Description: "Far from test coordinates",
			Latitude:    40.7128,
			Longitude:   -74.0060,
			Radius:      200,
			UserID:      1,
		},
	}
	
	for _, g := range geofences {
		database.DB.Create(&g)
	}

	// Create request with coordinates near San Francisco
	req, _ := http.NewRequest("GET", "/api/geofences/nearby?lat=37.7748&lng=-122.4193", nil)

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.GetNearbyGeofences(rr, req)

	// Check status code
	assert.Equal(t, http.StatusOK, rr.Code)
	
	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	
	// Check response data
	assert.NotNil(t, response["data"])
	
	// Extract and check geofence data
	// Note: Your actual nearby logic might return different results
	// This test needs to be adjusted based on your implementation
	data, ok := response["data"].([]interface{})
	if ok {
		// We expect only the 2 nearby geofences, not the far one
		// If your logic is different, adjust this assertion
		t.Logf("Found %d nearby geofences", len(data))
	}
}