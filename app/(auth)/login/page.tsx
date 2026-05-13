import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";
import { Navbar } from "@/components/layout/Navbar";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto flex max-w-6xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Welcome back
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Login to CommuteConnect
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Access your commute dashboard, manage journey requests, and view
            upcoming rides.
          </p>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-slate-600">
            Do not have an account?{" "}
            <Link href="/register" className="font-semibold text-emerald-700 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
