import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 text-green-700">FoodBites</h1>
        <p className="text-lg sm:text-xl text-gray-700 font-medium">Waste Less, Feed More</p>
      </header>
      <section className="mb-10 max-w-xl text-center">
        <p className="text-gray-600 text-lg mb-6">
          FoodBites bridges the gap between food donors (restaurants, cafes, individuals) and claimants (NGOs, shelters), making food distribution efficient and impactful. Join us in reducing food waste and feeding communities in real time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded shadow text-lg transition">I am donating food</Link>
          <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded shadow text-lg transition">I am claiming food</Link>
          <Link href="/about" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded shadow text-lg transition">Learn More</Link>
        </div>
      </section>
      <footer className="mt-12 text-gray-400 text-sm">&copy; {new Date().getFullYear()} FoodBites. All rights reserved.</footer>
    </div>
  );
} 