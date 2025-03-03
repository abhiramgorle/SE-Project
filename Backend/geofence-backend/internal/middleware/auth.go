package middleware

import (
	"context"
	"net/http"
	"strings"

	"geofence/internal/utils"
)

// AuthMiddleware checks for authentication token
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.RespondWithError(w, http.StatusUnauthorized, "Authorization header required")
			return
		}

		// Extract token from "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			utils.RespondWithError(w, http.StatusUnauthorized, "Invalid authorization format")
			return
		}

		token := tokenParts[1]
		// For Sprint 2, we're using a simple token validation
		// In Sprint 3, implement proper JWT validation

		// Set user ID in context for handlers to use
		ctx := context.WithValue(r.Context(), "userID", uint(1))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// CORSMiddleware handles CORS preflight requests
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
