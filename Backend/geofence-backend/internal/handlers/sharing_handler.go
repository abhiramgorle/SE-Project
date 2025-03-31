// internal/handlers/sharing_handler.go

package handlers

import (
	"encoding/json"
	"geofence/internal/database"
	"geofence/internal/models"
	"geofence/internal/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

// GeofenceShare represents sharing a geofence with a user
type GeofenceShare struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	GeofenceID uint      `json:"geofence_id"`
	OwnerID    uint      `json:"owner_id"`
	UserID     uint      `json:"user_id"`
	Permission string    `json:"permission"` // "view", "edit", "admin"
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// ShareGeofence allows users to share a geofence with another user
func ShareGeofence(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	geofenceID := params["id"]
	
	// Get user ID from context
	ownerID, ok := r.Context().Value("userID").(uint)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}
	
	var shareRequest struct {
		UserID     uint   `json:"user_id"`
		Permission string `json:"permission"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&shareRequest); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	
	// Validate permission
	if shareRequest.Permission != "view" && shareRequest.Permission != "edit" && shareRequest.Permission != "admin" {
		utils.RespondWithError(w, http.StatusBadRequest, "Permission must be 'view', 'edit', or 'admin'")
		return
	}
	
	id, err := strconv.Atoi(geofenceID)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid geofence ID")
		return
	}
	
	// Verify geofence exists and user is the owner
	var geofence models.Geofence
	if err := database.DB.First(&geofence, id).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Geofence not found")
		return
	}
	
	if geofence.UserID != ownerID {
		utils.RespondWithError(w, http.StatusForbidden, "Only the owner can share this geofence")
		return
	}
	
	// Verify target user exists
	var targetUser models.User
	if err := database.DB.First(&targetUser, shareRequest.UserID).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Target user not found")
		return
	}
	
	// Check if already shared
	var existingShare GeofenceShare
	result := database.DB.Where("geofence_id = ? AND user_id = ?", id, shareRequest.UserID).First(&existingShare)
	
	if result.Error == nil {
		// Update existing share
		existingShare.Permission = shareRequest.Permission
		existingShare.UpdatedAt = time.Now()
		
		if err := database.DB.Save(&existingShare).Error; err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Error updating share")
			return
		}
		
		utils.RespondWithSuccess(w, http.StatusOK, existingShare)
		return
	}
	
	// Create new share
	newShare := GeofenceShare{
		GeofenceID: uint(id),
		OwnerID:    ownerID,
		UserID:     shareRequest.UserID,
		Permission: shareRequest.Permission,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	
	if err := database.DB.Create(&newShare).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error creating share")
		return
	}
	
	utils.RespondWithSuccess(w, http.StatusCreated, newShare)
}

// GetSharedGeofences returns all geofences shared with the current user
func GetSharedGeofences(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value("userID").(uint)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}
	
	var shares []GeofenceShare
	if err := database.DB.Where("user_id = ?", userID).Find(&shares).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error fetching shares")
		return
	}
	
	// If no shares, return empty array
	if len(shares) == 0 {
		utils.RespondWithSuccess(w, http.StatusOK, []GeofenceShare{})
		return
	}
	
	// Get geofence details for each share
	var geofenceIDs []uint
	for _, share := range shares {
		geofenceIDs = append(geofenceIDs, share.GeofenceID)
	}
	
	var geofences []models.Geofence
	if err := database.DB.Where("id IN ?", geofenceIDs).Find(&geofences).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error fetching geofences")
		return
	}
	
	// Combine share data with geofence data
	type SharedGeofence struct {
		Geofence   models.Geofence `json:"geofence"`
		Permission string          `json:"permission"`
		OwnerID    uint            `json:"owner_id"`
		SharedAt   time.Time       `json:"shared_at"`
	}
	
	var sharedGeofences []SharedGeofence
	for _, geofence := range geofences {
		for _, share := range shares {
			if share.GeofenceID == geofence.ID {
				sharedGeofences = append(sharedGeofences, SharedGeofence{
					Geofence:   geofence,
					Permission: share.Permission,
					OwnerID:    share.OwnerID,
					SharedAt:   share.CreatedAt,
				})
				break
			}
		}
	}
	
	utils.RespondWithSuccess(w, http.StatusOK, sharedGeofences)
}