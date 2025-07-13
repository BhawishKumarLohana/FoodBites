"use client";
import React, { useState, useEffect } from "react";
import { getToken, decodeToken, removeToken } from "../../jwt";
import { useRouter } from "next/navigation";
import GoogleMap from "../components/GoogleMap";
import { getUserLocation, filterDonorsByDistance } from "../utils/location";




export default function DashboardPage() {
  const [role, setRole] = useState(null);
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", deadline: "", isDelivery:"" });
  const [available, setAvailable] = useState([]);
  const [claimed, setClaimed] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyDonors, setNearbyDonors] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const router = useRouter();

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

  }, [router]);
  

  


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
  const handleClaim = (item) => {
    setClaimed([{ id: Date.now(), donor: item.donor, type: item.type, amount: item.amount, date: new Date().toISOString().slice(0, 10) }, ...claimed]);
    setAvailable(available.filter((a) => a.id !== item.id));
    setNearbyDonors(nearbyDonors.filter((a) => a.id !== item.id));
    setShowModal(false);
    setSelectedPin(null);
  };

  // Handle donor click from map
  const handleDonorClick = (donor) => {
    setSelectedPin(donor);
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
      <div className="grid sm:grid-cols-2 gap-4">
        {donations.map((d) => (
          <div key={d.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
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
        ))}
      </div>
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
            <GoogleMap 
              donors={nearbyDonors}
              onDonorClick={handleDonorClick}
              userLocation={userLocation}
            />
          </div>
          
          {/* Nearby Donors Count */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {nearbyDonors.length} donor(s) within 10km of your location
          </div>
          {/* Modal for pin details and claim */}
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
          <h3 className="text-lg font-semibold mb-2">Claimed Items</h3>
          <ul className="bg-white p-4 rounded shadow">
            {claimed.map((item) => (
              <li key={item.id} className="mb-2 border-b pb-2 last:border-b-0">
                <strong>{item.type}</strong> from {item.donor} - {item.amount} <br />
                <span className="text-xs text-gray-500">Date: {item.date}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 