"use client";

import { BusinessWithReviewCount } from "@/services/businesses";
import About from "@/components/custom/business-details/about";
import ContactInfo from "@/components/custom/business-details/contact-info";
import TopHeader from "@/components/custom/business-details/top-header";
import ReviewsSection from "@/components/custom/business-details/review-section";
import { useRef, useState, useEffect } from "react";
import ReviewsGrid from "@/components/custom/business-details/reviews-grid";
import { getBusinessInsightFromMistral } from "@/services/business_insights";
import { toast } from "sonner";

interface Review {
  review: {
    review_id: number;
    review_text: string;
    review_title: string | null;
    rating: number;
    created_at: string;
    user_id: number;
    business_id: number;
  };
  votes_count: number;
  user_has_voted: boolean;
}

export default function ClientBusinessPage({
  businessObject,
}: {
  businessObject: BusinessWithReviewCount;
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/review-replies/business/${businessObject.business.business_id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews.");
      }
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Erreur de chargement des avis");
    }
  };

  useEffect(() => {
    if (businessObject?.business?.business_id) {
      fetchReviews();
    }
  }, [businessObject.business.business_id]);

  const handleGenerateInsight = async () => {
    if (reviews.length === 0) {
      toast.error("Aucun avis disponible pour générer un aperçu");
      return;
    }

    const reviewTexts = reviews
      .map(
        (review) =>
          `${
            review.review.review_title ? review.review.review_title + ": " : ""
          }${review.review.review_text}`
      )
      .filter(Boolean);

    try {
      setIsLoading(true);
      const insight = await getBusinessInsightFromMistral(reviewTexts);
      if (insight) {
        setInsight(insight);
        toast.success("Aperçu rapide généré avec succès!");
      } else {
        throw new Error("Erreur de generation aperçu");
      }
    } catch (error) {
      console.error("Error generating insight:", error);
      toast.error("Erreur de generation aperçu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-10 bg-white border border-gray-200 rounded-md p-10">
      <TopHeader
        business={businessObject}
        scrollHandler={scrollToSection}
        onGenerateInsight={handleGenerateInsight}
        isLoading={isLoading}
        insight={insight}
      />
      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
      <About businessDesc={businessObject.business.description} />
      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
      <ContactInfo business={businessObject.business} />
      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
      <ReviewsSection
        business={businessObject.business}
        sectionRef={sectionRef}
      />
      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
      <ReviewsGrid business={businessObject.business} />
    </div>
  );
}
