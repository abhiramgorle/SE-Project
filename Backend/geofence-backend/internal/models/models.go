package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username  string     `json:"username" gorm:"unique"`
	Email     string     `json:"email" gorm:"unique"`
	Password  string     `json:"password,omitempty"`
	Geofences []Geofence `json:"geofences,omitempty"`
}

type Geofence struct {
	gorm.Model
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	Radius      float64   `json:"radius"`
	UserID      uint      `json:"user_id"`
	Contents    []Content `json:"contents,omitempty" gorm:"foreignKey:GeofenceID"`
}

// Remove the Content struct from here since it's already defined in content.go
type UserPreference struct {
    gorm.Model
    UserID              uint   `json:"user_id" gorm:"uniqueIndex"`
    NotificationsEnabled bool   `json:"notifications_enabled" gorm:"default:true"`
    DefaultRadius       float64 `json:"default_radius" gorm:"default:500"`
    Theme               string  `json:"theme" gorm:"default:'light'"`
    Language            string  `json:"language" gorm:"default:'en'"`
}
type ContentInteraction struct {
	gorm.Model
	UserID           uint      `json:"user_id"`
	ContentID        uint      `json:"content_id"`
	InteractionType  string    `json:"interaction_type"`
	InteractionTime  time.Time `json:"interaction_time"`
}