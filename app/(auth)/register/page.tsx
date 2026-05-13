import Link from "next/link";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { Navbar } from "@/components/layout/Navbar";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto flex max-w-6xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Join the platform
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Create your CommuteConnect account
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Register as a passenger, driver, or both. This form is ready for the
            future Supabase authentication connection.
          </p>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
