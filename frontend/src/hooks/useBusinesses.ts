import { useState, useEffect } from "react";
import {
  Business,
  BusinessWithReviewCount,
  getBusinessesByCategory,
  getAllBusinesses,
  extractBusiness
} from "@/services/businesses";

export function useBusinessesByCategory(categoryId: number | null) {
  const [businesses, setBusinesses] = useState<BusinessWithReviewCount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryId === null) {
      setBusinesses([]);
      return;
    }

    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const data = await getBusinessesByCategory(categoryId);
        setBusinesses(data);
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [categoryId]);

  return { businesses, loading };
}

export function useBusinessesBySearch(query: string | null) {
  const [businesses, setBusinesses] = useState<BusinessWithReviewCount[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!query) {
      setBusinesses([]);
      return;
    }
    
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const data = await getAllBusinesses({ search: query });
        setBusinesses(data);
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinesses();
  }, [query]);
  
  return { businesses, loading };
}
