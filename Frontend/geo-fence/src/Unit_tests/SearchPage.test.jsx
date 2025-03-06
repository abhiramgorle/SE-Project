import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MapLoadedContext } from '../context/MapLoadedContext';
import SearchPage from '../pages/search-page/SearchPage';

// Mock sweetalert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn()
}));

// Mock mapUtils functions
jest.mock('../utils/mapUtils', () => ({
  initInfoWindowCarousel: jest.fn(),
  initStreetView: jest.fn(),
  getInfoWindowTemplate: jest.fn().mockReturnValue('<div>Mock Info Window</div>'),
  getInfoWindowRouteTemplate: jest.fn().mockReturnValue('<div>Mock Route Template</div>'),
  searchInPolygon: jest.fn(),
  getPolyBounds: jest.fn(),
  plotRoute: jest.fn()
}));

// Mock Google Maps API with detailed implementation
const mockMap = {
  fitBounds: jest.fn(),
  panTo: jest.fn(),
  setZoom: jest.fn(),
  getBounds: jest.fn().mockReturnValue({}),
  addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  setMap: jest.fn()
};

const mockMarker = {
  setMap: jest.fn(),
  addListener: jest.fn(),
  setAnimation: jest.fn(),
  id: 'test-place-id',
  position: { lat: 37.7749, lng: -122.4194 }
};

const mockInfoWindow = {
  setContent: jest.fn(),
  open: jest.fn(),
  marker: null
};

const mockDrawingManager = {
  setDrawingMode: jest.fn(),
  setOptions: jest.fn(),
  setMap: jest.fn()
};

const mockPolygon = {
  setEditable: jest.fn(),
  getPath: jest.fn().mockReturnValue({
    addListener: jest.fn()
  }),
  setMap: jest.fn(),
  addListener: jest.fn()
};

global.window.google = {
  maps: {
    Map: jest.fn().mockImplementation(() => mockMap),
    Marker: jest.fn().mockImplementation(() => mockMarker),
    InfoWindow: jest.fn().mockImplementation(() => mockInfoWindow),
    drawing: {
      DrawingManager: jest.fn().mockImplementation(() => mockDrawingManager),
      OverlayType: {
        POLYGON: 'polygon'
      }
    },
    LatLngBounds: jest.fn().mockImplementation(() => ({
      extend: jest.fn(),
      union: jest.fn()
    })),
    event: {
      addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
      addListenerOnce: jest.fn(),
      clearListeners: jest.fn()
    },
    Animation: {
      DROP: 'DROP',
      BOUNCE: 'BOUNCE'
    },
    ControlPosition: {
      TOP_LEFT: 'TOP_LEFT'
    },
    places: {
      PlacesService: jest.fn().mockImplementation(() => ({
        getDetails: jest.fn((request, callback) => {
          callback({
            name: 'Test Place',
            geometry: {
              location: { lat: 37.7749, lng: -122.4194 }
            }
          }, 'OK');
        }),
        textSearch: jest.fn((request, callback) => {
          callback([
            {
              name: 'Test Place',
              place_id: 'test-place-id',
              geometry: {
                location: { lat: 37.7749, lng: -122.4194 }
              }
            }
          ], 'OK');
        })
      })),
      PlacesServiceStatus: {
        OK: 'OK'
      },
      SearchBox: jest.fn().mockImplementation(() => ({
        addListener: jest.fn((event, callback) => {
          // Store callback for testing
          this.placesChangedCallback = callback;
          return { remove: jest.fn() };
        }),
        getPlaces: jest.fn().mockReturnValue([
          {
            name: 'Test Place',
            place_id: 'test-place-id',
            geometry: {
              location: { lat: 37.7749, lng: -122.4194 },
              viewport: {}
            }
          }
        ]),
        setBounds: jest.fn()
      }))
    }
  }
};

// Mock component refs
const mockSidebarRef = {
  open: jest.fn(),
  close: jest.fn(),
  getContentRef: jest.fn().mockReturnValue({ current: {} })
};

// Override useRef to return controlled mocks for specific elements
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useRef: jest.fn(initialValue => {
      // For specific refs, return our mocks
      if (initialValue === null) {
        return { current: null };
      }
      return { current: initialValue };
    }),
    createRef: jest.fn().mockReturnValue({ current: document.createElement('div') })
  };
});

// Before rendering, ensure React.useRef returns our mock sidebar ref for sidebarRef
const mockUseRef = React.useRef;
beforeEach(() => {
  mockUseRef.mockImplementation((initialValue) => {
    if (initialValue === null && !mockUseRef.calledWith) {
      mockUseRef.calledWith = 'sidebarRef';
      return { current: mockSidebarRef };
    }
    return { current: initialValue };
  });
});

afterEach(() => {
  mockUseRef.calledWith = null;
});

const renderSearchPage = (isMapLoaded = true, initialLocation = { lat: 37.7749, lng: -122.4194 }) => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/search', state: initialLocation }]}>
      <MapLoadedContext.Provider value={isMapLoaded}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MapLoadedContext.Provider>
    </MemoryRouter>
  );
};

describe('SearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <div id="map"></div>
      <input type="text" class="search-input" />
      <button class="search-btn"></button>
    `;
  });

  it('initializes the map when mapLoaded is true and location is provided', () => {
    renderSearchPage(true);
    
    expect(window.google.maps.Map).toHaveBeenCalled();
  });

  it('sets up SearchBox when map is created', async () => {
    renderSearchPage(true);
    
    // Wait for the useEffect that creates the SearchBox to run
    await waitFor(() => {
      expect(window.google.maps.places.SearchBox).toHaveBeenCalled();
    });
  });

  it('handles text search when searchBtn is clicked', async () => {
    renderSearchPage(true);
    
    // Set up refs for test
    const mapUtilsModule = require('../utils/mapUtils');
    mapUtilsModule.getPolyBounds.mockReturnValue({});
    
    // Mock the input ref
    document.querySelector('.search-input').value = 'Test Query';
    
    // Click the search button
    fireEvent.click(document.querySelector('.search-btn'));
    
    // Wait for the search to complete
    await waitFor(() => {
      expect(window.google.maps.places.PlacesService).toHaveBeenCalled();
      const placesService = window.google.maps.places.PlacesService.mock.results[0].value;
      expect(placesService.textSearch).toHaveBeenCalled();
    });
  });

  it('creates markers when search results are returned', async () => {
    renderSearchPage(true);
    
    // Set up refs for test
    const mapUtilsModule = require('../utils/mapUtils');
    mapUtilsModule.getPolyBounds.mockReturnValue({});
    
    // Mock the input ref
    document.querySelector('.search-input').value = 'Test Query';
    
    // Click the search button
    fireEvent.click(document.querySelector('.search-btn'));
    
    // Wait for the markers to be created
    await waitFor(() => {
      expect(window.google.maps.Marker).toHaveBeenCalled();
    });
  });

  it('initializes drawing mode when draw button is clicked', async () => {
    renderSearchPage(true);
    
    // Mock the onDrawClick prop to FloatingActions
    const floatingActions = screen.getByLabelText('Draw');
    fireEvent.click(floatingActions);
    
    await waitFor(() => {
      expect(window.google.maps.drawing.DrawingManager).toHaveBeenCalled();
      expect(mockDrawingManager.setDrawingMode).toHaveBeenCalledWith('polygon');
      expect(mockDrawingManager.setMap).toHaveBeenCalled();
    });
  });

  it('clears all map objects when clear button is clicked', async () => {
    renderSearchPage(true);
    
    // Set up mock states
    const React = require('react');
    React.useRef.mockImplementationOnce(() => ({ current: mockDrawingManager }));
    React.useRef.mockImplementationOnce(() => ({ current: mockPolygon }));
    
    // Click the clear button
    const clearButton = screen.getByLabelText('Clear');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      // Verify cleanup actions
      expect(mockPolygon.setMap).toHaveBeenCalledWith(null);
      expect(window.google.maps.event.clearListeners).toHaveBeenCalled();
    });
  });

  it('doesn\'t initialize map when mapLoaded is false', () => {
    renderSearchPage(false);
    
    expect(window.google.maps.Map).not.toHaveBeenCalled();
  });
});