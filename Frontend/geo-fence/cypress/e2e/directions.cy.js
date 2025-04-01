// cypress/e2e/directions.cy.js

describe('Directions Functionality', () => {
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
              textSearch: (request, callback) => {
                callback([
                  {
                    name: 'Test Restaurant',
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
                  name: 'Test Restaurant',
                  formatted_address: '123 Test St, San Francisco, CA',
                  formatted_phone_number: '(123) 456-7890',
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
        
        // Mock Marker
        win.google.maps.Marker = class {
          constructor(options) {
            this.options = options || {};
            
            return {
              setMap: cy.stub(),
              setAnimation: cy.stub(),
              position: options.position || {
                lat: () => 37.7749,
                lng: () => -122.4194
              },
              addListener: (event, callback) => {
                if (event === 'click') {
                  // Store the callback to trigger later
                  this.clickCallback = callback;
                }
                return { remove: cy.stub() };
              },
              triggerClick: function() {
                if (this.clickCallback) {
                  this.clickCallback();
                }
              },
              id: options.id || 'test_place_id'
            };
          }
        };
        
        // Mock DirectionsService
        win.google.maps.DirectionsService = class {
          constructor() {
            return {
              route: (request, callback) => {
                callback({
                  routes: [{
                    legs: [{
                      duration: { text: '15 mins' },
                      distance: { text: '3.2 miles' },
                      steps: [
                        {
                          instructions: 'Head north on Test St',
                          distance: { text: '0.5 miles' }
                        },
                        {
                          instructions: 'Turn right onto Main St',
                          distance: { text: '1.2 miles' }
                        },
                        {
                          instructions: 'Arrive at destination',
                          distance: { text: '0' }
                        }
                      ]
                    }]
                  }]
                }, 'OK');
              }
            };
          }
        };
        
        // Mock DirectionsRenderer
        win.google.maps.DirectionsRenderer = class {
          constructor(options) {
            this.options = options || {};
            
            return {
              setMap: cy.stub(),
              setDirections: cy.stub(),
              setPanel: (panel) => {
                // Actually inject some mock directions into the panel
                if (panel) {
                  panel.innerHTML = `
                    <div class="adp">
                      <div class="adp-summary">
                        <span>15 mins</span>
                        <span>3.2 miles</span>
                      </div>
                      <div class="adp-directions">
                        <div class="adp-substep">
                          <div class="adp-stepicon">1</div>
                          <div class="adp-steptext">Head north on Test St</div>
                        </div>
                        <div class="adp-substep">
                          <div class="adp-stepicon">2</div>
                          <div class="adp-steptext">Turn right onto Main St</div>
                        </div>
                        <div class="adp-substep">
                          <div class="adp-stepicon">3</div>
                          <div class="adp-steptext">Arrive at destination</div>
                        </div>
                      </div>
                    </div>
                  `;
                }
              }
            };
          }
        };
        
        // Mock LatLng
        win.google.maps.LatLng = class {
          constructor(lat, lng) {
            return {
              lat: () => lat,
              lng: () => lng
            };
          }
        };
        
        // Mock geometry utilities
        win.google.maps.geometry = {
          spherical: {
            computeHeading: () => 45
          }
        };
        
        // Mock TravelMode
        win.google.maps.TravelMode = {
          DRIVING: 'DRIVING',
          WALKING: 'WALKING',
          BICYCLING: 'BICYCLING',
          TRANSIT: 'TRANSIT'
        };
        
        // Mock DirectionsStatus
        win.google.maps.DirectionsStatus = {
          OK: 'OK',
          NOT_FOUND: 'NOT_FOUND',
          ZERO_RESULTS: 'ZERO_RESULTS'
        };
        
        // Mock event
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
      
      // Trigger a search to populate the map with markers
      cy.get('input[type="text"]').type('Restaurant');
      cy.get('button[aria-label="Search"]').click();
      
      // Wait for markers to be created
      cy.wait(1000);
    });
  
    it('should show directions UI when clicking the directions button', () => {
      // Set up info window with place details
      cy.window().then((win) => {
        const infoWindow = new win.google.maps.InfoWindow();
        const content = `
          <div class="info-main">
            <div class="info-head">
              <h2>Test Restaurant</h2>
            </div>
            <div class="info-btns">
              <button class="btn-street">Street View</button>
              <button class="btn-route" id="place-directions-btn">Directions</button>
            </div>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open();
      });
      
      // Click the directions button
      cy.get('#mock-info-window .btn-route').click();
      
      // Verify the prompt to select a starting point appears
      cy.get('#mock-info-window .route-prompt').should('exist');
      cy.contains('Please select your starting point').should('be.visible');
    });
  
    it('should allow selecting an origin point on the map', () => {
      // Set up info window with directions prompt
      cy.window().then((win) => {
        const infoWindow = new win.google.maps.InfoWindow();
        const content = `
          <div class="route-prompt">
            <div class="route-prompt-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <p>Please select your starting point on the map</p>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open();
        
        // Simulate click on map to set origin
        const map = new win.google.maps.Map();
        if (map.clickCallback) {
          map.clickCallback({
            latLng: new win.google.maps.LatLng(37.78, -122.42)
          });
        }
      });
      
      // Check if travel mode selection appears
      cy.get('#mock-info-window .travel-modes').should('exist');
      cy.contains('Choose Travel Mode').should('be.visible');
    });
  
    it('should show route options for different travel modes', () => {
      // Set up info window with travel mode selection
      cy.window().then((win) => {
        const infoWindow = new win.google.maps.InfoWindow();
        const content = `
          <div class="route-main">
            <div class="route-header">
              <h3>Choose Travel Mode</h3>
            </div>
            <div class="travel-modes">
              <label class="travel-mode-option">
                <input type="radio" name="mode" value="DRIVING" checked>
                <span class="mode-icon">
                  <i class="fas fa-car"></i>
                </span>
                <span class="mode-label">Drive</span>
              </label>
              
              <label class="travel-mode-option">
                <input type="radio" name="mode" value="WALKING">
                <span class="mode-icon">
                  <i class="fas fa-walking"></i>
                </span>
                <span class="mode-label">Walk</span>
              </label>
              
              <label class="travel-mode-option">
                <input type="radio" name="mode" value="BICYCLING">
                <span class="mode-icon">
                  <i class="fas fa-bicycle"></i>
                </span>
                <span class="mode-label">Bike</span>
              </label>
              
              <label class="travel-mode-option">
                <input type="radio" name="mode" value="TRANSIT">
                <span class="mode-icon">
                  <i class="fas fa-bus"></i>
                </span>
                <span class="mode-label">Transit</span>
              </label>
            </div>
            <button class="route-calculate-btn">Calculate Route</button>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open();
      });
      
      // Select walking mode
      cy.get('#mock-info-window input[value="WALKING"]').check();
      
      // Click calculate route
      cy.get('#mock-info-window .route-calculate-btn').click();
      
      // Verify route details appear
      cy.get('#mock-info-window .directions-info').should('exist');
      cy.contains('15 mins').should('be.visible');
      cy.contains('3.2 miles').should('be.visible');
    });
  
    it('should display step-by-step directions in sidebar', () => {
      // First, set up mock sidebar
      cy.window().then((win) => {
        // Create a mock sidebar
        const sidebarDiv = document.createElement('div');
        sidebarDiv.id = 'mock-sidebar';
        sidebarDiv.className = 'sidebar-container d-block';
        sidebarDiv.style.position = 'fixed';
        sidebarDiv.style.top = '0';
        sidebarDiv.style.left = '0';
        sidebarDiv.style.width = '350px';
        sidebarDiv.style.height = '100%';
        sidebarDiv.style.backgroundColor = 'white';
        sidebarDiv.style.zIndex = '1500';
        sidebarDiv.style.display = 'none';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'sidebar-content';
        sidebarDiv.appendChild(contentDiv);
        
        document.body.appendChild(sidebarDiv);
        
        // Create a mock for the sidebar ref
        win.sidebarRef = {
          current: {
            open: () => {
              sidebarDiv.style.display = 'block';
            },
            close: () => {
              sidebarDiv.style.display = 'none';
            },
            getContentRef: () => ({
              current: contentDiv
            })
          }
        };
        
        // Now set up the info window with directions info
        const infoWindow = new win.google.maps.InfoWindow();
        infoWindow.setContent(`
          <div class="directions-info">
            <div class="directions-place">
              <i class="fas fa-map-marker-alt"></i>
              <span class="place-name">Test Restaurant</span>
            </div>
            
            <div class="directions-details">
              <div class="directions-time">
                <i class="fas fa-clock"></i>
                <span class="place-duration">15 mins</span>
              </div>
              
              <div class="directions-distance">
                <i class="fas fa-road"></i>
                <span class="place-distance">3.2 miles</span>
              </div>
            </div>
            
            <button class="view-directions-btn" id="view-directions-btn">
              <i class="fas fa-list"></i>
              View Step-by-Step Directions
            </button>
          </div>
        `);
        infoWindow.open();
      });
      
      // Click the view directions button
      cy.get('#view-directions-btn').click();
      
      // Wait for sidebar to open and directions to load
      cy.wait(500);
      
      // Check if sidebar is visible
      cy.get('#mock-sidebar').should('be.visible');
      
      // Check if directions are displayed
      cy.get('.sidebar-content .adp-directions').should('exist');
      cy.get('.sidebar-content .adp-steptext').contains('Head north on Test St').should('exist');
    });
  
    it('should clear route when clicking the cancel button', () => {
      // Set up info window with directions info
      cy.window().then((win) => {
        const infoWindow = new win.google.maps.InfoWindow();
        infoWindow.setContent(`
          <div class="directions-info">
            <div class="directions-place">
              <span class="place-name">Test Restaurant</span>
            </div>
            <div class="directions-details">
              <span class="place-duration">15 mins</span>
              <span class="place-distance">3.2 miles</span>
            </div>
            <div class="directions-actions">
              <button class="view-directions-btn">
                View Step-by-Step Directions
              </button>
              <button class="route-cancel-btn">
                <i class="fas fa-times"></i>
                Clear Route
              </button>
            </div>
          </div>
        `);
        infoWindow.open();
      });
      
      // Click the cancel button
      cy.get('.route-cancel-btn').click();
      
      // Verify info window is reset to place details
      cy.get('#mock-info-window .info-main').should('exist');
    });
  });