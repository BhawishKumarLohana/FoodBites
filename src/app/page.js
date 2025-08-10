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
  { name: "Bhawish Kumar", fact: "I Code and Do Model United Nations!!", avatar:"/BK.jpg" },
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

const card = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
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
  transition={{ type: "tween", duration: 0.8, ease: "easeOut" }}
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
        const targetPct = 60; // visual share
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
                initial={{ width: "0%" }}
                animate={{ width: `${targetPct}%` }}
                transition={{ type: "tween", duration: 0.8, ease: "easeOut" }}
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
                initial={{ width: "0%" }}
                animate={{ width: `${targetPct}%` }}
                transition={{ type: "tween", duration: 0.8, ease: "easeOut" }}
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
                initial={{ width: "0%" }}
                animate={{ width: `${targetPct}%` }}
                transition={{ type: "tween", duration: 0.8, ease: "easeOut" }}
                className="h-full bg-yellow-500"
              />
            </div>
          </div>
        );
      })()}

    </div>
  </div>
</motion.section>



<motion.section
  className="py-16 bg-gray-50 flex flex-col items-center"
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  viewport={{ once: true, amount: 0.3 }}
>
  <h2 className="text-3xl font-bold mb-6 text-green-800">How FoodBites Works</h2>

  <div className="max-w-3xl text-center text-lg text-gray-700 mb-12 px-6">
    <p>
      FoodBites connects restaurants, cafes, and individuals with surplus food to NGOs and shelters in real time.
      Donors can quickly list available food, and claimants can browse and claim what they need. Our platform ensures
      efficient, safe, and impactful food distribution—zero waste, more full plates.
    </p>
  </div>

  {/* Wheel container */}
  <div className="relative mx-auto w-[360px] h-[360px] sm:w-[420px] sm:h-[420px]">

    {/* Rotating wheel (no image) */}
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
      aria-hidden="true"
    >
      <div className="w-64 h-64 rounded-full border-[14px] border-green-300 border-t-transparent shadow-inner" />
    </motion.div>

    {/* Optional dotted connectors */}
    <svg
      className="absolute inset-0 pointer-events-none"
      viewBox="0 0 420 420"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* center */}
      <circle cx="210" cy="210" r="3" fill="rgba(16,185,129,0.9)" />
      {/* to Step 1 (top) */}
      <line x1="210" y1="210" x2="210" y2="40" stroke="rgba(16,185,129,0.5)" strokeWidth="2" strokeDasharray="6 6" />
      {/* to Step 2 (left) */}
      <line x1="210" y1="210" x2="60" y2="210" stroke="rgba(59,130,246,0.5)" strokeWidth="2" strokeDasharray="6 6" />
      {/* to Step 3 (bottom-right) */}
      <line x1="210" y1="210" x2="360" y2="360" stroke="rgba(234,179,8,0.5)" strokeWidth="2" strokeDasharray="6 6" />
    </svg>

    {/* Step chips around the wheel */}
    {/* Top (Step 1) */}
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 -top-6"
      initial={{ opacity: 0, y: -12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      viewport={{ once: true, amount: 0.4 }}
    >
      <div className="rounded-xl bg-white shadow-lg ring-1 ring-green-200 px-4 py-3 text-center">
        <div className="text-xs font-semibold text-green-700">Step 1</div>
        <div className="text-sm font-medium text-gray-800">Sign Up</div>
      </div>
    </motion.div>

    {/* Left middle (Step 2) */}
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 -left-6"
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.08 }}
      viewport={{ once: true, amount: 0.4 }}
    >
      <div className="rounded-xl bg-white shadow-lg ring-1 ring-blue-200 px-4 py-3 text-center">
        <div className="text-xs font-semibold text-blue-700">Step 2</div>
        <div className="text-sm font-medium text-gray-800">List or Claim</div>
      </div>
    </motion.div>

    {/* Bottom-right (Step 3) */}
    <motion.div
      className="absolute -bottom-6 -right-6"
      initial={{ opacity: 0, x: 12, y: 12 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.45, delay: 0.16 }}
      viewport={{ once: true, amount: 0.4 }}
    >
      <div className="rounded-xl bg-white shadow-lg ring-1 ring-yellow-200 px-4 py-3 text-center">
        <div className="text-xs font-semibold text-yellow-700">Step 3</div>
        <div className="text-sm font-medium text-gray-800">Make an Impact</div>
      </div>
    </motion.div>
  </div>
</motion.section>







     {/* Map Feature Section */}
<motion.section
  className="relative py-16 bg-white flex flex-col items-center overflow-hidden"
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
  viewport={{ amount: 0.3, once: true }}
>
  {/* soft glow */}
  <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]" />

  <h2 className="text-3xl font-bold mb-4 text-green-800">See Food Near You</h2>

  <p className="max-w-2xl text-center text-lg text-gray-700 mb-10 px-6">
    Claimants can view available food on a live map and claim what they need in real time.
    Our interactive dashboard makes it easy to find and request surplus food from nearby donors.
  </p>

  <div className="w-full flex justify-center px-6">
    <motion.div
      className="relative group w-full max-w-5xl"
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.4 }}
    >
      {/* gradient border */}
      <div className="rounded-3xl p-[1px] bg-gradient-to-br from-green-300/60 via-emerald-200/40 to-blue-300/60 shadow-2xl">
        <div className="relative rounded-3xl overflow-hidden bg-white">
          {/* live pill */}
          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            Live
          </span>

          {/* mock toolbar */}
          <div className="absolute right-4 top-4 z-10 hidden sm:flex gap-2">
            <span className="rounded-md bg-white/80 px-2 py-1 text-[11px] text-gray-700 shadow">Filters</span>
            <span className="rounded-md bg-white/80 px-2 py-1 text-[11px] text-gray-700 shadow">Distance</span>
          </div>

          {/* image */}
          <Image
            src="/ss.jpeg"
            alt="Map of available food feature screenshot"
            width={1600}
            height={900}
            className="w-full h-auto object-cover aspect-[16/9]"
            priority={false}
          />
        </div>
      </div>

      {/* footer meta + CTA */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Real-time updates
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-blue-800">
            Nearby donors
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">
            One-tap claim
          </span>
        </div>

        <motion.a
          href="/map"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0, scale: 0.98 }}
          className="inline-flex items-center rounded-full bg-green-600 px-5 py-2 font-semibold text-white shadow hover:bg-green-700"
        >
          Open Live Map →
        </motion.a>
      </div>
    </motion.div>
  </div>
</motion.section>


{/* Team Section */}
<section className="relative py-16 bg-gray-50 flex flex-col items-center overflow-hidden">
  <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_50%_-10%,rgba(16,185,129,0.10),transparent_60%)]" />
  <h2 className="text-3xl font-bold mb-8 text-green-800">Meet the Team</h2>

  <motion.div
    className="flex flex-wrap gap-8 justify-center px-6"
    variants={container}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
  >
    {TEAM_MEMBERS.map((member) => (
      <motion.div
        key={member.name}
        variants={card}
        whileHover={{ y: -6 }}
        transition={{ type: "tween", duration: 0.18 }}
        className="group flex flex-col items-center bg-white rounded-2xl p-6 w-60 shadow-xl border border-transparent transition-all hover:shadow-2xl hover:border-green-300"
      >
        {/* Avatar (photo if provided, otherwise initials) */}
        <div className="relative mb-4">
          <div className="h-16 w-16 rounded-full p-[2px] bg-gradient-to-br from-green-400 to-emerald-500 shadow">
            <div className="h-full w-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              {member.avatar ? (
                <Image
                  src={member.avatar}                 // string path or imported image
                  alt={`${member.name} profile photo`}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover rounded-full"
                  priority={false}
                />
              ) : (
                <span className="text-green-700 font-bold">
                  {member.name?.[0] ?? "•"}
                </span>
              )}
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
        </div>

        <div className="text-lg font-semibold mb-1 text-green-900 text-center">
          {member.name}
        </div>

        <p className="text-sm text-gray-600 text-center min-h-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {member.fact}
        </p>
      </motion.div>
    ))}
  </motion.div>
</section>

      <footer className="mt-8 mb-4 text-gray-400 text-sm text-center">&copy; {new Date().getFullYear()} FoodBites. All rights reserved.</footer>
    </div>
  );
} 