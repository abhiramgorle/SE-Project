package database

import (
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
    "geofence/internal/models"
)

var DB *gorm.DB

func InitDB() error {
    db, err := gorm.Open(sqlite.Open("geofence.db"), &gorm.Config{})
    if err != nil {
        return err
    }

    // Auto migrate the schemas
    err = db.AutoMigrate(&models.User{}, &models.Geofence{}, &models.Content{})
    if err != nil {
        return err
    }

    DB = db
    return nil
}

// InitTestDB initializes a test in-memory SQLite database
func InitTestDB() error {
    // Use in-memory SQLite for testing
    db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
    if err != nil {
        return err
    }

    // Auto migrate the schemas
    err = db.AutoMigrate(&models.User{}, &models.Geofence{}, &models.Content{})
    if err != nil {
        return err
    }

    // Set the global DB variable
    DB = db
    
    return nil
}