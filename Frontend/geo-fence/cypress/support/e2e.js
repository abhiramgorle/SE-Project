// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// cypress/support/e2e.js
// Import commands.js using ES2015 syntax:
import './commands';

// Mock Google Maps API
Cypress.on('window:before:load', (win) => {
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
        },
        SearchBox: class {
          constructor() {
            return {
              addListener: () => ({ remove: () => {} }),
              getPlaces: () => [{
                geometry: {
                  location: {
                    lat: () => 37.7749,
                    lng: () => -122.4194
                  }
                }
              }]
            };
          }
        }
      },
      Geocoder: class {
        geocode(request, callback) {
          callback([{
            geometry: {
              location: { lat: () => 37.7749, lng: () => -122.4194 }
            }
          }], 'OK');
        }
      },
      GeocoderStatus: { OK: 'OK' },
      Map: class {},
    }
  };
});