"use client";
import { useEffect, useState } from "react";
import { getToken, removeToken } from "../jwt";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, []);

  const handleLogout = () => {
    removeToken();
    setLoggedIn(false);
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow mb-6">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="font-bold text-xl">
          <a href="/">Waste Less, Feed More</a>
        </div>
        <div className="space-x-4">
          <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
          <a href="/about" className="text-gray-700 hover:text-blue-600">About</a>
          {loggedIn ? (
            <>
              <a href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</a>
              <a href="/profile" className="text-gray-700 hover:text-blue-600">Profile</a>
              <button onClick={handleLogout} className="text-red-600 hover:underline ml-2">Logout</button>
            </>
          ) : (
            <>
              <a href="/login" className="text-gray-700 hover:text-blue-600">Login</a>
              <a href="/signup" className="text-gray-700 hover:text-blue-600">Signup</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 