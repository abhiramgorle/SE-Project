// cypress/e2e/polygon_drawing.cy.js

describe('Polygon Drawing', () => {
    beforeEach(() => {
      // Visit the search page
      cy.visit('/search');
      
      // Set up mocks for Google Maps API
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
              }),
              addListener: (event, callback) => {
                this[`${event}Callback`] = callback;
                return { remove: cy.stub() };
              },
              triggerClick: (latLng) => {
                if (this.clickCallback) {
                  this.clickCallback({ latLng });
                }
              }
            };
          }
        };
        
        // Mock DrawingManager with events
        let drawingManagerInstance;
        win.google.maps.drawing = {
          OverlayType: { POLYGON: 'polygon' },
          DrawingManager: class {
            constructor(options) {
              drawingManagerInstance = this;
              
              this.drawingMode = options?.drawingMode || null;
              this.map = null;
              this.options = options || {};
              this.listeners = {};
              
              return {
                setMap: (map) => {
                  this.map = map;
                },
                setDrawingMode: (mode) => {
                  this.drawingMode = mode;
                },
                setOptions: (options) => {
                  this.options = { ...this.options, ...options };
                },
                getDrawingMode: () => this.drawingMode,
                addListener: (event, callback) => {
                  this.listeners[event] = callback;
                  return { remove: cy.stub() };
                }
              };
            }
            
            // Method to simulate polygon completion
            simulatePolygonComplete() {
              // Create a mock polygon
              const polygon = new win.google.maps.Polygon();
              
              // If there's an overlaycomplete listener, call it
              if (this.listeners.overlaycomplete) {
                this.listeners.overlaycomplete({
                  type: 'polygon',
                  overlay: polygon
                });
              }
              
              return polygon;
            }
          }
        };
        
        // Store the DrawingManager class for later use
        win.drawingManagerClass = win.google.maps.drawing.DrawingManager;
        
        // Mock Polygon
        win.google.maps.Polygon = class {
          constructor(options) {
            this.options = options || {};
            this.listeners = {};
            this.paths = [];
            
            return {
              setMap: cy.stub(),
              setEditable: cy.stub(),
              getPath: () => ({
                forEach: (callback) => {
                  // Simulate a polygon with 4 points
                  for (let i = 0; i < 4; i++) {
                    callback({
                      lat: () => 37.7749 + (i * 0.01),
                      lng: () => -122.4194 + (i * 0.01)
                    });
                  }
                },
                addListener: (event, callback) => {
                  this.listeners[event] = callback;
                  return { remove: cy.stub() };
                }
              })
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
        
        // Mock geometry utility
        win.google.maps.geometry = {
          poly: {
            containsLocation: () => true
          }
        };
        
        // Mock places service for search results
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
                      viewport: {}
                    },
                    place_id: 'test_place_id'
                  }
                ], 'OK');
              },
              getDetails: (request, callback) => {
                callback({
                  name: 'Test Place',
                  formatted_address: '123 Test St, San Francisco, CA',
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
      });
    });
  
    it('should initiate drawing mode when clicking the draw button', () => {
      // Click the draw button
      cy.get('.draw-btn').click();
      
      // Check that the status message appears
      cy.contains('Draw a region on the map').should('be.visible');
      
      // Verify drawing mode is activated - we can only check indirectly
      cy.window().then((win) => {
        const drawingManager = new win.google.maps.drawing.DrawingManager();
        expect(drawingManager.getDrawingMode()).to.equal('polygon');
      });
    });
  
    it('should complete a polygon and update the search prompt', () => {
      // Click the draw button to initiate drawing
      cy.get('.draw-btn').click();
      
      // Simulate polygon completion
      cy.window().then((win) => {
        // Create a new DrawingManager instance
        const drawingManager = new win.drawingManagerClass();
        
        // Simulate completion of a polygon
        const polygon = drawingManager.simulatePolygonComplete();
        
        // Now check if the search input placeholder changed
        cy.get('input[type="text"]').should('have.attr', 'placeholder').and('include', 'Search for places');
      });
    });
  
    it('should search within the polygon', () => {
      // First, click draw button
      cy.get('.draw-btn').click();
      
      // Simulate polygon completion
      cy.window().then((win) => {
        const drawingManager = new win.drawingManagerClass();
        const polygon = drawingManager.simulatePolygonComplete();
      });
      
      // Now search within the polygon
      cy.get('input[type="text"]').type('Restaurant');
      cy.get('button[aria-label="Search"]').click();
      
      // Check that the search was performed
      cy.contains('Found 1 place').should('be.visible');
    });
  
    it('should update search when polygon is edited', () => {
      // Set up the polygon first
      cy.get('.draw-btn').click();
      
      cy.window().then((win) => {
        const drawingManager = new win.drawingManagerClass();
        const polygon = drawingManager.simulatePolygonComplete();
      });
      
      // Search for something
      cy.get('input[type="text"]').type('Restaurant');
      cy.get('button[aria-label="Search"]').click();
      
      // Now simulate editing the polygon
      cy.window().then((win) => {
        // Trigger the set_at event on the polygon path
        if (win.polygonRef && win.polygonRef.current) {
          const path = win.polygonRef.current.getPath();
          if (path.listeners && path.listeners.set_at) {
            path.listeners.set_at();
          }
        }
      });
      
      // Check that the search updates
      cy.contains('Area updated, searching again').should('be.visible');
    });
  
    it('should clear the polygon when clicking the clear button', () => {
      // First set up the polygon
      cy.get('.draw-btn').click();
      
      cy.window().then((win) => {
        const drawingManager = new win.drawingManagerClass();
        const polygon = drawingManager.simulatePolygonComplete();
      });
      
      // Now click the clear button
      cy.get('.clear-btn').click();
      
      // Verify the status message
      cy.contains('All cleared').should('be.visible');
      
      // Check that the input placeholder is reset
      cy.get('input[type="text"]').should('have.attr', 'placeholder').and('include', 'Click on the draw icon');
    });
  });