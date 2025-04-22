package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	
	"geofence/internal/handlers"
	"geofence/internal/database"
	"geofence/internal/middleware"
	
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
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
	
	// Root handler for welcome page
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(`
			<html>
			<head>
				<title>GeoFence API Server</title>
				<style>
					body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
					h1 { color: #333; }
					.endpoint { background-color: #f4f4f4; padding: 10px; margin: 10px 0; border-radius: 5px; }
					code { background-color: #e0e0e0; padding: 2px 5px; border-radius: 3px; }
				</style>
			</head>
			<body>
				<h1>GeoFence API Server</h1>
				<p>The API server is running successfully. Use the following endpoints to access the services:</p>
				
				<div class="endpoint">
					<h3>User Registration</h3>
					<p><code>POST /api/register</code></p>
					<p>Register a new user with username, email, and password.</p>
				</div>
				
				<div class="endpoint">
					<h3>User Login</h3>
					<p><code>POST /api/login</code></p>
					<p>Authenticate with email and password.</p>
				</div>
				
				<div class="endpoint">
					<h3>Create Geofence</h3>
					<p><code>POST /api/geofences</code></p>
					<p>Create a new geofence with name, description, coordinates, and radius.</p>
				</div>
				
				<div class="endpoint">
					<h3>Get All Geofences</h3>
					<p><code>GET /api/geofences</code></p>
					<p>Retrieve all geofences.</p>
				</div>
				
				<div class="endpoint">
					<h3>Get Nearby Geofences</h3>
					<p><code>GET /api/geofences/nearby?lat={latitude}&lng={longitude}</code></p>
					<p>Find geofences near specified coordinates.</p>
				</div>

				<div class="endpoint">
					<h3>Content Management</h3>
					<p><code>GET /api/contents?geofence_id={id}</code></p>
					<p>Get all content for a specific geofence.</p>
				</div>
			</body>
			</html>
		`))
	}).Methods("GET")
	
	// API routes
	apiRouter := router.PathPrefix("/api").Subrouter()

	// Public routes (no auth required)
	apiRouter.HandleFunc("/register", handlers.Register).Methods("POST")
	apiRouter.HandleFunc("/login", handlers.Login).Methods("POST")
	
	// Protected routes (auth required)
	protectedRouter := apiRouter.PathPrefix("").Subrouter()
	protectedRouter.Use(middleware.AuthMiddleware)
	
	// Geofence routes
	apiRouter.HandleFunc("/geofences/nearby", handlers.GetNearbyGeofences).Methods("GET") // Public
	protectedRouter.HandleFunc("/geofences", handlers.CreateGeofence).Methods("POST")
	apiRouter.HandleFunc("/geofences", handlers.GetGeofences).Methods("GET") // Public
	apiRouter.HandleFunc("/geofences/{id}", handlers.GetGeofence).Methods("GET") // Public
	protectedRouter.HandleFunc("/geofences/{id}", handlers.UpdateGeofence).Methods("PUT")
	protectedRouter.HandleFunc("/geofences/{id}", handlers.DeleteGeofence).Methods("DELETE")

	// Content routes
	apiRouter.HandleFunc("/contents", handlers.CreateContent).Methods("POST")
	apiRouter.HandleFunc("/contents", handlers.GetContents).Methods("GET")
	apiRouter.HandleFunc("/contents/{id}", handlers.GetContent).Methods("GET")
	apiRouter.HandleFunc("/contents/{id}", handlers.UpdateContent).Methods("PUT")
	apiRouter.HandleFunc("/contents/{id}", handlers.DeleteContent).Methods("DELETE")

	// API health check
	apiRouter.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
	}).Methods("GET")

	// Middleware
	router.Use(loggingMiddleware)

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"}, // Frontend domain
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization", "X-Requested-With"},
		AllowCredentials: true,
	})

	// Get port from environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server starting on port %s...", port)
	log.Printf("Backend ready for frontend integration at http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, c.Handler(router)))
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Request: %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}