import React from "react";

interface SkeletonLoaderProps {
  className?: string;
}

export default function SkeletonLoader({ className = "" }: SkeletonLoaderProps) {
  return (
    <div className={`relative overflow-hidden bg-neutral-200 dark:bg-neutral-800 rounded-lg ${className}`}>
      <div className="absolute inset-0 shimmer"></div>
    </div>
  );
}
