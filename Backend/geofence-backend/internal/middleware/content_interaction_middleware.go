// internal/middleware/content_interaction_middleware.go
package middleware

import (
	"net/http"
	"time"

	"geofence/internal/database"
	"geofence/internal/models"
)

// TrackContentInteraction logs user interactions with content
func TrackContentInteraction(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(uint)
		if !ok {
			next.ServeHTTP(w, r)
			return
		}

		contentID := extractContentID(r)
		if contentID > 0 {
			interaction := models.ContentInteraction{
				UserID:      userID,
				ContentID:   contentID,
				InteractionTime: time.Now(),
			}

			go func() {
				database.DB.Create(&interaction)
			}()
		}

		next.ServeHTTP(w, r)
	})
}

func extractContentID(r *http.Request) uint {
	// Logic to extract content ID from request
	return 0
}