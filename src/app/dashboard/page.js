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
  const [form, setForm] = useState({ title: "", amount: "", deadline: "", isDelivery:"" });
  const [available, setAvailable] = useState([]);
  const [claimed, setClaimed] = useState([]);
  const [unClaimed,setunClaimed]=useState([]);
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
    } else {
      console.error("Failed to fetch unclaimed food:", data.error);
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
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  };
  
  fetchDonations();
  fetchUnclaimed();

  }, [router]);

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
      <ClientOnly fallback={<div className="grid sm:grid-cols-2 gap-4"><div className="bg-gray-100 p-4 rounded-lg animate-pulse">Loading...</div></div>}>
        <div className="grid sm:grid-cols-2 gap-4">
          {donations && donations.length > 0 ? donations.map((d) => (
            <div key={d.foodId} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-bold text-green-700">{d.title}</h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    d.isDelivery
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                  }`}
                >
                  {d.isDelivery ? 'Delivery' : 'Pickup'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Quantity:</span> {d.quantity}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Deadline:</span>{" "}
                {d.deadline ? new Date(d.deadline).toLocaleString() : "-"}
              </div>
            </div>
          )) : (
            <div className="col-span-2 text-center text-gray-500 py-8">
              No donations found
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
                  <button className="w-full bg-green-600 text-white p-2 rounded mt-2" onClick={() => handleClaim(selectedPin)}>Claim Food</button>
                </div>
              </div>
            )}
          </ClientOnly>
         <h3 className="text-xl font-semibold mb-4 text-gray-800">Available Food Donations</h3>
<ClientOnly fallback={<div className="grid gap-4"><div className="bg-gray-100 p-4 rounded-lg animate-pulse">Loading...</div></div>}>
<div className="grid gap-4">
  {claimed && claimed.length > 0 ? claimed.map((item) => (
    <div
      key={item.foodId}
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200 transition hover:shadow-lg"
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-bold text-green-700">{item.title}</h4>
        <span
          className={`text-xs px-2 py-1 rounded-full border ${
            item.isDelivery
              ? 'bg-blue-100 text-blue-700 border-blue-300'
              : 'bg-yellow-100 text-yellow-700 border-yellow-300'
          }`}
        >
          {item.isDelivery ? 'Delivery' : 'Pickup'}
        </span>
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
        {item.deadline ? new Date(item.deadline).toLocaleString() : '-'}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setModalPos({ x: rect.left, y: rect.bottom + window.scrollY });
            setSelectedFood(item);
            setShowModal(true);
          }}
          className="text-sm bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1 rounded hover:bg-gray-200 transition"
        >
          View More
        </button>

          
       <button
        onClick={() => {
          setSelectedFood(item); 
          setClaimModalOpen(true);
        }}
        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
      >
        Claim
      </button>


      </div>
    </div>
  )) : (
    <div className="text-center text-gray-500 py-8">
      No available food donations found
    </div>
  )}
</div>
</ClientOnly>


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
                <hr className="my-2" />
                <p className="font-semibold">Donor Info:</p>
                <p>{selectedFood.user?.email}</p>
                <p>{selectedFood.user?.primary_PhoneN}</p>
                <p>{selectedFood.user?.address}, {selectedFood.user?.city}, {selectedFood.user?.country}</p>
              </div>

              <div className="flex justify-end mt-4">
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