package handlers

import (
	"encoding/json"
	"geofence/internal/database"
	"geofence/internal/utils"
	"net/http"
	"time"
)

// UserPreferences represents user preferences
type UserPreferences struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	UserID           uint      `json:"user_id" gorm:"uniqueIndex"`
	Language         string    `json:"language" gorm:"default:'en'"`
	DistanceUnit     string    `json:"distance_unit" gorm:"default:'km'"`
	TemperatureUnit  string    `json:"temperature_unit" gorm:"default:'celsius'"`
	NotificationsEnabled bool   `json:"notifications_enabled" gorm:"default:true"`
	DarkMode         bool      `json:"dark_mode" gorm:"default:false"`
	AutoCheckIn      bool      `json:"auto_check_in" gorm:"default:true"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// GetUserPreferences returns the preferences for the current user
func GetUserPreferences(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value("userID").(uint)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}
	
	// Find user preferences
	var preferences UserPreferences
	result := database.DB.Where("user_id = ?", userID).First(&preferences)
	
	// If preferences don't exist, create default preferences
	if result.Error != nil {
		preferences = UserPreferences{
			UserID:               userID,
			Language:             "en",
			DistanceUnit:         "km",
			TemperatureUnit:      "celsius",
			NotificationsEnabled: true,
			DarkMode:             false,
			AutoCheckIn:          true,
			CreatedAt:            time.Now(),
			UpdatedAt:            time.Now(),
		}
		
		if err := database.DB.Create(&preferences).Error; err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Error creating default preferences")
			return
		}
	}
	
	utils.RespondWithSuccess(w, http.StatusOK, preferences)
}

// UpdateUserPreferences updates the preferences for the current user
func UpdateUserPreferences(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value("userID").(uint)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}
	
	// Parse the request body
	var preferences UserPreferences
	if err := json.NewDecoder(r.Body).Decode(&preferences); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	
	// Find existing preferences
	var existingPreferences UserPreferences
	result := database.DB.Where("user_id = ?", userID).First(&existingPreferences)
	
	if result.Error != nil {
		// Create new preferences
		preferences.UserID = userID
		preferences.CreatedAt = time.Now()
		preferences.UpdatedAt = time.Now()
		
		if err := database.DB.Create(&preferences).Error; err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Error creating preferences")
			return
		}
	} else {
		// Update existing preferences
		existingPreferences.Language = preferences.Language
		existingPreferences.DistanceUnit = preferences.DistanceUnit
		existingPreferences.TemperatureUnit = preferences.TemperatureUnit
		existingPreferences.NotificationsEnabled = preferences.NotificationsEnabled
		existingPreferences.DarkMode = preferences.DarkMode
		existingPreferences.AutoCheckIn = preferences.AutoCheckIn
		existingPreferences.UpdatedAt = time.Now()
		
		if err := database.DB.Save(&existingPreferences).Error; err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Error updating preferences")
			return
		}
		
		preferences = existingPreferences
	}
	
	utils.RespondWithSuccess(w, http.StatusOK, preferences)
}