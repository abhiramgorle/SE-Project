<<<<<<< HEAD
=======
// internal/config/config.go
>>>>>>> 56da89969bb36d9b47143d340e6dcfb4932b95b8
package config

import (
	"log"
	"os"
<<<<<<< HEAD
	"strconv"
=======
>>>>>>> 56da89969bb36d9b47143d340e6dcfb4932b95b8

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
<<<<<<< HEAD
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string
	ServerPort int
	JWTSecret  string
}

func LoadConfig() *Config {
	// Load .env file
=======
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	ServerPort string
}

func LoadConfig() *Config {
>>>>>>> 56da89969bb36d9b47143d340e6dcfb4932b95b8
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

<<<<<<< HEAD
	// Parse database port
	dbPort, err := strconv.Atoi(getEnv("DB_PORT", "5432"))
	if err != nil {
		log.Println("Invalid DB_PORT, using default 5432")
		dbPort = 5432
	}

	// Parse server port
	serverPort, err := strconv.Atoi(getEnv("SERVER_PORT", "8080"))
	if err != nil {
		log.Println("Invalid SERVER_PORT, using default 8080")
		serverPort = 8080
	}

	return &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     dbPort,
		DBUser:     getEnv("DB_USER", ""),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "geofence_db"),
		ServerPort: serverPort,
		JWTSecret:  getEnv("JWT_SECRET", "default_secret_key"),
	}
}

// getEnv retrieves an environment variable with a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
=======
	return &Config{
		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     os.Getenv("DB_PORT"),
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),
		ServerPort: os.Getenv("SERVER_PORT"),
	}
>>>>>>> 56da89969bb36d9b47143d340e6dcfb4932b95b8
}