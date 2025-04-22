package middleware

import (
	"net/http"

	"github.com/rs/cors"
)

func ConfigureCORS() *cors.Cors {
	return cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"https://yourdomain.com",
		},
		AllowedMethods: []string{
			http.MethodGet, 
			http.MethodPost, 
			http.MethodPut, 
			http.MethodDelete, 
			http.MethodOptions,
		},
		AllowedHeaders: []string{
			"Authorization", 
			"Content-Type", 
			"X-Requested-With",
		},
		AllowCredentials: true,
		Debug:            true,
	})
}