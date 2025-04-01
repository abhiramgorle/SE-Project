package models

import (
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