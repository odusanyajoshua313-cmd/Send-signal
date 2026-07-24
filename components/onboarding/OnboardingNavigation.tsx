"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OnboardingNavigationProps {
  backUrl?: string;
  nextUrl?: string; 
  nextLabel?: React.ReactNode;
  onNext?: () => void;
  isSubmitting?: boolean;
}

export function OnboardingNavigation({ 
  backUrl, 
  nextUrl, 
  nextLabel, 
  onNext,
  isSubmitting = false
}: OnboardingNavigationProps) {
  const { pending } = useFormStatus();
  const router = useRouter();
  const loading = pending || isSubmitting;

  const label = typeof nextLabel === "string" || !nextLabel ? (
    <span className="flex items-center gap-2">
      {nextLabel || "Next"}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
      </svg>
    </span>
  ) : nextLabel;
  
  return (
    <div className="flex items-center justify-between w-full mt-10 pt-6 border-t-neutral-variant">
      {backUrl ? (
        <button
          type="button"
          onClick={() => router.push(backUrl)}
          className="btn-outline border-transparent hover:bg-transparent"
        >
          Back
        </button>
      ) : (
        <div /> 
      )}
      
      {nextUrl ? (
        <Link href={nextUrl} className="btn-primary min-w-32">
          {label}
        </Link>
      ) : onNext ? (
        <button 
          type="button" 
          onClick={onNext} 
          disabled={loading}
          className="btn-primary min-w-32"
        >
          {loading ? "Loading..." : label}
        </button>
      ) : (
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary min-w-32"
        >
          {loading ? "Loading..." : label}
        </button>
      )}
    </div>
  );
}
