import React, { useState, useEffect } from 'react';
import MapComponent from '../common/MapComponent';
import { FaMapMarkerAlt, FaHome, FaBuilding, FaTrash, FaPen, FaPlus } from 'react-icons/fa';

const SavedLocationsMap = () => {
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    locationType: 'home',
    notes: ''
  });

  // Fetch user's saved locations
  useEffect(() => {
    const fetchSavedLocations = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from API
        // Simulating API call
        setTimeout(() => {
          const locations = [
            {
              id: 1,
              name: 'Home',
              address: '123 Main St, Anytown, USA',
              position: [40.7128, -74.0060], // New York
              locationType: 'home',
              notes: 'Enter through the back gate',
              createdAt: '2023-05-15T10:30:00Z'
            },
            {
              id: 2,
              name: 'Office',
              address: '456 Business Ave, Metropolis, USA',
              position: [40.7500, -73.9800], // Nearby
              locationType: 'work',
              notes: 'Parking available in Building B',
              createdAt: '2023-06-20T09:15:00Z'
            },
            {
              id: 3,
              name: 'Vacation Home',
              address: '789 Beach Road, Oceanview, USA',
              position: [40.7000, -74.0200], // Also nearby
              locationType: 'other',
              notes: 'Key under the flowerpot',
              createdAt: '2023-07-10T14:45:00Z'
            }
          ];
          
          setSavedLocations(locations);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching saved locations:', err);
        setError('Failed to load saved locations');
        setLoading(false);
      }
    };

    fetchSavedLocations();
  }, []);

  // Prepare markers for MapComponent
  const mapMarkers = savedLocations.map(location => ({
    id: location.id,
    position: location.position,
    popupContent: `<div class="font-medium">${location.name}</div><div class="text-sm text-gray-600">${location.address}</div>`
  }));

  // Handle marker click
  const handleMarkerClick = (locationId) => {
    const location = savedLocations.find(loc => loc.id === locationId);
    setActiveLocation(location);
    setIsEditing(false);
  };

  // Start editing a location
  const handleEditLocation = () => {
    if (!activeLocation) return;
    
    setEditForm({
      name: activeLocation.name,
      address: activeLocation.address,
      locationType: activeLocation.locationType,
      notes: activeLocation.notes || ''
    });
    
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  // Save location changes
  const handleSaveLocation = () => {
    // In a real app, this would call an API to update the location
    const updatedLocations = savedLocations.map(location => 
      location.id === activeLocation.id 
        ? { ...location, ...editForm } 
        : location
    );
    
    setSavedLocations(updatedLocations);
    setActiveLocation({ ...activeLocation, ...editForm });
    setIsEditing(false);
  };

  // Delete a location
  const handleDeleteLocation = () => {
    if (!activeLocation || !window.confirm('Are you sure you want to delete this location?')) return;
    
    // In a real app, this would call an API to delete the location
    const updatedLocations = savedLocations.filter(
      location => location.id !== activeLocation.id
    );
    
    setSavedLocations(updatedLocations);
    setActiveLocation(null);
  };

  // Render location type icon
  const renderLocationTypeIcon = (type) => {
    switch (type) {
      case 'home':
        return <FaHome className="mr-2 text-blue-600" />;
      case 'work':
        return <FaBuilding className="mr-2 text-purple-600" />;
      default:
        return <FaMapMarkerAlt className="mr-2 text-green-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">My Saved Locations</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Locations List */}
        <div className="p-4 border-r border-gray-200">
          <div className="mb-4">
            <button className="w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              <FaPlus className="mr-2" />
              <span>Add New Location</span>
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-[400px]">
            {savedLocations.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {savedLocations.map(location => (
                  <li 
                    key={location.id}
                    className={`py-3 cursor-pointer ${activeLocation?.id === location.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => handleMarkerClick(location.id)}
                  >
                    <div className="flex items-start">
                      {renderLocationTypeIcon(location.locationType)}
                      <div>
                        <h3 className="font-medium text-gray-900">{location.name}</h3>
                        <p className="text-sm text-gray-600 truncate max-w-[200px]">{location.address}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FaMapMarkerAlt className="mx-auto text-gray-300 text-4xl mb-3" />
                <p>You don't have any saved locations yet</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Map Display */}
        <div className="md:col-span-2">
          <div className="h-[400px]">
            <MapComponent 
              markers={mapMarkers}
              center={activeLocation ? activeLocation.position : (mapMarkers[0]?.position || [51.505, -0.09])}
              zoom={activeLocation ? 15 : 12}
              onMarkerClick={handleMarkerClick}
              height="100%"
            />
          </div>
          
          {/* Location Details */}
          {activeLocation && !isEditing && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center">
                    {renderLocationTypeIcon(activeLocation.locationType)}
                    <h3 className="text-lg font-semibold text-gray-900">{activeLocation.name}</h3>
                  </div>
                  <p className="text-gray-600 mt-1">{activeLocation.address}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleEditLocation} 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <FaPen />
                  </button>
                  <button 
                    onClick={handleDeleteLocation} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              {activeLocation.notes && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700">Notes:</h4>
                  <p className="text-sm text-gray-600 mt-1">{activeLocation.notes}</p>
                </div>
              )}
              
              <div className="mt-4">
                <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Use This Address for Booking
                </button>
              </div>
            </div>
          )}
          
          {/* Edit Form */}
          {activeLocation && isEditing && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Edit Location</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={editForm.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="locationType" className="block text-sm font-medium text-gray-700 mb-1">
                    Location Type
                  </label>
                  <select
                    id="locationType"
                    name="locationType"
                    value={editForm.locationType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={editForm.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                
                <div className="flex space-x-3 pt-3">
                  <button 
                    onClick={handleSaveLocation}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedLocationsMap; 