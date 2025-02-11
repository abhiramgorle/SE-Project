package database

import (
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
    "geofence/internal/models"    // Changed from geofence-backend to geofence
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