"use client"

import { useBusinessesBySearch } from "@/hooks/useBusinesses";
import { useSearchParams } from "next/navigation";
import BusinessesGrid from "@/components/custom/seach-page/businesses-grid";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const { businesses, loading } = useBusinessesBySearch(query);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="py-10 font-medium text-xl">Search Results for "{query}"</h1>
      {businesses.length > 0 ? (
        <BusinessesGrid businesses={businesses} />
      ) : (
        <p>No results found.</p>
      )}
      
    </div>
  );
}
