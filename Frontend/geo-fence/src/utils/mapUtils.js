import Swal from 'sweetalert2';

export const getInfoWindowTemplate = place => {
  const getReviewTemplate = (reviews, url) => {
    let template = '';
    const review = [];
    reviews.forEach(element => {
      review.push(element.text.split(' ').splice(0, 30));
    });
    
    const str = review[0].join(' ');
    if (str.split(' ').length >= 30) {
      template += `
        <div class="info-review">
          <div class="review-content">"${str.padEnd(str.length + 3, '.')}"</div>
          <a class="info-link" href="${url}" target="_blank">
            <i class="fas fa-external-link-alt"></i> Read more
          </a>
        </div>`;
    } else {
      template += `
        <div class="info-review">
          <div class="review-content">"${str}"</div>
          <a class="info-link" href="${url}" target="_blank">
            <i class="fas fa-external-link-alt"></i> Read more
          </a>
        </div>`;
    }
    return template;
  };

  const getPhotoTemplate = src => `
    <div class="info-img-container">
      <button type="button" class="info-img-prev" aria-label="Previous image">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="info-img-wrapper">
        <img class="info-img" src="${src}" alt="Place photo">
      </div>
      <button type="button" class="info-img-next" aria-label="Next image">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;

  return `
    <div class="info-main">
      ${place.name ? `
        <div class="info-head">
          <h2>${place.name}</h2>
          ${place.rating ? 
            `<div class="info-rating">
              <span class="rating-value">${place.rating}</span>
              <i class="fas fa-star"></i>
            </div>` : 
            ''}
        </div>` : 
        ''}
        
      <div class="info-details">
        ${place.formatted_address ? 
          `<div class="info-address">
            <i class="fas fa-map-marker-alt"></i>
            <span>${place.formatted_address}</span>
          </div>` : 
          ''}
          
        ${place.formatted_phone_number ? 
          `<div class="info-phone">
            <i class="fas fa-phone"></i>
            <span>${place.formatted_phone_number}</span>
          </div>` : 
          ''}
          
        ${place.website ? 
          `<div class="info-website">
            <i class="fas fa-globe"></i>
            <a href="${place.website}" target="_blank">Website</a>
          </div>` : 
          ''}
          
        ${place.opening_hours?.isOpen ? 
          `<div class="info-hours ${place.opening_hours.isOpen() ? 'open' : 'closed'}">
            <i class="fas fa-clock"></i>
            <span>${place.opening_hours.isOpen() ? 'Open now' : 'Closed now'}</span>
          </div>` : 
          ''}
      </div>
      
      ${place.photos?.length ? getPhotoTemplate(place.photos[0].getUrl({ maxHeight: 200, maxWidth: 300 })) : ''}
      
      ${place.reviews && place.url ? getReviewTemplate(place.reviews, place.url) : ''}
      
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
};

export const initInfoWindowCarousel = photos => {
  let currentIndex = 0;
  const nextImage = document.querySelector('.info-img-next');
  const prevImage = document.querySelector('.info-img-prev');
  const infoImg = document.querySelector('.info-img');
  
  if (nextImage && prevImage && infoImg) {
    // Add slide transition classes
    infoImg.classList.add('carousel-img');
    
    // Update image counter if we have multiple photos
    if (photos.length > 1) {
      const imgContainer = document.querySelector('.info-img-container');
      const counter = document.createElement('div');
      counter.className = 'image-counter';
      counter.textContent = `1/${photos.length}`;
      imgContainer.appendChild(counter);
    }
    
    nextImage.addEventListener('click', () => {
      if (currentIndex < photos.length - 1) {
        infoImg.classList.add('slide-out');
        setTimeout(() => {
          const nextIndex = currentIndex + 1;
          infoImg.src = photos[nextIndex];
          currentIndex = nextIndex;
          
          // Update counter
          const counter = document.querySelector('.image-counter');
          if (counter) counter.textContent = `${currentIndex + 1}/${photos.length}`;
          
          infoImg.classList.remove('slide-out');
          infoImg.classList.add('slide-in');
          
          setTimeout(() => {
            infoImg.classList.remove('slide-in');
          }, 300);
        }, 200);
      }
    });
    
    prevImage.addEventListener('click', () => {
      if (currentIndex > 0) {
        infoImg.classList.add('slide-out');
        setTimeout(() => {
          const prevIndex = currentIndex - 1;
          infoImg.src = photos[prevIndex];
          currentIndex = prevIndex;
          
          // Update counter
          const counter = document.querySelector('.image-counter');
          if (counter) counter.textContent = `${currentIndex + 1}/${photos.length}`;
          
          infoImg.classList.remove('slide-out');
          infoImg.classList.add('slide-in');
          
          setTimeout(() => {
            infoImg.classList.remove('slide-in');
          }, 300);
        }, 200);
      }
    });
  }
};

export const initStreetView = (place, infoWindow) => {
  const streetBtn = document.querySelector('.btn-street');
  if (streetBtn) {
    streetBtn.addEventListener('click', () => {
      // get the nearest street view from position at radius of 50 meters
      const radius = 50;
      // this function is used to get panorama shot for the given location
      new window.google.maps.StreetViewService().getPanoramaByLocation(place.geometry.location, radius, (data, status) => {
        if (status === window.google.maps.StreetViewStatus.OK) {
          // the location
          const location = data.location.latLng;
          const heading = window.google.maps.geometry.spherical.computeHeading(location, place.geometry.location);
          infoWindow.setContent(`
            <div class="street-main">
              <div class="street-header">
                <button class="back-btn" aria-label="Back to place details">
                  <i class="fas fa-arrow-left"></i>
                </button>
                <h2 class="street-title">${place.name}</h2>
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
          `);
          
          const panoramaOptions = {
            position: location,
            pov: { heading, pitch: 10 },
            controlSize: 24,
            motionTrackingControl: false,
            motionTracking: false,
            linksControl: true,
            panControl: true,
            enableCloseButton: false,
            addressControl: false,
            fullscreenControl: false,
            zoomControl: false,
          };
          
          // Initialize street view panorama
          const panorama = new window.google.maps.StreetViewPanorama(document.querySelector('#pano'), panoramaOptions);
          
          // Add custom control handlers
          const zoomInBtn = document.querySelector('.street-zoom-in');
          const zoomOutBtn = document.querySelector('.street-zoom-out');
          const fullscreenBtn = document.querySelector('.street-fullscreen');
          
          if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
              const zoom = panorama.getZoom();
              panorama.setZoom(zoom + 1);
            });
          }
          
          if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
              const zoom = panorama.getZoom();
              panorama.setZoom(zoom - 1);
            });
          }
          
          if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
              const panoElement = document.getElementById('pano');
              if (panoElement) {
                if (!document.fullscreenElement) {
                  panoElement.requestFullscreen().catch((err) => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                  });
                  fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                } else {
                  document.exitFullscreen();
                  fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                }
              }
            });
          }
        } else {
          infoWindow.setContent(`
            <div class="street-error">
              <button class="back-btn">
                <i class="fas fa-arrow-left"></i>
              </button>
              <h2 class="street-title">${place.name}</h2>
              <div class="no-street-view">
                <i class="fas fa-map-marked-alt"></i>
                <p>No Street View available for this location</p>
              </div>
            </div>
          `);
        }
        
        // Handle back button
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
          backBtn.addEventListener('click', () => {
            const template = getInfoWindowTemplate(place);
            infoWindow.setContent(template);
            
            // Re-initialize events after going back
            setTimeout(() => {
              const photos = [];
              if (place.photos) {
                place.photos.forEach(photo => {
                  photos.push(photo.getUrl({ maxHeight: 200, maxWidth: 300 }));
                });
              }
              
              // Reinitialize carousel
              initInfoWindowCarousel(photos);
              // Reinitialize street view button
              initStreetView(place, infoWindow);
            }, 100);
          });
        }
      });
    });
  }
};

export const getInfoWindowRouteTemplate = () => `
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
    <button class="show-route-btn">Show Route</button>
  </div>
`;

export const getInfoWindowDirectionTemplate = (place, result) => `
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
    
    <button class="view-directions-btn">
      <i class="fas fa-list"></i>
      View Step-by-Step Directions
    </button>
  </div>
`;

// Rest of the functions remain the same
export const getPolyBounds = polygon => {
  if (polygon) {
    const polyBounds = new window.google.maps.LatLngBounds();
    polygon.getPath().forEach(element => {
      polyBounds.extend(element);
    });
    return polyBounds;
  }
  return undefined;
};

export const searchInPolygon = (map, markers, polygon) => {
  // Log some debug info
  console.log(`Checking ${markers.length} markers against polygon`);
  
  // Whether the location is found or not
  let found = false;
  
  markers.forEach(marker => {
    try {
      // Check if the polygon encloses any markers
      if (window.google.maps.geometry.poly.containsLocation(marker.position, polygon)) {
        found = true;
        // Display the enclosed markers
        marker.setMap(map);
        console.log("Marker in polygon:", marker.title);
      } else if (markers.length === 1) {
        // Show at most one marker even if it's out of bounds
        found = true;
        markers[0].setMap(map);
        console.log("Showing single marker even though outside polygon");
      } else {
        // Hide the rest
        map.fitBounds(getPolyBounds(polygon));
        marker.setMap(null);
        console.log("Marker outside polygon:", marker.title);
      }
    } catch (e) {
      console.error("Error in polygon containment check:", e);
      // Fallback: just show the marker
      marker.setMap(map);
    }
  });

  if (!found) {
    // This popup occurs too fast so slow it down for polygon editing to complete
    setTimeout(() => Swal.fire('Please expand your selection or select new area'), 500);
  }
};

// plot the route to destination
export const plotRoute = (routeMarkerRef, directionsDisplayRef, map, place, infoWindow, sidebarRef) => {
  if (routeMarkerRef.current) {
    // Clear previous click listener to avoid duplicates
    window.google.maps.event.clearListeners(routeMarkerRef.current, 'click');
    
    // Add a new click listener to remove the marker when clicked
    window.google.maps.event.addListenerOnce(routeMarkerRef.current, 'click', () => {
      if (routeMarkerRef.current) {
        routeMarkerRef.current.setMap(null);
        routeMarkerRef.current = null;
        if (directionsDisplayRef.current) {
          directionsDisplayRef.current.setMap(null);
          directionsDisplayRef.current = null;
        }
      }
    });
    
    // Set the content for selecting route options
    infoWindow.setContent(getInfoWindowRouteTemplate());
    
    // Handle the route calculation
    const showBtn = document.querySelector('.show-route-btn');
    if (showBtn) {
      showBtn.addEventListener('click', () => {
        // Get the mode of transport
        const modeInputs = document.querySelectorAll('input[name="mode"]');
        let selectedMode = 'DRIVING';
        
        modeInputs.forEach(input => {
          if (input.checked) {
            selectedMode = input.value;
          }
        });
        
        // Make sure we have both origin and destination
        if (!routeMarkerRef.current) {
          infoWindow.setContent(`
            <div class="route-prompt">
              <div class="route-prompt-icon">
                <i class="fas fa-exclamation-circle"></i>
              </div>
              <p>Please select your starting point first</p>
              <button class="try-again-btn">Try Again</button>
            </div>
          `);
          
          const tryAgainBtn = document.querySelector('.try-again-btn');
          if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', () => {
              // Reset and show the original prompt
              routeMarkerRef.current = null;
              infoWindow.setContent(`
                <div class="route-prompt">
                  <div class="route-prompt-icon">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <p>Please select your starting point on the map</p>
                </div>
              `);
              
              // Re-add click listener
              map.addListener('click', evt => {
                if (!routeMarkerRef.current) {
                  const image = { url: destinationIcon, scaledSize: new window.google.maps.Size(36, 36) };
                  routeMarkerRef.current = new window.google.maps.Marker({ position: evt.latLng, map, icon: image });
                  infoWindow.setContent(getInfoWindowRouteTemplate());
                  plotRoute(routeMarkerRef, directionsDisplayRef, map, place, infoWindow, sidebarRef);
                }
              });
            });
          }
          
          return;
        }
        
        const directionsService = new window.google.maps.DirectionsService();
        
        // Get the direction between the route and destination
        directionsService.route(
          {
            origin: routeMarkerRef.current.position,
            destination: place.geometry.location,
            travelMode: window.google.maps.TravelMode[selectedMode],
          },
          (response, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
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
              
              const result = response.routes[0].legs[0];
              if (place.name && result.duration.text && result.distance.text) {
                infoWindow.setContent(getInfoWindowDirectionTemplate(place, result));
              } else {
                infoWindow.setContent(`
                  <div class="directions-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Route not available for this place</span>
                    <button class="try-again-btn">Try Again</button>
                  </div>
                `);
                
                const tryAgainBtn = document.querySelector('.try-again-btn');
                if (tryAgainBtn) {
                  tryAgainBtn.addEventListener('click', () => {
                    infoWindow.setContent(getInfoWindowRouteTemplate());
                    plotRoute(routeMarkerRef, directionsDisplayRef, map, place, infoWindow, sidebarRef);
                  });
                }
              }

              const dirBtn = document.querySelector('.view-directions-btn');
              if (dirBtn) {
                dirBtn.addEventListener('click', () => {
                  sidebarRef.current.getContentRef().current.innerHTML = '';
                  
                  // Add a header to the sidebar before adding directions
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
                  
                  if (directionsDisplayRef.current) {
                    directionsDisplayRef.current.setPanel(sidebarRef.current.getContentRef().current);
                  }
                  
                  sidebarRef.current.open();
                });
              }
            } else {
              Swal.fire({
                title: 'Route Error',
                text: 'Unable to get directions for that location',
                icon: 'error',
                confirmButtonText: 'Ok'
              });
            }
          }
        );
      });
    }
  }
};

