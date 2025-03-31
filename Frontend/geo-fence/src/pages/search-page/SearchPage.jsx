import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cx } from '@linaria/core';
import Swal from 'sweetalert2';
import FloatingActions from 'components/floating-actions/FloatingActions';
import Sidebar from 'components/sidebar/Sidebar';
import { MapLoadedContext } from 'context/MapLoadedContext';
import {
  initInfoWindowCarousel,
  initStreetView,
  getInfoWindowTemplate,
  getInfoWindowRouteTemplate,
  searchInPolygon,
  getPolyBounds,
  plotRoute,
} from 'utils/mapUtils';
import { MAP_CONFIG } from 'constants/index';
import placeIcon from 'assets/images/place.svg';
import destinationIcon from 'assets/images/origin.svg';
import './googleStyles.css';
// import './UpdatedMapStyles.css'; // Import our new styles
import './SearchPage.css'; // Import CSS for this component

const SearchPage = () => {
  const { state: initialLatLng } = useLocation();
  const isMapLoaded = useContext(MapLoadedContext);
  const [map, setMap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [showNoResults, setShowNoResults] = useState(false);
  const [statusTimeout, setStatusTimeout] = useState(null);

  const mapNodeRef = useRef(null);
  const inputRef = useRef(null);

  const markersRef = useRef([]);
  const placeInfoWindowRef = useRef(null);
  const directionsDisplayRef = useRef(null);
  const polygonRef = useRef(null);
  const routeMarkerRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const searchBoxRef = useRef(null);
  const sidebarRef = useRef(null);

  // Helper to show temporary status messages
  const showStatus = (message, duration = 3000) => {
    if (statusTimeout) {
      clearTimeout(statusTimeout);
    }
    
    setSearchStatus(message);
    const timeout = setTimeout(() => {
      setSearchStatus('');
    }, duration);
    
    setStatusTimeout(timeout);
  };

  const resetListeners = useCallback(() => {
    if (placeInfoWindowRef.current) {
      window.google.maps.event.clearListeners(placeInfoWindowRef.current, 'domready');
    }
    if (directionsDisplayRef.current) {
      directionsDisplayRef.current.setMap(null);
      directionsDisplayRef.current = null;
    }
  }, []);

  const hideMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      if (marker) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
  }, []);

  // check whether new destination marker can be created
  const checkDestinationMarker = useCallback(
    (place, infoWindow) => {
      const createDestinationMarker = evt => {
        const image = { url: destinationIcon, scaledSize: new window.google.maps.Size(36, 36) };
        routeMarkerRef.current = new window.google.maps.Marker({ position: evt.latLng, map, icon: image });
        // Only now we should show the "origin selected" message
        showStatus('Origin point selected');
        plotRoute(routeMarkerRef, directionsDisplayRef, map, place, infoWindow, sidebarRef);
      };
  
      const btnRoute = document.querySelector('.btn-route');
      if (btnRoute) {
        btnRoute.addEventListener('click', () => {
          // When button is clicked, routeMarkerRef.current should be null - we're waiting for the user to select a point
          routeMarkerRef.current = null; // Reset this to ensure we start fresh
          
          // Show the prompt to select an origin
          infoWindow.setContent(`
            <div class="route-prompt">
              <div class="route-prompt-icon">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <p>Please select your starting point on the map</p>
            </div>
          `);
          
          showStatus('Click on map to set starting point');
          
          // Remove any existing click listeners to avoid duplicates
          window.google.maps.event.clearListeners(map, 'click');
          
          // Add the click listener for selecting origin
          map.addListener('click', evt => {
            if (!routeMarkerRef.current) {
              createDestinationMarker(evt);
            }
          });
          
          // Also allow clicking inside polygon if it exists
          if (polygonRef.current) {
            // Clear existing listeners first
            window.google.maps.event.clearListeners(polygonRef.current, 'click');
            
            polygonRef.current.addListener('click', evt => {
              if (!routeMarkerRef.current) {
                createDestinationMarker(evt);
              }
            });
          }
        });
      }
    },
    [map, showStatus]
  );

  const getPlaceDetails = useCallback(
    (marker, infoWindow) => {
      // marker bounce effect
      markersRef.current.forEach(m => {
        // bounce only the marker which matches the current clicked marker
        if (m.id === marker.id) {
          m.setAnimation(window.google.maps.Animation.BOUNCE);
          setTimeout(() => {
            m.setAnimation(null);
          }, 2100); // Bounce for a short time then stop
        } else {
          m.setAnimation(null);
        }
      });
  
      setIsLoading(true);
      // create a place service to get details on the places
      const service = new window.google.maps.places.PlacesService(map);
      service.getDetails({ placeId: marker.id }, (place, status) => {
        setIsLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          infoWindow.marker = marker;
  
          const template = getInfoWindowTemplate(place);
          infoWindow.setContent(template);
          infoWindow.open(map, marker);
  
          // dynamically attach event listeners to btns once infowindow is ready
          window.google.maps.event.addListener(infoWindow, 'domready', () => {
            const photos = [];
            if (place.photos) {
              place.photos.forEach(photo => {
                photos.push(photo.getUrl({ maxHeight: 200, maxWidth: 300 }));
              });
            }
            // for the photo carousel
            initInfoWindowCarousel(photos);
            // for fetching the street view
            initStreetView(place, infoWindow);
            // for directions - now using our new approach
            initDirections(place, infoWindow);
          });
  
          // clearing marker on closing infowindow
          window.google.maps.event.addListenerOnce(infoWindow, 'closeclick', () => {
            infoWindow.marker = null;
            marker.setAnimation(null);
            
            // Clear route if it exists
            if (routeMarkerRef.current) {
              routeMarkerRef.current.setMap(null);
              routeMarkerRef.current = null;
            }
            
            if (directionsDisplayRef.current) {
              directionsDisplayRef.current.setMap(null);
              directionsDisplayRef.current = null;
            }
            
            // clearing the set listeners
            resetListeners();
            window.google.maps.event.clearListeners(map, 'click');
            sidebarRef.current.close();
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Could not fetch details for this place',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
    },
    [map, resetListeners]
  );

  const createMarkers = useCallback(
    places => {
      // Set marker bounds
      const bounds = new window.google.maps.LatLngBounds();
  
      // Clear any existing markers first
      hideMarkers();
      
      // Define the marker icon
      const image = {
        url: placeIcon,
        scaledSize: new window.google.maps.Size(36, 36),
      };
  
      // Create a marker for each place
      places.forEach(place => {
        const marker = new window.google.maps.Marker({
          map: map,  // This is critical - directly set the map here
          icon: image,
          title: place.name,
          position: place.geometry.location,
          id: place.place_id,
          animation: window.google.maps.Animation.DROP,
        });
  
        // Store marker in ref array
        markersRef.current.push(marker);
        
        // Creating a shared place info window
        placeInfoWindowRef.current = new window.google.maps.InfoWindow();
        
        // Add click listener to marker
        marker.addListener('click', () => {
          if (placeInfoWindowRef.current.marker !== marker) {
            bounds.extend(marker.position);
            map.fitBounds(bounds);
            map.panTo(marker.position);
            map.setZoom(14);
  
            getPlaceDetails(marker, placeInfoWindowRef.current);
            resetListeners();
            window.google.maps.event.clearListeners(map, 'click');
            sidebarRef.current.close();
          }
        });
  
        // Extend bounds to include this place
        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      
      // Fit the map to the new bounds
      map.fitBounds(bounds);
      map.setZoom(14);
      
      // If we have a polygon, check which markers are inside it
      if (polygonRef.current) {
        searchInPolygon(map, markersRef.current, polygonRef.current);
      }
    },
    [map, getPlaceDetails, resetListeners]
  );

  const textSearchPlaces = () => {
    const query = inputRef.current.value;
    if (map && query.trim().length) {
      // Hide existing markers
      hideMarkers();
      
      // Create a PlacesService instance directly on the map
      const service = new window.google.maps.places.PlacesService(map);
      
      // Perform the search
      service.textSearch(
        { 
          query,
          bounds: getPolyBounds(polygonRef.current) 
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            // Force markers to show on map by setting map property directly
            results.forEach(place => {
              console.log("Found place:", place.name);
            });
            
            // Create new markers
            createMarkers(results);
          } else {
            Swal.fire('Place not found, try again with a new place?');
          }
        }
      );
    } else {
      Swal.fire('Please enter search query first');
    }
  };

  const drawPolygon = () => {
    window.google.maps.event.addListenerOnce(drawingManagerRef.current, 'overlaycomplete', evt => {
      // once drawing is complete we go back to free hand movement mode
      drawingManagerRef.current.setDrawingMode(null);
      drawingManagerRef.current.setOptions({ drawingControl: false });

      // creating an editable polygon
      polygonRef.current = evt.overlay;
      polygonRef.current.setEditable(true);

      // Show success message
      showStatus('Area selected! Now search for places within this area');
      
      // set the bounds of searchbox to the polygon
      const searchInput = inputRef.current;
      searchInput.value = '';
      searchInput.setAttribute('placeholder', 'Search for places eg. pizza, salon, rentals');
      searchInput.focus();
      
      if (searchBoxRef.current) searchBoxRef.current.setBounds(getPolyBounds(polygonRef.current));

      // redo the search if the polygon is edited
      polygonRef.current.getPath().addListener('set_at', () => {
        if (searchInput.value) {
          showStatus('Area updated, searching again...');
          textSearchPlaces();
        }
      });
      
      polygonRef.current.getPath().addListener('insert_at', () => {
        if (searchInput.value) {
          showStatus('Area updated, searching again...');
          textSearchPlaces();
        }
      });
    });
  };
  const initDirections = (place, infoWindow) => {
    // Find the directions button by ID
    const directionsBtn = document.getElementById('place-directions-btn');
    
    if (!directionsBtn) {
      console.error("Directions button not found");
      return;
    }
    
    // Remove any existing event listeners
    const newDirectionsBtn = directionsBtn.cloneNode(true);
    directionsBtn.parentNode.replaceChild(newDirectionsBtn, directionsBtn);
    
    // Add the new event listener
    newDirectionsBtn.addEventListener('click', () => {
      console.log("Directions button clicked");
      
      // Reset the route marker if it exists
      if (routeMarkerRef.current) {
        routeMarkerRef.current.setMap(null);
        routeMarkerRef.current = null;
      }
      
      // Clear any existing directions display
      if (directionsDisplayRef.current) {
        directionsDisplayRef.current.setMap(null);
        directionsDisplayRef.current = null;
      }
      
      // Update the info window to prompt for origin selection
      infoWindow.setContent(`
        <div class="route-prompt">
          <div class="route-prompt-icon">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <p>Please click on the map to set your starting point</p>
          <button class="route-cancel-btn">Cancel</button>
        </div>
      `);
      
      // Add cancel button functionality
      const cancelBtn = document.querySelector('.route-cancel-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          // Reset and go back to place details
          window.google.maps.event.clearListeners(map, 'click');
          infoWindow.setContent(getInfoWindowTemplate(place));
          
          // Re-initialize info window events
          setTimeout(() => {
            const photos = [];
            if (place.photos) {
              place.photos.forEach(photo => {
                photos.push(photo.getUrl({ maxHeight: 200, maxWidth: 300 }));
              });
            }
            
            initInfoWindowCarousel(photos);
            initStreetView(place, infoWindow);
            initDirections(place, infoWindow);
          }, 100);
        });
      }
      
      // Clear any existing click listeners
      window.google.maps.event.clearListeners(map, 'click');
      
      // Add click listener for selecting origin point
      map.addListener('click', (event) => {
        // Create origin marker
        const image = { 
          url: destinationIcon, 
          scaledSize: new window.google.maps.Size(36, 36) 
        };
        
        // Create the marker at clicked location
        routeMarkerRef.current = new window.google.maps.Marker({
          position: event.latLng,
          map: map,
          icon: image,
          animation: window.google.maps.Animation.DROP
        });
        
        // Show travel mode selection
        infoWindow.setContent(`
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
            <div class="route-actions">
              <button class="route-calculate-btn">Calculate Route</button>
              <button class="route-cancel-btn">Cancel</button>
            </div>
          </div>
        `);
        
        // Remove the map click listener since we have our origin
        window.google.maps.event.clearListeners(map, 'click');
        
        // Add calculate route button functionality
        const calculateBtn = document.querySelector('.route-calculate-btn');
        if (calculateBtn) {
          calculateBtn.addEventListener('click', () => {
            calculateRoute(place, infoWindow);
          });
        }
        
        // Add cancel button functionality again
        const cancelBtn = document.querySelector('.route-cancel-btn');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => {
            // Remove the origin marker
            if (routeMarkerRef.current) {
              routeMarkerRef.current.setMap(null);
              routeMarkerRef.current = null;
            }
            
            // Reset and go back to place details
            infoWindow.setContent(getInfoWindowTemplate(place));
            
            // Re-initialize info window events
            setTimeout(() => {
              const photos = [];
              if (place.photos) {
                place.photos.forEach(photo => {
                  photos.push(photo.getUrl({ maxHeight: 200, maxWidth: 300 }));
                });
              }
              
              initInfoWindowCarousel(photos);
              initStreetView(place, infoWindow);
              initDirections(place, infoWindow);
            }, 100);
          });
        }
      });
    });
  };
  const calculateRoute = (place, infoWindow) => {
    if (!routeMarkerRef.current) {
      infoWindow.setContent(`
        <div class="route-error">
          <i class="fas fa-exclamation-circle"></i>
          <p>Please select a starting point first</p>
          <button class="route-cancel-btn">OK</button>
        </div>
      `);
      
      const cancelBtn = document.querySelector('.route-cancel-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          // Reset and go back to place details
          infoWindow.setContent(getInfoWindowTemplate(place));
          
          // Re-initialize info window events
          setTimeout(() => {
            const photos = [];
            if (place.photos) {
              place.photos.forEach(photo => {
                photos.push(photo.getUrl({ maxHeight: 200, maxWidth: 300 }));
              });
            }
            
            initInfoWindowCarousel(photos);
            initStreetView(place, infoWindow);
            initDirections(place, infoWindow);
          }, 100);
        });
      }
      return;
    }
    
    // Get selected travel mode
    const modeInputs = document.querySelectorAll('input[name="mode"]');
    let selectedMode = 'DRIVING';
    
    modeInputs.forEach(input => {
      if (input.checked) {
        selectedMode = input.value;
      }
    });
    
    // Create directions service
    const directionsService = new window.google.maps.DirectionsService();
    
    // Calculate route
    directionsService.route({
      origin: routeMarkerRef.current.position,
      destination: place.geometry.location,
      travelMode: window.google.maps.TravelMode[selectedMode],
    }, (response, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        // Create renderer for the directions
        directionsDisplayRef.current = new window.google.maps.DirectionsRenderer({
          map,
          directions: response,
          draggable: false,
          suppressMarkers: true,
          hideRouteList: true,
          polylineOptions: {
            strokeColor: '#4285F4',
            strokeWeight: 5,
            editable: false,
            zIndex: 10,
          },
        });
        
        // Get the leg details
        const result = response.routes[0].legs[0];
        
        // Show route details
        infoWindow.setContent(`
          <div class="directions-info">
            <div class="directions-place">
              <i class="fas fa-map-marker-alt"></i>
              <span class="place-name">${place.name}</span>
            </div>
            
            <div class="directions-details">
              <div class="directions-time">
                <i class="fas fa-clock"></i>
                <span class="place-duration">${result.duration.text}</span>
              </div>
              
              <div class="directions-distance">
                <i class="fas fa-road"></i>
                <span class="place-distance">${result.distance.text}</span>
              </div>
            </div>
            
            <div class="directions-actions">
              <button class="view-directions-btn">
                <i class="fas fa-list"></i>
                View Step-by-Step Directions
              </button>
              <button class="route-cancel-btn">
                <i class="fas fa-times"></i>
                Clear Route
              </button>
            </div>
          </div>
        `);
        
        // Add view directions button functionality
        const viewDirectionsBtn = document.querySelector('.view-directions-btn');
        if (viewDirectionsBtn) {
          viewDirectionsBtn.addEventListener('click', () => {
            // Clear existing content
            sidebarRef.current.getContentRef().current.innerHTML = '';
            
            // Add a header to the sidebar
            const headerDiv = document.createElement('div');
            headerDiv.className = 'sidebar-header';
            headerDiv.innerHTML = `
              <h2>Directions to ${place.name}</h2>
              <div class="route-summary">
                <div class="route-duration">
                  <i class="fas fa-clock"></i>
                  <span>${result.duration.text}</span>
                </div>
                <div class="route-distance">
                  <i class="fas fa-road"></i>
                  <span>${result.distance.text}</span>
                </div>
              </div>
            `;
            sidebarRef.current.getContentRef().current.appendChild(headerDiv);
            
            // Add the directions panel
            if (directionsDisplayRef.current) {
              directionsDisplayRef.current.setPanel(sidebarRef.current.getContentRef().current);
            }
            
            // Open the sidebar
            sidebarRef.current.open();
          });
        }
        
        // Add cancel button functionality
        const cancelBtn = document.querySelector('.route-cancel-btn');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => {
            // Remove the origin marker
            if (routeMarkerRef.current) {
              routeMarkerRef.current.setMap(null);
              routeMarkerRef.current = null;
            }
            
            // Clear the directions display
            if (directionsDisplayRef.current) {
              directionsDisplayRef.current.setMap(null);
              directionsDisplayRef.current = null;
            }
            
            // Reset and go back to place details
            infoWindow.setContent(getInfoWindowTemplate(place));
            
            // Re-initialize info window events
            setTimeout(() => {
              const photos = [];
              if (place.photos) {
                place.photos.forEach(photo => {
                  photos.push(photo.getUrl({ maxHeight: 200, maxWidth: 300 }));
                });
              }
              
              initInfoWindowCarousel(photos);
              initStreetView(place, infoWindow);
              initDirections(place, infoWindow);
            }, 100);
          });
        }
      } else {
        // Show error message
        infoWindow.setContent(`
          <div class="route-error">
            <i class="fas fa-exclamation-circle"></i>
            <p>Could not calculate route. Please try again.</p>
            <button class="route-cancel-btn">OK</button>
          </div>
        `);
        
        const cancelBtn = document.querySelector('.route-cancel-btn');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => {
            // Reset and go back to place details
            infoWindow.setContent(getInfoWindowTemplate(place));
            
            // Re-initialize info window events
            setTimeout(() => {
              const photos = [];
              if (place.photos) {
                place.photos.forEach(photo => {
                  photos.push(photo.getUrl({ maxHeight: 200, maxWidth: 300 }));
                });
              }
              
              initInfoWindowCarousel(photos);
              initStreetView(place, infoWindow);
              initDirections(place, infoWindow);
            }, 100);
          });
        }
      }
    });
  };
  const initDrawing = () => {
    if (map) {
      // Create drawing manager directly
      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_LEFT,
          drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: '#262633',
          fillOpacity: 0.125,
          strokeWeight: 3.5,
          strokeColor: '#585577',
          clickable: false,
          editable: true,
        },
      });
      
      // Set it on the map
      drawingManager.setMap(map);
      
      // Save reference
      drawingManagerRef.current = drawingManager;
      
      // Handle the polygon creation event
      google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
        // Switch back to non-drawing mode after polygon is completed
        drawingManager.setDrawingMode(null);
        drawingManager.setOptions({ drawingControl: false });
        
        // Store the polygon
        polygonRef.current = event.overlay;
        polygonRef.current.setEditable(true);
        
        // Set the bounds of searchbox to the polygon
        const searchInput = inputRef.current;
        searchInput.value = '';
        searchInput.setAttribute('placeholder', 'Search for places eg. pizza, salon, rentals');
        searchInput.focus();
        
        if (searchBoxRef.current) {
          searchBoxRef.current.setBounds(getPolyBounds(polygonRef.current));
        }
        
        // Redo the search if the polygon is edited
        polygonRef.current.getPath().addListener('set_at', () => {
          if (searchInput.value) {
            textSearchPlaces();
          }
        });
        
        polygonRef.current.getPath().addListener('insert_at', () => {
          if (searchInput.value) {
            textSearchPlaces();
          }
        });
      });
    } else {
      Swal.fire('Please wait while map is initialized');
    }
  };
  

  const clearAll = () => {
    if (map) {
      if (polygonRef.current) window.google.maps.event.clearListeners(polygonRef.current, 'click');
      if (drawingManagerRef.current?.map) {
        drawingManagerRef.current.setMap(null);
        // get rid of the polygon too and clean the references
        if (polygonRef.current) {
          polygonRef.current.setMap(null);
          polygonRef.current = null;
        }
        hideMarkers();
        
        // Clear search input
        if (inputRef.current) {
          inputRef.current.value = '';
          inputRef.current.setAttribute('placeholder', 'Click on the draw icon below and define the region');
        }
        
        // Hide no results message if showing
        setShowNoResults(false);
        
        showStatus('All cleared! Start a new search');
      }
      
      // clearing the set listeners and route marker
      if (routeMarkerRef.current) {
        routeMarkerRef.current.setMap(null);
        routeMarkerRef.current = null;
      }
      
      window.google.maps.event.clearListeners(map, 'click');
      resetListeners();
      
      // Reset map view
      if (initialLatLng) {
        map.setCenter(initialLatLng);
        map.setZoom(14);
      }
      
      // Close sidebar
      sidebarRef.current.close();
      
      // Reset any active info windows
      if (placeInfoWindowRef.current) {
        placeInfoWindowRef.current.close();
      }
    }
  };

  // Handle search on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      textSearchPlaces();
    }
  };

  useEffect(() => {
    if (isMapLoaded && initialLatLng) {
      setMap(
        new window.google.maps.Map(mapNodeRef.current, {
          center: initialLatLng,
          ...MAP_CONFIG,
        })
      );
    }
    
    // Cleanup function
    return () => {
      if (statusTimeout) {
        clearTimeout(statusTimeout);
      }
    };
  }, [isMapLoaded, initialLatLng, statusTimeout]);

  useEffect(() => {
    let listener;
    if (map) {
      searchBoxRef.current = new window.google.maps.places.SearchBox(inputRef.current, { bounds: map.getBounds() });
      listener = searchBoxRef.current.addListener('places_changed', () => {
        const places = searchBoxRef.current.getPlaces();
        if (!places.length) {
          setShowNoResults(true);
          return;
        }
        
        // hide existing markers
        hideMarkers();
        setShowNoResults(false);
        
        // create new markers
        createMarkers(places);
      });
    }
    return () => {
      if (listener) listener.remove();
    };
  }, [map, hideMarkers, createMarkers]);

  // Focus on search input when available
  useEffect(() => {
    if (inputRef.current && polygonRef.current) {
      inputRef.current.focus();
    }
  }, [polygonRef.current]);

  return (
    <div className="search-page-container">
      <Sidebar ref={sidebarRef} />
      
      <div className={cx(
        'search-container',
        'animate__animated',
        'animate__fadeInDown',
        'animate__faster'
      )}>
        <Link to="/">
          <div className="go-back-button" aria-label="Go back to home">
            <i className="fas fa-chevron-left"></i>
          </div>
        </Link>
        
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="Click on the draw icon below and define the region"
          onKeyPress={handleKeyPress}
          aria-label="Search for places"
        />
        
        <button 
          type="button" 
          className="search-button"
          onClick={textSearchPlaces}
          aria-label="Search"
        >
          <i className="fas fa-search"></i>
        </button>
      </div>
      
      {searchStatus && (
        <div className={cx(
          'search-status',
          'animate__animated',
          'animate__fadeIn'
        )}>
          {searchStatus}
        </div>
      )}
      
      {showNoResults && (
        <div className={cx(
          'no-results-message',
          'animate__animated',
          'animate__fadeIn'
        )}>
          <i className="fas fa-search"></i>
          <h3>No results found</h3>
          <p>Try different keywords or expand your search area</p>
          <button onClick={() => setShowNoResults(false)}>OK</button>
        </div>
      )}
      
      <FloatingActions 
        onDrawClick={() => initDrawing()} 
        onClearClick={() => clearAll()} 
      />
      
      <div ref={mapNodeRef} className="map-container" />
      
      {isLoading && (
        <div className={cx(
          'loading-overlay',
          'animate__animated',
          'animate__fadeIn'
        )}>
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;