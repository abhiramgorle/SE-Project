package handlers

import (
    "encoding/json"
    "net/http"
    "strconv"
    "github.com/gorilla/mux"
    "geofence/internal/database"
    "geofence/internal/models"
)

func CreateGeofence(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    var geofence models.Geofence
    if err := json.NewDecoder(r.Body).Decode(&geofence); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    result := database.DB.Create(&geofence)
    if result.Error != nil {
        http.Error(w, result.Error.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(geofence)
}

func GetGeofences(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")

    var geofences []models.Geofence
    result := database.DB.Find(&geofences)
    if result.Error != nil {
        http.Error(w, result.Error.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(geofences)
}

func GetGeofence(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    params := mux.Vars(r)
    id := params["id"]

    var geofence models.Geofence
    result := database.DB.First(&geofence, id)
    if result.Error != nil {
        http.Error(w, "Geofence not found", http.StatusNotFound)
        return
    }

    json.NewEncoder(w).Encode(geofence)
}

func GetNearbyGeofences(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")

    lat, err := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
    if err != nil {
        http.Error(w, "Invalid latitude parameter", http.StatusBadRequest)
        return
    }

    lng, err := strconv.ParseFloat(r.URL.Query().Get("lng"), 64)
    if err != nil {
        http.Error(w, "Invalid longitude parameter", http.StatusBadRequest)
        return
    }

    var geofences []models.Geofence
    result := database.DB.Where(
        "latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?",
        lat-0.1, lat+0.1, lng-0.1, lng+0.1,
    ).Find(&geofences)

    if result.Error != nil {
        http.Error(w, "Error fetching nearby geofences", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(geofences)
}

func UpdateGeofence(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    params := mux.Vars(r)
    id := params["id"]

    var geofence models.Geofence
    if err := json.NewDecoder(r.Body).Decode(&geofence); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    var existingGeofence models.Geofence
    if err := database.DB.First(&existingGeofence, id).Error; err != nil {
        http.Error(w, "Geofence not found", http.StatusNotFound)
        return
    }

    existingGeofence.Name = geofence.Name
    existingGeofence.Description = geofence.Description
    existingGeofence.Latitude = geofence.Latitude
    existingGeofence.Longitude = geofence.Longitude
    existingGeofence.Radius = geofence.Radius

    if err := database.DB.Save(&existingGeofence).Error; err != nil {
        http.Error(w, "Error updating geofence", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(existingGeofence)
}

func DeleteGeofence(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    params := mux.Vars(r)
    id := params["id"]

    var geofence models.Geofence
    if err := database.DB.First(&geofence, id).Error; err != nil {
        http.Error(w, "Geofence not found", http.StatusNotFound)
        return
    }

    if err := database.DB.Delete(&geofence).Error; err != nil {
        http.Error(w, "Error deleting geofence", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}