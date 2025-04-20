// internal/services/content_recommendation_service.go
package services

import (
	"geofence/internal/database"
	"geofence/internal/models"
)

type ContentRecommendationService struct{}

// RecommendContentForGeofence suggests content based on user interactions
func (s *ContentRecommendationService) RecommendContentForGeofence(geofenceID uint) ([]models.Content, error) {
	var recommendedContents []models.Content

	// Complex recommendation logic
	database.DB.Raw(`
		SELECT c.* 
		FROM contents c
		JOIN geofence_visits v ON c.geofence_id = v.geofence_id
		WHERE c.geofence_id = ? 
		GROUP BY c.id 
		ORDER BY COUNT(v.id) DESC 
		LIMIT 5
	`, geofenceID).Scan(&recommendedContents)

	return recommendedContents, nil
}