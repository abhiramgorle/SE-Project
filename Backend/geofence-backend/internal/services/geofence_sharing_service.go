// internal/services/geofence_sharing_service.go
package services

import (
	"errors"

	"geofence/internal/database"
	"geofence/internal/models"
)

// GeofenceShareService manages geofence sharing
type GeofenceShareService struct{}

// ShareGeofence allows a user to share a geofence with another user
func (s *GeofenceShareService) ShareGeofence(ownerID, targetUserID, geofenceID uint, permission string) error {
	// Validate permission
	if permission != "view" && permission != "edit" && permission != "admin" {
		return errors.New("invalid permission level")
	}

	// Check geofence ownership
	var geofence models.Geofence
	if err := database.DB.First(&geofence, geofenceID).Error; err != nil {
		return err
	}

	if geofence.UserID != ownerID {
		return errors.New("only geofence owner can share")
	}

	// Create or update share
	share := models.GeofenceShare{
		GeofenceID: geofenceID,
		UserID:     targetUserID,
		Permission: permission,
	}

	return database.DB.Save(&share).Error
}