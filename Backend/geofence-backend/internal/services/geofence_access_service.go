// internal/services/geofence_access_service.go
package services

import (
	"geofence/internal/database"
	"geofence/internal/models"
	"errors"
)

type GeofenceAccessService struct{}

// CheckGeofenceAccess verifies if a user can access a specific geofence
func (s *GeofenceAccessService) CheckGeofenceAccess(userID, geofenceID uint, requiredPermission string) error {
	var share models.GeofenceShare
	result := database.DB.Where("user_id = ? AND geofence_id = ?", userID, geofenceID).First(&share)
	
	if result.Error != nil {
		return errors.New("no access to geofence")
	}

	// Permission hierarchy: admin > edit > view
	permissions := map[string]int{
		"view":  1,
		"edit":  2,
		"admin": 3,
	}

	currentPermissionLevel := permissions[share.Permission]
	requiredPermissionLevel := permissions[requiredPermission]

	if currentPermissionLevel < requiredPermissionLevel {
		return errors.New("insufficient permissions")
	}

	return nil
}