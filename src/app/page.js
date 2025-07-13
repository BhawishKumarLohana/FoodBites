"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUserPlus, FaUtensils, FaHandsHelping } from "react-icons/fa";

// AnimatedNumber component for counting up
function AnimatedNumber({ value, duration = 1200, suffix = "", replayKey }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    let raf;
    function animate() {
      start += increment;
      if (start < end) {
        setCount(Math.floor(start));
        raf = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    }
    animate();
    return () => cancelAnimationFrame(raf);
  }, [value, duration, replayKey]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

// Team fun facts
const TEAM_MEMBERS = [
  { name: "Ayman Jashim", fact: "Loves spicy food and hackathons!" },
  { name: "Bhawish Kumar Lohana", fact: "Can debug anything—even in his sleep." },
  { name: "Bibinur Adikhan", fact: "Designs with pixels and paints with code." },
  { name: "Habibul Bashar", fact: "Map wizard and data enthusiast." },
];

export default function Home() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.style.scrollBehavior = "smooth";
    }
    return () => {
      if (typeof window !== "undefined") {
        document.documentElement.style.scrollBehavior = "auto";
      }
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-br from-green-100 to-blue-100">
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/food-NGO.jpg"
            alt="FoodBites Hero"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 text-green-800 drop-shadow-lg">FoodBites</h1>
          <p className="text-2xl sm:text-3xl text-gray-800 font-medium mb-6 drop-shadow">Waste Less, Feed More</p>
          <p className="text-lg sm:text-xl text-gray-700 mb-8">Bridging the gap between food donors and those in need. Join us in reducing food waste and feeding communities in real time.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <motion.a
              href="/signup"
              whileHover={{ scale: 1.07, boxShadow: "0 8px 32px rgba(16, 185, 129, 0.25)" }}
              whileTap={{ scale: 0.96 }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded shadow text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-300 cursor-pointer"
              style={{ display: 'inline-block' }}
            >
              I am donating food
            </motion.a>
            <motion.a
              href="/signup"
              whileHover={{ scale: 1.07, boxShadow: "0 8px 32px rgba(59, 130, 246, 0.25)" }}
              whileTap={{ scale: 0.96 }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded shadow text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 cursor-pointer"
              style={{ display: 'inline-block' }}
            >
              I am claiming food
            </motion.a>
          </div>
          <Link href="#impact" className="inline-block mt-2 text-green-700 underline font-semibold">Learn More ↓</Link>
        </div>
      </section>

      {/* Impact Stats */}
      <motion.section
        id="impact"
        className="py-16 bg-white flex flex-col items-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ amount: 0.3 }}
      >
        <h2 className="text-3xl font-bold mb-8 text-green-800">Our Impact (So Far)</h2>
        <p className="mb-8 text-lg text-gray-700 text-center">Globally, around 300 million tons of food is wasted every year.</p>
        <div className="flex flex-wrap gap-8 justify-center">
          {/* Meals Donated */}
          {(() => {
            const [replayKey1, setReplayKey1] = useState(0);
            return (
              <div
                className="bg-green-100 rounded-2xl p-6 shadow-xl text-center min-w-[160px] transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group border-2 border-transparent hover:border-green-300"
                onMouseEnter={() => setReplayKey1((k) => k + 1)}
              >
                <div className="text-4xl font-extrabold text-green-700 mb-2 transition-colors duration-300 group-hover:text-green-900">
                  <AnimatedNumber value={1200} suffix="+" duration={700} replayKey={replayKey1} />
                </div>
                <div className="text-gray-700">Meals Donated</div>
              </div>
            );
          })()}
          {/* NGOs/Shelters Helped */}
          {(() => {
            const [replayKey2, setReplayKey2] = useState(0);
            return (
              <div
                className="bg-blue-100 rounded-2xl p-6 shadow-xl text-center min-w-[160px] transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group border-2 border-transparent hover:border-blue-300"
                onMouseEnter={() => setReplayKey2((k) => k + 1)}
              >
                <div className="text-4xl font-extrabold text-blue-700 mb-2 transition-colors duration-300 group-hover:text-blue-900">
                  <AnimatedNumber value={30} suffix="+" duration={700} replayKey={replayKey2} />
                </div>
                <div className="text-gray-700">NGOs/Shelters Helped</div>
              </div>
            );
          })()}
          {/* Food Saved */}
          {(() => {
            const [replayKey3, setReplayKey3] = useState(0);
            return (
              <div
                className="bg-yellow-100 rounded-2xl p-6 shadow-xl text-center min-w-[160px] transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group border-2 border-transparent hover:border-yellow-300"
                onMouseEnter={() => setReplayKey3((k) => k + 1)}
              >
                <div className="text-4xl font-extrabold text-yellow-700 mb-2 transition-colors duration-300 group-hover:text-yellow-900">
                  <AnimatedNumber value={5000} suffix="kg" duration={700} replayKey={replayKey3} />
                </div>
                <div className="text-gray-700">Food Saved</div>
              </div>
            );
          })()}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        className="py-16 bg-gray-50 flex flex-col items-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        viewport={{ amount: 0.3 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-green-800">How FoodBites Works</h2>
        <div className="max-w-3xl text-center text-lg text-gray-700 mb-8">
          <p>FoodBites connects restaurants, cafes, and individuals with surplus food to NGOs and shelters in real time. Donors can quickly list available food, and claimants can browse and claim what they need. Our platform ensures efficient, safe, and impactful food distribution—zero waste, more full plates.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-72 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group flex flex-col items-center border-2 border-transparent hover:border-green-300">
            <motion.div
              whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex justify-center mb-2"
            >
              <FaUserPlus className="text-green-500 text-3xl" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2 text-green-700">1. Sign Up</h3>
            <p>Register as a donor or claimant. It's free and takes less than a minute.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-72 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group flex flex-col items-center border-2 border-transparent hover:border-blue-300">
            <motion.div
              whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex justify-center mb-2"
            >
              <FaUtensils className="text-blue-500 text-3xl" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2 text-green-700">2. List or Claim Food</h3>
            <p>Donors post available food. Claimants browse and claim what they need.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-72 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group flex flex-col items-center border-2 border-transparent hover:border-yellow-300">
            <motion.div
              whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex justify-center mb-2"
            >
              <FaHandsHelping className="text-yellow-500 text-3xl" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2 text-green-700">3. Make an Impact</h3>
            <p>Coordinate pickup and help reduce waste while feeding communities.</p>
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <section className="py-16 bg-white flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-8 text-green-800">Meet the Team</h2>
        <div className="flex flex-wrap gap-8 justify-center">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={member.name}
              className="flex flex-col items-center bg-gray-50 rounded-2xl p-6 w-60 shadow-xl border-2 border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-green-400 cursor-pointer group"
            >
              <div className="text-lg font-semibold mb-2">{member.name}</div>
              <div className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 mt-2 transition-opacity duration-300 text-center min-h-[32px]">{member.fact}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-8 mb-4 text-gray-400 text-sm text-center">&copy; {new Date().getFullYear()} FoodBites. All rights reserved.</footer>
    </div>
  );
} 