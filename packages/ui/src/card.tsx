import { type JSX, ReactNode } from "react";

interface CardProps {
  className?: string;
  title?: string;
  children: ReactNode;
  href?: string;
}

export function Card({
  className = "",
  title,
  children,
  href,
}: CardProps): JSX.Element {
  const baseClasses = "rounded-2xl border border-gray-200/50 bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300";
  
  if (href) {
    return (
      <a
        className={`${baseClasses} ${className} hover:scale-105 transform transition-all duration-300`}
        href={`${href}?utm_source=create-turbo&utm_medium=basic&utm_campaign=create-turbo`}
        rel="noopener noreferrer"
        target="_blank"
      >
        {title && <h2 className="text-lg font-semibold text-gray-900 mb-2">{title} <span className="text-indigo-600">→</span></h2>}
        <p className="text-gray-600">{children}</p>
      </a>
    );
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      {title && <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>}
      {children}
    </div>
  );
}
