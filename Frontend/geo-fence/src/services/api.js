// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get authentication token
const getToken = () => localStorage.getItem('token');

// Enhanced fetch wrapper with authorization
const apiFetch = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'An unexpected error occurred');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error(`API Error: ${error.message}`);
    throw error;
  }
};

export const fetchGeofences = () => 
  apiFetch(`${API_BASE_URL}/geofences`);

export const fetchNearbyGeofences = (lat, lng) => 
  apiFetch(`${API_BASE_URL}/geofences/nearby?lat=${lat}&lng=${lng}`);

export const createGeofence = (geofenceData) => 
  apiFetch(`${API_BASE_URL}/geofences`, {
    method: 'POST',
    body: JSON.stringify(geofenceData),
  });

export const updateGeofence = (id, geofenceData) => 
  apiFetch(`${API_BASE_URL}/geofences/${id}`, {
    method: 'PUT',
    body: JSON.stringify(geofenceData),
  });

export const deleteGeofence = (id) => 
  apiFetch(`${API_BASE_URL}/geofences/${id}`, {
    method: 'DELETE',
  });

export const registerUser = (userData) => 
  apiFetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const loginUser = async (credentials) => {
  try {
    const data = await apiFetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token and user info
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

export const isAuthenticated = () => {
  return !!getToken();
};

// Map configuration
export const MAP_CONFIG = {
  zoom: 14,
  mapTypeControl: false,
  fullscreenControl: false,
  streetViewControl: false,
  gestureHandling: 'greedy',
  controlSize: 33,
  scaleControl: false,
  disableDefaultUI: true,
};