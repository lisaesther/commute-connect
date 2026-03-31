"use client";

import { useState } from "react";

export default function Home() {
  // These variables hold the data the user types into the form
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  // This function runs when the user clicks "Search"
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from reloading
    console.log("Search Data Submitted:", { origin, destination, date });
    alert(
      `Searching for rides from ${origin} to ${destination} on ${date}! (Check your browser console for the data)`,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm p-4 border-b">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">
            CommuteConnect Ireland
          </h1>
          <div className="space-x-4">
            <button className="text-gray-600 hover:text-blue-600 font-medium">
              Login
            </button>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors">
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-4 mt-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Share your journey, save your money.
          </h2>
          <p className="text-lg text-gray-600">
            Smart carpooling for Irish commuters. Find your route today.
          </p>
        </div>

        {/* Interactive Search Component */}
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="Leaving from (e.g. Maynooth)"
              className="flex-1 p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Going to (e.g. Dublin)"
              className="flex-1 p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
            <input
              type="date"
              className="flex-1 p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 font-bold transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
