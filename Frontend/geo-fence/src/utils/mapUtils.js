import Swal from 'sweetalert2';

export const getInfoWindowTemplate = place => {
  const getReviewTemplate = (reviews, url) => {
    let template = '';
    const review = [];
    reviews.forEach(element => {
      review.push(element.text.split(' ').splice(0, 30));
    });
    // pad reviews with > 30 words
    const str = review[0].join(' ');
    if (str.split(' ').length >= 30) {
      template += `<div class="info-review">'${str.padEnd(
        str.length + 3,
        '.'
      )}'<a class="info-link" href="${url}" target="_blank">View more</a></div>`;
    } else {
      template += `<div class="info-review">'${str}'<a class="info-link" href="${url}" target="_blank">View more</a></div>`;
    }
    return template;
  };

  const getPhotoTemplate = src => `
    <div class="info-img-container">
      <button type="button" class="info-img-prev">
        <li><i class="fa fa-chevron-left"></i></li>
      </button>
      <img class="info-img" src="${src}" alt="Place photo">
      <button type="button" class="info-img-next">
         <li><i class="fa fa-chevron-right"></i></li>
      </button>
    </div>
  `;

  return `
      <div class="info-main">
        ${place.name ? `<div class="info-head">${place.name}</div>` : ''}
        ${place.formatted_address ? `<div class="info-address"><span>Address: </span>${place.formatted_address}</div>` : ''}
        ${place.formatted_phone_number ? `<div class="info-phn"><span>Phone: </span>${place.formatted_phone_number}</div>` : ''}
        ${place.formatted_phone_number ? `<div class="info-phn"><span>Phone: </span>${place.formatted_phone_number}</div>` : ''}
        ${place.rating ? `<div class="info-star">${place.rating}<li><i class="fa fa-star"></i></li></div>` : ''}
        ${place.reviews && place.url ? getReviewTemplate(place.reviews, place.url) : ''}
        ${place.photos?.length ? getPhotoTemplate(place.photos[0].getUrl({ maxHeight: 100, maxWidth: 200 })) : ''}       
      </div>
    `;
};

export const initInfoWindowCarousel = photos => {
  let currentIndex = 0;
  const nextImage = document.querySelector('.info-img-next');
  const prevImage = document.querySelector('.info-img-prev');
  const infoImg = document.querySelector('.info-img');
  if (nextImage && prevImage && infoImg) {
    nextImage.addEventListener('click', () => {
      if (currentIndex < photos.length - 1) {
        const nextIndex = currentIndex + 1;
        infoImg.src = photos[nextIndex];
        currentIndex = nextIndex;
      }
    });
    prevImage.addEventListener('click', () => {
      if (currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        infoImg.src = photos[prevIndex];
        currentIndex = prevIndex;
      }
    });
  }
};

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
