// src/setupTests.js
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock for window.google.maps
global.window = {
  ...global.window,
  google: {
    maps: {
      Map: vi.fn(() => ({
        fitBounds: vi.fn(),
        panTo: vi.fn(),
        setZoom: vi.fn(),
        getBounds: vi.fn(),
        addListener: vi.fn(() => ({ remove: vi.fn() }))
      })),
      Marker: vi.fn(() => ({
        setMap: vi.fn(),
        addListener: vi.fn(),
        setAnimation: vi.fn(),
        id: 'marker-id',
        position: { lat: 37.7749, lng: -122.4194 }
      })),
      InfoWindow: vi.fn(() => ({
        setContent: vi.fn(),
        open: vi.fn(),
        close: vi.fn(),
        addListener: vi.fn(() => ({ remove: vi.fn() }))
      })),
      LatLngBounds: vi.fn(() => ({
        extend: vi.fn(),
        union: vi.fn()
      })),
      places: {
        PlacesService: vi.fn(() => ({
          getDetails: vi.fn((request, callback) => {
            callback({
              name: 'Test Place',
              formatted_address: '123 Test St',
              geometry: {
                location: { lat: 37.7749, lng: -122.4194 }
              }
            }, 'OK');
          }),
          textSearch: vi.fn((request, callback) => {
            callback([{
              name: 'Test Place',
              place_id: 'test123',
              formatted_address: '123 Test St',
              geometry: {
                location: { lat: 37.7749, lng: -122.4194 },
                viewport: 'viewport'
              }
            }], 'OK');
          })
        })),
        PlacesServiceStatus: {
          OK: 'OK'
        },
        Autocomplete: vi.fn(() => ({
          addListener: vi.fn((event, callback) => {
            return { remove: vi.fn() };
          }),
          getPlace: vi.fn(() => ({
            geometry: {
              location: {
                lat: () => 37.7749,
                lng: () => -122.4194
              }
            }
          }))
        })),
        SearchBox: vi.fn(() => ({
          addListener: vi.fn((event, callback) => {
            return { remove: vi.fn() };
          }),
          getPlaces: vi.fn(() => [{
            name: 'Test Place',
            place_id: 'test123',
            formatted_address: '123 Test St',
            geometry: {
              location: { lat: 37.7749, lng: -122.4194 },
              viewport: 'viewport'
            }
          }]),
          setBounds: vi.fn()
        }))
      },
      Animation: {
        DROP: 'DROP',
        BOUNCE: 'BOUNCE'
      },
      drawing: {
        OverlayType: {
          POLYGON: 'polygon'
        },
        DrawingManager: vi.fn(() => ({
          setDrawingMode: vi.fn(),
          setOptions: vi.fn(),
          setMap: vi.fn(),
          addListener: vi.fn(() => ({ remove: vi.fn() }))
        }))
      },
      geometry: {
        poly: {
          containsLocation: vi.fn()
        },
        spherical: {
          computeHeading: vi.fn()
        }
      },
      StreetViewService: vi.fn(() => ({
        getPanoramaByLocation: vi.fn((location, radius, callback) => {
          callback({
            location: {
              latLng: { lat: 37.7749, lng: -122.4194 }
            }
          }, 'OK');
        })
      })),
      StreetViewStatus: {
        OK: 'OK'
      },
      StreetViewPanorama: vi.fn(),
      DirectionsService: vi.fn(() => ({
        route: vi.fn((request, callback) => {
          callback({
            routes: [{
              legs: [{
                duration: { text: '10 mins' },
                distance: { text: '5 km' }
              }]
            }]
          }, 'OK');
        })
      })),
      DirectionsStatus: {
        OK: 'OK'
      },
      DirectionsRenderer: vi.fn(() => ({
        setMap: vi.fn(),
        setPanel: vi.fn()
      })),
      TravelMode: {
        DRIVING: 'DRIVING',
        WALKING: 'WALKING',
        BICYCLING: 'BICYCLING',
        TRANSIT: 'TRANSIT'
      }
    }
  }
};

// Mock for navigator.geolocation
global.navigator.geolocation = {
  getCurrentPosition: vi.fn(callback => {
    callback({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    });
  })
};

// Mock for sweetalert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn()
  }
}));

// Mock for CSSTransition
vi.mock('react-transition-group', () => ({
  CSSTransition: vi.fn(({ children, in: inProp }) => (
    inProp ? children : null
  ))
}));