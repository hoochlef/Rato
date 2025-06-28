export interface ReviewInterface {
  Review: Review;
  votes_count: number;
  label: "offensive" | "not offensive";
}

export interface Review {
  review_id: number;
  user_id: number;
  business_id: number;
  rating: number;
  review_text: string;
  review_title: string | null;
  created_at: string;
  reviewer: Reviewer;
}

interface Reviewer {
  username: string;
  email: string;
  role: string;
}
