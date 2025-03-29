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

// CreateContent handles the creation of new content for a geofence
func CreateContent(w http.ResponseWriter, r *http.Request) {
	var content models.Content
	if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate required fields
	if content.Title == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Title is required")
		return
	}

	if content.GeofenceID == 0 {
		utils.RespondWithError(w, http.StatusBadRequest, "Geofence ID is required")
		return
	}

	// Verify the geofence exists
	var geofence models.Geofence
	if err := database.DB.First(&geofence, content.GeofenceID).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Geofence not found")
		return
	}

	result := database.DB.Create(&content)
	if result.Error != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error creating content")
		return
	}

	utils.RespondWithSuccess(w, http.StatusCreated, content)
}

// GetContents returns all content for a geofence
func GetContents(w http.ResponseWriter, r *http.Request) {
	geofenceID := r.URL.Query().Get("geofence_id")

	if geofenceID == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Geofence ID is required")
		return
	}

	var contents []models.Content
	result := database.DB.Where("geofence_id = ?", geofenceID).Find(&contents)
	if result.Error != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error fetching contents")
		return
	}

	utils.RespondWithSuccess(w, http.StatusOK, contents)
}

// GetContent returns a specific content by ID
func GetContent(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	var content models.Content
	result := database.DB.First(&content, id)
	if result.Error != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Content not found")
		return
	}

	utils.RespondWithSuccess(w, http.StatusOK, content)
}

// UpdateContent updates existing content
func UpdateContent(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	var content models.Content
	if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	var existingContent models.Content
	if err := database.DB.First(&existingContent, id).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Content not found")
		return
	}

	// Update fields
	existingContent.Title = content.Title
	existingContent.Description = content.Description
	existingContent.Type = content.Type
	existingContent.URL = content.URL

	if err := database.DB.Save(&existingContent).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error updating content")
		return
	}

	utils.RespondWithSuccess(w, http.StatusOK, existingContent)
}

// DeleteContent deletes content by ID
func DeleteContent(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	var content models.Content
	if err := database.DB.First(&content, id).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Content not found")
		return
	}

	if err := database.DB.Delete(&content).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error deleting content")
		return
	}

	utils.RespondWithSuccess(w, http.StatusNoContent, nil)
}