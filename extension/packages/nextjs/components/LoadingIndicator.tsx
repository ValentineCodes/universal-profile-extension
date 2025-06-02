import React from "react";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
}

export default function LoadingIndicator({ size = "md" }: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border",
    md: "w-5 h-5 border-2",
    lg: "w-6 h-6 border-2",
  };

  return <div className={`${sizeClasses[size]} border-slate-300 border-t-slate-700 rounded-full animate-spin`}></div>;
}
