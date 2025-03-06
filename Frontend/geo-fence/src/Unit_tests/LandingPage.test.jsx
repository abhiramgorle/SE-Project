import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MapLoadedContext } from '../context/MapLoadedContext';
import LandingPage from '../pages/landing-page/LandingPage';
import getUserLocation from '../utils/getUserLocation';

// Mock react-router-dom's useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

// Mock getUserLocation utility
jest.mock('../utils/getUserLocation');

// Mock SweetAlert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn()
}));

// Mock Google Maps API
global.window.google = {
  maps: {
    places: {
      Autocomplete: jest.fn().mockImplementation(() => ({
        addListener: jest.fn((event, callback) => {
          // Store the callback to call it in tests
          this.placeChangedCallback = callback;
          return { remove: jest.fn() };
        }),
        getPlace: jest.fn().mockReturnValue({
          geometry: {
            location: {
              lat: () => 37.7749,
              lng: () => -122.4194
            }
          }
        })
      }))
    },
    Geocoder: jest.fn().mockImplementation(() => ({
      geocode: jest.fn((request, callback) => {
        callback([
          {
            geometry: {
              location: {
                lat: () => 37.7749,
                lng: () => -122.4194
              }
            }
          }
        ], 'OK');
      })
    })),
    GeocoderStatus: {
      OK: 'OK'
    }
  }
};

const renderLandingPage = (isMapLoaded = true) => {
  return render(
    <MemoryRouter>
      <MapLoadedContext.Provider value={isMapLoaded}>
        <LandingPage />
      </MapLoadedContext.Provider>
    </MemoryRouter>
  );
};

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the landing page correctly', () => {
    renderLandingPage();
    
    expect(screen.getByText('Geo-Fence')).toBeInTheDocument();
    expect(screen.getByText('Your Personal Navigator')).toBeInTheDocument();
    expect(screen.getByText('TO PLACES NEAR YOU')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search city')).toBeInTheDocument();
  });

  it('initializes autocomplete when map is loaded', () => {
    renderLandingPage(true);
    
    expect(window.google.maps.places.Autocomplete).toHaveBeenCalled();
  });

  it('does not initialize autocomplete when map is not loaded', () => {
    renderLandingPage(false);
    
    expect(window.google.maps.places.Autocomplete).not.toHaveBeenCalled();
  });

  it('navigates to search page when a place is selected via autocomplete', async () => {
    renderLandingPage();
    
    // Get the autocomplete instance created in the component
    const autocompleteInstance = window.google.maps.places.Autocomplete.mock.results[0].value;
    
    // Simulate place_changed event by calling the stored callback
    autocompleteInstance.placeChangedCallback();
    
    expect(mockedNavigate).toHaveBeenCalledWith('/search', {
      state: { lat: 37.7749, lng: -122.4194 }
    });
  });

  it('geocodes address and navigates to search page', async () => {
    renderLandingPage();
    
    // Type in the input field
    const input = screen.getByPlaceholderText('Search city');
    fireEvent.change(input, { target: { value: 'San Francisco' } });
    
    // Click the geocode button (search button)
    const geocodeBtn = screen.getByLabelText('search');
    fireEvent.click(geocodeBtn);
    
    // Wait for navigation
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/search', {
        state: { lat: 37.7749, lng: -122.4194 }
      });
    });
  });

  it('gets user location and navigates to search page', async () => {
    getUserLocation.mockResolvedValue({
      lat: 37.7749,
      lng: -122.4194
    });
    
    renderLandingPage();
    
    // Click the location button
    const locationBtn = screen.getByLabelText('user location');
    fireEvent.click(locationBtn);
    
    // Wait for navigation
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/search', {
        state: { lat: 37.7749, lng: -122.4194 }
      });
    });
  });

  it('shows error when geocoding fails', async () => {
    // Override the geocode implementation for this test
    global.window.google.maps.Geocoder.mockImplementationOnce(() => ({
      geocode: jest.fn((request, callback) => {
        callback([], 'ZERO_RESULTS');
      })
    }));
    
    const Swal = require('sweetalert2');
    
    renderLandingPage();
    
    // Type in the input field
    const input = screen.getByPlaceholderText('Search city');
    fireEvent.change(input, { target: { value: 'Invalid Location' } });
    
    // Click the geocode button
    const geocodeBtn = screen.getByLabelText('search');
    fireEvent.click(geocodeBtn);
    
    // Wait for the alert
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith('Location not found try a different area?');
    });
  });

  it('shows error when getUserLocation fails', async () => {
    getUserLocation.mockRejectedValue(new Error('Location access denied'));
    
    const Swal = require('sweetalert2');
    
    renderLandingPage();
    
    // Click the location button
    const locationBtn = screen.getByLabelText('user location');
    fireEvent.click(locationBtn);
    
    // Wait for the alert
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith('Unable to determine location');
    });
  });
});