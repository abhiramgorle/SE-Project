package main

import (
    "log"
    "net/http"
    "os"
    "github.com/gorilla/mux"
    "github.com/joho/godotenv"
    "github.com/rs/cors"
    "geofence/internal/database"
    "geofence/internal/handlers"
)

func main() {
    // Load .env file
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: No .env file found")
    }

    // Initialize database
    if err := database.InitDB(); err != nil {
        log.Fatal("Database initialization failed:", err)
    }
    log.Println("Database initialized successfully")

    // Create router
    router := mux.NewRouter()
    
    // API routes
    apiRouter := router.PathPrefix("/api").Subrouter()

    // User routes
    apiRouter.HandleFunc("/register", handlers.Register).Methods("POST")
    apiRouter.HandleFunc("/login", handlers.Login).Methods("POST")
    
    // Geofence routes - Order matters!
    apiRouter.HandleFunc("/geofences/nearby", handlers.GetNearbyGeofences).Methods("GET")
    apiRouter.HandleFunc("/geofences", handlers.CreateGeofence).Methods("POST")
    apiRouter.HandleFunc("/geofences", handlers.GetGeofences).Methods("GET")
    apiRouter.HandleFunc("/geofences/{id}", handlers.GetGeofence).Methods("GET")
    apiRouter.HandleFunc("/geofences/{id}", handlers.UpdateGeofence).Methods("PUT")
    apiRouter.HandleFunc("/geofences/{id}", handlers.DeleteGeofence).Methods("DELETE")

    // Middleware
    router.Use(loggingMiddleware)

    // Setup CORS
    c := cors.New(cors.Options{
        AllowedOrigins: []string{"*"},
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders: []string{"Content-Type", "Authorization", "X-Requested-With"},
        AllowCredentials: true,
        Debug: true,
    })

    // Get port from environment variable
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    // Start server
    log.Printf("Server starting on port %s...\n", port)
    log.Fatal(http.ListenAndServe(":"+port, c.Handler(router)))
}

func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("Request: %s %s", r.Method, r.URL.Path)
        next.ServeHTTP(w, r)
    })
}