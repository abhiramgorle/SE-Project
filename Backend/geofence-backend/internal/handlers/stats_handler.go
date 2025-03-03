package handlers

import (
	"net/http"
	"strconv"

	"geofence/internal/database"
	"geofence/internal/models"
	"geofence/internal/utils"
)

// GetUserStats returns statistics for a user
func GetUserStats(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "User ID is required")
		return
	}

	id, err := strconv.Atoi(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	// Count user's geofences
	var geofenceCount int64
	database.DB.Model(&models.Geofence{}).Where("user_id = ?", id).Count(&geofenceCount)

	// Count content items
	var contentCount int64
	database.DB.Model(&models.Content{}).
		Joins("JOIN geofences ON contents.geofence_id = geofences.id").
		Where("geofences.user_id = ?", id).
		Count(&contentCount)

	// Get latest geofence
	var latestGeofence models.Geofence
	database.DB.Where("user_id = ?", id).Order("created_at DESC").First(&latestGeofence)

	// Get most active locations (top 3 geofences by content count)
	type GeofenceStat struct {
		ID           uint   `json:"id"`
		Name         string `json:"name"`
		ContentCount int64  `json:"content_count"`
	}

	var activeGeofences []GeofenceStat
	database.DB.Model(&models.Geofence{}).
		Select("geofences.id, geofences.name, COUNT(contents.id) as content_count").
		Joins("LEFT JOIN contents ON geofences.id = contents.geofence_id").
		Where("geofences.user_id = ?", id).
		Group("geofences.id").
		Order("content_count DESC").
		Limit(3).
		Scan(&activeGeofences)

	stats := map[string]interface{}{
		"geofence_count":        geofenceCount,
		"content_count":         contentCount,
		"latest_geofence":       latestGeofence,
		"most_active_locations": activeGeofences,
	}

	utils.RespondWithSuccess(w, http.StatusOK, stats)
}

// GetSystemStats returns overall system statistics
func GetSystemStats(w http.ResponseWriter, r *http.Request) {
	// Count total users
	var userCount int64
	database.DB.Model(&models.User{}).Count(&userCount)

	// Count total geofences
	var geofenceCount int64
	database.DB.Model(&models.Geofence{}).Count(&geofenceCount)

	// Count total content
	var contentCount int64
	database.DB.Model(&models.Content{}).Count(&contentCount)

	// Get latest registered user
	var latestUser models.User
	database.DB.Order("created_at DESC").First(&latestUser)
	latestUser.Password = "" // Don't expose password

	stats := map[string]interface{}{
		"user_count":     userCount,
		"geofence_count": geofenceCount,
		"content_count":  contentCount,
		"latest_user":    latestUser,
	}

	utils.RespondWithSuccess(w, http.StatusOK, stats)
}
