"use client";

import { useState } from 'react';

interface ExpandableTextProps {
    text: string;
    maxLength: number;
}

export default function ExpandableText(props: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if text needs to be truncated
  const needsTruncation = props.text.length > props.maxLength;
  
  // Display full text or truncated version based on state
  const displayText = isExpanded || !needsTruncation 
    ? props.text 
    : props.text.slice(0, props.maxLength) + '...';
  
  return (
    <div className="font-semibold text-lg max-w-150">
      <p>{displayText}</p>
      
      {needsTruncation && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700 transition duration-300 font-medium mt-2 focus:outline-none cursor-pointer"
        >
          {isExpanded ? 'Lire moins' : 'Lire la suite'}
        </button>
      )}
    </div>
  );
}