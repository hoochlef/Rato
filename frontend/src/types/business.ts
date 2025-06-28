import { Category } from "./category";

export interface Business {
  business_id: number;
  name: string;
  description: string;
  logo: string;
  number?: string;
  website?: string;
  created_at: string;
  average_rating: number;
  location: string;
  category_id: number;
  category?: Category;
  supervisor_id?: number;
}

export interface BusinessWithReviewCount {
  business: Business;
  reviews_count: number;
}
