"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white shadown py-5">
      <div className="container mx-auto px-4 py-3 flex justify-around items-center mb-0 mt-0">
        <div className="font-bold text-xl">
          <a href="/">FoodBites</a>
        </div>
        <div className="space-x-12">
          <a href="/" className="text-black text-lg hover:text-blue-600">Home</a>
          {user ? (
            <>
              <a href="/dashboard" className="text-black text-lg hover:text-blue-600">Dashboard</a>
              <a href="/profile" className="text-black text-lg hover:text-blue-600">Profile</a>
              <button onClick={handleLogout} className="text-red-600 text-lg hover:underline ml-2">Logout</button>
            </>
          ) : (
            <>
              <a href="/login" className="text-black text-lg hover:text-blue-600">Login</a>
              <a href="/signup" className="text-black text-lg hover:text-blue-600">Signup</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 