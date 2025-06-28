import { MapPin, MessageSquareText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Business, BusinessWithReviewCount } from "@/services/businesses";
import ReadOnlyStarRating from "../business-details/readonly-rating";

export default function BusinessCard({ business, reviewsCount = 0 }: { business: Business, reviewsCount?: number }) {
  return (
    <Link
      href={`/business/${business.business_id}`}
      target="_blank"
      className="bg-white rounded-md p-5 shadow-md space-y-2 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex gap-2 items-center">
        <div className="w-[45px] h-[45px] relative shrink-0">
          <Image
            src={business.logo}
            alt={`${business.name} logo`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-md object-cover"
          />
        </div>
        <h2 className="font-semibold text-xl">{business.name}</h2>
      </div>
      <div className="flex gap-1 items-start">
        <MessageSquareText className="h-4 w-4 mt-1 shrink-0" />
        <p className="font-light line-clamp-2">{business.description}</p>
      </div>
      <div className="flex gap-1 items-center">
        <MapPin className="w-4 h-4" />
        <span className="">{business.location}</span>
      </div>
      <ReadOnlyStarRating
        averageRating={business.average_rating}
        totalReviews={reviewsCount}
        starsMaxWidth={140}
        isLarge={false}
      />
    </Link>
  );
}
