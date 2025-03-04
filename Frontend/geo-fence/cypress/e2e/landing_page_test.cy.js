// cypress/integration/landing_page_spec.js

describe('Geo-Fence Landing Page', () => {
    beforeEach(() => {
        
      cy.visit('/');
      
      // Mock geolocation API
      cy.window().then((win) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((callback) => {
          return callback({
            coords: {
              latitude: 37.7749,
              longitude: -122.4194
            }
          });
        });
      });
  
      cy.window().then((win) => {
        win.google = {
          maps: {
            places: {
              Autocomplete: class {
                constructor() {
                  return {
                    addListener: (event, cb) => {
                      this.callback = cb;
                      return { remove: () => {} };
                    },
                    getPlace: () => ({
                      geometry: {
                        location: {
                          lat: () => 37.7749,
                          lng: () => -122.4194
                        }
                      }
                    })
                  };
                }
              }
            },
            Geocoder: class {
              geocode(request, callback) {
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
              }
            },
            GeocoderStatus: {
              OK: 'OK'
            }
          }
        };
      });
    });
  
    it('should load the landing page correctly', () => {
      // Check if the header is visible
      cy.contains('Geo-Fence').should('be.visible');
      
      // Check if the subtitle text is present
      cy.contains('Your Personal Navigator').should('be.visible');
      cy.contains('TO PLACES NEAR YOU').should('be.visible');
      
      // Check if the search input is visible
      cy.get('input[placeholder="Search city"]').should('be.visible');
    });
  
    it('should allow searching for a city', () => {
      // Type a city name in the search input
      cy.get('input[placeholder="Search city"]').type('San Francisco');
      
      // Click the search button
      cy.get('button[aria-label="search"]').click();
      cy.url().should('include', '/search');
    });
  
    it('should allow using current location', () => {
      // Click the location button
      cy.get('button[aria-label="user location"]').click();
      
      // Check if it navigates to the search page
      cy.url().should('include', '/search');
    });
  });