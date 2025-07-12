"use client";
import React from "react";
import { getToken, decodeToken, removeToken } from "../../jwt";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [role, setRole] = useState(null);
  const [donations, setDonations] = useState([
    // Mocked previous donations
    { id: 1, type: "Rice", amount: "10 kg", status: "Available" },
    { id: 2, type: "Bread", amount: "20 loaves", status: "Claimed" },
  ]);
  const [claimed, setClaimed] = useState([
    { id: 1, donor: "Restaurant A", type: "Rice", amount: "10 kg", pickup: "12-2pm", status: "Picked up" },
    { id: 2, donor: "Bakery B", type: "Bread", amount: "20 loaves", pickup: "3-4pm", status: "Pending" },
  ]);
  const [form, setForm] = useState({ type: "", amount: "", pickup: "", image: "", location: "" });
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add new donation to the list (mocked)
    setDonations([
      { id: Date.now(), type: form.type, amount: form.amount, status: "Available" },
      ...donations,
    ]);
    setForm({ type: "", amount: "", pickup: "", image: "", location: "" });
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
              name="type"
              placeholder="Type of food"
              value={form.type}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
              required
            />
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
              name="pickup"
              placeholder="Pickup time window"
              value={form.pickup}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            />
            {/* Image upload can be added later */}
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Add Donation</button>
          </form>
          <h3 className="text-lg font-semibold mb-2">Previous Donations</h3>
          <ul className="bg-white p-4 rounded shadow">
            {donations.map((d) => (
              <li key={d.id} className="mb-2 border-b pb-2 last:border-b-0">
                <strong>{d.type}</strong> - {d.amount} <span className="ml-2 text-xs text-gray-500">[{d.status}]</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Claimant Dashboard</h2>
          <div className="mb-4">
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded mb-2">
              {/* Replace with real map later */}
              <span className="text-gray-500">[Map Placeholder]</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Map of available food sources (mocked)</p>
          </div>
          <h3 className="text-lg font-semibold mb-2">Claimed Items</h3>
          <ul className="bg-white p-4 rounded shadow">
            {claimed.map((item) => (
              <li key={item.id} className="mb-2 border-b pb-2 last:border-b-0">
                <strong>{item.type}</strong> from {item.donor} - {item.amount} <br />
                <span className="text-xs text-gray-500">Pickup: {item.pickup} | Status: {item.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 