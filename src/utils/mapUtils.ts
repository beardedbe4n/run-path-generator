import { loader } from './googleMapsLoader';

interface MapConfig {
  center: google.maps.LatLngLiteral;
  zoom: number;
  mapElement: HTMLElement;
}

export const initializeMap = async (config: MapConfig): Promise<google.maps.Map> => {
  try {
    const google = await loader.load();
    const map = new google.maps.Map(config.mapElement, {
      center: config.center,
      zoom: config.zoom,
    });
    return map;
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw error;
  }
};

export const getCurrentLocation = (): Promise<google.maps.LatLngLiteral> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const generateRunningPath = async (
  map: google.maps.Map,
  startLocation: google.maps.LatLngLiteral,
  distance: number,
  useMetric: boolean
): Promise<google.maps.DirectionsResult> => {
  const directionsService = new google.maps.DirectionsService();
  
  const distanceInMeters = useMetric 
    ? distance * 1000
    : distance * 1609.34;

  const attempts = 3;
  
  for (let i = 0; i < attempts; i++) {
    try {
      const numWaypoints = 2;
      const waypoints: google.maps.DirectionsWaypoint[] = [];
      
      for (let j = 0; j < numWaypoints; j++) {
        const angle = (2 * Math.PI * (j + 1)) / (numWaypoints + 1) + (Math.random() * Math.PI / 4);
        const waypointRadius = distanceInMeters / (numWaypoints + 1);
        
        const waypointLat = startLocation.lat + (waypointRadius / 111320) * Math.cos(angle);
        const waypointLng = startLocation.lng + (waypointRadius / (111320 * Math.cos(startLocation.lat * Math.PI / 180))) * Math.sin(angle);
        
        waypoints.push({
          location: new google.maps.LatLng(waypointLat, waypointLng),
          stopover: false
        });
      }

      const request: google.maps.DirectionsRequest = {
        origin: startLocation,
        destination: startLocation,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.WALKING,
        optimizeWaypoints: true
      };

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Route generation failed with status: ${status}`));
          }
        });
      });

      return result;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === attempts - 1) throw error;
    }
  }

  throw new Error('Failed to generate a suitable route after multiple attempts');
};