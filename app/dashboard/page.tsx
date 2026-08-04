import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardSupport } from "@/components/dashboard/DashboardSupport";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = user.user_metadata?.full_name as string | undefined;
  const role = user.user_metadata?.role as string | undefined;

  return (
    <DashboardShell fullName={fullName} email={user.email} role={role}>
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <DashboardHeader
          fullName={fullName}
          email={user.email}
          role={role}
        />

        <DashboardStats role={role} />

        <DashboardOverview role={role} />

        <DashboardSupport fullName={fullName} role={role} />

      </section>
    </DashboardShell>
  );
}
