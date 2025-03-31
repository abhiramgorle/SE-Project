// Update internal/utils/response.go
package utils

import (
	"encoding/json"
	"net/http"
	"time"
)

// ErrorResponse represents a standardized error response
type ErrorResponse struct {
	Status  string    `json:"status"`
	Message string    `json:"message"`
	Error   string    `json:"error,omitempty"`
	Time    time.Time `json:"timestamp"`
}

// SuccessResponse represents a standardized success response
type SuccessResponse struct {
	Status string      `json:"status"`
	Data   interface{} `json:"data"`
	Time   time.Time   `json:"timestamp"`
}

// RespondWithError sends a JSON error response
func RespondWithError(w http.ResponseWriter, code int, message string) {
	response := ErrorResponse{
		Status:  "error",
		Message: message,
		Time:    time.Now(),
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(response)
}

// RespondWithSuccess sends a JSON success response
func RespondWithSuccess(w http.ResponseWriter, code int, data interface{}) {
	response := SuccessResponse{
		Status: "success",
		Data:   data,
		Time:   time.Now(),
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(response)
}