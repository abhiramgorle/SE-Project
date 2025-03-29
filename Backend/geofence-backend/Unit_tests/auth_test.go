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

func TestRegisterValidation(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Test cases
	testCases := []struct {
		name           string
		userData       map[string]string
		expectedStatus int
	}{
		{
			name: "Valid Registration",
			userData: map[string]string{
				"username": "testuser",
				"email":    "test@example.com",
				"password": "password123",
			},
			expectedStatus: http.StatusCreated,
		},
		{
			name: "Missing Username",
			userData: map[string]string{
				"email":    "test2@example.com",
				"password": "password123",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Missing Email",
			userData: map[string]string{
				"username": "testuser2",
				"password": "password123",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Missing Password",
			userData: map[string]string{
				"username": "testuser3",
				"email":    "test3@example.com",
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Convert to JSON
			jsonUser, _ := json.Marshal(tc.userData)

			// Create request
			req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(jsonUser))
			req.Header.Set("Content-Type", "application/json")

			// Create response recorder
			rr := httptest.NewRecorder()

			// Call handler directly
			handlers.Register(rr, req)

			// Check status code
			assert.Equal(t, tc.expectedStatus, rr.Code)
		})
	}
}

func TestLoginSuccess(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Create a test user with a hashed password
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	user := models.User{
		Username: "logintest",
		Email:    "login@example.com",
		Password: string(hashedPassword),
	}
	database.DB.Create(&user)

	// Create login credentials
	credentials := map[string]string{
		"email":    "login@example.com",
		"password": password,
	}

	// Convert to JSON
	jsonCredentials, _ := json.Marshal(credentials)

	// Create request
	req, _ := http.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonCredentials))
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

	// Check token exists
	data, ok := response["data"].(map[string]interface{})
	if ok {
		_, hasToken := data["token"]
		assert.True(t, hasToken, "Response should contain a token")
	}
}

func TestLoginFailure(t *testing.T) {
	// Set up test database
	setupTestDB()

	// Create a test user with a hashed password
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	user := models.User{
		Username: "logintest",
		Email:    "login@example.com",
		Password: string(hashedPassword),
	}
	database.DB.Create(&user)

	// Test cases
	testCases := []struct {
		name           string
		credentials    map[string]string
		expectedStatus int
	}{
		{
			name: "Wrong Password",
			credentials: map[string]string{
				"email":    "login@example.com",
				"password": "wrongpassword",
			},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "User Not Found",
			credentials: map[string]string{
				"email":    "nonexistent@example.com",
				"password": "password123",
			},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "Missing Email",
			credentials: map[string]string{
				"password": "password123",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Missing Password",
			credentials: map[string]string{
				"email": "login@example.com",
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Convert to JSON
			jsonCredentials, _ := json.Marshal(tc.credentials)

			// Create request
			// Create request
			req, _ := http.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonCredentials))
			req.Header.Set("Content-Type", "application/json")

			// Create response recorder
			rr := httptest.NewRecorder()

			// Call handler directly
			handlers.Login(rr, req)

			// Check status code
			assert.Equal(t, tc.expectedStatus, rr.Code)
		})
	}
}