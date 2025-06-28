import apiClient from "@/lib/api-client";

export interface Category {
  category_id: number;
  name: string;
  description: string | null;
  icon: string;
}

export const getAllCategories = async (): Promise<Category[]> => {
  return apiClient.get("/categories");
};
