package utils

import (
    "encoding/json"
    "net/http"
)

// Response represents a standardized API response format
type Response struct {
    Status  string      `json:"status"`
    Message string      `json:"message,omitempty"`
    Data    interface{} `json:"data,omitempty"`
}

// RespondWithError sends a JSON error response
func RespondWithError(w http.ResponseWriter, code int, message string) {
    RespondWithJSON(w, code, Response{
        Status:  "error",
        Message: message,
    })
}

// RespondWithSuccess sends a JSON success response with data
func RespondWithSuccess(w http.ResponseWriter, code int, data interface{}) {
    RespondWithJSON(w, code, Response{
        Status: "success",
        Data:   data,
    })
}

// RespondWithJSON sends a JSON response
func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
    response, _ := json.Marshal(payload)
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Access-Control-Allow-Origin", "*") // Backup CORS header
    w.WriteHeader(code)
    w.Write(response)
}