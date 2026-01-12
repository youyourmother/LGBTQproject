/**
 * Google Maps and Places API utilities
 */

export interface PlaceDetails {
  placeId: string;
  formattedAddress: string;
  geo: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  name?: string;
}

export interface LoadGoogleMapsOptions {
  libraries?: string[];
}

let googleMapsLoaded = false;
let googleMapsPromise: Promise<typeof google> | null = null;

export async function loadGoogleMaps(
  options: LoadGoogleMapsOptions = {}
): Promise<typeof google> {
  if (googleMapsLoaded && window.google) {
    return window.google;
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;
    
    if (!apiKey) {
      reject(new Error('Google Maps API key is not configured'));
      return;
    }

    const script = document.createElement('script');
    const libraries = options.libraries?.join(',') || 'places,marker';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      googleMapsLoaded = true;
      resolve(window.google);
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetails | null> {
  try {
    const google = await loadGoogleMaps();
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    return new Promise((resolve) => {
      service.getDetails(
        {
          placeId,
          fields: ['place_id', 'formatted_address', 'geometry', 'name'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve({
              placeId: place.place_id!,
              formattedAddress: place.formatted_address!,
              geo: {
                type: 'Point',
                coordinates: [
                  place.geometry!.location!.lng(),
                  place.geometry!.location!.lat(),
                ],
              },
              name: place.name,
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

export function generateMapUrl(lat: number, lng: number, zoom: number = 15): string {
  return `https://www.google.com/maps/@${lat},${lng},${zoom}z`;
}

export function generateDirectionsUrl(placeId: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(placeId)}&destination_place_id=${placeId}`;
}

