'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { loadGoogleMaps } from '@/lib/google-maps';

interface PlacesAutocompleteProps {
  onPlaceSelected: (place: {
    placeId: string;
    formattedAddress: string;
    geo: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  }) => void;
  defaultValue?: string;
}

export default function PlacesAutocomplete({
  onPlaceSelected,
  defaultValue = '',
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete;

    const initAutocomplete = async () => {
      try {
        const google = await loadGoogleMaps();
        setIsLoaded(true);

        if (!inputRef.current) return;

        autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['place_id', 'formatted_address', 'geometry', 'name'],
          types: ['establishment', 'geocode'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();

          if (!place.geometry || !place.geometry.location) {
            alert('No details available for the selected location');
            return;
          }

          onPlaceSelected({
            placeId: place.place_id!,
            formattedAddress: place.formatted_address!,
            geo: {
              type: 'Point',
              coordinates: [
                place.geometry.location.lng(),
                place.geometry.location.lat(),
              ],
            },
          });

          setValue(place.formatted_address || '');
        });
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        alert('Failed to load Google Maps. Please check your API key configuration.');
      }
    };

    initAutocomplete();

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [onPlaceSelected]);

  return (
    <div>
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search for a location..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!isLoaded}
      />
      {!isLoaded && (
        <p className="text-xs text-muted-foreground mt-1">
          Loading Google Maps...
        </p>
      )}
    </div>
  );
}

