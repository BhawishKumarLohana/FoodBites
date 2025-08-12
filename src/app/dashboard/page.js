"use client";
import React, { useState, useEffect } from "react";
import { getToken, decodeToken, removeToken } from "../../jwt";
import { useRouter } from "next/navigation";
import GoogleMap from "../components/GoogleMap";
import { getUserLocation, filterDonorsByDistance, getCoordsFromAddress } from "../utils/location";
import ClientOnly from "../components/ClientOnly";




export default function DashboardPage() {
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [donationFilter, setDonationFilter] = useState('all');
  const [form, setForm] = useState({ title: "", amount: "", deadline: "", isDelivery:"" });
  const [available, setAvailable] = useState([]);
  const [claimed, setClaimed] = useState([]);
  const [unClaimed,setunClaimed]=useState([]);
  const [userClaims, setUserClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [claimFilter, setClaimFilter] = useState('all');
  const [displayedFood, setDisplayedFood] = useState([]); // Separate state for display
  const [selectedPin, setSelectedPin] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyDonors, setNearbyDonors] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [claimModalOpen, setClaimModalOpen] = useState(false);
    const [claimForm, setClaimForm] = useState({
      status: "PENDING",
      specialInstruction: "",
    });

  


  const router = useRouter();

  // Helper function to format relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Helper function to calculate urgency level based on deadline
  const getUrgencyLevel = (deadline) => {
    const now = new Date();
    const timeLeft = new Date(deadline) - now;
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return 'CRITICAL'; // Expired = Critical (most urgent)
    if (hoursLeft < 2) return 'HIGH';
    if (hoursLeft < 6) return 'MEDIUM';
    if (hoursLeft < 24) return 'LOW';
    return 'FUTURE';
  };

  // Helper function to get urgency color and text
  const getUrgencyDisplay = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'CRITICAL':
        return { color: 'bg-red-100 text-red-700 border-red-300', text: 'EXPIRED', icon: '⏰' };
      case 'HIGH':
        return { color: 'bg-orange-100 text-orange-700 border-orange-300', text: 'SOON', icon: '⚠️' };
      case 'MEDIUM':
        return { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', text: 'TODAY', icon: '📅' };
      case 'LOW':
        return { color: 'bg-green-100 text-green-700 border-green-300', text: 'TOMORROW', icon: '📅' };
      case 'FUTURE':
        return { color: 'bg-blue-100 text-blue-700 border-blue-300', text: 'FUTURE', icon: '✅' };
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-300', text: 'UNKNOWN', icon: '❓' };
    }
  };

  // Helper function to get time remaining text
  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const timeLeft = new Date(deadline) - now;
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft < 0) return 'Expired';
    if (hoursLeft < 1) return `${Math.abs(minutesLeft)} min${Math.abs(minutesLeft) !== 1 ? 's' : ''}`;
    if (hoursLeft < 24) return `${Math.floor(hoursLeft)}h ${minutesLeft}m`;
    const daysLeft = Math.floor(hoursLeft / 24);
    return `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
  };



  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUnclaimed = async () => {
    const res = await fetch("/api/food/unclaimed");
    const data = await res.json();
    console.log(data);
    if (res.ok) {
      setClaimed(data);
      setDisplayedFood(data); // Initialize display with same data
    } else {
      console.error("Failed to fetch unclaimed food:", data.error);
    }
  };

  const fetchUserClaims = async (token) => {
    try {
      const res = await fetch("/api/food/claims", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUserClaims(data);
        setFilteredClaims(data);
      } else {
        console.error("Failed to fetch user claims:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user claims:", error);
    }
  };

  const refreshUserClaims = async () => {
    const token = getToken();
    if (token) {
      await fetchUserClaims(token);
    }
  };

  const updateClaimStatus = async (claimId, newStatus) => {
    try {
      const token = getToken();
      if (!token) {
        console.error("No auth token found.");
        return;
      }

      const res = await fetch(`/api/food/claims/${claimId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        console.log("Claim status updated successfully");
        // Refresh the claims to show updated status
        await refreshUserClaims();
      } else {
        const data = await res.json();
        console.error("Failed to update claim status:", data.error);
      }
    } catch (error) {
      console.error("Error updating claim status:", error);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const payload = decodeToken(token);
    if (!payload) {
      removeToken();
      router.push("/login");
      return;
    }
    setRole(payload.role);
    
    // Fetch user data for location
    fetchUserData(payload.userId, token);
    
    // Fetch donations after auth
  const fetchDonations = async () => {
    try {
      const res = await fetch("/api/food/donations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("DATA" + data);
      if (res.ok) {
        setDonations(data);
        setFilteredDonations(data); // Initialize filtered donations
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  };
  
  fetchDonations();
  fetchUnclaimed();
  
  // Fetch user claims if claimant
  if (payload.role === "claimant") {
    fetchUserClaims(token);
  }

  }, [router]);

  // Handle donation filtering
  useEffect(() => {
    if (donationFilter === 'all') {
      setFilteredDonations(donations);
    } else if (donationFilter === 'claimed') {
      setFilteredDonations(donations.filter(d => d.foodclaim && d.foodclaim.length > 0));
    } else if (donationFilter === 'unclaimed') {
      setFilteredDonations(donations.filter(d => !d.foodclaim || d.foodclaim.length === 0));
    }
  }, [donations, donationFilter]);

  // Handle claim filtering
  useEffect(() => {
    if (claimFilter === 'all') {
      setFilteredClaims(userClaims);
    } else if (claimFilter === 'pending') {
      setFilteredClaims(userClaims.filter(c => c.status === 'PENDING'));
    } else if (claimFilter === 'complete') {
      setFilteredClaims(userClaims.filter(c => c.status === 'COMPLETE'));
    }
  }, [userClaims, claimFilter]);

  // Get user location for claimants
  useEffect(() => {
    if (role === "claimant" && userData) {
      setLocationLoading(true);
      setLocationError(null);
      
      getUserLocation(userData.address, userData.city, userData.country)
        .then(async location => {
          setUserLocation(location);
          // Convert claimed food to donor format for map
          const donorsForMap = claimed.map(food => ({
            id: food.foodId,
            donor: food.user?.email || 'Unknown',
            type: food.title,
            amount: food.quantity,
            pickup: food.isDelivery ? 'Delivery' : 'Pickup',
            location: `${food.user?.address}, ${food.user?.city}, ${food.user?.country}`,
            urgency: getUrgencyLevel(food.deadline),
            urgencyDisplay: getUrgencyDisplay(getUrgencyLevel(food.deadline)),
            timeRemaining: getTimeRemaining(food.deadline),
            lat: null, // Will be set after geocoding
            lng: null,
            food: food // Keep original food data
          }));
          
          // Geocode donor addresses
          const donorsWithCoords = await Promise.all(
            donorsForMap.map(async (donor) => {
              if (donor.location && donor.location !== 'Unknown, Unknown, Unknown') {
                const coords = await getCoordsFromAddress(donor.location);
                return {
                  ...donor,
                  lat: coords?.lat || null,
                  lng: coords?.lng || null,
                };
              }
              return donor;
            })
          );
          console.log('Donors with coords:', donorsWithCoords);
          // Filter donors within 10km radius
          const nearby = filterDonorsByDistance(donorsWithCoords, location.lat, location.lng, 10);
          setNearbyDonors(nearby);
        })
        .catch(error => {
          console.error('Location error:', error);
          setLocationError(error.message);
          // Use default location and all donors if location fails
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
          const donorsForMap = claimed.map(food => ({
            id: food.foodId,
            donor: food.user?.email || 'Unknown',
            type: food.title,
            amount: food.quantity,
            pickup: food.isDelivery ? 'Delivery' : 'Pickup',
            location: `${food.user?.address}, ${food.user?.city}, ${food.user?.country}`,
            lat: null,
            lng: null,
            food: food
          }));
          setNearbyDonors(donorsForMap);
        })
        .finally(() => {
          setLocationLoading(false);
        });
    }
  }, [role, userData, claimed]);

  // Donor: Add donation
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleImage = (e) => {
    setForm({ ...form, image: e.target.files[0]?.name || "" });
  };
 
  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = getToken();
  if (!token) return;

 const res = await fetch("/api/food/donations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: form.title,
    quantity: form.amount, // Ensure number if your schema uses Int
    deadline: new Date(form.deadline).toISOString(),
    isDelivery: form.isDelivery === "true" || form.isDelivery === true,
  }),
});

  const data = await res.json();

  if (res.ok) {
    console.log("Donation added:", data);
    setDonations([data, ...donations]);
    setForm({ title: "", amount: "", deadline: "",isDelivery:""});
  } else {
    console.error("Error adding donation:", data.error);
  }

  

};


  // Claimant: Claim food
  const handleClaim = async (selectedFood) => {
  try {
    const token = getToken()
    if (!token) {
      console.error("No auth token found.");
      return;
    }

    console.log("FOOD ID SENT"+selectedFood.foodId);
    console.log("FOOD ID SENT"+claimForm.status);
    console.log("FOOD ID SENT"+claimForm.specialInstruction);

    const res = await fetch("/api/food/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        foodId: selectedFood.foodId,
        status: claimForm.status,
        specialInstruction: claimForm.specialInstruction
      }),
    });

    const data = await res.json();
    console.log("RESPONSE ")

    if (res.ok) {
      console.log("Claim successful:", data);
      fetchUnclaimed();
      // Refresh user claims to show the new claim
      refreshUserClaims();
      setClaimModalOpen(false);
      setClaimForm({ status: "PENDING", specialInstruction: "" });
      setSelectedFood(null);
      

    
    } else {
      console.error("Claim failed:", data.error);
    }
  } catch (error) {
    console.error("Error in handleClaim:", error);
  }
};

  // Handle donor click from map
  const handleDonorClick = (donor) => {
    setSelectedFood(donor.food);
    setShowModal(true);
  };

  if (!role) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 mt-0">
      {role === "donor" ? (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
  <div className="max-w-4xl mx-auto">
    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Donor Dashboard</h1>

    <div className="bg-white rounded-xl shadow-md p-6 mb-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add a New Donation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Name of Food
          </label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="e.g., Char Siu Bao"
            value={form.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            id="amount"
            type="text"
            name="amount"
            placeholder="e.g., 10 kg, 20 plates"
            value={form.amount}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
            Deadline (Pickup/Delivery Time)
          </label>
          <input
            id="deadline"
            type="datetime-local"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        <div>
          <label htmlFor="isDelivery" className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Option
          </label>
          <select
            id="isDelivery"
            name="isDelivery"
            value={form.isDelivery}
            onChange={(e) => setForm({ ...form, isDelivery: e.target.value === 'true' })}
            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          >
            <option value="">Select an Option</option>
            <option value="false">Pickup</option>
            <option value="true">Delivery</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-2 rounded-md transition duration-200"
        >
          Add Donation
        </button>
      </form>
    </div>

    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Previous Donations</h3>
      
      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-800">{donations?.length || 0}</div>
          <div className="text-sm text-gray-600">Total Donations</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">
            {donations?.filter(d => d.foodclaim && d.foodclaim.length > 0).length || 0}
          </div>
          <div className="text-sm text-gray-600">Claimed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {donations?.filter(d => !d.foodclaim || d.foodclaim.length === 0).length || 0}
          </div>
          <div className="text-sm text-gray-600">Unclaimed</div>
        </div>
      </div>
      
      {/* Filter Options */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredDonations?.length || 0} of {donations?.length || 0} donations
        </div>
        <div className="flex items-center gap-2">
          {donationFilter !== 'all' && (
            <button
              onClick={() => setDonationFilter('all')}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Reset Filter
            </button>
          )}
          <select
            value={donationFilter}
            onChange={(e) => {
              setDonationFilter(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
          >
            <option value="all">All Donations</option>
            <option value="claimed">Claimed Only</option>
            <option value="unclaimed">Unclaimed Only</option>
          </select>
        </div>
      </div>
      
      <ClientOnly fallback={<div className="grid sm:grid-cols-2 gap-4"><div className="bg-gray-100 p-4 rounded-lg animate-pulse">Loading...</div></div>}>
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredDonations && filteredDonations.length > 0 ? filteredDonations.map((d) => (
            <div key={d.foodId} className={`p-4 rounded-lg shadow border ${
              d.foodclaim && d.foodclaim.length > 0 
                ? 'bg-white border-green-200' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Claim Status Badge */}
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-md font-bold text-green-700">{d.title}</h4>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      d.isDelivery
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    }`}
                  >
                    {d.isDelivery ? 'Delivery' : 'Pickup'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    d.foodclaim && d.foodclaim.length > 0
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}>
                    {d.foodclaim && d.foodclaim.length > 0 ? '✓ Claimed' : '○ Available'}
                  </span>
                  {/* Urgency Badge */}
                  {!d.foodclaim || d.foodclaim.length === 0 ? (
                    (() => {
                      const urgencyLevel = getUrgencyLevel(d.deadline);
                      const urgencyDisplay = getUrgencyDisplay(urgencyLevel);
                      return (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium border ${urgencyDisplay.color}`}>
                          {urgencyDisplay.icon} {urgencyDisplay.text}
                        </span>
                      );
                    })()
                  ) : null}
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Quantity:</span> {d.quantity}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Deadline:</span>{" "}
                {d.deadline ? (
                  <span>
                    {new Date(d.deadline).toLocaleString()}
                                         {!d.foodclaim || d.foodclaim.length === 0 ? (
                       <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                         getUrgencyLevel(d.deadline) === 'CRITICAL' 
                           ? 'bg-red-100 text-red-700' 
                           : 'bg-blue-100 text-blue-700'
                       }`}>
                         {getTimeRemaining(d.deadline)} left
                       </span>
                     ) : null}
                  </span>
                ) : "-"}
              </div>
              
              {/* Claim Status */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                {d.foodclaim && d.foodclaim.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        d.foodclaim[0].status === 'COMPLETE' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {d.foodclaim[0].status === 'COMPLETE' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Claimed by:</span> {d.foodclaim[0].org?.user?.email || 'Unknown Organization'}
                      {d.foodclaim[0].org?.type && (
                        <span className="text-gray-400 ml-1">({d.foodclaim[0].org.type})</span>
                      )}
                    </div>
                    {d.foodclaim[0].org?.orgName && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Organization:</span> {d.foodclaim[0].org.orgName}
                      </div>
                    )}
                    {d.foodclaim[0].org?.regNumber && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Reg. Number:</span> {d.foodclaim[0].org.regNumber}
                      </div>
                    )}
                    {d.foodclaim[0].org?.description && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Description:</span> {d.foodclaim[0].org.description}
                      </div>
                    )}
                    {d.foodclaim[0].org?.openTime && d.foodclaim[0].org?.closeTime && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Hours:</span> {d.foodclaim[0].org.openTime} - {d.foodclaim[0].org.closeTime}
                      </div>
                    )}
                    {d.foodclaim[0].org?.user?.individualDonor?.fullName && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Donor Name:</span> {d.foodclaim[0].org.user.individualDonor.fullName}
                      </div>
                    )}
                    {d.foodclaim[0].org?.user?.individualDonor?.idcard && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">ID Card:</span> {d.foodclaim[0].org.user.individualDonor.idcard}
                      </div>
                    )}
                    {d.foodclaim[0].org?.user?.restaurant?.ResName && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Restaurant:</span> {d.foodclaim[0].org.user.restaurant.ResName}
                      </div>
                    )}
                    {d.foodclaim[0].org?.user?.restaurant?.description && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Restaurant Description:</span> {d.foodclaim[0].org.user.restaurant.description}
                      </div>
                    )}
                    {d.foodclaim[0].org?.user?.primary_PhoneN && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Phone:</span> {d.foodclaim[0].org.user.primary_PhoneN}
                      </div>
                    )}
                    {d.foodclaim[0].org?.user?.address && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Address:</span> {d.foodclaim[0].org.user.address}, {d.foodclaim[0].org.user.city}, {d.foodclaim[0].org.user.country}
                      </div>
                    )}
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Claimed:</span> {getRelativeTime(d.foodclaim[0].claimedAt)} 
                      <span className="text-gray-400 ml-1">({new Date(d.foodclaim[0].claimedAt).toLocaleDateString()})</span>
                    </div>
                    {d.foodclaim[0].specialInstruction && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Special Instructions:</span> {d.foodclaim[0].specialInstruction}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">
                    This donation is available for claiming
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-2 text-center text-gray-500 py-8">
              {donations && donations.length > 0 
                ? `No donations match the "${donationFilter}" filter` 
                : 'No donations found'
              }
            </div>
          )}
        </div>
      </ClientOnly>
    </div>
  </div>
</div>

      
    ) : (
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-2">Claimant Dashboard</h2>
          
          {/* Location Status */}
          {locationLoading && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              Getting your location from your address...
            </div>
          )}
          
          {locationError && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <strong>Location Error:</strong> {locationError}. Showing all available donors.
            </div>
          )}
          
          {/* Google Maps */}
          <div className="mb-4">
            <ClientOnly fallback={<div className="bg-gray-100 p-8 rounded-lg animate-pulse text-center">Loading map...</div>}>
              <GoogleMap 
                donors={nearbyDonors}
                onDonorClick={handleDonorClick}
                userLocation={userLocation}
              />
            </ClientOnly>
          </div>
          
          {/* Nearby Donors Count */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {nearbyDonors.length} donor(s) within 10km of your location
          </div>
          {/* Modal for pin details and claim */}
          <ClientOnly fallback={null}>
            {showModal && selectedPin && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white p-6 rounded shadow-lg w-80 relative">
                  <button className="absolute top-2 right-2 text-gray-400" onClick={() => setShowModal(false)}>&times;</button>
                  <h3 className="text-lg font-bold mb-2">Available Food</h3>
                                <div className="mb-2"><strong>Donor:</strong> {selectedPin.donor}</div>
              <div className="mb-2"><strong>Type:</strong> {selectedPin.type}</div>
              <div className="mb-2"><strong>Amount:</strong> {selectedPin.amount}</div>
              <div className="mb-2"><strong>Pickup Window:</strong> {selectedPin.pickup}</div>
              <div className="mb-2"><strong>Location:</strong> {selectedPin.location}</div>
              <div className="mb-2">
                <strong>Urgency:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${selectedPin.urgencyDisplay.color}`}>
                  {selectedPin.urgencyDisplay.icon} {selectedPin.urgencyDisplay.text}
                </span>
              </div>
                             <div className="mb-2"><strong>Time Left:</strong> {selectedPin.timeRemaining}</div>
               {selectedPin.urgency === 'CRITICAL' ? (
                 <button 
                   disabled 
                   className="w-full bg-gray-400 text-white p-2 rounded mt-2 cursor-not-allowed"
                   title="This food has expired and cannot be claimed"
                 >
                   Food Expired
                 </button>
               ) : (
                 <button className="w-full bg-green-600 text-white p-2 rounded mt-2" onClick={() => handleClaim(selectedPin)}>
                   Claim Food
                 </button>
               )}
                </div>
              </div>
            )}
          </ClientOnly>
         <h3 className="text-xl font-semibold mb-4 text-gray-800">Available Food Donations</h3>
         
                   {/* Urgency Summary Stats */}
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg shadow border border-gray-200 text-center">
              <div className="text-lg font-bold text-gray-800">{displayedFood?.length || 0}</div>
              <div className="text-xs text-gray-600">Total Available</div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg shadow border border-red-200 text-center">
              <div className="text-lg font-bold text-red-700">
                {displayedFood?.filter(item => getUrgencyLevel(item.deadline) === 'CRITICAL').length || 0}
              </div>
              <div className="text-xs text-red-600">⏰ Expired</div>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg shadow border border-orange-200 text-center">
              <div className="text-lg font-bold text-orange-700">
                {displayedFood?.filter(item => getUrgencyLevel(item.deadline) === 'HIGH').length || 0}
              </div>
              <div className="text-xs text-orange-600">⚠️ Soon</div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg shadow border border-yellow-200 text-center">
              <div className="text-lg font-bold text-yellow-700">
                {displayedFood?.filter(item => getUrgencyLevel(item.deadline) === 'MEDIUM').length || 0}
              </div>
              <div className="text-xs text-yellow-600">📅 Today</div>
            </div>
          </div>

                                       {/* Sorting Options */}
           <div className="mb-4 flex justify-end">
             <select
               onChange={(e) => {
                 const sortBy = e.target.value;
                 
                 if (sortBy === 'deadline') {
                   // Sort by deadline (earliest first)
                   const sorted = [...claimed].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
                   setDisplayedFood(sorted);
                 } else if (sortBy === 'distance') {
                   // Restore original distance-sorted order from map
                   setDisplayedFood([...claimed]); // Use original claimed data
                 }
               }}
               className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
             >
               <option value="distance">Sort by Distance</option>
               <option value="deadline">Sort by Deadline</option>
             </select>
           </div>

<ClientOnly fallback={<div className="grid gap-4"><div className="bg-gray-100 p-4 rounded-lg animate-pulse">Loading...</div></div>}>
 <div className="grid gap-4">
   {displayedFood && displayedFood.length > 0 ? displayedFood.map((item) => (
    <div
      key={item.foodId}
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200 transition hover:shadow-lg"
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-bold text-green-700">{item.title}</h4>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-xs px-2 py-1 rounded-full border ${
              item.isDelivery
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-yellow-100 text-yellow-700 border-yellow-300'
            }`}
          >
            {item.isDelivery ? 'Delivery' : 'Pickup'}
          </span>
          {/* Urgency Badge */}
          {(() => {
            const urgencyLevel = getUrgencyLevel(item.deadline);
            const urgencyDisplay = getUrgencyDisplay(urgencyLevel);
            return (
              <span className={`text-xs px-2 py-1 rounded-full font-medium border ${urgencyDisplay.color}`}>
                {urgencyDisplay.icon} {urgencyDisplay.text}
              </span>
            );
          })()}
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Quantity:</span> {item.quantity}
      </div>

      <div className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Donor:</span>{' '}
        {item.user?.email || 'N/A'}{' '}
        <span className="text-xs text-gray-400 ml-1">
          ({item.user?.primary_PhoneN || 'No Phone'})
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Location:</span>{' '}
        {item.user?.address}, {item.user?.city}, {item.user?.country}
      </div>

      <div className="text-sm text-gray-600 mb-3">
        <span className="font-medium">Deadline:</span>{' '}
        {item.deadline ? (
          <span>
            {new Date(item.deadline).toLocaleString()}
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              getUrgencyLevel(item.deadline) === 'EXPIRED' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {getTimeRemaining(item.deadline)} left
            </span>
          </span>
        ) : '-'}
      </div>

             <div className="flex justify-end gap-2">
         <button
           onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             setModalPos({ x: rect.left, y: rect.bottom + window.scrollY });
             setSelectedFood(item);
             setShowModal(true);
           }}
           className="text-sm bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded hover:bg-green-200 transition"
         >
           View More
         </button>

         {getUrgencyLevel(item.deadline) === 'CRITICAL' ? (
           <button
             disabled
             className="text-sm bg-gray-300 text-gray-500 px-3 py-1 rounded cursor-not-allowed"
             title="This food has expired and cannot be claimed"
           >
             Expired
           </button>
         ) : (
           <button
             onClick={() => {
               setSelectedFood(item); 
               setClaimModalOpen(true);
             }}
             className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
           >
             Claim
           </button>
         )}
       </div>
    </div>
     )) : (
     <div className="text-center text-gray-500 py-8">
       {claimed && claimed.length > 0 
         ? `No food matches the current sorting` 
         : 'No available food donations found'
       }
     </div>
   )}
</div>
</ClientOnly>

         {/* Previous Claims Section */}
         <div className="mt-8">
           <h3 className="text-xl font-semibold mb-4 text-gray-800">Previous Claims</h3>
           
           {/* Summary Stats */}
           <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
               <div className="text-2xl font-bold text-gray-800">{userClaims?.length || 0}</div>
               <div className="text-sm text-gray-600">Total Claims</div>
             </div>
             <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
               <div className="text-2xl font-bold text-orange-600">
                 {userClaims?.filter(c => c.status === 'PENDING').length || 0}
               </div>
               <div className="text-sm text-gray-600">Pending</div>
             </div>
             <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
               <div className="text-2xl font-bold text-green-600">
                 {userClaims?.filter(c => c.status === 'COMPLETE').length || 0}
               </div>
               <div className="text-sm text-gray-600">Completed</div>
             </div>
           </div>
           
           {/* Filter Options */}
           <div className="mb-4 flex justify-between items-center">
             <div className="text-sm text-gray-600">
               Showing {filteredClaims?.length || 0} of {userClaims?.length || 0} claims
             </div>
             <div className="flex items-center gap-2">
               {claimFilter !== 'all' && (
                 <button
                   onClick={() => setClaimFilter('all')}
                   className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                 >
                   Reset Filter
                 </button>
               )}
               <select
                 value={claimFilter}
                 onChange={(e) => {
                   setClaimFilter(e.target.value);
                 }}
                 className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
               >
                 <option value="all">All Claims</option>
                 <option value="pending">Pending Only</option>
                 <option value="complete">Completed Only</option>
               </select>
             </div>
           </div>
           
           <ClientOnly fallback={<div className="grid gap-4"><div className="bg-gray-100 p-4 rounded-lg animate-pulse">Loading...</div></div>}>
             <div className="grid gap-4">
               {filteredClaims && filteredClaims.length > 0 ? filteredClaims.map((claim) => (
                 <div key={claim.claimId} className={`p-4 rounded-lg shadow border ${
                   claim.status === 'COMPLETE' 
                     ? 'bg-white border-green-200' 
                     : 'bg-white border-orange-200'
                 }`}>
                   {/* Claim Status Badge */}
                   <div className="flex justify-between items-start mb-2">
                     <h4 className="text-md font-bold text-green-700">{claim.food.title}</h4>
                     <div className="flex flex-col items-end gap-1">
                       <span
                         className={`text-xs px-2 py-1 rounded-full border ${
                           claim.food.isDelivery
                             ? 'bg-blue-100 text-blue-700 border-blue-300'
                             : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                         }`}
                       >
                         {claim.food.isDelivery ? 'Delivery' : 'Pickup'}
                       </span>
                       <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                         claim.status === 'COMPLETE'
                           ? 'bg-green-100 text-green-700 border border-green-300'
                           : 'bg-orange-100 text-orange-600 border border-orange-300'
                       }`}>
                         {claim.status === 'COMPLETE' ? '✓ Completed' : '⏳ Pending'}
                       </span>
                     </div>
                   </div>
                   
                   <div className="text-sm text-gray-600 mb-1">
                     <span className="font-medium">Quantity:</span> {claim.food.quantity}
                   </div>
                   
                   <div className="text-sm text-gray-600 mb-1">
                     <span className="font-medium">Deadline:</span>{" "}
                     {claim.food.deadline ? new Date(claim.food.deadline).toLocaleString() : "-"}
                   </div>
                   
                   {/* Claim Details */}
                   <div className="mt-3 pt-3 border-t border-gray-100">
                     <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                           claim.status === 'COMPLETE' 
                             ? 'bg-blue-100 text-blue-800' 
                             : 'bg-orange-100 text-orange-800'
                         }`}>
                           {claim.status === 'COMPLETE' ? 'Completed' : 'Pending'}
                         </span>
                       </div>
                       
                       <div className="text-xs text-gray-600">
                         <span className="font-medium">Claimed:</span> {getRelativeTime(claim.claimedAt)} 
                         <span className="text-gray-400 ml-1">({new Date(claim.claimedAt).toLocaleDateString()})</span>
                       </div>
                       
                       {claim.specialInstruction && (
                         <div className="text-xs text-gray-600">
                           <span className="font-medium">Special Instructions:</span> {claim.specialInstruction}
                         </div>
                       )}
                       
                       {/* Donor Information */}
                       <div className="text-xs text-gray-600">
                         <span className="font-medium">Donor:</span> {claim.food.user.email}
                         {claim.food.user.primary_PhoneN && (
                           <span className="text-gray-400 ml-1">({claim.food.user.primary_PhoneN})</span>
                         )}
                       </div>
                       
                       {claim.food.user.address && (
                         <div className="text-xs text-gray-600">
                           <span className="font-medium">Donor Address:</span> {claim.food.user.address}, {claim.food.user.city}, {claim.food.user.country}
                         </div>
                       )}
                       
                       {/* Organization/Restaurant/Individual Donor Details */}
                       {claim.food.user.organization && (
                         <div className="text-xs text-gray-600">
                           <span className="font-medium">Organization:</span> {claim.food.user.organization.orgName}
                           {claim.food.user.organization.type && (
                             <span className="text-gray-400 ml-1">({claim.food.user.organization.type})</span>
                           )}
                         </div>
                       )}
                       
                       {claim.food.user.restaurant && (
                         <div className="text-xs text-gray-600">
                           <span className="font-medium">Restaurant:</span> {claim.food.user.restaurant.ResName}
                           {claim.food.user.restaurant.description && (
                             <span className="text-gray-400 ml-1">({claim.food.user.restaurant.description})</span>
                           )}
                         </div>
                       )}
                       
                       {claim.food.user.individualDonor && (
                         <div className="text-xs text-gray-600">
                           <span className="font-medium">Donor Name:</span> {claim.food.user.individualDonor.fullName}
                           {claim.food.user.individualDonor.idcard && (
                             <span className="text-gray-400 ml-1">({claim.food.user.individualDonor.idcard})</span>
                           )}
                         </div>
                       )}

                       {/* Action Buttons */}
                       <div className="mt-3 pt-3 border-t border-gray-100">
                         {claim.status === 'PENDING' ? (
                           <div className="flex gap-2 items-center">
                             <button
                               onClick={() => updateClaimStatus(claim.claimId, 'COMPLETE')}
                               className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                               title="Mark as received/used"
                             >
                               ✓ Mark Complete
                             </button>
                             <span className="text-xs text-gray-500 italic">
                               Click when you've received and used the food
                             </span>
                           </div>
                         ) : (
                           <div className="text-xs text-green-600 font-medium">
                             ✓ Claim completed successfully
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
               )) : (
                 <div className="text-center text-gray-500 py-8">
                   {userClaims && userClaims.length > 0 
                     ? `No claims match the "${claimFilter}" filter` 
                     : 'No claims found'
                   }
                 </div>
               )}
             </div>
           </ClientOnly>
         </div>


        </div>
      )}
      <ClientOnly fallback={null}>
        {showModal && selectedFood && (
          <div
            className="absolute z-50 w-96 max-w-full"
            style={{
              top: modalPos.y + 10, // offset to avoid overlapping the button
              left: modalPos.x,
            }}
          >
            <div className="bg-white border border-gray-200 shadow-xl rounded-xl p-6 relative">
              <button
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>

              <h2 className="text-xl font-bold text-green-700 mb-3">
                {selectedFood.title}
              </h2>

              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Quantity:</strong> {selectedFood.quantity}</p>
                <p><strong>Type:</strong> {selectedFood.isDelivery ? "Delivery" : "Pickup"}</p>
                <p><strong>Deadline:</strong> {new Date(selectedFood.deadline).toLocaleString()}</p>
                <p>
                  <strong>Urgency:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${
                    (() => {
                      const urgencyLevel = getUrgencyLevel(selectedFood.deadline);
                      const urgencyDisplay = getUrgencyDisplay(urgencyLevel);
                      return urgencyDisplay.color;
                    })()
                  }`}>
                    {(() => {
                      const urgencyLevel = getUrgencyLevel(selectedFood.deadline);
                      const urgencyDisplay = getUrgencyDisplay(urgencyLevel);
                      return `${urgencyDisplay.icon} ${urgencyDisplay.text}`;
                    })()}
                  </span>
                </p>
                <p><strong>Time Left:</strong> {getTimeRemaining(selectedFood.deadline)}</p>
                <hr className="my-2" />
                <p className="font-semibold">Donor Info:</p>
                <p>{selectedFood.user?.email}</p>
                <p>{selectedFood.user?.primary_PhoneN}</p>
                <p>{selectedFood.user?.address}, {selectedFood.user?.city}, {selectedFood.user?.country}</p>
              </div>

                             <div className="flex justify-end mt-4 gap-2">
                 {getUrgencyLevel(selectedFood.deadline) === 'CRITICAL' ? (
                   <button
                     disabled
                     className="bg-gray-300 text-gray-500 px-3 py-1 rounded cursor-not-allowed"
                     title="This food has expired and cannot be claimed"
                   >
                     Food Expired
                   </button>
                 ) : (
                   <button
                     onClick={() => {
                       setShowModal(false);
                       setSelectedFood(selectedFood);
                       setClaimModalOpen(true);
                     }}
                     className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                   >
                     Claim Food
                   </button>
                 )}
                 <button
                   onClick={() => setShowModal(false)}
                   className="bg-gray-100 text-gray-800 px-3 py-1 rounded hover:bg-gray-200 transition"
                 >
                   Close
                 </button>
               </div>
            </div>
          </div>
        )}
      </ClientOnly>

      <ClientOnly fallback={null}>
        {claimModalOpen && selectedFood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 mx-4 sm:mx-0">
              <h2 className="text-xl font-bold text-green-700 mb-4">Confirm Claim</h2>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Claim Status</label>
                <select
                  value={claimForm.status}
                  onChange={(e) => setClaimForm({ ...claimForm, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETE">Complete</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  rows={4}
                  placeholder="Add any special instructions for the donor..."
                  value={claimForm.specialInstruction}
                  onChange={(e) =>
                    setClaimForm({ ...claimForm, specialInstruction: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setClaimModalOpen(false);
                    setClaimForm({ status: "PENDING", specialInstruction: "" });
                    setSelectedFood(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleClaim({
                      ...selectedFood,
                      status: claimForm.status,
                      specialInstruction: claimForm.specialInstruction,
                    });
                    
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                >
                  Confirm Claim
                </button>
              </div>
            </div>
          </div>
        )}
      </ClientOnly>
    </div>
  );
} 