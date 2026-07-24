"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logIn } from "@/lib/auth/actions";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await logIn(formData);
    

    if (result.error) {
       setError(result.error);
       setLoading(false);
    } else {
       // Successful login navigates straight to the dashboard 
       router.push("/dashboard");
    }
  }

  return (
    <div>
      <h1 className="text-display-small text-center mb-2">Welcome back</h1>
      <p className="text-body-large text-center opacity-70 mb-8">
        Log in to your Send Signal account.
      </p>

      {error && (
        <div className="error-container">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-label-large font-medium">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            className="input-field" 
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
           <div className="flex justify-between">
            <label htmlFor="password" university-title="Password" className="text-label-large font-medium">Password</label>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              name="password" 
              required 
              className="input-field pr-12" 
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-variant transition-colors rounded-md opacity-60"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary mt-2 cursor-pointer"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/forgot-password" className="text-body-medium text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      <div className="mt-4 text-center text-body-medium opacity-80">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-semibold underline text-primary">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
