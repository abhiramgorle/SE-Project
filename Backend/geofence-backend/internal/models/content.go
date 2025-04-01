package models

import (
	"gorm.io/gorm"
)

type Content struct {
	gorm.Model
	Title       string `json:"title" gorm:"not null"`
	Description string `json:"description"`
	Type        string `json:"type" gorm:"default:'text'"`
	URL         string `json:"url,omitempty"`
	GeofenceID  uint   `json:"geofence_id" gorm:"not null"`
}