import { generateMapUrl, generateDirectionsUrl } from '@/lib/google-maps';

describe('Google Maps Utilities', () => {
  describe('generateMapUrl', () => {
    it('should generate correct map URL', () => {
      const lat = 42.3314;
      const lng = -83.0458;
      const url = generateMapUrl(lat, lng);

      expect(url).toContain('google.com/maps');
      expect(url).toContain('42.3314');
      expect(url).toContain('-83.0458');
    });

    it('should use default zoom level', () => {
      const url = generateMapUrl(42.3314, -83.0458);
      expect(url).toContain('15z');
    });

    it('should use custom zoom level', () => {
      const url = generateMapUrl(42.3314, -83.0458, 12);
      expect(url).toContain('12z');
    });
  });

  describe('generateDirectionsUrl', () => {
    it('should generate correct directions URL', () => {
      const placeId = 'ChIJSWYi9lzLJIgR3MJX8L5L0T4';
      const url = generateDirectionsUrl(placeId);

      expect(url).toContain('google.com/maps/dir');
      expect(url).toContain('destination_place_id');
      expect(url).toContain(placeId);
    });

    it('should encode place ID properly', () => {
      const placeId = 'test-place-id-123';
      const url = generateDirectionsUrl(placeId);

      expect(url).toContain(encodeURIComponent(placeId));
    });
  });
});

