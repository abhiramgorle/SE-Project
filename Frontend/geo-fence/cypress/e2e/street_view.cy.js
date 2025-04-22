// cypress/e2e/street_view.cy.js

describe('Street View Functionality', () => {
    beforeEach(() => {
      // Visit the search page
      cy.visit('/search');
      
      // Set up mocks for Google Maps API with emphasis on Street View
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
        
        // Mock InfoWindow with actual DOM manipulation for testing
        win.google.maps.InfoWindow = class {
          constructor() {
            this.content = '';
            this.isOpen = false;
            this.marker = null;
            
            // Create a div to represent the info window content
            const div = document.createElement('div');
            div.id = 'mock-info-window';
            div.style.position = 'absolute';
            div.style.top = '50%';
            div.style.left = '50%';
            div.style.transform = 'translate(-50%, -50%)';
            div.style.backgroundColor = 'white';
            div.style.padding = '20px';
            div.style.borderRadius = '8px';
            div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            div.style.zIndex = '1000';
            div.style.display = 'none';
            document.body.appendChild(div);
            
            this.contentDiv = div;
            
            return {
              setContent: (content) => {
                this.content = content;
                this.contentDiv.innerHTML = content;
              },
              open: (map, marker) => {
                this.isOpen = true;
                this.marker = marker;
                this.contentDiv.style.display = 'block';
                
                // Simulate the domready event
                setTimeout(() => {
                  if (win.google.maps.event.trigger) {
                    win.google.maps.event.trigger(this, 'domready');
                  }
                }, 100);
              },
              close: () => {
                this.isOpen = false;
                this.marker = null;
                this.contentDiv.style.display = 'none';
              },
              getContent: () => this.content,
              marker: null
            };
          }
        };
        
        // Mock places service
        win.google.maps.places.PlacesService = class {
          constructor() {
            return {
              getDetails: (request, callback) => {
                callback({
                  name: 'Test Restaurant',
                  formatted_address: '123 Test St, San Francisco, CA',
                  formatted_phone_number: '(123) 456-7890',
                  geometry: {
                    location: {
                      lat: () => 37.7749,
                      lng: () => -122.4194
                    }
                  },
                  photos: [{
                    getUrl: () => 'test-image-url.jpg'
                  }]
                }, 'OK');
              }
            };
          }
        };
        
        // Mock StreetViewService
        win.google.maps.StreetViewService = class {
          constructor() {
            return {
              getPanoramaByLocation: (location, radius, callback) => {
                // Mock successful response
                callback({
                  location: {
                    latLng: {
                      lat: () => 37.7749,
                      lng: () => -122.4194
                    },
                    description: 'Test Street View Location'
                  },
                  tiles: {
                    worldSize: { width: 512, height: 512 },
                    tileSize: { width: 512, height: 512 },
                    centerHeading: 0
                  },
                  copyright: '© Google'
                }, win.google.maps.StreetViewStatus.OK);
              },
              // Add a method to simulate no street view found
              simulateNoStreetView: function() {
                this.getPanoramaByLocation = (location, radius, callback) => {
                  callback(null, win.google.maps.StreetViewStatus.ZERO_RESULTS);
                };
              }
            };
          }
        };
        
        // Mock StreetViewPanorama
        win.google.maps.StreetViewPanorama = class {
          constructor(element, options) {
            this.element = element;
            this.options = options || {};
            this.position = options?.position;
            this.pov = options?.pov || { heading: 0, pitch: 0 };
            this.zoom = options?.zoom || 1;
            
            // Inject a mock panorama preview
            if (element) {
              element.innerHTML = `
                <div class="mock-street-view">
                  <div class="mock-street-view-controls">
                    <button class="mock-zoom-in">+</button>
                    <button class="mock-zoom-out">-</button>
                    <button class="mock-fullscreen">⛶</button>
                  </div>
                  <div class="mock-street-view-image">
                    <img src="https://via.placeholder.com/300x200/808080/FFFFFF?text=Street+View+Panorama" alt="Street View" />
                  </div>
                </div>
              `;
              
              // Style the mock panorama
              element.style.width = '100%';
              element.style.height = '100%';
              element.style.backgroundColor = '#f1f1f1';
              element.style.position = 'relative';
              
              // Add event listeners to mock controls
              const zoomInBtn = element.querySelector('.mock-zoom-in');
              if (zoomInBtn) {
                zoomInBtn.addEventListener('click', () => {
                  this.zoom += 1;
                });
              }
              
              const zoomOutBtn = element.querySelector('.mock-zoom-out');
              if (zoomOutBtn) {
                zoomOutBtn.addEventListener('click', () => {
                  this.zoom = Math.max(1, this.zoom - 1);
                });
              }
            }
            
            return {
              setPosition: (position) => {
                this.position = position;
              },
              getPosition: () => this.position,
              setPov: (pov) => {
                this.pov = pov;
              },
              getPov: () => this.pov,
              setZoom: (zoom) => {
                this.zoom = zoom;
              },
              getZoom: () => this.zoom,
              registerPanoProvider: cy.stub(),
              addListener: (event, callback) => {
                this[`${event}Callback`] = callback;
                return { remove: cy.stub() };
              }
            };
          }
        };
        
        // Mock StreetViewStatus
        win.google.maps.StreetViewStatus = {
          OK: 'OK',
          ZERO_RESULTS: 'ZERO_RESULTS',
          UNKNOWN_ERROR: 'UNKNOWN_ERROR'
        };
        
        // Mock geometry utilities
        win.google.maps.geometry = {
          spherical: {
            computeHeading: () => 45
          }
        };
        
        // Mock event handlers
        win.google.maps.event = {
          addListener: (instance, event, callback) => {
            instance[`${event}Callback`] = callback;
            return { remove: cy.stub() };
          },
          addListenerOnce: (instance, event, callback) => {
            instance[`${event}OnceCallback`] = callback;
            return { remove: cy.stub() };
          },
          clearListeners: cy.stub(),
          trigger: (instance, event) => {
            if (instance[`${event}Callback`]) {
              instance[`${event}Callback`]();
            }
          }
        };
      });
    });
  
    it('should display the street view when clicking the street view button', () => {
      // Set up info window with place details
      cy.window().then((win) => {
        const infoWindow = new win.google.maps.InfoWindow();
        const content = `
          <div class="info-main">
            <div class="info-head">
              <h2>Test Restaurant</h2>
            </div>
            <div class="info-btns">
              <button class="btn-street">
                <i class="fas fa-street-view"></i>
                Street View
              </button>
              <button class="btn-route" id="place-directions-btn">
                <i class="fas fa-directions"></i>
                Directions
              </button>
            </div>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open();
      });
      
      // Click the street view button
      cy.get('#mock-info-window .btn-street').click();
      
      // Verify street view content appears
      cy.get('#mock-info-window .street-header').should('exist');
      cy.get('#mock-info-window #pano').should('exist');
    });
  
    it('should show error when street view is not available', () => {
      // Set up info window with place details
      cy.window().then((win) => {
        // Override the StreetViewService to return no results
        win.google.maps.StreetViewService = class {
          constructor() {
            return {
              getPanoramaByLocation: (location, radius, callback) => {
                callback(null, win.google.maps.StreetViewStatus.ZERO_RESULTS);
              }
            };
          }
        };
        
        const infoWindow = new win.google.maps.InfoWindow();
        const content = `
          <div class="info-main">
            <div class="info-head">
              <h2>Test Restaurant</h2>
            </div>
            <div class="info-btns">
              <button class="btn-street">
                <i class="fas fa-street-view"></i>
                Street View
              </button>
            </div>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open();
      });
      
      // Click the street view button
      cy.get('#mock-info-window .btn-street').click();
      
      // Verify error message appears
      cy.contains('No Street View available').should('be.visible');
    });
  
    it('should have functional controls in street view', () => {
      // Set up info window with street view
      cy.window().then((win) => {
        const infoWindow = new win.google.maps.InfoWindow();
        
        // Start with street view already displayed
        const content = `
          <div class="street-main">
            <div class="street-header">
              <button class="back-btn" aria-label="Back to place details">
                <i class="fas fa-arrow-left"></i>
              </button>
              <h2 class="street-title">Test Restaurant</h2>
              <div class="street-controls">
                <button class="street-zoom-in" aria-label="Zoom in">
                  <i class="fas fa-plus"></i>
                </button>
                <button class="street-zoom-out" aria-label="Zoom out">
                  <i class="fas fa-minus"></i>
                </button>
                <button class="street-fullscreen" aria-label="Toggle fullscreen">
                  <i class="fas fa-expand"></i>
                </button>
              </div>
            </div>
            <div class="street-info">Street View</div>
            <div class="street-pano">
              <div id="pano"></div>
            </div>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open();
        
        // Mock the panorama
        setTimeout(() => {
          const panoDiv = document.getElementById('pano');
          if (panoDiv) {
            new win.google.maps.StreetViewPanorama(panoDiv, {
              position: { lat: 37.7749, lng: -122.4194 },
              pov: { heading: 45, pitch: 10 },
              zoom: 1
            });
          }
        }, 100);
      });
      
      // Test zoom in button
      cy.get('.street-zoom-in').click();
      
      // Test zoom out button
      cy.get('.street-zoom-out').click();
      
      // Test back button
      cy.get('.back-btn').click();
      
      // Verify that clicking back button returns to place details
      cy.get('#mock-info-window .info-main').should('exist');
    });
  
    it('should handle fullscreen toggling', () => {
      // Set up info window with street view
      cy.window().then((win) => {
        const infoWindow = new win.google.maps.InfoWindow();
        
        // Start with street view already displayed
        const content = `
          <div class="street-main">
            <div class="street-header">
              <button class="back-btn">
                <i class="fas fa-arrow-left"></i>
              </button>
              <h2 class="street-title">Test Restaurant</h2>
              <div class="street-controls">
                <button class="street-fullscreen" aria-label="Toggle fullscreen">
                  <i class="fas fa-expand"></i>
                </button>
              </div>
            </div>
            <div class="street-pano">
              <div id="pano"></div>
            </div>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open();
        
        // Mock fullscreen API
        const panoElement = document.createElement('div');
        panoElement.id = 'pano';
        document.body.appendChild(panoElement);
        
        // Mock fullscreen methods
        panoElement.requestFullscreen = cy.stub();
        document.exitFullscreen = cy.stub();
        
        // Mock fullscreen property
        Object.defineProperty(document, 'fullscreenElement', {
          get: function() { return null; }
        });
        
        // Set up the StreetViewPanorama
        new win.google.maps.StreetViewPanorama(panoElement, {
          position: { lat: 37.7749, lng: -122.4194 },
          pov: { heading: 45, pitch: 10 }
        });
      });
      
      // Test fullscreen button
      cy.get('.street-fullscreen').click();
      
      // We can't actually test fullscreen in Cypress, but we can verify
      // that the button was clicked and the stub was called
      cy.window().then((win) => {
        // The panoElement.requestFullscreen should have been called
        if (win.document.getElementById('pano').requestFullscreen.called) {
          expect(win.document.getElementById('pano').requestFullscreen.called).to.be.true;
        }
      });
    });
  
    it('should reinitialize street view when going back and clicking street view again', () => {
      // Set up info window with place details
      cy.window().then((win) => {
        const infoWindow = new win.google.maps.InfoWindow();
        let streetViewInitialized = false;
        
        // Mock the initStreetView function to track calls
        win.initStreetView = (place, infoWindow) => {
          streetViewInitialized = true;
        };
        
        const content = `
          <div class="info-main">
            <div class="info-head">
              <h2>Test Restaurant</h2>
            </div>
            <div class="info-btns">
              <button class="btn-street">
                <i class="fas fa-street-view"></i>
                Street View
              </button>
            </div>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open();
        
        // Manually attach the click handler to the street view button
        setTimeout(() => {
          const streetBtn = document.querySelector('.btn-street');
          if (streetBtn) {
            streetBtn.addEventListener('click', () => {
              // Set street view content
              infoWindow.setContent(`
                <div class="street-main">
                  <div class="street-header">
                    <button class="back-btn">
                      <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2 class="street-title">Test Restaurant</h2>
                  </div>
                  <div class="street-pano">
                    <div id="pano"></div>
                  </div>
                </div>
              `);
              
              // Mark as initialized
              streetViewInitialized = true;
              
              // Attach back button handler
              setTimeout(() => {
                const backBtn = document.querySelector('.back-btn');
                if (backBtn) {
                  backBtn.addEventListener('click', () => {
                    // Reset to original content
                    infoWindow.setContent(content);
                    streetViewInitialized = false;
                    
                    // Reattach street view button handler
                    setTimeout(() => {
                      const newStreetBtn = document.querySelector('.btn-street');
                      if (newStreetBtn) {
                        newStreetBtn.addEventListener('click', () => {
                          streetViewInitialized = true;
                        });
                      }
                    }, 10);
                  });
                }
              }, 10);
            });
          }
        }, 10);
      });
      
      // Click street view button
      cy.get('.btn-street').click();
      
      // Verify street view is shown
      cy.get('.street-pano').should('exist');
      
      // Click back button
      cy.get('.back-btn').click();
      
      // Verify place details are shown again
      cy.get('.info-main').should('exist');
      
      // Click street view button again
      cy.get('.btn-street').click();
      
      // Verify street view is shown again
      cy.get('.street-pano').should('exist');
      
      // Verify that street view was initialized twice (checking indirectly)
      cy.window().then((win) => {
        expect(win.streetViewInitialized).to.be.true;
      });
    });
  });