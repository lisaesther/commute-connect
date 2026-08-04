"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters."),
    email: z.string().trim().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must contain at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    role: z.enum(["passenger", "driver", "both"], {
      message: "Please select how you plan to use CommuteConnect.",
    }),
    termsAccepted: z.boolean().refine((value) => value, {
      message: "You must agree to the Terms and Privacy Policy.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterErrors = {
  fullName?: string[];
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
  role?: string[];
  termsAccepted?: string[];
};

function getFriendlyAuthError(message: string) {
  const normalisedMessage = message.toLowerCase();

  if (
    normalisedMessage.includes("already registered") ||
    normalisedMessage.includes("already exists")
  ) {
    return "An account may already exist for this email. Try logging in instead.";
  }

  if (normalisedMessage.includes("rate limit")) {
    return "Too many registration attempts were made. Please wait and try again.";
  }

  if (normalisedMessage.includes("password")) {
    return "The password does not meet the security requirements.";
  }

  if (normalisedMessage.includes("email")) {
    return "We could not use this email address. Please check it and try again.";
  }

  return "We could not create your account. Please check your details and try again.";
}

export function RegisterForm() {
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    setIsSubmitting(true);
    setErrors({});
    setFormError("");
    setMessage("");

    const formData = new FormData(form);

    const values = {
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      confirmPassword: String(formData.get("confirmPassword") || ""),
      role: String(formData.get("role") || ""),
      termsAccepted: formData.get("termsAccepted") === "on",
    };

    const result = registerSchema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: result.data.email.toLowerCase(),
      password: result.data.password,
      options: {
        data: {
          full_name: result.data.fullName,
          role: result.data.role,
        },
      },
    });

    if (error) {
      setFormError(getFriendlyAuthError(error.message));
      setIsSubmitting(false);
      return;
    }

    setMessage(
      "Your account has been created successfully. You can now log in using your email address and password.",
    );

    form.reset();
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-slate-700"
        >
          Full name
        </label>

        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        {errors.fullName ? (
          <p id="fullName-error" className="mt-2 text-sm text-red-600">
            {errors.fullName[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700"
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        {errors.email ? (
          <p id="email-error" className="mt-2 text-sm text-red-600">
            {errors.email[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-slate-700"
        >
          How do you plan to use CommuteConnect?
        </label>

        <select
          id="role"
          name="role"
          defaultValue=""
          aria-invalid={Boolean(errors.role)}
          aria-describedby={errors.role ? "role-error" : "role-description"}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="" disabled>
            Select an option
          </option>
          <option value="passenger">Find rides</option>
          <option value="driver">Offer rides</option>
          <option value="both">Find and offer rides</option>
        </select>

        <p
          id="role-description"
          className="mt-2 text-xs leading-5 text-slate-500"
        >
          You can update this preference later from your profile.
        </p>

        {errors.role ? (
          <p id="role-error" className="mt-2 text-sm text-red-600">
            {errors.role[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700"
        >
          Password
        </label>

        <div className="relative mt-2">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "password-error" : "password-description"
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-20 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <p
          id="password-description"
          className="mt-2 text-xs leading-5 text-slate-500"
        >
          Use at least 8 characters.
        </p>

        {errors.password ? (
          <p id="password-error" className="mt-2 text-sm text-red-600">
            {errors.password[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-slate-700"
        >
          Confirm password
        </label>

        <div className="relative mt-2">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "confirmPassword-error" : undefined
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-20 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            aria-label={
              showConfirmPassword
                ? "Hide confirmed password"
                : "Show confirmed password"
            }
            className="absolute inset-y-0 right-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>

        {errors.confirmPassword ? (
          <p id="confirmPassword-error" className="mt-2 text-sm text-red-600">
            {errors.confirmPassword[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            aria-invalid={Boolean(errors.termsAccepted)}
            aria-describedby={
              errors.termsAccepted ? "termsAccepted-error" : undefined
            }
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />

          <span className="text-sm leading-6 text-slate-600">
            I agree to the Terms of Service and Privacy Policy.
          </span>
        </label>

        {errors.termsAccepted ? (
          <p id="termsAccepted-error" className="mt-2 text-sm text-red-600">
            {errors.termsAccepted[0]}
          </p>
        ) : null}
      </div>

      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {formError}
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <p>{message}</p>

          <Link
            href="/login"
            className="mt-2 inline-flex font-semibold underline"
          >
            Go to Login
          </Link>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}
