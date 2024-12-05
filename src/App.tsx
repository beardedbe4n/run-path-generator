import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { initializeMap, getCurrentLocation, generateRunningPath } from './utils/mapUtils';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [startLocation, setStartLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [distance, setDistance] = useState(3.0);
  const [useMetric, setUseMetric] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // First, render the map container
  useLayoutEffect(() => {
    console.log('Map container rendered:', mapRef.current);
  }, []);

  // Then initialize the map after the container is available
  useEffect(() => {
    let isMounted = true;

    const waitForMapContainer = () => {
      return new Promise<HTMLDivElement>((resolve, reject) => {
        if (mapRef.current) {
          resolve(mapRef.current);
        } else {
          const observer = new MutationObserver((mutations, obs) => {
            const mapDiv = document.getElementById('map');
            if (mapDiv) {
              obs.disconnect();
              resolve(mapDiv as HTMLDivElement);
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true
          });

          // Timeout after 5 seconds
          setTimeout(() => {
            observer.disconnect();
            reject(new Error('Timeout waiting for map container'));
          }, 5000);
        }
      });
    };

    const initializeWithLocation = async () => {
      try {
        console.log('Waiting for map container...');
        const mapElement = await waitForMapContainer();
        console.log('Map container found:', mapElement);

        setIsLoading(true);
        let initialLocation: google.maps.LatLngLiteral;

        try {
          console.log('Getting current location...');
          initialLocation = await getCurrentLocation();
          if (isMounted) setStartLocation(initialLocation);
        } catch (locationError) {
          console.warn('Using default location due to error:', locationError);
          initialLocation = { lat: 40.7128, lng: -74.0060 };
        }

        console.log('Initializing map with location:', initialLocation);
        const newMap = await initializeMap({
          center: initialLocation,
          zoom: 14,
          mapElement
        });

        if (isMounted) {
          setMap(newMap);
          const renderer = new google.maps.DirectionsRenderer({
            map: newMap,
            suppressMarkers: false
          });
          setDirectionsRenderer(renderer);
        }
      } catch (error) {
        console.error('Map initialization error:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to initialize map');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeWithLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCurrentLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      setStartLocation(location);
      map?.setCenter(location);
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get current location. Please enter an address.');
    }
  }, [map]);

  const handleAddressSelect = useCallback((location: google.maps.LatLngLiteral) => {
    setStartLocation(location);
    map?.setCenter(location);
  }, [map]);

  const handleGeneratePath = useCallback(async () => {
    if (!map || !startLocation || !directionsRenderer) {
      alert('Please select a starting location first.');
      return;
    }

    try {
      const result = await generateRunningPath(map, startLocation, distance, useMetric);
      directionsRenderer.setDirections(result);
    } catch (error) {
      console.error('Error generating path:', error);
      alert('Unable to generate path. Please try a different distance or location.');
    }
  }, [map, startLocation, directionsRenderer, distance, useMetric]);

  const handleReset = useCallback(() => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
  }, [directionsRenderer]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} id="map" className="w-full h-full" style={{ minHeight: '400px' }} />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="text-lg">Loading map...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center p-4">
            <h2 className="text-xl text-red-600 mb-2">Error Loading Map</h2>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <ControlPanel
        distance={distance}
        useMetric={useMetric}
        onDistanceChange={setDistance}
        onUnitToggle={() => setUseMetric(!useMetric)}
        onCurrentLocation={handleCurrentLocation}
        onAddressSelect={handleAddressSelect}
        onGeneratePath={handleGeneratePath}
        onReset={handleReset}
      />
    </div>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}