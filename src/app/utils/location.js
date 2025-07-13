// Utility functions for location handling

export const getUserLocation = async (userAddress, userCity, userCountry) => {
  try {
    if (!userAddress || !userCity || !userCountry) {
      throw new Error('User address information is incomplete');
    }

    // Construct full address
    const fullAddress = `${userAddress}, ${userCity}, ${userCountry}`;
    
    // Convert address to coordinates using Google Geocoding API
    const coords = await getCoordsFromAddress(fullAddress);
    
    if (!coords) {
      throw new Error('Could not find coordinates for the provided address');
    }

    return coords;
  } catch (error) {
    console.error('Error getting user location from address:', error);
    throw error;
  }
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Filter donors within a specified radius (in kilometers)
export const filterDonorsByDistance = (donors, userLat, userLng, radiusKm = 10) => {
  return donors.filter(donor => {
    const distance = calculateDistance(userLat, userLng, donor.lat, donor.lng);
    return distance <= radiusKm;
  });
};

// Get address from coordinates using Google Geocoding API
export const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
};

// Get coordinates from address using Google Geocoding API
export const getCoordsFromAddress = async (address) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
}; 