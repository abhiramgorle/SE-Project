package middleware

import (
	"net/http"
	"time"

	"geofence/internal/database"
)

// GeofenceVisitTracker tracks user interactions with geofences
type GeofenceVisitTracker struct {
	GeofenceID uint      `json:"geofence_id"`
	UserID     uint      `json:"user_id"`
	EnteredAt  time.Time `json:"entered_at"`
	Duration   int       `json:"duration_seconds"`
}

// TrackGeofenceVisit logs geofence visit details
func TrackGeofenceVisit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extract user ID from context
		userID, ok := r.Context().Value("userID").(uint)
		if !ok {
			next.ServeHTTP(w, r)
			return
		}

		// Log geofence visit
		visitTracker := GeofenceVisitTracker{
			UserID:    userID,
			EnteredAt: time.Now(),
		}

		// Save visit data (async)
		go func() {
			database.DB.Create(&visitTracker)
		}()

		next.ServeHTTP(w, r)
	})
}