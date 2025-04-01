package utils

import (
	"encoding/json"
	"net/http"
)

// RespondWithError sends an error response
func RespondWithError(w http.ResponseWriter, code int, message string) {
	RespondWithJSON(w, code, map[string]string{
		"status":  "error",
		"message": message,
	})
}

// RespondWithSuccess sends a success response
func RespondWithSuccess(w http.ResponseWriter, code int, payload interface{}) {
	RespondWithJSON(w, code, map[string]interface{}{
		"status": "success",
		"data":   payload,
	})
}

// RespondWithJSON writes a JSON response
func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	
	// Only attempt to marshal and write if payload is not nil
	if payload != nil {
		response, err := json.Marshal(payload)
		if err != nil {
			http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
			return
		}
		w.Write(response)
	}
}