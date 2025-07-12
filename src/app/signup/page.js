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
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  // Org fields
  const [orgName, setOrgName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [orgType, setOrgType] = useState("");
  // Restaurant fields
  const [resName, setResName] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [resDescription, setResDescription] = useState("");
  // Individual Donor fields
  const [fullName, setFullName] = useState("");
  const [idcard, setIdcard] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  // Step navigation
  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  // Step 1: User type
  const Step1 = (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <div className="bg-white p-6 rounded shadow-md w-80 flex flex-col items-center">
        <p className="mb-4 font-semibold text-center">What type of user are you?</p>
        {USER_TYPES.map((type) => (
          <button
            key={type.value}
            className={`w-full mb-3 p-2 rounded border font-medium ${userType === type.value ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"}`}
            onClick={() => setUserType(type.value)}
            type="button"
          >
            {type.label}
          </button>
        ))}
        <button
          className="w-full bg-green-600 text-white p-2 rounded mt-2 disabled:opacity-50"
          onClick={next}
          disabled={!userType}
        >
          Next
        </button>
        <p className="mt-2 text-sm">Already have an account? <Link href="/login" className="text-blue-600">Login</Link></p>
      </div>
    </div>
  );

  // Step 2: Email & password
  const Step2 = (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <div className="bg-white p-6 rounded shadow-md w-80 flex flex-col items-center">
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
        <div className="flex w-full justify-between">
          <button type="button" className="text-gray-600 underline" onClick={prev}>Back</button>
          <button type="button" className="bg-green-600 text-white px-4 py-2 rounded" onClick={next} disabled={!email || !password}>Next</button>
        </div>
      </div>
    </div>
  );

  // Step 3: Address, country, city, phones
  const Step3 = (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <div className="bg-white p-6 rounded shadow-md w-80 flex flex-col items-center">
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Primary Phone Number"
          value={primaryPhone}
          onChange={(e) => setPrimaryPhone(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Secondary Phone Number (optional)"
          value={secondaryPhone}
          onChange={(e) => setSecondaryPhone(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <div className="flex w-full justify-between">
          <button type="button" className="text-gray-600 underline" onClick={prev}>Back</button>
          <button type="button" className="bg-green-600 text-white px-4 py-2 rounded" onClick={next} disabled={!address || !country || !city || !primaryPhone}>Next</button>
        </div>
      </div>
    </div>
  );

  // Step 4: User-type-specific fields
  let Step4Fields = null;
  if (userType === "organization") {
    Step4Fields = (
      <>
        <input
          type="text"
          placeholder="Organization Name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Registration Number (optional)"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={orgDescription}
          onChange={(e) => setOrgDescription(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Type (NGO, NPO, etc)"
          value={orgType}
          onChange={(e) => setOrgType(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
      </>
    );
  } else if (userType === "restaurant") {
    Step4Fields = (
      <>
        <input
          type="text"
          placeholder="Restaurant Name"
          value={resName}
          onChange={(e) => setResName(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Open Time (e.g. 09:00)"
          value={openTime}
          onChange={(e) => setOpenTime(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Close Time (e.g. 18:00)"
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={resDescription}
          onChange={(e) => setResDescription(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
      </>
    );
  } else if (userType === "individual") {
    Step4Fields = (
      <>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="ID Card (optional)"
          value={idcard}
          onChange={(e) => setIdcard(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
      </>
    );
  }

  const Step4 = (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <div className="bg-white p-6 rounded shadow-md w-80 flex flex-col items-center">
        {Step4Fields}
        <div className="flex w-full justify-between">
          <button type="button" className="text-gray-600 underline" onClick={prev}>Back</button>
          <button type="button" className="bg-green-600 text-white px-4 py-2 rounded" onClick={next}>Next</button>
        </div>
      </div>
    </div>
  );

  // Step 5: Review & submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mock API call: returns a fake JWT with role
    if (email && password && userType) {
      const fakePayload = {
        email,
        role: userType, // changed from userType to role
        address,
        country,
        city,
        primaryPhone,
        secondaryPhone,
        orgName,
        regNumber,
        orgDescription,
        orgType,
        resName,
        openTime,
        closeTime,
        resDescription,
        fullName,
        idcard,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };
      const base64 = (obj) => btoa(JSON.stringify(obj));
      const fakeToken = `header.${base64(fakePayload)}.signature`;
      login(fakeToken);
      router.push("/dashboard");
    } else {
      setError("Please fill all required fields");
    }
  };

  const Step5 = (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Review & Submit</h1>
      <div className="bg-white p-6 rounded shadow-md w-96 flex flex-col items-center">
        <div className="w-full mb-4">
          <div className="mb-2"><strong>User Type:</strong> {USER_TYPES.find(t => t.value === userType)?.label}</div>
          <div className="mb-2"><strong>Email:</strong> {email}</div>
          <div className="mb-2"><strong>Address:</strong> {address}, {city}, {country}</div>
          <div className="mb-2"><strong>Primary Phone:</strong> {primaryPhone}</div>
          {secondaryPhone && <div className="mb-2"><strong>Secondary Phone:</strong> {secondaryPhone}</div>}
          {userType === "organization" && (
            <>
              <div className="mb-2"><strong>Organization Name:</strong> {orgName}</div>
              {regNumber && <div className="mb-2"><strong>Registration Number:</strong> {regNumber}</div>}
              {orgDescription && <div className="mb-2"><strong>Description:</strong> {orgDescription}</div>}
              <div className="mb-2"><strong>Type:</strong> {orgType}</div>
            </>
          )}
          {userType === "restaurant" && (
            <>
              <div className="mb-2"><strong>Restaurant Name:</strong> {resName}</div>
              <div className="mb-2"><strong>Open Time:</strong> {openTime}</div>
              <div className="mb-2"><strong>Close Time:</strong> {closeTime}</div>
              {resDescription && <div className="mb-2"><strong>Description:</strong> {resDescription}</div>}
            </>
          )}
          {userType === "individual" && (
            <>
              <div className="mb-2"><strong>Full Name:</strong> {fullName}</div>
              {idcard && <div className="mb-2"><strong>ID Card:</strong> {idcard}</div>}
            </>
          )}
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex w-full justify-between">
          <button type="button" className="text-gray-600 underline" onClick={prev}>Back</button>
          <button type="button" className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>Submit</button>
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