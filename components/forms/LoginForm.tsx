"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginErrors = {
  email?: string[];
  password?: string[];
};

export function LoginForm() {
  const router = useRouter();

  const [errors, setErrors] = useState<LoginErrors>({});
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const values = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    };

    const result = loginSchema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      setMessage("");
      return;
    }

    setErrors({});
    setMessage("Login form validated successfully. Supabase Auth will be connected next.");

    setTimeout(() => {
      router.push("/dashboard");
    }, 700);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        {errors.password ? (
          <p className="mt-2 text-sm text-red-600">{errors.password[0]}</p>
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
        Login
      </button>
    </form>
  );
}
