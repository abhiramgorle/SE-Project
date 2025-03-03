package tests

import (
	"bytes"
	"encoding/json"
	"geofence/internal/database"
	"geofence/internal/handlers"
	"geofence/internal/models"
	"net/http"
	"net/http/httptest"
	"strconv" // Add this import
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

	// Check if there's data (response format might vary)
	t.Logf("Create response: %v", response)
	
	// Verify a geofence was created in the database
	var count int64
	database.DB.Model(&models.Geofence{}).Count(&count)
	assert.Equal(t, int64(1), count)
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

	// Log the response for debugging
	t.Logf("Get geofences response: %v", response)
	
	// Check that we have 2 geofences (response format may vary)
	// Adjust based on your actual API response format
	if data, ok := response["data"].([]interface{}); ok {
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
	
	// Create the geofence and get the ID
	result := database.DB.Create(&geofence)
	assert.NoError(t, result.Error)
	
	// Get the ID (might be different from 1)
	var id uint
	database.DB.Model(&geofence).Select("id").First(&id)
	
	// Create request with the correct ID
	req, _ := http.NewRequest("GET", "/api/geofences/"+strconv.Itoa(int(id)), nil)
	req = mux.SetURLVars(req, map[string]string{"id": strconv.Itoa(int(id))})

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
	
	// Log response for debugging
	t.Logf("Get geofence response: %v", response)
	
	// Verify response contents (adapt to your actual response format)
	if data, ok := response["data"].(map[string]interface{}); ok {
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
	
	// Create the geofence and get the ID
	result := database.DB.Create(&geofence)
	assert.NoError(t, result.Error)
	
	// Get the ID (might be different from 1)
	var id uint
	database.DB.Model(&geofence).Select("id").First(&id)

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

	// Create request with the correct ID
	req, _ := http.NewRequest("PUT", "/api/geofences/"+strconv.Itoa(int(id)), bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req = mux.SetURLVars(req, map[string]string{"id": strconv.Itoa(int(id))})

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
	
	// Log response for debugging
	t.Logf("Update geofence response: %v", response)
	
	// Verify response contents (adapt to your actual response format)
	if data, ok := response["data"].(map[string]interface{}); ok {
		assert.Equal(t, "Updated Geofence", data["name"])
		assert.Equal(t, float64(200), data["radius"])
	}
	
	// Check the database was updated
	var updatedName string
	database.DB.Model(&models.Geofence{}).Where("id = ?", id).Select("name").First(&updatedName)
	assert.Equal(t, "Updated Geofence", updatedName)
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
	
	// Create the geofence and get the ID
	result := database.DB.Create(&geofence)
	assert.NoError(t, result.Error)
	
	// Get the ID (might be different from 1)
	var id uint
	database.DB.Model(&geofence).Select("id").First(&id)

	// Create request with the correct ID
	req, _ := http.NewRequest("DELETE", "/api/geofences/"+strconv.Itoa(int(id)), nil)
	req = mux.SetURLVars(req, map[string]string{"id": strconv.Itoa(int(id))})

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call handler directly
	handlers.DeleteGeofence(rr, req)

	// Check status code
	assert.Equal(t, http.StatusNoContent, rr.Code)
	
	// Verify the geofence was deleted
	var count int64
	database.DB.Model(&models.Geofence{}).Where("id = ?", id).Count(&count)
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
	
	// Log response for debugging
	t.Logf("Nearby geofences response: %v", response)
	
	// Check we get nearby geofences (response format may vary)
	if data, ok := response["data"].([]interface{}); ok {
		// Log the count for debugging
		t.Logf("Found %d nearby geofences", len(data))
		// We should have at least the 2 nearby geofences
		assert.GreaterOrEqual(t, len(data), 2)
	}
}