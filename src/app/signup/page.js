"use client";
import React, { useState } from "react";
import Link from "next/link";
import { setToken } from "../../jwt";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";

const USER_TYPES = [
  { value: "organization", label: "Organization (NGO/NPO/etc)" },
  { value: "restaurant", label: "Restaurant" },
  { value: "individual", label: "Individual Donor" },
];

export default function SignupPage() {
  // ... (keep all your existing state and handler functions)

  // Step 1: User type
  const Step1 = (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-80 flex flex-col items-center">
        <p className="mb-4 font-semibold text-center">What type of user are you?</p>
        {USER_TYPES.map((type) => (
          <button
            key={type.value}
            className={`w-full mb-3 p-3 rounded-md border font-medium transition-transform duration-100 hover:scale-[1.02] ${
              userType === type.value 
                ? "bg-green-600 text-white border-green-600" 
                : "bg-gray-100 text-gray-800 border-gray-200"
            }`}
            onClick={() => setUserType(type.value)}
            type="button"
          >
            {type.label}
          </button>
        ))}
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-md mt-2 disabled:opacity-50 transition-transform duration-100 hover:scale-[1.02]"
          onClick={next}
          disabled={!userType}
        >
          Next
        </button>
        <p className="mt-2 text-sm">Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login</Link></p>
      </div>
    </div>
  );

  // Step 2: Email & password
  const Step2 = (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-80 flex flex-col items-center">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 border rounded-md focus:ring-1 focus:ring-green-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-3 border rounded-md focus:ring-1 focus:ring-green-500"
          required
        />
        <div className="flex w-full justify-between">
          <button 
            type="button" 
            className="text-gray-600 hover:text-gray-800 underline transition-colors"
            onClick={prev}
          >
            Back
          </button>
          <button 
            type="button" 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-transform duration-100 hover:scale-[1.02]"
            onClick={next} 
            disabled={!email || !password}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  // Step 3: Address, country, city, phones
  const Step3 = (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-80 flex flex-col items-center">
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full mb-3 p-3 border rounded-md focus:ring-1 focus:ring-green-500"
          required
        />
        {/* Keep other input fields with same styling */}
        <div className="flex w-full justify-between">
          <button 
            type="button" 
            className="text-gray-600 hover:text-gray-800 underline transition-colors"
            onClick={prev}
          >
            Back
          </button>
          <button 
            type="button" 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-transform duration-100 hover:scale-[1.02]"
            onClick={next} 
            disabled={!address || !country || !city || !primaryPhone}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  // Step 4: User-type-specific fields (keep existing fields, just update their classes)
  // Add rounded-md and focus:ring-1 focus:ring-green-500 to all input fields

  // Step 5: Review & submit
  const Step5 = (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Review & Submit</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-96 flex flex-col items-center">
        {/* Keep existing review content */}
        <div className="flex w-full justify-between">
          <button 
            type="button" 
            className="text-gray-600 hover:text-gray-800 underline transition-colors"
            onClick={prev}
          >
            Back
          </button>
          <button 
            type="button" 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-transform duration-100 hover:scale-[1.02]"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {step === 1 && Step1}
      {step === 2 && Step2}
      {step === 3 && Step3}
      {step === 4 && Step4}
      {step === 5 && Step5}
    </div>
  );
}
