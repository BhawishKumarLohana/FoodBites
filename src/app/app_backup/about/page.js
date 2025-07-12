import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">About</h1>
      <p className="mb-4 max-w-xl text-center">
        <strong>Reduce Waste, Feed Communities.</strong><br />
        Connecting restaurants with surplus food to local shelters in real time.<br />
        Zero food waste.
      </p>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-xl mb-4">
        <h2 className="text-lg font-semibold mb-2">Why does this exist?</h2>
        <p>
          Around 300 million tons of food is wasted every year globally. Our platform aims to bridge the gap between food donors and those in need, making food distribution efficient and impactful.
        </p>
      </div>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-xl">
        <h2 className="text-lg font-semibold mb-2">Team/Contributors</h2>
        <ul>
          <li>Ayman Jashim</li>
          <li>Bhawish Kumar Lohana</li>
          <li>Other team members...</li>
        </ul>
      </div>
    </div>
  );
} 