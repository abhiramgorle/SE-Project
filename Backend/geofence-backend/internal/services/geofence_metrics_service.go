// internal/services/geofence_metrics_service.go
package services

import (
	"time"

	"geofence/internal/database"
	"geofence/internal/models"
)

type GeofenceMetricsService struct{}

// GetGeofencePerformanceMetrics calculates various performance indicators
func (s *GeofenceMetricsService) GetGeofencePerformanceMetrics(geofenceID uint) (map[string]interface{}, error) {
	var metrics = make(map[string]interface{})

	// Total visits in last 30 days
	database.DB.Raw(`
		SELECT COUNT(*) as total_visits 
		FROM geofence_visits 
		WHERE geofence_id = ? AND created_at >= ?
	`, geofenceID, time.Now().AddDate(0, 0, -30)).Scan(&metrics["total_visits"])

	// Unique visitors
	database.DB.Raw(`
		SELECT COUNT(DISTINCT user_id) as unique_visitors 
		FROM geofence_visits 
		WHERE geofence_id = ? AND created_at >= ?
	`, geofenceID, time.Now().AddDate(0, 0, -30)).Scan(&metrics["unique_visitors"])

	return metrics, nil
}