"use client";
import React, { useEffect, useState } from "react";
import { getToken, decodeToken, removeToken } from "../../jwt";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState([]);
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
    setUser(payload);
    // Mocked activity log
    if (payload.role === "donor") {
      setActivity([
        { id: 1, action: "Donated Rice", status: "Claimed", date: "2024-06-01" },
        { id: 2, action: "Donated Bread", status: "Available", date: "2024-06-02" },
      ]);
    } else {
      setActivity([
        { id: 1, action: "Claimed Rice from Restaurant A", status: "Picked up", date: "2024-06-01" },
        { id: 2, action: "Claimed Bread from Bakery B", status: "Pending", date: "2024-06-02" },
      ]);
    }
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white p-6 rounded shadow-md w-80 mb-4">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role === "donor" ? "Donor" : "Claimant"}</p>
      </div>
      <div className="bg-white p-6 rounded shadow-md w-80 mb-4">
        <h2 className="text-lg font-semibold mb-2">Activity Log</h2>
        <ul>
          {activity.map((item) => (
            <li key={item.id} className="mb-2 border-b pb-2 last:border-b-0">
              <span className="font-medium">{item.action}</span> - {item.status} <span className="text-xs text-gray-500">({item.date})</span>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
    </div>
  );
} 