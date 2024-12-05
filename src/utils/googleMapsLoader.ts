import { Loader } from '@googlemaps/js-api-loader';

// Create a single shared loader instance with all required libraries
export const loader = new Loader({
  apiKey: 'AIzaSyABUgCkWoLM5DrAnh7BeF0rzNbCXak7hv0',
  version: 'weekly',
  libraries: ['places', 'geometry'],
  id: '__googleMapsScriptId'
});