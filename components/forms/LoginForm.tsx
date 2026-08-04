"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginErrors = {
  email?: string[];
  password?: string[];
};

function getFriendlyLoginError(message: string) {
  const normalisedMessage = message.toLowerCase();

  if (
    normalisedMessage.includes("invalid login credentials") ||
    normalisedMessage.includes("invalid credentials")
  ) {
    return "The email or password you entered is incorrect.";
  }

  if (normalisedMessage.includes("email not confirmed")) {
    return "Please confirm your email address before logging in.";
  }

  if (normalisedMessage.includes("rate limit")) {
    return "Too many login attempts were made. Please wait and try again.";
  }

  return "We could not log you in. Please check your details and try again.";
}

export function LoginForm() {
  const router = useRouter();

  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrors({});
    setFormError("");

    const formData = new FormData(event.currentTarget);

    const values = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    };

    const result = loginSchema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email.toLowerCase(),
      password: result.data.password,
    });

    if (error) {
      setFormError(getFriendlyLoginError(error.message));
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
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
          aria-describedby={errors.email ? "login-email-error" : undefined}
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        {errors.email ? (
          <p id="login-email-error" className="mt-2 text-sm text-red-600">
            {errors.email[0]}
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
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
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

        {errors.password ? (
          <p id="login-password-error" className="mt-2 text-sm text-red-600">
            {errors.password[0]}
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Logging you in…" : "Log in"}
      </button>
    </form>
  );
}
