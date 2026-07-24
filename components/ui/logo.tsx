import React from "react";
import styles from "./logo.module.css";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 40, 
  showText = true,
  iconOnly = false 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-xl bg-[var(--sys-primitive-color-collection-key-color-group-primary-key-color)] shadow-lg shadow-blue-500/10 w-10 h-10"
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[65%] h-[65%]"
        >
          {/* Signal Pulse Design - Consistent with Tone & Speed tokens */}
          <circle cx="6" cy="20" r="4" fill="white" />
          <path
            d="M14 12C16.6667 14.6667 18 17.3333 18 20C18 22.6667 16.6667 25.3333 14 28"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M22 8C26 12 28 16 28 20C28 24 26 28 22 32"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M30 4C36 10 38 15 38 20C38 25 36 30 30 36"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </div>
      {!iconOnly && showText && (
        <span className={`tracking-tight ${styles.logoText}`}>
          Send Signal
        </span>
      )}
    </div>
  );
};
