"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      const trimmedQuery = query.trim();
      if (trimmedQuery) {
        router.push(`/search?query=${encodeURIComponent(trimmedQuery)}`);
      } else {
        console.log("Search query is empty.");
      }
    }
  };

  return (
    <div className="py-7 mb-5 max-w-3xl mx-auto">
      <div className="relative bg-white rounded-full shadow-md hover:shadow-lg p-4">
        <div className="flex items-center">
          <Search className="text-[#939393] mr-2" size={20} />
          <input
            type="text"
            placeholder="Rechercher une entreprise"
            className="w-full text-lg outline-none placeholder-gray-500 bg-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
}
