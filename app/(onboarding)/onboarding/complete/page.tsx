"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function OnboardingCompleteStep() {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-6 animate-in fade-in duration-1000">
        <h1 className="text-display-small text-neutral-variant-20 font-bold mb-4">Welcome to Send Signal</h1>
        
        {/* ProgressIndicator is rendered by the layout, so it will appear here in the real app flow */}
        {/* We just need to handle the content below it */}

        <div className="text-center max-w-2xl mt-8">
            <h2 className="text-headline-medium font-bold mb-6 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                You&apos;re all set!
            </h2>
            <p className="text-body-large opacity-60 leading-relaxed mb-12 animate-in slide-in-from-bottom-4 duration-700 delay-500">
                Your account is configured. Let&apos;s go to the dashboard to create your first template and launch a campaign.
            </p>
        </div>

        {/* Custom Navigation Footer to match the image precisely */}
        <div className="flex items-center justify-between w-full max-w-4xl mt-auto pt-10 border-t border-neutral-variant-90">
            <Link 
              href="/onboarding/template" 
              className="px-6 py-2 text-neutral-variant-40 font-medium hover:bg-neutral-95 rounded-lg transition-colors"
            >
              Back
            </Link>
            <Link 
              href="/dashboard" 
              className="btn-primary px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Go to Dashboard
            </Link>
        </div>
    </div>
  );
}
