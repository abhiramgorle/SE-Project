package handlers

import (
	"encoding/json"
	"geofence/internal/database"
	"geofence/internal/models"
	"geofence/internal/utils"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// CreateGeofence handles the creation of a new geofence
func CreateGeofence(w http.ResponseWriter, r *http.Request) {
	var geofence models.Geofence
	if err := json.NewDecoder(r.Body).Decode(&geofence); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate required fields
	if geofence.Name == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Name is required")
		return
	}

	if geofence.Radius <= 0 {
		utils.RespondWithError(w, http.StatusBadRequest, "Radius must be greater than 0")
		return
	}

	result := database.DB.Create(&geofence)
	if result.Error != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error creating geofence")
		return
	}

	utils.RespondWithSuccess(w, http.StatusCreated, geofence)
}

// GetGeofences returns all geofences
func GetGeofences(w http.ResponseWriter, r *http.Request) {
	// Get user_id from query parameter if provided
	userID := r.URL.Query().Get("user_id")

	var geofences []models.Geofence
	var result error

	if userID != "" {
		result = database.DB.Where("user_id = ?", userID).Find(&geofences).Error
	} else {
		result = database.DB.Find(&geofences).Error
	}

	if result != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error fetching geofences")
		return
	}

	utils.RespondWithSuccess(w, http.StatusOK, geofences)
}

// GetGeofence returns a specific geofence by ID
func GetGeofence(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	var geofence models.Geofence
	result := database.DB.First(&geofence, id)
	if result.Error != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Geofence not found")
		return
	}

	utils.RespondWithSuccess(w, http.StatusOK, geofence)
}

// UpdateGeofence updates an existing geofence
func UpdateGeofence(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	var geofence models.Geofence
	if err := json.NewDecoder(r.Body).Decode(&geofence); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	var existingGeofence models.Geofence
	if err := database.DB.First(&existingGeofence, id).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Geofence not found")
		return
	}

	// Update fields
	existingGeofence.Name = geofence.Name
	existingGeofence.Description = geofence.Description
	existingGeofence.Latitude = geofence.Latitude
	existingGeofence.Longitude = geofence.Longitude
	existingGeofence.Radius = geofence.Radius

	if err := database.DB.Save(&existingGeofence).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error updating geofence")
		return
	}

	utils.RespondWithSuccess(w, http.StatusOK, existingGeofence)
}

// DeleteGeofence deletes a geofence by ID
func DeleteGeofence(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	var geofence models.Geofence
	if err := database.DB.First(&geofence, id).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Geofence not found")
		return
	}

	if err := database.DB.Delete(&geofence).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error deleting geofence")
		return
	}

	utils.RespondWithSuccess(w, http.StatusNoContent, nil)
}

// GetNearbyGeofences returns geofences near specified coordinates
func GetNearbyGeofences(w http.ResponseWriter, r *http.Request) {
	lat, err := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid latitude parameter")
		return
	}

	lng, err := strconv.ParseFloat(r.URL.Query().Get("lng"), 64)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid longitude parameter")
		return
	}

	// Simple range check for nearby geofences
	// In a production environment, you would use more sophisticated spatial queries
	var geofences []models.Geofence
	result := database.DB.Where(
		"latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?",
		lat-0.1, lat+0.1, lng-0.1, lng+0.1,
	).Find(&geofences)

	if result.Error != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error fetching nearby geofences")
		return
	}

	utils.RespondWithSuccess(w, http.StatusOK, geofences)
}
