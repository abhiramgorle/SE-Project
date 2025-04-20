// internal/handlers/user_preference_handler.go
package handlers

import (
	"encoding/json"
	"net/http"

	"geofence/internal/database"
	"geofence/internal/models"
	"geofence/internal/utils"
)

// UpdateUserPreferences allows users to update their application preferences
func UpdateUserPreferences(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var preferences models.UserPreference
	if err := json.NewDecoder(r.Body).Decode(&preferences); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid preferences")
		return
	}

	preferences.UserID = userID
	result := database.DB.Save(&preferences)
	if result.Error != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update preferences")
		return
	}

	utils.RespondWithSuccess(w, http.StatusOK, preferences)
}