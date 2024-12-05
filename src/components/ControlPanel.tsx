import React from 'react';
import { RotateCcw, Navigation } from 'lucide-react';
import { AddressSearch } from './AddressSearch';

interface ControlPanelProps {
  distance: number;
  useMetric: boolean;
  onDistanceChange: (distance: number) => void;
  onUnitToggle: () => void;
  onCurrentLocation: () => void;
  onAddressSelect: (location: google.maps.LatLngLiteral) => void;
  onGeneratePath: () => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  distance,
  useMetric,
  onDistanceChange,
  onUnitToggle,
  onCurrentLocation,
  onAddressSelect,
  onGeneratePath,
  onReset,
}) => {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Starting Location</label>
          <AddressSearch onAddressSelect={onAddressSelect} />
          <button
            onClick={onCurrentLocation}
            className="mt-2 flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Navigation className="mr-2" size={20} />
            Use Current Location
          </button>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Distance</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={distance}
              onChange={(e) => onDistanceChange(Number(e.target.value))}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0.1"
              step="0.1"
            />
            <button
              onClick={onUnitToggle}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-w-[60px]"
            >
              {useMetric ? 'KM' : 'MI'}
            </button>
          </div>
          
          <div className="flex space-x-2 mt-2">
            <button
              onClick={onGeneratePath}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Generate Path
            </button>
            
            <button
              onClick={onReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              title="Reset Path"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}