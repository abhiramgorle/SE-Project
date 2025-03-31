// internal/handlers/content_rating_handler.go

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

// ContentRating represents a user rating for content
type ContentRating struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ContentID uint      `json:"content_id"`
	UserID    uint      `json:"user_id"`
	Rating    int       `json:"rating"` // 1-5 stars
	Comment   string    `json:"comment,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// RateContent allows users to rate content
func RateContent(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	contentID := params["id"]

	// Get user ID from context
	userID, ok := r.Context().Value("userID").(uint)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var rating ContentRating
	if err := json.NewDecoder(r.Body).Decode(&rating); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate rating
	if rating.Rating < 1 || rating.Rating > 5 {
		utils.RespondWithError(w, http.StatusBadRequest, "Rating must be between 1 and 5")
		return
	}

	id, err := strconv.Atoi(contentID)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid content ID")
		return
	}

	// Verify content exists
	var content models.Content
	if err := database.DB.First(&content, id).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Content not found")
		return
	}

	// Check if user has already rated this content
	var existingRating ContentRating
	result := database.DB.Where("content_id = ? AND user_id = ?", id, userID).First(&existingRating)
	
	if result.Error == nil {
		// Update existing rating
		existingRating.Rating = rating.Rating
		existingRating.Comment = rating.Comment
		existingRating.UpdatedAt = time.Now()
		
		if err := database.DB.Save(&existingRating).Error; err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Error updating rating")
			return
		}
		
		utils.RespondWithSuccess(w, http.StatusOK, existingRating)
		return
	}
	
	// Create new rating
	newRating := ContentRating{
		ContentID: uint(id),
		UserID:    userID,
		Rating:    rating.Rating,
		Comment:   rating.Comment,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	
	if err := database.DB.Create(&newRating).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error creating rating")
		return
	}
	
	utils.RespondWithSuccess(w, http.StatusCreated, newRating)
}

// GetContentRatings returns all ratings for a content item
func GetContentRatings(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	contentID := params["id"]
	
	id, err := strconv.Atoi(contentID)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid content ID")
		return
	}
	
	// Verify content exists
	var content models.Content
	if err := database.DB.First(&content, id).Error; err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Content not found")
		return
	}
	
	var ratings []ContentRating
	if err := database.DB.Where("content_id = ?", id).Find(&ratings).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error fetching ratings")
		return
	}
	
	// Calculate average rating
	var totalRating int
	for _, r := range ratings {
		totalRating += r.Rating
	}
	
	averageRating := 0.0
	if len(ratings) > 0 {
		averageRating = float64(totalRating) / float64(len(ratings))
	}
	
	response := map[string]interface{}{
		"content_id":     id,
		"ratings":        ratings,
		"average_rating": averageRating,
		"rating_count":   len(ratings),
	}
	
	utils.RespondWithSuccess(w, http.StatusOK, response)
}