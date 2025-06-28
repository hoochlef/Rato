import apiClient from "@/lib/api-client";

export interface Business {
  business_id: number;
  name: string;
  description: string;
  average_rating: number;
  location: string;
  website: string;
  number: string; 
  logo: string;
  category_id: number;
  supervisor_id?: number;
  category?: {
    name: string;
    description?: string;
    icon: string;
  };
}

export interface BusinessWithReviewCount {
  business: Business;
  reviews_count: number;
}

export const getAllBusinesses = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<BusinessWithReviewCount[]> => apiClient.get("/businesses", { params });


export const getBusinessesByCategory = async (
  categoryId: number | null,
  params?: { limit?: number; offset?: number }
): Promise<BusinessWithReviewCount[]> => {
  if (categoryId === null) {
    return Promise.resolve([]);
  }
  return apiClient.get(`/businesses/category/${categoryId}`, { params });
};

export const getBusinessById = async (id: number | string): Promise<BusinessWithReviewCount> =>
  apiClient.get(`/businesses/${id}`);

// Helper function to extract just the business from BusinessWithReviewCount
export const extractBusiness = (businessWithCount: BusinessWithReviewCount): Business & { reviews_count: number } => ({
  ...businessWithCount.business,
  reviews_count: businessWithCount.reviews_count
});
