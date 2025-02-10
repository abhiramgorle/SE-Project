// main.go
package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Database Models
type User struct {
	gorm.Model
	Username  string     `json:"username" gorm:"unique"`
	Email     string     `json:"email" gorm:"unique"`
	Password  string     `json:"password"`
	Geofences []Geofence `json:"geofences"`
}

type Geofence struct {
	gorm.Model
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	Radius      float64   `json:"radius"` // in meters
	UserID      uint      `json:"user_id"`
	Contents    []Content `json:"contents"`
}

type Content struct {
	gorm.Model
	Title       string `json:"title"`
	Description string `json:"description"`
	Type        string `json:"type"` // text, image, link, etc.
	URL         string `json:"url"`
	GeofenceID  uint   `json:"geofence_id"`
}

// Global DB instance
var DB *gorm.DB

// Database initialization
func initDB() {
	dsn := "host=localhost user=postgres password=postgres dbname=geofence port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate the schemas
	db.AutoMigrate(&User{}, &Geofence{}, &Content{})

	DB = db
}

// Middleware for basic authentication
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// TODO: Implement JWT authentication
		next(w, r)
	}
}

// Handler functions
func createGeofence(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement geofence creation
}

func getGeofencesInRange(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement geofence lookup based on user location
}

func addContent(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement content addition to geofence
}

func main() {
	// Initialize database
	initDB()

	// Initialize router
	router := mux.NewRouter()

	// API routes
	router.HandleFunc("/api/geofence", authMiddleware(createGeofence)).Methods("POST")
	router.HandleFunc("/api/geofence/nearby", authMiddleware(getGeofencesInRange)).Methods("GET")
	router.HandleFunc("/api/geofence/{id}/content", authMiddleware(addContent)).Methods("POST")

	// Start server
	log.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", router))
}
