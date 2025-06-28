"use client";

import React, { useId } from 'react';

interface StarIconProps {
  fillPercentage: number; // Value between 0 and 100
  size?: number;
  className?: string;
}

const StarIcon: React.FC<StarIconProps> = ({ fillPercentage, size = 16, className = '' }) => {
  const id = useId();
  const gradientId = `starGradient-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId}>
          <stop offset={`${fillPercentage}%`} stopColor="#FACC15" />
          <stop offset={`${fillPercentage}%`} stopColor="#E5E7EB" />
        </linearGradient>
      </defs>
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
};

export default StarIcon;

