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
  { name: "Ayman Jashim", fact: "Debugging, sipping tea, and dreaming up the next big hackathon win!" },
  { name: "Bhawish Kumar", fact: "I Code and Do Model United Nations!!" },
  { name: "Bibinur Adikhan", fact: "Designs with pixels and paints with code." },
  { name: "Habibul Bashar", fact: "I can’t tie shoelaces." },
];

// variants (keep these outside the component file-scope)
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {  duration:2,staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration:2, ease: [0.22, 1, 0.36, 1] }
  }
};

const pop = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {  duration:2,type: "spring", stiffness: 120, damping: 16 }
  }
};

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
    <div className="flex flex-col bg-gray-50 mt-0 px-0 py-0">
      {/* Hero Section */}
     <section className="relative w-full h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
  {/* Background Image */}
  <div className="absolute inset-0">
    <Image
      src="/food-NGO.jpg"
      alt="FoodBites Hero"
      fill
      className="object-cover opacity-30"
      priority
    />
  </div>

  {/* Content */}
  <div className="relative z-10 max-w-2xl mx-auto py-20">


    {/* Buttons */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
       <motion.div
      className="relative z-10 max-w-2xl mx-auto py-20"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h1
        className="text-5xl sm:text-6xl font-extrabold mb-4 text-green-800 drop-shadow-lg"
        variants={pop}
      >
        FoodBites
      </motion.h1>

      <motion.p
        className="text-2xl sm:text-3xl text-gray-800 font-medium mb-2 drop-shadow"
        variants={fadeUp}
      >
        Waste Less, Feed More
      </motion.p>

      <motion.p
        className="text-lg sm:text-xl text-gray-700 mb-8"
        variants={fadeUp}
      >
        Bridging the gap between food donors and those in need. Join us in
        reducing food waste and feeding communities in real time.
      </motion.p>

      {/* Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center mb-4"
        variants={fadeUp}
      >
        <motion.a
          href="/signup"
          whileHover={{
            scale: 1.07,
            boxShadow: "0 8px 32px rgba(16, 185, 129, 0.25)",
            y: -2
          }}
          whileTap={{ scale: 0.96, y: 0 }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded shadow text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-300 cursor-pointer"
        >
          I am donating food
        </motion.a>

        <motion.a
          href="/signup"
          whileHover={{
            scale: 1.07,
            boxShadow: "0 8px 32px rgba(59, 130, 246, 0.25)",
            y: -2
          }}
          whileTap={{ scale: 0.96, y: 0 }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded shadow text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 cursor-pointer"
        >
          I am claiming food
        </motion.a>
      </motion.div>

      <motion.div variants={fadeUp}>
        <a
          href="#impact"
          className="inline-block mt-2 text-green-700 underline font-semibold"
        >
          <motion.span
            whileHover={{ x: 2 }}
            transition={{ type: "tween", duration: 0.15 }}
          >
            Learn More ↓
          </motion.span>
        </a>
      </motion.div>
    </motion.div>
    </div>

   
  </div>
</section>


    {/* Impact Section  */}
<motion.section
  id="impact"
  className="py-16 bg-green-100"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 2 }}
>
  <div className="max-w-full max-h-full px-20 grid grid-rows-3 grid-cols-1 md:grid-cols-[0.4fr_0.6fr] gap-10 items-center"> {/* do not change */}

    {/* Left Column (40%) — span all 3 rows on md+ */}
    <div className="md:col-start-1 md:row-span-3 self-center w-full">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-green-900 mb-4">
        Our Impact
      </h2>
      <p className="text-xl sm:text-2xl text-green-800 font-semibold">
        Saving billions of lives...
      </p>
      <p className="mt-4 text-base sm:text-lg text-green-900/80">
        We’re bridging donors and communities—turning surplus into sustenance.
        Every connection reduces waste and feeds people who need it most.
      </p>
    </div>

    {/* Right Column (60%) — graph-like bars that always fit the column */}
    <div className="md:col-start-2 md:row-span-3 w-full flex flex-col gap-6 justify-center">

      {/* Meals Donated (bar ~ 60%) */}
      {(() => {
        const [replayKey1, setReplayKey1] = useState(0);
        const targetPct = 60; // adjust visual share
        return (
          <div
            className="w-full bg-green-50 rounded-2xl p-5 shadow-xl border border-green-200 hover:shadow-2xl transition-shadow cursor-pointer"
            onMouseEnter={() => setReplayKey1(k => k + 1)}
          >
            <div className="flex items-end justify-between mb-3">
              <div className="text-sm font-medium text-green-900/80">Meals Donated</div>
              <div className="text-3xl font-extrabold text-green-700">
                <AnimatedNumber value={1200} suffix="+" duration={700} replayKey={replayKey1} />
              </div>
            </div>

            {/* Track */}
            <div className="w-full h-4 rounded-full bg-green-200/60 overflow-hidden">
              <motion.div
                key={replayKey1}
                initial={{ width: 0 }}
                animate={{ width: `${targetPct}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-green-500"
              />
            </div>
          </div>
        );
      })()}

      {/* NGOs/Shelters Helped (bar ~ 35%) */}
      {(() => {
        const [replayKey2, setReplayKey2] = useState(0);
        const targetPct = 35;
        return (
          <div
            className="w-full bg-blue-50 rounded-2xl p-5 shadow-xl border border-blue-200 hover:shadow-2xl transition-shadow cursor-pointer"
            onMouseEnter={() => setReplayKey2(k => k + 1)}
          >
            <div className="flex items-end justify-between mb-3">
              <div className="text-sm font-medium text-blue-900/80">NGOs/Shelters Helped</div>
              <div className="text-3xl font-extrabold text-blue-700">
                <AnimatedNumber value={30} suffix="+" duration={700} replayKey={replayKey2} />
              </div>
            </div>

            {/* Track */}
            <div className="w-full h-4 rounded-full bg-blue-200/60 overflow-hidden">
              <motion.div
                key={replayKey2}
                initial={{ width: 0 }}
                animate={{ width: `${targetPct}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-blue-500"
              />
            </div>
          </div>
        );
      })()}

      {/* Food Saved (bar ~ 80%) */}
      {(() => {
        const [replayKey3, setReplayKey3] = useState(0);
        const targetPct = 80;
        return (
          <div
            className="w-full bg-yellow-50 rounded-2xl p-5 shadow-xl border border-yellow-200 hover:shadow-2xl transition-shadow cursor-pointer"
            onMouseEnter={() => setReplayKey3(k => k + 1)}
          >
            <div className="flex items-end justify-between mb-3">
              <div className="text-sm font-medium text-yellow-900/80">Food Saved</div>
              <div className="text-3xl font-extrabold text-yellow-700">
                <AnimatedNumber value={5000} suffix="kg" duration={700} replayKey={replayKey3} />
              </div>
            </div>

            {/* Track */}
            <div className="w-full h-4 rounded-full bg-yellow-200/60 overflow-hidden">
              <motion.div
                key={replayKey3}
                initial={{ width: 0 }}
                animate={{ width: `${targetPct}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-yellow-500"
              />
            </div>
          </div>
        );
      })()}

    </div>
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

      {/* Map Feature Section */}
      <motion.section
        className="py-16 bg-white flex flex-col items-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        viewport={{ amount: 0.3 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-green-800">See Food Near You</h2>
        <p className="max-w-2xl text-center text-lg text-gray-700 mb-8">
          Claimants can view available food on a live map and claim what they need in real time. Our interactive dashboard makes it easy to find and request surplus food from nearby donors.
        </p>
        <div className="w-full flex justify-center">
          <div className="rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-3xl w-full bg-gray-50">
            <Image
              src="/ss.jpeg"
              alt="Map of available food feature screenshot"
              width={900}
              height={340}
              className="w-full h-auto object-cover"
              priority={false}
            />
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50 flex flex-col items-center">
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