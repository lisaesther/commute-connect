"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

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
  const router = useRouter();

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

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
      setMessage("");
      return;
    }

    setErrors({});
    setMessage("Registration form validated successfully. Supabase Auth will be connected next.");

    setTimeout(() => {
      router.push("/dashboard");
    }, 700);
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
          <p className="mt-2 text-sm text-red-600">{errors.confirmPassword[0]}</p>
        ) : null}
      </div>

      {message ? (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
      >
        Create account
      </button>
    </form>
  );
}
