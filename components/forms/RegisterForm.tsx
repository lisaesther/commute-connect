"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    role: z.enum(["passenger", "driver", "both"], {
      message: "Please select how you want to use the platform.",
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
};

export function RegisterForm() {
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    setIsSubmitting(true);
    setFormError("");
    setMessage("");

    const formData = new FormData(form);

    const values = {
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      confirmPassword: String(formData.get("confirmPassword") || ""),
      role: String(formData.get("role") || ""),
    };

    const result = registerSchema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      setIsSubmitting(false);
      return;
    }

    setErrors({});

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          full_name: result.data.fullName,
          role: result.data.role,
        },
      },
    });

    if (error) {
      setFormError(error.message);
      setIsSubmitting(false);
      return;
    }

    setMessage(
      "Account created. Please check your email to confirm your account, then log in."
    );

    form.reset();
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Your full name"
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        {errors.fullName ? (
          <p className="mt-2 text-sm text-red-600">{errors.fullName[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        {errors.email ? (
          <p className="mt-2 text-sm text-red-600">{errors.email[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-slate-700">
          I want to use CommuteConnect as
        </label>
        <select
          id="role"
          name="role"
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="" disabled>
            Select an option
          </option>
          <option value="passenger">Passenger</option>
          <option value="driver">Driver</option>
          <option value="both">Both driver and passenger</option>
        </select>
        {errors.role ? (
          <p className="mt-2 text-sm text-red-600">{errors.role[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Minimum 8 characters"
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        {errors.password ? (
          <p className="mt-2 text-sm text-red-600">{errors.password[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        {errors.confirmPassword ? (
          <p className="mt-2 text-sm text-red-600">
            {errors.confirmPassword[0]}
          </p>
        ) : null}
      </div>

      {formError ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <p>{message}</p>
          <Link href="/login" className="mt-2 inline-flex font-semibold underline">
            Go to login
          </Link>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
