"use client";
import React, { useState, useEffect } from "react";
import { getToken, decodeToken, removeToken } from "../../jwt";
import { useRouter } from "next/navigation";

const MOCK_DONATIONS = [
  { id: 1, type: "Rice", amount: "10 kg", status: "Available", pickup: "12-2pm", location: "Downtown", image: "", date: "2024-06-01" },
  { id: 2, type: "Bread", amount: "20 loaves", status: "Claimed", pickup: "3-4pm", location: "Bakery St.", image: "", date: "2024-06-02" },
  { id: 3, type: "Curry", amount: "5 kg", status: "Expired", pickup: "1-2pm", location: "Main Ave.", image: "", date: "2024-05-30" },
];

const MOCK_AVAILABLE = [
  { id: 1, donor: "Restaurant A", type: "Rice", amount: "10 kg", pickup: "12-2pm", location: "Downtown", lat: 40.7128, lng: -74.0060 },
  { id: 2, donor: "Anonymous", type: "Bread", amount: "20 loaves", pickup: "3-4pm", location: "Bakery St.", lat: 40.7138, lng: -74.0050 },
  { id: 3, donor: "Cafe C", type: "Curry", amount: "5 kg", pickup: "1-2pm", location: "Main Ave.", lat: 40.7148, lng: -74.0040 },
];

const MOCK_CLAIMED = [
  { id: 1, donor: "Restaurant A", type: "Rice", amount: "10 kg", date: "2024-06-01" },
  { id: 2, donor: "Bakery B", type: "Bread", amount: "20 loaves", date: "2024-06-02" },
];

export default function DashboardPage() {
  const [role, setRole] = useState(null);
  const [donations, setDonations] = useState(MOCK_DONATIONS);
  const [form, setForm] = useState({ type: "", amount: "", pickup: "", image: "", location: "" });
  const [available, setAvailable] = useState(MOCK_AVAILABLE);
  const [claimed, setClaimed] = useState(MOCK_CLAIMED);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
  }, [router]);

  // Donor: Add donation
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleImage = (e) => {
    setForm({ ...form, image: e.target.files[0]?.name || "" });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setDonations([
      { id: Date.now(), ...form, status: "Available", date: new Date().toISOString().slice(0, 10) },
      ...donations,
    ]);
    setForm({ type: "", amount: "", pickup: "", image: "", location: "" });
  };

  // Claimant: Claim food
  const handleClaim = (item) => {
    setClaimed([{ id: Date.now(), donor: item.donor, type: item.type, amount: item.amount, date: new Date().toISOString().slice(0, 10) }, ...claimed]);
    setAvailable(available.filter((a) => a.id !== item.id));
    setShowModal(false);
    setSelectedPin(null);
  };

  if (!role) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {role === "donor" ? (
        <div className="w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Donor Dashboard</h2>
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
            <input
              type="text"
              name="amount"
              placeholder="Amount (e.g., 10 kg, 20 plates)"
              value={form.amount}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
              required
            />
            <input
              type="text"
              name="type"
              placeholder="Type of food"
              value={form.type}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
              required
            />
            <input
              type="text"
              name="pickup"
              placeholder="Pickup time window"
              value={form.pickup}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              name="location"
              placeholder="Location (auto-filled or editable)"
              value={form.location}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImage}
              className="w-full mb-2"
            />
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Add Donation</button>
          </form>
          <h3 className="text-lg font-semibold mb-2">Previous Donations</h3>
          <ul className="bg-white p-4 rounded shadow">
            {donations.map((d) => (
              <li key={d.id} className="mb-2 border-b pb-2 last:border-b-0">
                <strong>{d.type}</strong> - {d.amount} <span className="ml-2 text-xs text-gray-500">[{d.status}]</span>
                <div className="text-xs text-gray-400">Pickup: {d.pickup || "-"} | Location: {d.location || "-"} | Date: {d.date}</div>
                {d.image && <div className="text-xs text-gray-400">Image: {d.image}</div>}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-2">Claimant Dashboard</h2>
          {/* Map Placeholder */}
          <div className="w-full h-64 bg-blue-100 flex items-center justify-center rounded mb-4 relative">
            {/* Pins (mocked as clickable dots) */}
            {available.map((item, idx) => (
              <button
                key={item.id}
                className="absolute"
                style={{ left: `${30 + idx * 30}%`, top: `${40 + idx * 10}%` }}
                onClick={() => { setSelectedPin(item); setShowModal(true); }}
                title={item.type}
              >
                <span className="w-5 h-5 bg-green-600 rounded-full inline-block border-2 border-white shadow-lg" />
              </button>
            ))}
            <span className="text-gray-500">[Map Placeholder]</span>
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