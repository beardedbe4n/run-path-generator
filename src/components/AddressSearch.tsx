import React, { useEffect, useRef } from 'react';
import { loader } from '../utils/googleMapsLoader';

interface AddressSearchProps {
  onAddressSelect: (location: google.maps.LatLngLiteral) => void;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        await loader.load();
        
        if (inputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'us' } // Restrict to US addresses
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            
            if (place && place.geometry && place.geometry.location) {
              const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              };
              onAddressSelect(location);
            }
          });
        }
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    initializeAutocomplete();

    return () => {
      // Cleanup if needed
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onAddressSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Enter an address"
      className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};