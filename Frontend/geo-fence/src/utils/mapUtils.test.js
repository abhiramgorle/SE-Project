import { describe, it, expect, vi } from 'vitest';
import { 
  getInfoWindowTemplate, 
  getInfoWindowRouteTemplate, 
  getInfoWindowDirectionTemplate
} from './mapUtils';

describe('Map Utility Functions', () => {
  describe('getInfoWindowTemplate', () => {
    it('returns a template with place details', () => {
      const place = {
        name: 'Test Place',
        formatted_address: '123 Test St, Test City',
        formatted_phone_number: '123-456-7890',
        rating: 4.5,
        reviews: [{ text: 'This is a great place to visit. I highly recommend it to everyone.' }],
        url: 'https://example.com',
        photos: [{
          getUrl: () => 'https://example.com/photo.jpg'
        }]
      };

      const template = getInfoWindowTemplate(place);
      
      // Check if template includes the place details
      expect(template).toContain(place.name);
      expect(template).toContain(place.formatted_address);
      expect(template).toContain(place.formatted_phone_number);
      expect(template).toContain(place.rating.toString());
      expect(template).toContain('This is a great place to visit');
      expect(template).toContain('View more');
      expect(template).toContain('Place photo');
    });

    it('handles missing place details gracefully', () => {
      const place = {
        name: 'Test Place'
      };

      const template = getInfoWindowTemplate(place);
      
      // Check if template includes the available details and omits the rest
      expect(template).toContain(place.name);
      expect(template).not.toContain('Address:');
      expect(template).not.toContain('Phone:');
      expect(template).not.toContain('fa-star');
      expect(template).not.toContain('info-review');
      expect(template).not.toContain('info-img');
    });
  });

  describe('getInfoWindowRouteTemplate', () => {
    it('returns a route template with transport options', () => {
      const template = getInfoWindowRouteTemplate();
      
      // Check if template includes the route elements
      expect(template).toContain('route-main');
      expect(template).toContain('mode');
      expect(template).toContain('DRIVING');
      expect(template).toContain('WALKING');
      expect(template).toContain('BICYCLING');
      expect(template).toContain('TRANSIT');
      expect(template).toContain('show-btn');
    });
  });

  describe('getInfoWindowDirectionTemplate', () => {
    it('returns a direction template with place and result details', () => {
      const place = {
        name: 'Test Place'
      };
      
      const result = {
        duration: { text: '10 mins' },
        distance: { text: '5 km' }
      };

      const template = getInfoWindowDirectionTemplate(place, result);
      
      // Check if template includes the place and result details
      expect(template).toContain(place.name);
      expect(template).toContain(result.duration.text);
      expect(template).toContain(result.distance.text);
      expect(template).toContain('direction-btn');
    });
  });
});