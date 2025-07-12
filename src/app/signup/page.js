"use client";
import React, { useState } from "react";
// import { auth } from "../../firebase";
// import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { setToken, decodeToken } from "../../jwt";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    // Mock API call: returns a fake JWT with role
    if (email && password && role) {
      const fakePayload = {
        email,
        role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };
      const base64 = (obj) => btoa(JSON.stringify(obj));
      const fakeToken = `header.${base64(fakePayload)}.signature`;
      setToken(fakeToken);
      router.push("/dashboard");
    } else {
      setError("Please fill all fields");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-md w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        >
          <option value="donor">Donor (Restaurant/Individual)</option>
          <option value="claimant">Claimant (NGO/Shelter)</option>
        </select>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Sign Up</button>
        <p className="mt-2 text-sm">
          Already have an account? <Link href="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
} 