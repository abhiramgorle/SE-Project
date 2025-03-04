// src/services/api.js

const API_BASE_URL = 'http://localhost:8080/api';

export const fetchGeofences = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/geofences`);
    if (!response.ok) {
      throw new Error('Failed to fetch geofences');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching geofences:', error);
    throw error;
  }
};

export const fetchNearbyGeofences = async (lat, lng) => {
  try {
    const response = await fetch(`${API_BASE_URL}/geofences/nearby?lat=${lat}&lng=${lng}`);
    if (!response.ok) {
      throw new Error('Failed to fetch nearby geofences');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching nearby geofences:', error);
    throw error;
  }
};

export const createGeofence = async (geofenceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/geofences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geofenceData),
    });
    if (!response.ok) {
      throw new Error('Failed to create geofence');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating geofence:', error);
    throw error;
  }
};

export const updateGeofence = async (id, geofenceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/geofences/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geofenceData),
    });
    if (!response.ok) {
      throw new Error('Failed to update geofence');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating geofence:', error);
    throw error;
  }
};

export const deleteGeofence = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/geofences/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete geofence');
    }
    return true;
  } catch (error) {
    console.error('Error deleting geofence:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to register user');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};