import Image from "next/image";
import Link from "next/link";

export default function Home() {
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
            <Link href="/signup" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded shadow text-lg transition">I am donating food</Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded shadow text-lg transition">I am claiming food</Link>
          </div>
          <Link href="#impact" className="inline-block mt-2 text-green-700 underline font-semibold">Learn More ↓</Link>
        </div>
      </section>

      {/* Impact Stats */}
      <section id="impact" className="py-16 bg-white flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-8 text-green-800">Our Impact (So Far)</h2>
        <p className="mb-8 text-lg text-gray-700 text-center">Globally, around 300 million tons of food is wasted every year.</p>
        <div className="flex flex-wrap gap-8 justify-center">
          <div className="bg-green-100 rounded-lg p-6 shadow text-center min-w-[160px]">
            <div className="text-4xl font-extrabold text-green-700 mb-2">1,200+</div>
            <div className="text-gray-700">Meals Donated</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-6 shadow text-center min-w-[160px]">
            <div className="text-4xl font-extrabold text-blue-700 mb-2">30+</div>
            <div className="text-gray-700">NGOs/Shelters Helped</div>
          </div>
          <div className="bg-yellow-100 rounded-lg p-6 shadow text-center min-w-[160px]">
            <div className="text-4xl font-extrabold text-yellow-700 mb-2">5,000kg</div>
            <div className="text-gray-700">Food Saved</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-6 text-green-800">How FoodBites Works</h2>
        <div className="max-w-3xl text-center text-lg text-gray-700 mb-8">
          <p>FoodBites connects restaurants, cafes, and individuals with surplus food to NGOs and shelters in real time. Donors can quickly list available food, and claimants can browse and claim what they need. Our platform ensures efficient, safe, and impactful food distribution—zero waste, more full plates.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          <div className="bg-white rounded-lg shadow p-6 w-72">
            <h3 className="text-xl font-semibold mb-2 text-green-700">1. Sign Up</h3>
            <p>Register as a donor or claimant. It's free and takes less than a minute.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 w-72">
            <h3 className="text-xl font-semibold mb-2 text-green-700">2. List or Claim Food</h3>
            <p>Donors post available food. Claimants browse and claim what they need.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 w-72">
            <h3 className="text-xl font-semibold mb-2 text-green-700">3. Make an Impact</h3>
            <p>Coordinate pickup and help reduce waste while feeding communities.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-8 text-green-800">Meet the Team</h2>
        <div className="flex flex-wrap gap-8 justify-center">
          <div className="flex flex-col items-center bg-gray-100 rounded-lg p-6 shadow w-60">
            <div className="text-lg font-semibold">Ayman Jashim</div>
          </div>
          <div className="flex flex-col items-center bg-gray-100 rounded-lg p-6 shadow w-60">
            <div className="text-lg font-semibold">Bhawish Kumar Lohana</div>
          </div>
          <div className="flex flex-col items-center bg-gray-100 rounded-lg p-6 shadow w-60">
            <div className="text-lg font-semibold">Bibinur Adikhan</div>
          </div>
          <div className="flex flex-col items-center bg-gray-100 rounded-lg p-6 shadow w-60">
            <div className="text-lg font-semibold">Habibul Bashar</div>
          </div>
        </div>
      </section>

      <footer className="mt-8 mb-4 text-gray-400 text-sm text-center">&copy; {new Date().getFullYear()} FoodBites. All rights reserved.</footer>
    </div>
  );
} 