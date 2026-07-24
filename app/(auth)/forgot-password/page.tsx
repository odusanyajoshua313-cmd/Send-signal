"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/lib/auth/actions";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("email", email);

    const result = await requestPasswordReset(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center text-success mx-auto mb-6 border border-success/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h1 className="text-headline-large mb-4">Check your email</h1>
        <p className="text-body-large opacity-70 mb-8 max-w-md mx-auto">
          If an account exists with that email, we&apos;ve sent password reset instructions.
        </p>
        <p className="text-body-medium opacity-60 mb-8">
          The link will expire in 1 hour.
        </p>
        <Link href="/login" className="btn-outline-primary-container px-8">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-headline-large text-center mb-2">Forgot password?</h1>
      <p className="text-body-large text-center opacity-70 mb-8">
        Enter your email and we&apos;ll send you reset instructions.
      </p>

      {error && (
        <div className="error-container mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-label-large font-medium">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
            placeholder="you@example.com"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary cursor-pointer">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-8 text-center text-body-medium opacity-80">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold underline text-primary">
          Log In
        </Link>
      </div>
    </div>
  );
}
