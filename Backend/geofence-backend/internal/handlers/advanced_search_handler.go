package handlers

import (
	"geofence/internal/database"
	"geofence/internal/models"
	"geofence/internal/utils"
	"net/http"
	"strconv"
)

// SearchGeofencesAdvanced provides advanced search functionality for geofences
func SearchGeofencesAdvanced(w http.ResponseWriter, r *http.Request) {
	// Get query parameters
	query := r.URL.Query().Get("q")
	category := r.URL.Query().Get("category")
	user := r.URL.Query().Get("user")
	radius := r.URL.Query().Get("radius")
	lat := r.URL.Query().Get("lat")
	lng := r.URL.Query().Get("lng")
	
	// Start building the query
	db := database.DB.Model(&models.Geofence{})
	
	// Apply text search if provided
	if query != "" {
		db = db.Where("name LIKE ? OR description LIKE ?", "%"+query+"%", "%"+query+"%")
	}
	
	// Filter by user if provided
	if user != "" {
		userID, err := strconv.Atoi(user)
		if err == nil {
			db = db.Where("user_id = ?", userID)
		}
	}
	
	// Filter by category if provided
	if category != "" {
		// This would require a join with a categories table
		// For simplicity, we'll assume the Category model and relationship exists
		categoryID, err := strconv.Atoi(category)
		if err == nil {
			db = db.Joins("JOIN geofence_categories ON geofences.id = geofence_categories.geofence_id").
				Where("geofence_categories.category_id = ?", categoryID)
		}
	}
	
	// Filter by location if all location parameters are provided
	if lat != "" && lng != "" && radius != "" {
		latitude, latErr := strconv.ParseFloat(lat, 64)
		longitude, lngErr := strconv.ParseFloat(lng, 64)
		radiusVal, radErr := strconv.ParseFloat(radius, 64)
		
		if latErr == nil && lngErr == nil && radErr == nil {
			// This is a simplified approach. For production, use spatial queries
			// For SQLite, you might need to calculate distance manually
			// This code assumes you're using a database with spatial functions
			
			// For a basic implementation, we'll filter geofences within the radius
			// using a bounding box approximation
			latRange := radiusVal / 111.0 // 1 degree lat ≈ 111 km
			lngRange := radiusVal / (111.0 * 0.85) // Approximate at mid latitudes
			
			db = db.Where("latitude BETWEEN ? AND ?", latitude-latRange, latitude+latRange).
				Where("longitude BETWEEN ? AND ?", longitude-lngRange, longitude+lngRange)
		}
	}
	
	// Execute the query
	var geofences []models.Geofence
	if err := db.Find(&geofences).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error searching geofences")
		return
	}
	
	// Return results
	utils.RespondWithSuccess(w, http.StatusOK, geofences)
}

// GetPopularGeofences returns the most popular geofences
func GetPopularGeofences(w http.ResponseWriter, r *http.Request) {
	// Get limit from query parameter
	limit := r.URL.Query().Get("limit")
	limitVal := 10 // Default value
	
	if limit != "" {
		if val, err := strconv.Atoi(limit); err == nil && val > 0 {
			limitVal = val
		}
	}
	
	// In a real implementation, you would have a visits or analytics table
	// to track geofence popularity. For this example, we'll use a simplified approach
	// by considering geofences with more content as more popular
	var popularGeofences []struct {
		models.Geofence
		ContentCount int `json:"content_count"`
	}
	
	query := `
		SELECT g.*, COUNT(c.id) as content_count
		FROM geofences g
		LEFT JOIN contents c ON g.id = c.geofence_id
		GROUP BY g.id
		ORDER BY content_count DESC
		LIMIT ?
	`
	
	if err := database.DB.Raw(query, limitVal).Scan(&popularGeofences).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error fetching popular geofences")
		return
	}
	
	utils.RespondWithSuccess(w, http.StatusOK, popularGeofences)
}