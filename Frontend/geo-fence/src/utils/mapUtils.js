import Swal from 'sweetalert2';


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
  // whether the location is found or not
  let found = false;
  markers.forEach(marker => {
    // check if the polygon encolses any markers
    if (window.google.maps.geometry.poly.containsLocation(marker.position, polygon)) {
      found = true;
      // display the enclosed markers
      marker.setMap(map);
    } else if (markers.length === 1) {
      // show atmost one marker even if its out of bounds
      found = true;
      markers[0].setMap(map);
    } else {
      // hide the rest
      map.fitBounds(getPolyBounds(polygon));
      marker.setMap(null);
    }
  });

  if (!found) {
    // this popup occurs too fast so slow it down for polygon editing to complete
    setTimeout(() => Swal.fire('Please expand your selection or select new area'), 500);
  }
};

