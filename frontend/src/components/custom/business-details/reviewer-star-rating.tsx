"use client";

import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

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

interface ReviewerStarRatingProps {
  userRating: number;
}

export default function ReviewerStarRating(props: ReviewerStarRatingProps) {
  return (
    <div className="flex items-center space-x-1">
      <Rating
        value={props.userRating}
        itemStyles={customStyles}
        spaceBetween="medium"
        spaceInside="medium"
        transition="colors"
        readOnly
        halfFillMode="box"
        className="flex-shrink-0"
        style={{ maxWidth: 140 }}
      />
    </div>
  );
}
