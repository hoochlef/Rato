"use client";

import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { Dispatch, SetStateAction, useState, useEffect } from "react";

const Star = (
  <path d="M62 25.154H39.082L32 3l-7.082 22.154H2l18.541 13.693L13.459 61L32 47.309L50.541 61l-7.082-22.152L62 25.154z" />
); // Source: https://www.svgrepo.com/svg/353297/star

const customStyles = {
  itemShapes: Star,
  boxBorderWidth: 2,

  activeFillColor: ["#FEE2E2", "#FFEDD5", "#FEF9C3", "#ECFCCB", "#D1FAE5"],
  activeBoxColor: ["#da1600", "#db711a", "#dcb000", "#61bb00", "#009664"],
  activeBoxBorderColor: ["#c41400", "#d05e00", "#cca300", "#498d00", "#00724c"],

  inactiveFillColor: "white",
  inactiveBoxColor: "#dddddd",
  inactiveBoxBorderColor: "#a8a8a8",
};

const CUSTOM_GROUP_LABEL_ID = "group_label";

const CUSTOM_ITEM_LABELS = [
  "Mauvais",
  "Médiocre",
  "Moyen",
  "Très bon",
  "Excellent",
];
const CUSTOM_ITEM_LABELS_IDS = [
  "label_1",
  "label_2",
  "label_3",
  "label_4",
  "label_5",
];

interface StarRatingProps {
  onChange: Dispatch<SetStateAction<number>>;
  value?: number; // Add this prop
}

export default function StarRating(props: StarRatingProps) {
  const [rating, setRating] = useState(props.value || 0);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    props.onChange(newRating);
  };

  // Update rating when value prop changes
  useEffect(() => {
    setRating(props.value || 0);
  }, [props.value]);

  return (
    <div role="group" style={{ maxWidth: 450 }}>
      <Rating
        value={rating}
        itemStyles={customStyles}
        onChange={handleRatingChange}
        visibleLabelId={CUSTOM_GROUP_LABEL_ID}
        visibleItemLabelIds={CUSTOM_ITEM_LABELS_IDS}
        spaceBetween="medium"
        spaceInside="medium"
        transition="colors"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          justifyItems: "center",
        }}
      >
        {CUSTOM_ITEM_LABELS.map((label, index) => (
          <span
            key={label}
            id={CUSTOM_ITEM_LABELS_IDS[index]}
            style={{
              opacity: index + 1 === rating ? 1 : 0.35,
              textDecoration: index + 1 === rating ? "underline" : "inherit",
              padding: "0 5%",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
