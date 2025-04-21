// internal/services/error_logging_service.go
package services

import (
	"log"
	"runtime"

	"geofence/internal/database"
	"geofence/internal/models"
)

type ErrorLoggingService struct{}

// LogErrorWithContext captures detailed error information
func (s *ErrorLoggingService) LogErrorWithContext(err error, additionalContext map[string]interface{}) {
	_, file, line, _ := runtime.Caller(1)

	errorLog := models.ErrorLog{
		ErrorMessage: err.Error(),
		SourceFile:   file,
		LineNumber:   line,
		Context:      additionalContext,
	}

	go func() {
		database.DB.Create(&errorLog)
		log.Printf("Error logged: %v at %s:%d", err, file, line)
	}()
}