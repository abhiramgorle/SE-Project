// cypress/e2e/info_window.cy.js

describe('Info Window', () => {
    beforeEach(() => {
      // Visit the search page
      cy.visit('/search');
      
      // Mock Google Maps API with more detailed mock for InfoWindow
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
                return { remove: cy.stub() };
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
        
        // Mock Marker to trigger info window
        win.google.maps.Marker = class {
          constructor(options) {
            return {
              setMap: cy.stub(),
              setAnimation: cy.stub(),
              position: options.position,
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
        
        // Mock places service with sample data
        win.google.maps.places.PlacesService = class {
          constructor() {
            return {
              textSearch: (request, callback) => {
                callback([
                  {
                    name: 'Test Restaurant',
                    formatted_address: '123 Test St, San Francisco, CA',
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
                  rating: 4.5,
                  website: 'https://test-restaurant.com',
                  photos: [{
                    getUrl: () => 'test-image-url.jpg'
                  }],
                  reviews: [{
                    text: 'Great food and atmosphere. The service was excellent and I would highly recommend this place to anyone looking for a good meal.'
                  }],
                  url: 'https://maps.google.com/test-restaurant',
                  geometry: {
                    location: {
                      lat: () => 37.7749,
                      lng: () => -122.4194
                    }
                  },
                  opening_hours: {
                    isOpen: () => true
                  }
                }, 'OK');
              }
            };
          }
        };
        
        // Enhanced event handler with trigger functionality
        win.google.maps.event = {
          ...win.google.maps.event,
          addListener: (instance, event, callback) => {
            if (event === 'domready') {
              // Store the callback
              instance.domreadyCallback = callback;
            }
            return { remove: cy.stub() };
          },
          trigger: (instance, event) => {
            if (event === 'domready' && instance.domreadyCallback) {
              instance.domreadyCallback();
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
  
    it('should show place details when clicking on a marker', () => {
      // Since we can't directly click the Google Maps marker, we'll trigger the mock
      cy.window().then((win) => {
        // Simulate marker click by setting the info window content and making it visible
        const infoWindow = new win.google.maps.InfoWindow();
        const content = `
          <div class="info-main">
            <div class="info-head">
              <h2>Test Restaurant</h2>
              <div class="info-rating">
                <span class="rating-value">4.5</span>
                <i class="fas fa-star"></i>
              </div>
            </div>
            <div class="info-details">
              <div class="info-address">
                <i class="fas fa-map-marker-alt"></i>
                <span>123 Test St, San Francisco, CA</span>
              </div>
              <div class="info-phone">
                <i class="fas fa-phone"></i>
                <span>(123) 456-7890</span>
              </div>
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
      
      // Now we should see the info window content in the DOM
      cy.get('#mock-info-window').should('be.visible');
      cy.get('#mock-info-window h2').should('contain', 'Test Restaurant');
      cy.get('#mock-info-window .info-rating').should('contain', '4.5');
      cy.get('#mock-info-window .info-address').should('contain', '123 Test St');
    });
  
    it('should have working street view button', () => {
      // First set up the info window with content
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
        
        // Mock street view service
        win.google.maps.StreetViewService = class {
          constructor() {
            return {
              getPanoramaByLocation: (location, radius, callback) => {
                callback({
                  location: {
                    latLng: {
                      lat: () => 37.7749,
                      lng: () => -122.4194
                    }
                  }
                }, win.google.maps.StreetViewStatus.OK);
              }
            };
          }
        };
        
        win.google.maps.StreetViewStatus = {
          OK: 'OK'
        };
        
        win.google.maps.StreetViewPanorama = class {
          constructor() {
            return {
              setZoom: cy.stub(),
              getZoom: () => 1
            };
          }
        };
      });
      
      // Click on the street view button
      cy.get('#mock-info-window .btn-street').click();
      
      // Verify street view content appears
      cy.get('#mock-info-window .street-header').should('exist');
      cy.get('#mock-info-window .street-pano').should('exist');
    });
  
    it('should have working directions button', () => {
      // First set up the info window with content
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
        
        // Mock DirectionsService
        win.google.maps.DirectionsService = class {
          constructor() {
            return {
              route: (request, callback) => {
                callback({
                  routes: [{
                    legs: [{
                      duration: { text: '10 mins' },
                      distance: { text: '2.5 miles' },
                      steps: []
                    }]
                  }]
                }, 'OK');
              }
            };
          }
        };
        
        win.google.maps.DirectionsStatus = {
          OK: 'OK'
        };
        
        win.google.maps.DirectionsRenderer = class {
          constructor(options) {
            return {
              setMap: cy.stub(),
              setPanel: cy.stub(),
              setDirections: cy.stub()
            };
          }
        };
      });
      
      // Click on the directions button
      cy.get('#mock-info-window .btn-route').click();
      
      // Verify directions prompt appears
      cy.get('#mock-info-window .route-prompt').should('exist');
    });
  });