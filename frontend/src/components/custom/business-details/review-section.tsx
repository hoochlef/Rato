"use client";

import { RefObject, useState } from "react";
import StarRating from "./star-rating";
import { Business } from "@/services/businesses";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface ReviewsSectionProps {
  sectionRef: RefObject<HTMLDivElement | null>;
  business: Business;
}

interface FormErrors {
  rating?: string;
  title?: string;
  review?: string;
  confirm?: string;
}

export default function ReviewsSection(props: ReviewsSectionProps) {
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isConfirmed, setIsConfirmed] = useState(false);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/auth/token");
      if (!response.ok) return null;
      const data = await response.json();
      return data.token || null;
    } catch (error) {
      console.error("Error fetching auth token:", error);
      return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!rating) {
      newErrors.rating = "Une note est requise";
    }

    if (!reviewTitle.trim()) {
      newErrors.title = "Un titre est requis";
    } else if (reviewTitle.trim().length < 3) {
      newErrors.title = "Le titre doit contenir au moins 3 caractères";
    }

    if (!reviewText.trim()) {
      newErrors.review = "Un avis est requis";
    } else if (reviewText.trim().length < 10) {
      newErrors.review = "L'avis doit contenir au moins 10 caractères";
    }

    if (!isConfirmed) {
      newErrors.confirm = "Veuillez confirmer que votre avis est authentique.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitReview = async () => {
    const token = await getAuthToken();
    if (!token) {
      toast.error("Tu doit être connecté pour envoyer un avis");
      return;
    }
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/reviews/submit-review`, {
        method: "POST",
        body: JSON.stringify({
          business_id: props.business.business_id,
          rating,
          review_title: reviewTitle,
          review_text: reviewText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review.");
      }
      toast.success("Votre avis a été envoyé avec succès!");

      // Reset all form fields
      setRating(0);
      setReviewTitle("");
      setReviewText("");
      setIsConfirmed(false);
      setErrors({});
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Une erreur est survenue lors de l'envoi de votre avis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2" ref={props.sectionRef}>
      <h2 className="font-bold text-3xl text-gray-800">
        Noter {props.business.name}
      </h2>
      <div className="mt-7 flex flex-col items-center gap-2">
        <StarRating value={rating} onChange={setRating} />
        {errors.rating && (
          <span className="text-red-500 text-sm">{errors.rating}</span>
        )}
      </div>
      <div className="mt-6 grid w-full gap-2">
        <div>
          <Input
            type="text"
            placeholder="Titre de l'avis"
            className={`${errors.title ? "border-red-500" : ""}`}
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
          />
          {errors.title && (
            <span className="text-red-500 text-sm">{errors.title}</span>
          )}
        </div>
        <div>
          <Textarea
            className={`h-20 ${errors.review ? "border-red-500" : ""}`}
            placeholder="Content."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          {errors.review && (
            <span className="text-red-500 text-sm">{errors.review}</span>
          )}
        </div>
        <div className="">
          <div
            className={`flex items-start space-x-3 p-2 rounded-md ${
              errors.confirm ? "border border-red-500" : ""
            }`}
          >
            <Checkbox
              id="confirmation"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(!!checked)}
              className="mt-0.5"
            />
            <label
              htmlFor="confirmation"
              className="text-sm font-medium leading-snug text-gray-700"
            >
              Je confirme que cet avis reflète une interaction réelle avec
              l’entreprise.
            </label>
          </div>
          {errors.confirm && (
            <p className="text-sm text-red-500 mt-1">{errors.confirm}</p>
          )}
        </div>

        <Button
          className="cursor-pointer bg-blue-500 hover:bg-blue-700 transition duration-300 py-5 text-lg font-semibold"
          onClick={handleSubmitReview}
          disabled={loading}
        >
          {loading ? "Envoi en cours..." : "Envoyer l'avis"}
        </Button>
      </div>
    </div>
  );
}
