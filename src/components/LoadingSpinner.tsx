import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-transparent border-t-primary-start border-r-primary-end rounded-full animate-gradient-spin shadow-lg shadow-primary-start/20"></div>
    </div>
  );
}
