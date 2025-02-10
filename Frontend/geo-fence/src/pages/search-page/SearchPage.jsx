import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cx } from '@linaria/core';
import Swal from 'sweetalert2';
import FloatingActions from 'components/floating-actions/FloatingActions';
import { MapLoadedContext } from 'context/MapLoadedContext';
import {
  
  searchInPolygon,
  getPolyBounds
} from 'utils/mapUtils';
import { MAP_CONFIG } from 'constants/index';
import placeIcon from 'assets/images/place.svg';
import destinationIcon from 'assets/images/origin.svg';
import './googleStyles.css';
import { searchPage, mapContainer, searchContainer, goBackBtn, searchInputStyle, searchBtn } from './SearchPage.styles';

const SearchPage = () => {
  const { state: initialLatLng } = useLocation();
  const isMapLoaded = useContext(MapLoadedContext);
  const [map, setMap] = useState(null);

  const mapNodeRef = useRef(null);
  const inputRef = useRef(null);

  const markersRef = useRef([]);
  const placeInfoWindowRef = useRef(null);
  const directionsDisplayRef = useRef(null);
  const polygonRef = useRef(null);
  const routeMarkerRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const searchBoxRef = useRef(null);

  



  
  
  const createMarkers = useCallback(
    places => {
      // set marker bounds
      const bounds = new window.google.maps.LatLngBounds();

      const image = {
        url: placeIcon,
        // 36 pixels wide by 36 pixels high
        scaledSize: new window.google.maps.Size(36, 36),
      };

      places.forEach(place => {
        // create a marker for each place.
        const marker = new window.google.maps.Marker({
          icon: image,
          title: place.name,
          position: place.geometry.location,
          id: place.place_id,
          animation: window.google.maps.Animation.DROP,
        });

        markersRef.current.push(marker);
        // creating a shared place info window
        placeInfoWindowRef.current = new window.google.maps.InfoWindow();
        marker.addListener('click', () => {
          // avoid repeated opening of the InfoWindow
          if (placeInfoWindowRef.current.marker !== marker) {
            bounds.extend(marker.position);
            map.fitBounds(bounds);
            map.panTo(marker.position);
            map.setZoom(14);

            
            // clearing the set listeners
            window.google.maps.event.clearListeners(map, 'click');
          }
        });

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
      map.setZoom(14);
      // initiate the search once markers are added to array
      if (polygonRef.current) searchInPolygon(map, markersRef.current, polygonRef.current);
    },
    [map]
  );

  const textSearchPlaces = () => {
    const query = inputRef.current.value;
    if (map && query.trim().length) {
      // hide existing markers
      new window.google.maps.places.PlacesService(map).textSearch(
        { query, bounds: getPolyBounds(polygonRef.current) },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            // create new markers
            createMarkers(results);
          } else {
            Swal.fire('Place not found, try again with an new place?');
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

      // set the bounds of searchbox to the polygon
      const searchInput = inputRef.current;
      searchInput.value = '';
      searchInput.setAttribute('placeholder', 'Search for places eg. pizza, salon, rentals');
      if (searchBoxRef.current) searchBoxRef.current.setBounds(getPolyBounds(polygonRef.current));

      // redo the search if the polygon is edited
      polygonRef.current.getPath().addListener('set_at', () => {
        if (searchInput.value) textSearchPlaces();
      });
      polygonRef.current.getPath().addListener('insert_at', () => {
        if (searchInput.value) textSearchPlaces();
      });
    });
  };

  const initDrawing = () => {
    if (map) {
      if (!drawingManagerRef.current) {
        drawingManagerRef.current = new window.google.maps.drawing.DrawingManager({
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
      }
      // initialize drawing mode only if not already drawing
      if (!drawingManagerRef.current?.map) {
        // set initial drawing mode
        drawingManagerRef.current.setDrawingMode('polygon');
        drawingManagerRef.current.setOptions({ drawingControl: true });
        drawingManagerRef.current.setMap(map);
        drawPolygon();
      }
      // goto bounds of poly on subsequent clicks
      if (polygonRef.current) map.fitBounds(getPolyBounds(polygonRef.current));
    } else {
      Swal.fire('Please wait while map is initialsed');
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
      }
      // clearing the set listeners and route marker
      if (routeMarkerRef.current) {
        routeMarkerRef.current.setMap(null);
        routeMarkerRef.current = null;
      }
      window.google.maps.event.clearListeners(map, 'click');
      map.setZoom(14);
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
  }, [isMapLoaded, initialLatLng]);

  useEffect(() => {
    let listener;
    if (map) {
      searchBoxRef.current = new window.google.maps.places.SearchBox(inputRef.current, { bounds: map.getBounds() });
      listener = searchBoxRef.current.addListener('places_changed', () => {
        const places = searchBoxRef.current.getPlaces();
        if (!places.length) {
          Swal.fire('Place not found, try again with an new place?');
          return;
        }
        
        // create new markers
        createMarkers(places);
      });
    }
    return () => {
      if (listener) listener.remove();
    };
  }, [map,  createMarkers]);

  return (
    <div className={searchPage}>
      <div className={cx(searchContainer, 'animate__animated', 'animate__fadeInRight', 'animate__faster')}>
        <Link to="/" className={goBackBtn}>
          <i className="fas fa-chevron-left" />
        </Link>
        <input ref={inputRef} className={searchInputStyle} type="text" placeholder="Click on the draw icon below and define the region" />
        <button type="button" className={searchBtn} onClick={textSearchPlaces}>
          <i className="fas fa-search" />
        </button>
      </div>
      <FloatingActions onDrawClick={initDrawing} onClearClick={clearAll} />
      <div ref={mapNodeRef} className={mapContainer} />
    </div>
  );
};

export default SearchPage;
