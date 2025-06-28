"use client";

import { Business } from "@/services/businesses";
import ReviewCard, { Review } from "./review-card";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./star-rating";

interface ReviewsGridProps {
  business: Business;
}

export default function ReviewsGrid(props: ReviewsGridProps) {
  const { user, loading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  // Getting auth token to use in protected routes
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

  const fetchReviewsForBusiness = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get auth token to check user's votes
      const token = await getAuthToken();
      
      // Use the review_replies endpoint instead of the reviews endpoint
      const response = await fetch(
        `http://127.0.0.1:8000/review-replies/business/${props.business.business_id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews.");
      }
      const data = await response.json();
      
      // If user is logged in, fetch their votes to mark reviews they've voted on
      if (token && user) {
        try {
          const votesResponse = await fetch(
            `http://127.0.0.1:8000/user-votes?user_id=${user.user_id}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            }
          );
          
          if (votesResponse.ok) {
            const votesData = await votesResponse.json();
            // Mark reviews that the user has voted on
            const reviewsWithVoteStatus = data.map((reviewData: any) => ({
              ...reviewData,
              user_has_voted: votesData.some((vote: any) => vote.review_id === reviewData.review.review_id)
            }));
            setReviews(reviewsWithVoteStatus);
          } else {
            // If we can't get votes data, just use the reviews as-is
            setReviews(data);
          }
        } catch (voteErr) {
          console.error("Error fetching user votes:", voteErr);
          setReviews(data);
        }
      } else {
        // User not logged in, just use the reviews as-is
        setReviews(data);
      }
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!props.business.business_id) return;
    fetchReviewsForBusiness();
  }, [props.business.business_id]);

  const handleVote = async (reviewId: number, direction: number) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Tu doit être connecté pour voter");
        return;
      }

      // Optimistically update the UI
      setReviews(prevReviews => {
        return prevReviews.map(review => {
          if (review.review.review_id === reviewId) {
            const newCount = direction === 1 
              ? review.votes_count + 1 
              : Math.max(0, review.votes_count - 1);
            
            return {
              ...review,
              votes_count: newCount,
              user_has_voted: direction === 1 // Update the vote status based on direction
            };
          }
          return review;
        });
      });

      const response = await fetch("http://127.0.0.1:8000/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          review_id: reviewId,
          direction: direction
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit vote");
      }
      
      // Success toast based on action
      if (direction === 1) {
        toast.success("Vote added successfully");
      } else {
        toast.success("Vote removed successfully");
      }
      
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error.message || "An error occurred while voting");
      // Revert optimistic update by re-fetching the reviews
      fetchReviewsForBusiness();
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.review.rating);
    setEditTitle(review.review.review_title);
    setEditText(review.review.review_text);
    setIsEditDialogOpen(true);
  };

  const handleDeleteReview = (reviewId: number) => {
    setDeletingReviewId(reviewId);
    setIsDeleteDialogOpen(true);
  };

  const submitEditReview = async () => {
    if (!editingReview) return;

    // Validate form
    if (!editRating) {
      toast.error("Une note est requise");
      return;
    }
    if (!editTitle.trim() || editTitle.trim().length < 3) {
      toast.error("Le titre doit contenir au moins 3 caractères");
      return;
    }
    if (!editText.trim() || editText.trim().length < 10) {
      toast.error("L'avis doit contenir au moins 10 caractères");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      const response = await fetch(
        `http://127.0.0.1:8000/reviews/${editingReview.review.review_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: editRating,
            review_title: editTitle,
            review_text: editText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      toast.success("Avis mis à jour avec succès");
      setIsEditDialogOpen(false);
      // Refresh reviews
      await fetchReviewsForBusiness();
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Une erreur est survenue lors de la mise à jour de l'avis");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteReview = async () => {
    if (!deletingReviewId) return;

    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      const response = await fetch(`http://127.0.0.1:8000/reviews/${deletingReviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      toast.success("Avis supprimé avec succès");
      setIsDeleteDialogOpen(false);
      // Refresh reviews
      await fetchReviewsForBusiness();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Une erreur est survenue lors de la suppression de l'avis");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-5">
        <p>Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-5">
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <h3 className="font-bold text-3xl text-gray-800 mb-5">
        Ce que les autres disent
      </h3>
      {reviews.length === 0 && !isLoading ? (
        <p>Aucun avis pour cette entreprise pour le moment.</p>
      ) : (
        <div className="bg-[#f8f7f5] p-4 rounded-md columns-1 md:columns-2 gap-4 space-y-4 [&>*]:break-inside-avoid-column">
          {reviews.map((review) => (
            <ReviewCard
              key={review.review.review_id}
              review={review}
              currentUserId={user?.user_id || 0}
              onEdit={() => handleEditReview(review)}
              onDelete={() => handleDeleteReview(review.review.review_id)}
              onVote={handleVote}
            />
          ))}
        </div>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier votre avis</DialogTitle>
            <DialogDescription>
              Mettez à jour votre avis sur ce business.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <StarRating value={editRating} onChange={setEditRating} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="title"
                className="col-span-4"
                placeholder="Titre de l'avis"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Textarea
                id="review"
                className="col-span-4 h-20"
                placeholder="Votre avis"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button onClick={submitEditReview} disabled={isSubmitting}>
              {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Review Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer cet avis?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cet avis sera
              définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteReview}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
