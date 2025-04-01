package handlers

import (
	"encoding/json"
	"net/http"

	"geofence/internal/database"
	"geofence/internal/middleware"
	"geofence/internal/models"
	"geofence/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

// RegisterRequest represents the structure for user registration input
type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Register handles user registration
func Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	
	// Decode request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate input fields
	if req.Username == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Username is required")
		return
	}

	if req.Email == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Email is required")
		return
	}

	if req.Password == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Password is required")
		return
	}

	// Check if email already exists
	var existingUser models.User
	if err := database.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		utils.RespondWithError(w, http.StatusConflict, "Email already exists")
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error hashing password")
		return
	}

	// Create new user
	user := models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	// Save user to database
	if err := database.DB.Create(&user).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error creating user")
		return
	}

	// Prepare response (exclude password)
	response := map[string]interface{}{
		"id":       user.ID,
		"username": user.Username,
		"email":    user.Email,
	}

	utils.RespondWithSuccess(w, http.StatusCreated, response)
}

// LoginRequest represents the structure for user login input
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login handles user authentication
func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	
	// Decode request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate input fields
	if req.Email == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Email is required")
		return
	}

	if req.Password == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Password is required")
		return
	}

	// Find user by email
	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(user.ID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error generating token")
		return
	}

	// Prepare response (exclude password)
	response := map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	}

	utils.RespondWithSuccess(w, http.StatusOK, response)
}

// GetUserProfile retrieves the authenticated user's profile
func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	// Extract user ID from context (set by AuthMiddleware)
	userID, ok := r.Context().Value("userID").(uint)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Find user by ID
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "User not found")
		return
	}

	// Prepare response (exclude password)
	response := map[string]interface{}{
		"id":       user.ID,
		"username": user.Username,
		"email":    user.Email,
	}

	utils.RespondWithSuccess(w, http.StatusOK, response)
}