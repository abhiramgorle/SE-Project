// internal/handlers/geofence_search_handler.go
package handlers

import (
	"net/http"
	"strconv"

	"geofence/internal/database"
	"geofence/internal/models"
	"geofence/internal/utils"
)

// SearchGeofencesAdvanced provides advanced search functionality
func SearchGeofencesAdvanced(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	category := r.URL.Query().Get("category")
	minRadius := r.URL.Query().Get("min_radius")
	maxRadius := r.URL.Query().Get("max_radius")
	
	db := database.DB.Model(&models.Geofence{})

	if query != "" {
		db = db.Where("name LIKE ? OR description LIKE ?", "%"+query+"%", "%"+query+"%")
	}

	if category != "" {
		db = db.Joins("JOIN geofence_categories ON geofences.id = geofence_categories.geofence_id")
		db = db.Where("geofence_categories.category_id = ?", category)
	}

	if minRadius != "" {
		if radius, err := strconv.ParseFloat(minRadius, 64); err == nil {
			db = db.Where("radius >= ?", radius)
		}
	}

	if maxRadius != "" {
		if radius, err := strconv.ParseFloat(maxRadius, 64); err == nil {
			db = db.Where("radius <= ?", radius)
		}
	}

	var geofences []models.Geofence
	if err := db.Find(&geofences).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Search failed")
		return
	}

	utils.RespondWithSuccess(w, http.StatusOK, geofences)
}