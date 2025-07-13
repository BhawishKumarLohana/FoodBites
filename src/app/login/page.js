"use client";
import React, { useState } from "react";
// import { auth } from "../../firebase";
// import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { setToken, decodeToken } from "../../jwt";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      login(data.token);
      router.push("/dashboard");
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
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
