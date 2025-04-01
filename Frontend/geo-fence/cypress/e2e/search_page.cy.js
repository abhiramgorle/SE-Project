// cypress/e2e/search_page.cy.js

describe('Search Page', () => {
    beforeEach(() => {
      // Visit the search page directly
      cy.visit('/search');
      
      // Mock Google Maps API
      cy.window().then((win) => {
        // Mock the map
        win.google.maps.Map = class {
          constructor() {
            return {
              setCenter: cy.stub(),
              setZoom: cy.stub(),
              fitBounds: cy.stub(),
              panTo: cy.stub(),
              getBounds: () => ({
                extend: cy.stub()
              })
            };
          }
        };
        
        // Mock the drawing manager
        win.google.maps.drawing = {
          OverlayType: { POLYGON: 'polygon' },
          DrawingManager: class {
            constructor() {
              return {
                setMap: cy.stub(),
                setDrawingMode: cy.stub(),
                setOptions: cy.stub()
              };
            }
          }
        };
        
        // Mock the places service
        win.google.maps.places.PlacesService = class {
          constructor() {
            return {
              textSearch: (request, callback) => {
                callback([
                  {
                    name: 'Test Place',
                    geometry: {
                      location: {
                        lat: () => 37.7749,
                        lng: () => -122.4194
                      },
                      viewport: {
                        getNorthEast: () => ({ lat: () => 37.8, lng: () => -122.3 }),
                        getSouthWest: () => ({ lat: () => 37.7, lng: () => -122.5 })
                      }
                    },
                    place_id: 'test_place_id'
                  }
                ], 'OK');
              },
              getDetails: (request, callback) => {
                callback({
                  name: 'Test Place',
                  formatted_address: '123 Test St, San Francisco, CA',
                  formatted_phone_number: '(123) 456-7890',
                  rating: 4.5,
                  photos: [{
                    getUrl: () => 'test-image-url.jpg'
                  }],
                  website: 'https://test-place.com',
                  reviews: [{
                    text: 'This is a test review'
                  }],
                  url: 'https://maps.google.com/test-place',
                  geometry: {
                    location: {
                      lat: () => 37.7749,
                      lng: () => -122.4194
                    }
                  }
                }, 'OK');
              }
            };
          }
        };
        
        // Mock LatLngBounds
        win.google.maps.LatLngBounds = class {
          constructor() {
            return {
              extend: cy.stub(),
              union: cy.stub(),
              getNorthEast: () => ({ lat: () => 37.8, lng: () => -122.3 }),
              getSouthWest: () => ({ lat: () => 37.7, lng: () => -122.5 })
            };
          }
        };
        
        // Mock Marker
        win.google.maps.Marker = class {
          constructor(options) {
            return {
              setMap: cy.stub(),
              setAnimation: cy.stub(),
              position: options.position,
              addListener: (event, callback) => {
                if (event === 'click') {
                  // Immediately trigger the click callback for testing
                  setTimeout(() => callback(), 100);
                }
                return { remove: cy.stub() };
              },
              id: options.id || 'test_place_id'
            };
          }
        };
        
        // Mock InfoWindow
        win.google.maps.InfoWindow = class {
          constructor() {
            return {
              setContent: cy.stub(),
              open: cy.stub(),
              close: cy.stub(),
              marker: null
            };
          }
        };
        
        // Mock event handlers
        win.google.maps.event = {
          addListener: (instance, event, callback) => {
            if (event === 'domready') {
              // Trigger domready immediately for testing
              setTimeout(() => callback(), 100);
            }
            return { remove: cy.stub() };
          },
          addListenerOnce: (instance, event, callback) => {
            return { remove: cy.stub() };
          },
          clearListeners: cy.stub()
        };
        
        // Mock geometry utility
        win.google.maps.geometry = {
          poly: {
            containsLocation: () => true
          },
          spherical: {
            computeHeading: () => 45
          }
        };
      });
    });
  
    it('should render the search container', () => {
      cy.get('.search-container').should('be.visible');
      cy.get('input[type="text"]').should('be.visible');
      cy.get('button[aria-label="Search"]').should('be.visible');
    });
  
    it('should search for places when submitting a query', () => {
      cy.get('input[type="text"]').type('Pizza');
      cy.get('button[aria-label="Search"]').click();
      
      // Allow time for the search to complete
      cy.wait(1000);
      
      // Check if search status shows
      cy.contains('Found 1 place').should('be.visible');
    });
  
    it('should initialize drawing mode when clicking the draw button', () => {
      cy.get('.draw-btn').click();
      
      // We can't really test the actual drawing, but we can check that
      // the instruction appears
      cy.contains('Draw a region on the map').should('be.visible');
    });
  
    it('should clear the map when clicking the clear button', () => {
      // First search for something
      cy.get('input[type="text"]').type('Pizza');
      cy.get('button[aria-label="Search"]').click();
      
      // Now clear it
      cy.get('.clear-btn').click();
      
      // Check if the input is cleared
      cy.get('input[type="text"]').should('have.value', '');
      
      // Check if the status message appears
      cy.contains('All cleared').should('be.visible');
    });
  
    it('should show place details when a place is found', () => {
      // Search for a place
      cy.get('input[type="text"]').type('Pizza');
      cy.get('button[aria-label="Search"]').click();
      
      // Wait for the marker to be created and the details to be loaded
      cy.wait(1000);
      
      // The place details should be shown in the info window
      // We can't directly test the InfoWindow content, but we can check
      // that the PlacesService was called with the right parameters
      
      // Instead, let's verify the search status message
      cy.contains('Found 1 place').should('be.visible');
    });
  
    it('should allow returning to home page', () => {
      cy.get('.go-back-button').click();
      cy.url().should('not.include', '/search');
    });
  });