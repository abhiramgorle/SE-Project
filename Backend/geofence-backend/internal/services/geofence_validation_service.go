// internal/services/geofence_validation_service.go
package services

import (
	"errors"
	"math"

	"geofence/internal/models"
)

type GeofenceValidationService struct{}

func (s *GeofenceValidationService) ValidateGeofence(geofence *models.Geofence) error {
	if geofence.Name == "" {
		return errors.New("geofence name is required")
	}

	if geofence.Radius <= 0 {
		return errors.New("geofence radius must be positive")
	}

	if !isValidLatitude(geofence.Latitude) {
		return errors.New("invalid latitude")
	}

	if !isValidLongitude(geofence.Longitude) {
		return errors.New("invalid longitude")
	}

	return nil
}

func isValidLatitude(lat float64) bool {
	return lat >= -90 && lat <= 90
}

func isValidLongitude(lon float64) bool {
	return lon >= -180 && lon <= 180
}

func (s *GeofenceValidationService) CalculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadius = 6371 // kilometers

	dLat := toRadians(lat2 - lat1)
	dLon := toRadians(lon2 - lon1)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(toRadians(lat1))*math.Cos(toRadians(lat2))*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return earthRadius * c
}

func toRadians(degrees float64) float64 {
	return degrees * (math.Pi / 180)
}