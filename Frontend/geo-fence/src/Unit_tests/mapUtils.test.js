import {
    getInfoWindowTemplate,
    getPolyBounds,
    getInfoWindowRouteTemplate,
    getInfoWindowDirectionTemplate,
    searchInPolygon,
    initInfoWindowCarousel,
    initStreetView,
    plotRoute
  } from '../utils/mapUtils';
  
  // Mock the DOM elements that would be created
  document.body.innerHTML = `
    <div class="info-img-container">
      <button class="info-img-next"></button>
      <button class="info-img-prev"></button>
      <img class="info-img" src="" alt="">
    </div>
    <button class="btn-street"></button>
  `;
  
  // Mock Swal (sweetalert2)
  jest.mock('sweetalert2', () => ({
    fire: jest.fn()
  }));
  
  // Mock window.google.maps
  global.window = Object.create(window);
  global.window.google = {
    maps: {
      LatLngBounds: jest.fn(() => ({
        extend: jest.fn(),
        union: jest.fn()
      })),
      geometry: {
        poly: {
          containsLocation: jest.fn()
        },
        spherical: {
          computeHeading: jest.fn()
        }
      },
      StreetViewService: jest.fn(() => ({
        getPanoramaByLocation: jest.fn()
      })),
      StreetViewStatus: {
        OK: 'OK'
      },
      StreetViewPanorama: jest.fn(),
      DirectionsService: jest.fn(() => ({
        route: jest.fn()
      })),
      DirectionsStatus: {
        OK: 'OK'
      },
      DirectionsRenderer: jest.fn(),
      TravelMode: {
        DRIVING: 'DRIVING',
        WALKING: 'WALKING',
        BICYCLING: 'BICYCLING',
        TRANSIT: 'TRANSIT'
      },
      event: {
        addListener: jest.fn(),
        addListenerOnce: jest.fn(),
        clearListeners: jest.fn()
      }
    }
  };
  
  describe('mapUtils', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe('getInfoWindowTemplate', () => {
      it('returns a template with place information', () => {
        const place = {
          name: 'Test Place',
          formatted_address: '123 Test St, Test City',
          formatted_phone_number: '555-1234',
          rating: 4.5,
          reviews: [{ text: 'This is a great place to visit. I really enjoyed my time here.' }],
          url: 'https://example.com',
          photos: [{
            getUrl: jest.fn(() => 'https://example.com/photo.jpg')
          }]
        };
  
        const template = getInfoWindowTemplate(place);
        
        expect(template).toContain('Test Place');
        expect(template).toContain('123 Test St, Test City');
        expect(template).toContain('555-1234');
        expect(template).toContain('4.5');
        expect(template).toContain('This is a great place to visit.');
        expect(template).toContain('https://example.com/photo.jpg');
      });
  
      it('handles place with minimal information', () => {
        const place = {
          name: 'Test Place'
        };
  
        const template = getInfoWindowTemplate(place);
        
        expect(template).toContain('Test Place');
        expect(template).not.toContain('Address');
        expect(template).not.toContain('Phone');
        expect(template).not.toContain('star');
      });
    });
  
    describe('getInfoWindowRouteTemplate', () => {
      it('returns a template with transportation mode options', () => {
        const template = getInfoWindowRouteTemplate();
        
        expect(template).toContain('DRIVING');
        expect(template).toContain('WALKING');
        expect(template).toContain('BICYCLING');
        expect(template).toContain('TRANSIT');
        expect(template).toContain('Show');
      });
    });
  
    describe('getInfoWindowDirectionTemplate', () => {
      it('returns a template with place and distance information', () => {
        const place = { name: 'Destination' };
        const result = {
          duration: { text: '10 minutes' },
          distance: { text: '5 km' }
        };
  
        const template = getInfoWindowDirectionTemplate(place, result);
        
        expect(template).toContain('Destination');
        expect(template).toContain('10 minutes');
        expect(template).toContain('5 km');
        expect(template).toContain('Directions');
      });
    });
  
    describe('getPolyBounds', () => {
      it('returns bounds for a polygon', () => {
        const mockPath = {
          forEach: jest.fn(callback => {
            callback('point1');
            callback('point2');
          })
        };
        
        const polygon = {
          getPath: jest.fn(() => mockPath)
        };
  
        const mockBounds = {
          extend: jest.fn()
        };
        
        global.window.google.maps.LatLngBounds.mockReturnValue(mockBounds);
        
        const result = getPolyBounds(polygon);
        
        expect(polygon.getPath).toHaveBeenCalled();
        expect(mockPath.forEach).toHaveBeenCalled();
        expect(mockBounds.extend).toHaveBeenCalledTimes(2);
        expect(mockBounds.extend).toHaveBeenCalledWith('point1');
        expect(mockBounds.extend).toHaveBeenCalledWith('point2');
        expect(result).toBe(mockBounds);
      });
  
      it('returns undefined if polygon is not provided', () => {
        const result = getPolyBounds(null);
        expect(result).toBeUndefined();
      });
    });
  
    describe('searchInPolygon', () => {
      it('displays markers inside polygon', () => {
        const map = {};
        const marker1 = {
          position: 'position1',
          setMap: jest.fn()
        };
        const marker2 = {
          position: 'position2',
          setMap: jest.fn()
        };
        const markers = [marker1, marker2];
        const polygon = {};
  
        // First marker is inside, second is outside
        global.window.google.maps.geometry.poly.containsLocation
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(false);
  
        searchInPolygon(map, markers, polygon);
  
        expect(global.window.google.maps.geometry.poly.containsLocation).toHaveBeenCalledTimes(2);
        expect(marker1.setMap).toHaveBeenCalledWith(map);
        expect(marker2.setMap).toHaveBeenCalledWith(null);
      });
  
      it('shows at least one marker even if none are in polygon when there is only one marker', () => {
        const map = {};
        const marker = {
          position: 'position',
          setMap: jest.fn()
        };
        const markers = [marker];
        const polygon = {};
  
        // Marker is outside polygon
        global.window.google.maps.geometry.poly.containsLocation.mockReturnValue(false);
  
        searchInPolygon(map, markers, polygon);
  
        expect(global.window.google.maps.geometry.poly.containsLocation).toHaveBeenCalledTimes(1);
        expect(marker.setMap).toHaveBeenCalledWith(map);
      });
    });
  
    describe('initInfoWindowCarousel', () => {
      it('sets up event listeners for photo navigation', () => {
        const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
        
        // Get references to the DOM elements
        const nextBtn = document.querySelector('.info-img-next');
        const prevBtn = document.querySelector('.info-img-prev');
        const img = document.querySelector('.info-img');
        
        // Mock addEventListener
        const addEventListenerMock = jest.fn();
        nextBtn.addEventListener = addEventListenerMock;
        prevBtn.addEventListener = addEventListenerMock;
        
        initInfoWindowCarousel(photos);
        
        expect(addEventListenerMock).toHaveBeenCalledTimes(2);
        expect(addEventListenerMock.mock.calls[0][0]).toBe('click');
        expect(addEventListenerMock.mock.calls[1][0]).toBe('click');
      });
    });
  
    describe('initStreetView', () => {
      it('sets up street view button click handler', () => {
        const place = {
          name: 'Test Place',
          geometry: {
            location: { lat: 37.7749, lng: -122.4194 }
          }
        };
        const infoWindow = {
          setContent: jest.fn()
        };
        
        const streetBtn = document.querySelector('.btn-street');
        const addEventListenerMock = jest.fn();
        streetBtn.addEventListener = addEventListenerMock;
        
        initStreetView(place, infoWindow);
        
        expect(addEventListenerMock).toHaveBeenCalledTimes(1);
        expect(addEventListenerMock.mock.calls[0][0]).toBe('click');
      });
    });
  
    describe('plotRoute', () => {
      it('sets up route display', () => {
        const routeMarkerRef = { current: { setMap: jest.fn() } };
        const directionsDisplayRef = { current: null };
        const map = {};
        const place = {
          geometry: {
            location: 'destination'
          }
        };
        const infoWindow = {
          setContent: jest.fn()
        };
        const sidebarRef = { current: {} };
        
        global.window.google.maps.event.addListenerOnce.mockImplementation((marker, event, callback) => {
          // Store the callback for later testing
          marker.clickCallback = callback;
        });
        
        plotRoute(routeMarkerRef, directionsDisplayRef, map, place, infoWindow, sidebarRef);
        
        expect(global.window.google.maps.event.addListenerOnce).toHaveBeenCalledWith(
          routeMarkerRef.current,
          'click',
          expect.any(Function)
        );
        expect(infoWindow.setContent).toHaveBeenCalledWith(expect.any(String));
      });
    });
  });