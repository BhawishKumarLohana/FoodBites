"use client";
import React, { useState } from "react";
// import { auth } from "../../firebase";
// import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { setToken, decodeToken } from "../../jwt";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Mock API call: returns a fake JWT with role
    if (email && password) {
      // Simulate backend response
      const fakeRole = email.includes("ngo") ? "claimant" : "donor";
      const fakePayload = {
        email,
        role: fakeRole,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };
      const base64 = (obj) => btoa(JSON.stringify(obj));
      const fakeToken = `header.${base64(fakePayload)}.signature`;
      setToken(fakeToken);
      router.push("/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
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
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
        <p className="mt-2 text-sm">
          Don't have an account? <Link href="/signup" className="text-blue-600">Sign up</Link>
        </p>
      </form>
    </div>
  );
} 