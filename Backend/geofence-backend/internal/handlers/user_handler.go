package handlers

import (
	"encoding/json"
	"geofence/internal/database"
	"geofence/internal/middleware"
	"geofence/internal/models"
	"geofence/internal/utils"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

// Register handles user registration
func Register(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate required fields
	if user.Username == "" || user.Email == "" || user.Password == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Username, email, and password are required")
		return
	}

	// Check if email already exists
	var existingUser models.User
	if err := database.DB.Where("email = ?", user.Email).First(&existingUser).Error; err == nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Email already exists")
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error hashing password")
		return
	}
	user.Password = string(hashedPassword)

	// Create the user
	result := database.DB.Create(&user)
	if result.Error != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error registering user")
		return
	}

	// Don't return the password
	user.Password = ""
	utils.RespondWithSuccess(w, http.StatusCreated, user)
}

// Login handles user authentication
func Login(w http.ResponseWriter, r *http.Request) {
	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Find user by email
	var user models.User
	if err := database.DB.Where("email = ?", credentials.Email).First(&user).Error; err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(user.ID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error generating token")
		return
	}

	// Don't return the password
	user.Password = ""

	response := map[string]interface{}{
		"token": token,
		"user":  user,
	}

	utils.RespondWithSuccess(w, http.StatusOK, response)
}

// GetUserProfile returns the user's profile
func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by AuthMiddleware)
	userID, ok := r.Context().Value("userID").(uint)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "User not found")
		return
	}

	// Don't return password
	user.Password = ""

	utils.RespondWithSuccess(w, http.StatusOK, user)
}