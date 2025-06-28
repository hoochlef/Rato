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
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Review } from "@/types/review";
import { Reply, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { getReviewLabelFromMistral } from "@/services/AI_supervisor";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function FeedbackPage() {
  // Loading and error states
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  //   reviews states
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  // Filter states
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  //   reply satate
  const [replyText, setReplyText] = useState<string>("");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  // Labels for offensive or not offensive reviews
  const [reviewLabels, setReviewLabels] = useState<Record<number, string>>({});
  const [processingLabels, setProcessingLabels] = useState<
    Record<number, boolean>
  >({});

  //   Mistral config *****************
  async function getResponseHandler(review: Review) {
    return await getReviewLabelFromMistral(
      review.review_title || "",
      review.review_text
    );
  }

  async function processReviewWithAI(review: Review) {
    const reviewId = review.review_id;

    // Skip if already processing or processed
    if (processingLabels[reviewId] || reviewLabels[reviewId]) {
      return;
    }

    // Mark as processing
    setProcessingLabels((prev) => ({
      ...prev,
      [reviewId]: true,
    }));

    try {
      const aiResponse = await getResponseHandler(review);
      console.log(`AI Response for review ${reviewId}:`, aiResponse);

      // Normalize the response by removing whitespace, punctuation and converting to lowercase
      const normalizedResponse = aiResponse
        ?.toLowerCase()
        .trim()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

      // Check if the response is exactly "offensive" or starts with "offensive" (not "not offensive")
      const isOffensive =
        normalizedResponse === "urgent" ||
        (normalizedResponse?.startsWith("urgent") &&
          !normalizedResponse.includes("not urgent"));

      const normalizedLabel = isOffensive ? "urgent" : "not urgent";

      console.log(
        `Normalized response: "${normalizedResponse}" → Label: "${normalizedLabel}"`
      );

      // Store the result
      setReviewLabels((prev) => ({
        ...prev,
        [reviewId]: normalizedLabel,
      }));
    } catch (error) {
      console.error(`Error processing review ${reviewId}:`, error);
      setReviewLabels((prev) => ({
        ...prev,
        [reviewId]: "unknown",
      }));
    } finally {
      // Mark as no longer processing
      setProcessingLabels((prev) => ({
        ...prev,
        [reviewId]: false,
      }));
    }
  }

  // Process all reviews with AI when data is loaded
  useEffect(() => {
    if (reviewsData.length > 0) {
      reviewsData.forEach((review) => {
        processReviewWithAI(review);
      });
    }
  }, [reviewsData]);

  // Filter reviews based on urgency state and date
  useEffect(() => {
    let filtered = [...reviewsData];

    // Apply urgency filter
    if (urgencyFilter !== "all") {
      filtered = filtered.filter((review) => {
        return reviewLabels[review.review_id] === urgencyFilter;
      });
    }

    // Apply date filter if set
    if (dateFilter) {
      filtered = filtered.filter((review) => {
        // Format the review date to YYYY-MM-DD for comparison
        const reviewDate = formatDate(review.created_at);
        return reviewDate === dateFilter;
      });
    }

    setFilteredReviews(filtered);
  }, [reviewsData, reviewLabels, urgencyFilter, dateFilter]);

  // *****************

  // helper function to format date
  const formatDate = (inputDate: string) => {
    const date = new Date(inputDate);
    const formatted = date.toISOString().split("T")[0];
    return formatted;
  };

  // Getting auth token to use in protected routes
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/auth/token");
      if (!response.ok) return null;
      const data = await response.json();
      return data.token || null;
    } catch (e: any) {
      console.error("Error fetching auth token:", e);
      return null;
    }
  };

  //   Fetching Reviews
  const fetchReviews = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      const response = await fetch(
        "http://127.0.0.1:8000/review-replies/supervisor/reviews",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      const data: Review[] = await response.json();
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

  // reply Creation
  const handleReplyToReview = async () => {
    if (!editingReview) {
      console.error("No review selected to reply to.");
      return;
    }
    setFormError(null);

    // Validate inputs
    if (replyText.trim().length < 20) {
      setFormError("The reply must be at least 20 characters long.");
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      const response = await fetch(
        `http://127.0.0.1:8000/review-replies/reviews/${editingReview.review_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            reply_text: replyText,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to create reply to this review"
        );
      }

      await fetchReviews();
      setIsDialogOpen(false);
      setReplyText("");
    } catch (e: any) {
      console.error("Failed to reply to review:", e);
      setFormError(e.message);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="container mx-aut ">
      {fetchLoading && reviewsData.length > 0 && (
        <div
          className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">Refreshing reviews data...</span>
          <div className="inline-block ml-2 h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">Customers Feedback</h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="urgency-filter" className="text-sm font-medium">
            Filter by urgency:
          </label>
          <select
            id="urgency-filter"
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="border rounded-md p-2 text-sm"
          >
            <option value="all">All Reviews</option>
            <option value="urgent">Urgent</option>
            <option value="not urgent">Not Urgent</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="date-filter"
            className="text-sm font-medium flex items-center"
          >
            <Calendar className="h-4 w-4 mr-1" /> Filter by date:
          </label>
          <Input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded-md p-2 text-sm w-auto"
          />
          {dateFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDateFilter("")}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <Table>
        <TableCaption>
          {`${
            urgencyFilter === "all"
              ? "All reviews"
              : urgencyFilter === "urgent"
              ? "Urgent reviews"
              : "Non-urgent reviews"
          }${dateFilter ? ` from ${dateFilter}` : ""} (${
            filteredReviews.length
          })`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Review Title</TableHead>
            <TableHead>Review Text</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Date of creation</TableHead>
            <TableHead>State of Urgency</TableHead>
            <TableHead>Reviewer</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReviews.map((review: Review) => (
            <TableRow key={review.review_id}>
              <TableCell>{review.review_id}</TableCell>
              <TableCell className="font-medium">
                {review.review_title}
              </TableCell>
              <TableCell className="max-w-[200px]">
                <div className="truncate" title={review.review_text}>
                  {review.review_text}
                </div>
              </TableCell>
              <TableCell>{review.rating} Stars</TableCell>
              <TableCell>{formatDate(review.created_at)}</TableCell>
              <TableCell>
                {processingLabels[review.review_id] ? (
                  <div className="flex items-center">
                    <div className="h-3 w-3 mr-2 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : reviewLabels[review.review_id] ? (
                  <Badge
                    variant={
                      reviewLabels[review.review_id] === "urgent"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {reviewLabels[review.review_id].charAt(0).toUpperCase() +
                      reviewLabels[review.review_id].slice(1)}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </TableCell>
              <TableCell>{review.reviewer.username}</TableCell>
              <TableCell>
                <Button
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyText("");
                    setEditingReview(review);
                    setIsDialogOpen(true);
                  }}
                >
                  <Reply className="mr-1 h-4 w-4 " /> Reply
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* reply to review dialog */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reply to review</DialogTitle>
              <DialogDescription>
                Write a reply to this customer
              </DialogDescription>
            </DialogHeader>
            {formError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{formError}</span>
              </div>
            )}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="add-reply" className="text-right">
                Reply Text
              </Label>
              <Textarea
                id="add-reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingReview(null);
                  setFormError(null);
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReplyToReview}
                className="cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Submitting reply...
                  </>
                ) : (
                  "Submit reply"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
