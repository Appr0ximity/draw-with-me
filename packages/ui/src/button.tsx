"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  appName?: string;
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = ({ 
  children, 
  className = "", 
  appName, 
  variant = "default",
  size = "md",
  ...props 
}: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-95";
  
  const variantClasses = {
    default: "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl focus-visible:ring-indigo-200",
    outline: "border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md focus-visible:ring-gray-200"
  };
  
  const sizeClasses = {
    sm: "h-8 px-3 text-sm rounded-lg",
    md: "h-10 px-4 py-2 rounded-lg",
    lg: "h-12 px-6 text-lg rounded-xl"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (appName && !props.onClick) {
      alert(`Hello from your ${appName} app!`);
    } else if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
