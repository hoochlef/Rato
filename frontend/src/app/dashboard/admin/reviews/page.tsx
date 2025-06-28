"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import {Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ReviewInterface } from "@/types/review";
import { getReviewLabelFromMistral } from "@/services/AI_admin";
import { Badge } from "@/components/ui/badge";

export default function ReviewPage() {
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  //   Review states
  const [reviewsData, setReviewsData] = useState<ReviewInterface[]>([]);
  //   Delete review states
  const [reviewToDelete, setReviewToDelete] = useState<ReviewInterface | null>(
    null
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState<boolean>(false);
  // Labels for offensive or not offensive reviews
  const [reviewLabels, setReviewLabels] = useState<Record<number, string>>({});
  const [processingLabels, setProcessingLabels] = useState<Record<number, boolean>>({});

  //   Fetching Reviews
  const fetchReviews = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      const response = await fetch("http://127.0.0.1:8000/reviews/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      const data: ReviewInterface[] = await response.json();
      setReviewsData(data);
    } catch (e: any) {
      console.error("Failed to fetch Reviews:", e);
      setError(e.message);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Process all reviews with AI when data is loaded
  useEffect(() => {
    if (reviewsData.length > 0) {
      reviewsData.forEach((review) => {
        processReviewWithAI(review);
      });
    }
  }, [reviewsData]);

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

  // Handle delete Business
  const openDeleteConfirmDialog = (review: ReviewInterface) => {
    setReviewToDelete(review);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirmDialog = () => {
    setReviewToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) {
      console.error("No review selected for deletion.");
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/reviews/${reviewToDelete.Review.review_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete review");
      }

      await fetchReviews();
      closeDeleteConfirmDialog();
    } catch (e: any) {
      console.error("Failed to delete review:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (inputDate: string) => {
    const date = new Date(inputDate);
    const formatted = date.toISOString().split("T")[0];
    return formatted;
  };

  async function getResponseHandler(review: ReviewInterface) {
    return await getReviewLabelFromMistral(
      review.Review.review_title || "", 
      review.Review.review_text
    );
  }

  async function processReviewWithAI(review: ReviewInterface) {
    const reviewId = review.Review.review_id;
    
    // Skip if already processing or processed
    if (processingLabels[reviewId] || reviewLabels[reviewId]) {
      return;
    }
    
    // Mark as processing
    setProcessingLabels(prev => ({
      ...prev,
      [reviewId]: true
    }));
    
    try {
      const aiResponse = await getResponseHandler(review);
      console.log(`AI Response for review ${reviewId}:`, aiResponse);
      
      // Normalize the response by removing whitespace, punctuation and converting to lowercase
      const normalizedResponse = aiResponse?.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      
      // Check if the response is exactly "offensive" or starts with "offensive" (not "not offensive")
      const isOffensive = normalizedResponse === "offensive" || 
                        (normalizedResponse?.startsWith("offensive") && !normalizedResponse.includes("not offensive"));
      
      const normalizedLabel = isOffensive ? "offensive" : "not offensive";
      
      console.log(`Normalized response: "${normalizedResponse}" → Label: "${normalizedLabel}"`);
      
      // Store the result
      setReviewLabels(prev => ({
        ...prev,
        [reviewId]: normalizedLabel
      }));
    } catch (error) {
      console.error(`Error processing review ${reviewId}:`, error);
      setReviewLabels(prev => ({
        ...prev,
        [reviewId]: "unknown"
      }));
    } finally {
      // Mark as no longer processing
      setProcessingLabels(prev => ({
        ...prev,
        [reviewId]: false
      }));
    }
  }

  // Only show full page loading on initial fetch
  if (fetchLoading && reviewsData.length === 0) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[50vh]">
        <div className="text-2xl flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <span>Loading Reviews...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <span className="text-xl">&times;</span>
          </button>
        </div>
        <Button onClick={() => fetchReviews()} className="cursor-pointer">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {fetchLoading && reviewsData.length > 0 && (
        <div
          className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">Refreshing reviews data...</span>
          <div className="inline-block ml-2 h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reviews Management</h1>
      </div>

      <Table>
        <TableCaption>{`A list of all reviews (${reviewsData.length})`}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Review Title</TableHead>
            <TableHead>Review Text</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Date of creation</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Reviewer</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviewsData.map((review: ReviewInterface) => (
            <TableRow key={review.Review.review_id}>
              <TableCell>{review.Review.review_id}</TableCell>
              <TableCell className="font-medium">
                {review.Review.review_title}
              </TableCell>
              <TableCell className="max-w-[200px]">
                <div className="truncate" title={review.Review.review_text}>
                  {review.Review.review_text}
                </div>
              </TableCell>
              <TableCell>{review.Review.rating} Stars</TableCell>
              <TableCell>{formatDate(review.Review.created_at)}</TableCell>
              <TableCell>
                {processingLabels[review.Review.review_id] ? (
                  <div className="flex items-center">
                    <div className="h-3 w-3 mr-2 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : reviewLabels[review.Review.review_id] ? (
                  <Badge
                    variant={
                      reviewLabels[review.Review.review_id] === "offensive"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {reviewLabels[review.Review.review_id].charAt(0).toUpperCase() +
                      reviewLabels[review.Review.review_id].slice(1)}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </TableCell>
              <TableCell>{review.Review.reviewer.username}</TableCell>
              <TableCell>
                <Button
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteConfirmDialog(review)}
                  >
                    <Trash2 className="mr-1 h-4 w-4 " /> Delete Review
                  </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      {reviewToDelete && (
        <Dialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the review "
                {reviewToDelete.Review.review_title}"? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeDeleteConfirmDialog}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteReview}
                className="cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
