"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth/actions";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState({ companyName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState({ companyName: false, email: false, password: false });
  const [verificationRequired, setVerificationRequired] = useState(false);

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length === 0) return 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthClasses = ["strength-weak", "strength-weak", "strength-medium", "strength-medium", "strength-strong", "strength-strong"];
  const strengthWidths = ["strength-0", "strength-20", "strength-40", "strength-60", "strength-80", "strength-100"];

  const handleCompanyNameBlur = () => {
    setTouched((prev) => ({ ...prev, companyName: true }));
    if (!companyName.trim()) {
      setValidationErrors((prev) => ({ ...prev, companyName: "This field cannot be empty" }));
    } else {
      setValidationErrors((prev) => ({ ...prev, companyName: "" }));
    }
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    const isValid = val.length >= 8 && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val) && /[A-Z]/.test(val);
    if (validationErrors.password && isValid) {
      setValidationErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value);
    if (validationErrors.companyName && e.target.value.trim()) {
      setValidationErrors((prev) => ({ ...prev, companyName: "" }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    
    if (!val) {
      setValidationErrors((prev) => ({ ...prev, email: "" }));
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const lowerVal = val.toLowerCase();
    
    if (!emailRegex.test(val)) {
      setValidationErrors((prev) => ({ ...prev, email: "Enter A Valid Company Email Address" }));
    } else if (lowerVal.endsWith("gmail.com") || lowerVal.endsWith("yahoo.com")) {
      setValidationErrors((prev) => ({ ...prev, email: "This is not a valid company email address" }));
    } else {
      setValidationErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  async function handleSubmit(formData: FormData) {
    let hasValidationError = false;
    const newValidationErrors = { companyName: '', email: '', password: '' };

    if (!companyName.trim()) {
      newValidationErrors.companyName = "This field cannot be empty";
      hasValidationError = true;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const lowerVal = email.toLowerCase();
    
    if (!email) {
      newValidationErrors.email = "Enter A Valid Company Email Address";
      hasValidationError = true;
    } else if (!emailRegex.test(email)) {
      newValidationErrors.email = "Enter A Valid Company Email Address";
      hasValidationError = true;
    } else if (lowerVal.endsWith("gmail.com") || lowerVal.endsWith("yahoo.com")) {
      newValidationErrors.email = "This is not a valid company email address";
      hasValidationError = true;
    }

    if (!password) {
      newValidationErrors.password = "Choose a password";
      hasValidationError = true;
    } else {
      const isValid = password.length >= 8 && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) && /[A-Z]/.test(password);
      if (!isValid) {
        newValidationErrors.password = "Please meet all password requirements";
        hasValidationError = true;
      }
    }

    setValidationErrors(newValidationErrors);
    
    if (hasValidationError) return;

    setLoading(true);
    setError(null);
    const result = await signUp(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.requiresVerification) {
      setVerificationRequired(true);
      setLoading(false);
    } else {
       // Mandatory redirect to onboarding per specifications
       router.push("/onboarding/welcome");
    }
  }

  const isCompanyNameValidAndTouched = touched.companyName && companyName.trim().length > 0 && !validationErrors.companyName;
  const isEmailValidAndTouched = touched.email && email.trim().length > 0 && !validationErrors.email;
  const isPasswordValid = password.length >= 8 && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) && /[A-Z]/.test(password);
  const isPasswordValidAndTouched = touched.password && isPasswordValid && !validationErrors.password;

  const unmetRequirements = [];
  if (password.length > 0) {
    if (password.length < 8) unmetRequirements.push("Password must be a minimum of 8 characters");
    if (!/[0-9]/.test(password)) unmetRequirements.push("Password must contain a number");
    if (!/[^A-Za-z0-9]/.test(password)) unmetRequirements.push("Password must contain a special character");
    if (!/[A-Z]/.test(password)) unmetRequirements.push("Password must contain an uppercase letter");
  }

  if (verificationRequired) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center text-success mx-auto mb-6 border border-success/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h1 className="text-headline-large mb-4">Verify email</h1>
        <p className="text-body-large opacity-70 mb-8 max-w-md mx-auto">
          We&apos;ve sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to complete your signup.
        </p>
        <Link href="/login" className="btn-outline-primary-container px-8">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-headline-medium text-center mb-8">Create account</h1>

      {error && (
        <div className="error-container">
          {error}
        </div>
      )}

      <form action={handleSubmit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="companyName" className="text-label-large font-medium">Company Name</label>
          <input 
            type="text" 
            id="companyName" 
            name="companyName"
            value={companyName}
            onChange={handleCompanyNameChange}
            onBlur={handleCompanyNameBlur}
            className={`input-field ${validationErrors.companyName ? 'border-error' : ''} ${isCompanyNameValidAndTouched ? 'bg-primary-container' : ''}`} 
          />
          {validationErrors.companyName && (
            <span className="text-label-small text-error">
              {validationErrors.companyName}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-label-large font-medium">Work email</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            className={`input-field ${validationErrors.email ? 'border-error' : ''} ${isEmailValidAndTouched ? 'bg-primary-container' : ''}`} 
          />
          {validationErrors.email && (
            <span className="text-label-small text-error">
              {validationErrors.email}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-label-large font-medium">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              name="password" 
              minLength={8}
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              className={`input-field pr-12 ${validationErrors.password ? 'border-error' : ''} ${isPasswordValidAndTouched ? 'bg-primary-container' : ''}`} 
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
          
          {validationErrors.password && (
            <span className="text-label-small text-error">
              {validationErrors.password}
            </span>
          )}
          
          {password.length > 0 && unmetRequirements.length > 0 && (
            <div className="text-label-small text-error opacity-80 mt-1">
              {unmetRequirements[0]}
            </div>
          )}
          
          {password.length > 0 && unmetRequirements.length === 0 && (
            <div className="space-y-1">
              <div className="strength-meter">
                <div 
                  className={`strength-bar ${strengthClasses[strength]} ${strengthWidths[strength]}`}
                ></div>
              </div>
              <div className="flex justify-between items-center text-label-small">
                <span className="opacity-60">Password strength</span>
                <span className={`font-medium ${
                  strength < 2 ? 'text-error' : strength < 4 ? 'text-accent' : 'text-success'
                }`}>
                  {strengthLabels[strength]}
                </span>
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary mt-2 cursor-pointer"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="mt-8 text-center text-body-medium opacity-80">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold underline text-primary">
          Log In
        </Link>
      </div>
    </div>
  );
}
