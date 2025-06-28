"use client";

import { useHorizontalScroll } from "@/lib/client-utils";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useCategories } from "@/hooks/useCategories";
import CategoriesSliderSkeleton from "./skeleton-categories-slider";

interface CategoriesSliderProps {
  activeCategory: number | null;
  setActiveCategory: Dispatch<SetStateAction<number | null>>;
}

export default function CategoriesSlider(props: CategoriesSliderProps) {
  const { categories, loading } = useCategories();
  const { scrollRef, handlers } = useHorizontalScroll();

  // Set first category as active when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && props.activeCategory === null) {
      props.setActiveCategory(categories[0].category_id);
    }
  }, [categories, props]);

  const handleCategoryClick = (categoryId: number) => {
    props.setActiveCategory(categoryId);
  };

  if (loading) return <CategoriesSliderSkeleton />;

  return (
    <div className="relative w-full overflow-hidden mb-5">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto pb-4 hide-scrollbar cursor-grab active:cursor-grabbing"
        {...handlers}
      >
        <div className="flex gap-2 px-1">
          {categories.map((category) => (
            <button
              key={category.category_id}
              onClick={() => handleCategoryClick(category.category_id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 transition-all select-none cursor-pointer",
                props.activeCategory === category.category_id
                  ? "bg-gray-700 text-primary-foreground "
                  : "bg-background border border-input hover:bg-accent hover:text-accent-foreground transition duration-300"
              )}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
