import { BusinessWithReviewCount } from "@/services/businesses";
import BusinessCard from "./business-card";

export default function BusinessesGrid({ businesses }: { businesses: BusinessWithReviewCount[] }) {
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
