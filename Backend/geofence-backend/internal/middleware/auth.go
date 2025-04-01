package middleware

import (
	"context"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"

	"geofence/internal/utils"
)

// Claims represents JWT claims
type Claims struct {
	UserID uint `json:"user_id"`
	jwt.StandardClaims
}

// GetJWTKey retrieves the JWT secret key
func GetJWTKey() []byte {
	// Get JWT secret from environment, fallback to a default for development
	key := os.Getenv("JWT_SECRET")
	if key == "" {
		key = "default_jwt_secret_development_only_change_in_production"
	}
	return []byte(key)
}

// GenerateToken creates a new JWT token for a user
func GenerateToken(userID uint) (string, error) {
	// Set token expiration to 24 hours
	expirationTime := time.Now().Add(24 * time.Hour)
	
	// Create JWT claims
	claims := &Claims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
			IssuedAt:  time.Now().Unix(),
			Issuer:    "geofence-backend",
		},
	}

	// Create token with HMAC SHA256 signing method
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	// Sign and get the complete encoded token as a string
	return token.SignedString(GetJWTKey())
}

// AuthMiddleware validates JWT tokens
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.RespondWithError(w, http.StatusUnauthorized, "Authorization token is required")
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.RespondWithError(w, http.StatusUnauthorized, "Invalid authorization format")
			return
		}

		tokenString := parts[1]

		// Parse and validate token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return GetJWTKey(), nil
		})

		// Check for parsing errors
		if err != nil {
			if err == jwt.ErrSignatureInvalid {
				utils.RespondWithError(w, http.StatusUnauthorized, "Invalid token signature")
				return
			}
			utils.RespondWithError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		// Validate token
		if !token.Valid {
			utils.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
			return
		}

		// Add user ID to request context
		ctx := context.WithValue(r.Context(), "userID", claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RefreshToken handles token renewal
func RefreshToken(w http.ResponseWriter, r *http.Request) {
	// Get Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "Authorization token is required")
		return
	}

	// Extract token from "Bearer <token>"
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid authorization format")
		return
	}

	tokenString := parts[1]

	// Parse claims without validating
	claims := &Claims{}
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, claims)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid token")
		return
	}

	// Extract user ID from the token
	if claims, ok := token.Claims.(*Claims); ok {
		// Generate a new token
		newToken, err := GenerateToken(claims.UserID)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to generate new token")
			return
		}

		// Respond with new token
		utils.RespondWithSuccess(w, http.StatusOK, map[string]string{
			"token": newToken,
		})
	} else {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid token claims")
	}
}