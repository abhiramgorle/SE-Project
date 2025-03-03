package handlers

import (
    "encoding/json"
    "net/http"
    "golang.org/x/crypto/bcrypt"
    "geofence/internal/database"
    "geofence/internal/models"
    "geofence/internal/utils"
    "time"
    "github.com/golang-jwt/jwt/v4"
)

// JWT secret key - in production, this should be set via environment variables
var jwtKey = []byte("your_secret_key")

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

    // Check if email is already in use
    var existingUser models.User
    if result := database.DB.Where("email = ?", user.Email).First(&existingUser); result.Error == nil {
        utils.RespondWithError(w, http.StatusBadRequest, "Email already in use")
        return
    }

    // Check if username is already in use
    if result := database.DB.Where("username = ?", user.Username).First(&existingUser); result.Error == nil {
        utils.RespondWithError(w, http.StatusBadRequest, "Username already in use")
        return
    }

    // Hash the password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Error hashing password")
        return
    }
    user.Password = string(hashedPassword)

    // Create the user in the database
    result := database.DB.Create(&user)
    if result.Error != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Error creating user")
        return
    }

    // Don't return the password
    user.Password = ""
    utils.RespondWithSuccess(w, http.StatusCreated, user)
}

// Login handles user authentication
func Login(w http.ResponseWriter, r *http.Request) {
    var loginUser models.User
    if err := json.NewDecoder(r.Body).Decode(&loginUser); err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
        return
    }

    // Validate required fields
    if loginUser.Email == "" || loginUser.Password == "" {
        utils.RespondWithError(w, http.StatusBadRequest, "Email and password are required")
        return
    }

    // Find the user by email
    var user models.User
    result := database.DB.Where("email = ?", loginUser.Email).First(&user)
    if result.Error != nil {
        utils.RespondWithError(w, http.StatusUnauthorized, "Invalid credentials")
        return
    }

    // Check if the password is correct
    err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginUser.Password))
    if err != nil {
        utils.RespondWithError(w, http.StatusUnauthorized, "Invalid credentials")
        return
    }

    // Generate JWT token
    expirationTime := time.Now().Add(24 * time.Hour)
    claims := &jwt.RegisteredClaims{
        Subject:   user.Email,
        ExpiresAt: jwt.NewNumericDate(expirationTime),
        IssuedAt:  jwt.NewNumericDate(time.Now()),
        ID:        user.Username,
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString(jwtKey)
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Error generating token")
        return
    }

    // Don't return the password
    user.Password = ""
    
    // Return user data and token
    response := map[string]interface{}{
        "user":  user,
        "token": tokenString,
    }
    
    utils.RespondWithSuccess(w, http.StatusOK, response)
}

// GetProfile gets the profile information for the current user
func GetProfile(w http.ResponseWriter, r *http.Request) {
    // This would typically extract user ID from the JWT token
    // For now we'll just use the user_id query parameter
    userID := r.URL.Query().Get("user_id")
    if userID == "" {
        utils.RespondWithError(w, http.StatusBadRequest, "User ID is required")
        return
    }

    var user models.User
    result := database.DB.First(&user, userID)
    if result.Error != nil {
        utils.RespondWithError(w, http.StatusNotFound, "User not found")
        return
    }

    // Don't return the password
    user.Password = ""
    utils.RespondWithSuccess(w, http.StatusOK, user)
}

// UpdateProfile updates the user's profile information
func UpdateProfile(w http.ResponseWriter, r *http.Request) {
    userID := r.URL.Query().Get("user_id")
    if userID == "" {
        utils.RespondWithError(w, http.StatusBadRequest, "User ID is required")
        return
    }

    var updatedUser models.User
    if err := json.NewDecoder(r.Body).Decode(&updatedUser); err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
        return
    }

    var user models.User
    result := database.DB.First(&user, userID)
    if result.Error != nil {
        utils.RespondWithError(w, http.StatusNotFound, "User not found")
        return
    }

    // Update fields
    if updatedUser.Username != "" {
        user.Username = updatedUser.Username
    }
    if updatedUser.Email != "" {
        user.Email = updatedUser.Email
    }
    if updatedUser.Password != "" {
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updatedUser.Password), bcrypt.DefaultCost)
        if err != nil {
            utils.RespondWithError(w, http.StatusInternalServerError, "Error hashing password")
            return
        }
        user.Password = string(hashedPassword)
    }

    if err := database.DB.Save(&user).Error; err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Error updating user")
        return
    }

    // Don't return the password
    user.Password = ""
    utils.RespondWithSuccess(w, http.StatusOK, user)
}

// DeleteAccount deletes a user account
func DeleteAccount(w http.ResponseWriter, r *http.Request) {
    userID := r.URL.Query().Get("user_id")
    if userID == "" {
        utils.RespondWithError(w, http.StatusBadRequest, "User ID is required")
        return
    }

    var user models.User
    if err := database.DB.First(&user, userID).Error; err != nil {
        utils.RespondWithError(w, http.StatusNotFound, "User not found")
        return
    }

    // Delete related data
    database.DB.Where("user_id = ?", userID).Delete(&models.Geofence{})
    
    // Delete user
    if err := database.DB.Delete(&user).Error; err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Error deleting user")
        return
    }

    utils.RespondWithSuccess(w, http.StatusNoContent, nil)
}