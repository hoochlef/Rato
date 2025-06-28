"use client";
import { Business, BusinessWithReviewCount } from "@/services/businesses";
import BusinessCard from "./business-card";
import { useBusinessesByCategory } from "@/hooks/useBusinesses";
import BusinessCardGridSkeleton from "./skeleton-business-cardgrid";

interface BusinessCardGridProps {
  activeCategory: number | null;
}

export default function BusinessCardGrid(props: BusinessCardGridProps) {
  const { businesses, loading} = useBusinessesByCategory(props.activeCategory);

  if (loading) return <BusinessCardGridSkeleton/>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {businesses.map((businessItem: BusinessWithReviewCount) => (
        <BusinessCard 
          key={businessItem.business.business_id} 
          business={businessItem.business}
          reviewsCount={businessItem.reviews_count}
        />
      ))}
    </div> 
  );
}