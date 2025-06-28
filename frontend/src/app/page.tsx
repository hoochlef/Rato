"use client";

import { useState } from "react";
import HomeTitle from "@/components/custom/home-components/home-title";
import SearchBar from "@/components/custom/home-components/searchbar";
import CategoriesSlider from "@/components/custom/home-components/categories-slider";
import BusinessCardGrid from "@/components/custom/home-components/business-cardgrid";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  return (
    <>
      <HomeTitle />
      <SearchBar />
      <CategoriesSlider
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <BusinessCardGrid activeCategory={activeCategory} />
    </>
  );
}
