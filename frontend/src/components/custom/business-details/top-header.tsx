import { BusinessWithReviewCount } from "@/services/businesses";
import Image from "next/image";
import React from "react";
import { PenIcon, Loader2 } from "lucide-react";
import ReadOnlyStarRating from "./readonly-rating";
import { Sparkles } from "lucide-react";

interface TopHeaderProps {
  business: BusinessWithReviewCount;
  scrollHandler: () => void;
  onGenerateInsight: () => Promise<void>;
  isLoading: boolean;
  insight: string | null;
}

export default function TopHeader(props: TopHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Main Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex gap-5 items-start">
          <div className="w-[100px] h-[100px] relative shrink-0">
            <Image
              src={props.business.business.logo}
              alt={`${props.business.business.name} logo`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-md object-cover shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <h1 className="font-bold text-4xl text-gray-700">
              {props.business.business.name}
            </h1>
            <ReadOnlyStarRating
              averageRating={props.business.business.average_rating}
              totalReviews={props.business.reviews_count}
              starsMaxWidth={220}
              isLarge={true}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 w-[220px]">
          <button
            className="w-full flex gap-2 items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-300 text-white text-lg px-6 py-3 rounded-lg cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
            onClick={props.onGenerateInsight}
            disabled={props.isLoading}
          >
            {props.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Génération...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Aperçu rapide</span>
              </>
            )}
          </button>

          <button
            className="w-full flex gap-2 items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-white text-lg px-6 py-3 rounded-lg cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            onClick={props.scrollHandler}
          >
            <PenIcon className="w-4 h-4" />
            <span>Noter l'entreprise</span>
          </button>
        </div>
      </div>

      {/* Insight Section - Displayed below the business profile */}
      {props.insight && (
        <div className="w-full">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="font-semibold text-white text-sm">
                  Aperçu rapide
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-700 leading-relaxed">{props.insight}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
