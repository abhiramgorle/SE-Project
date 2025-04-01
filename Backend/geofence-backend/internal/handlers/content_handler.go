package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"geofence/internal/database"
	"geofence/internal/models"
	"geofence/internal/utils"

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

	// Verify geofence exists
	var geofence models.Geofence
	if err := database.DB.First(&geofence, content.GeofenceID).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Geofence not found")
		return
	}

	// Create the content
	result := database.DB.Create(&content)
	if result.Error != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error creating content")
		return
	}

	utils.RespondWithSuccess(w, http.StatusCreated, content)
}

// GetContents returns all content for a specific geofence
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

	// Convert ID to uint
	contentID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid content ID")
		return
	}

	var content models.Content
	result := database.DB.First(&content, contentID)
	if result.Error != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Content not found")
		return
	}

	utils.RespondWithSuccess(w, http.StatusOK, content)
}

// UpdateContent updates an existing content
func UpdateContent(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	// Convert ID to uint
	contentID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid content ID")
		return
	}

	var content models.Content
	if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Find the existing content
	var existingContent models.Content
	result := database.DB.First(&existingContent, contentID)
	if result.Error != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Content not found")
		return
	}

	// Update fields
	existingContent.Title = content.Title
	existingContent.Description = content.Description
	existingContent.Type = content.Type
	existingContent.URL = content.URL

	// Save the updated content
	saveResult := database.DB.Save(&existingContent)
	if saveResult.Error != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error updating content")
		return
	}

	utils.RespondWithSuccess(w, http.StatusOK, existingContent)
}

// DeleteContent removes a content by ID
func DeleteContent(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	// Convert ID to uint
	contentID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid content ID")
		return
	}

	// Find the content
	var content models.Content
	result := database.DB.First(&content, contentID)
	if result.Error != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Content not found")
		return
	}

	// Delete the content
	deleteResult := database.DB.Delete(&content)
	if deleteResult.Error != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error deleting content")
		return
	}

	utils.RespondWithSuccess(w, http.StatusNoContent, nil)
}