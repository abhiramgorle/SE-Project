package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"geofence/internal/handlers"
	"geofence/internal/models"

	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
)

func setupTestDB() {
	// This is a mock setup that you would implement
	// For real tests, you might use an in-memory SQLite database
}

func TestCreateGeofence(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Initialize router
	router := mux.NewRouter()
	router.HandleFunc("/api/geofences", handlers.CreateGeofence).Methods("POST")

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

	// Serve the request
	router.ServeHTTP(rr, req)

	// Check status code
	assert.Equal(t, http.StatusCreated, rr.Code)

	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Check response data
	assert.Equal(t, "success", response["status"])
	assert.NotNil(t, response["data"])
}

func TestGetGeofences(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Initialize router
	router := mux.NewRouter()
	router.HandleFunc("/api/geofences", handlers.GetGeofences).Methods("GET")

	// Create request
	req, _ := http.NewRequest("GET", "/api/geofences", nil)

	// Create response recorder
	rr := httptest.NewRecorder()

	// Serve the request
	router.ServeHTTP(rr, req)

	// Check status code
	assert.Equal(t, http.StatusOK, rr.Code)

	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Check response status
	assert.Equal(t, "success", response["status"])
}

func TestGetGeofence(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Initialize router
	router := mux.NewRouter()
	router.HandleFunc("/api/geofences/{id}", handlers.GetGeofence).Methods("GET")

	// Create request
	req, _ := http.NewRequest("GET", "/api/geofences/1", nil)

	// Create response recorder
	rr := httptest.NewRecorder()

	// Serve the request
	router.ServeHTTP(rr, req)

	// Check status code - expect 404 since no geofence exists in test DB
	assert.Equal(t, http.StatusNotFound, rr.Code)
}

func TestGetNearbyGeofences(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Initialize router
	router := mux.NewRouter()
	router.HandleFunc("/api/geofences/nearby", handlers.GetNearbyGeofences).Methods("GET")

	// Create request
	req, _ := http.NewRequest("GET", "/api/geofences/nearby?lat=37.7749&lng=-122.4194", nil)

	// Create response recorder
	rr := httptest.NewRecorder()

	// Serve the request
	router.ServeHTTP(rr, req)

	// Check status code
	assert.Equal(t, http.StatusOK, rr.Code)

	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)

	// Check response status
	assert.Equal(t, "success", response["status"])
}
