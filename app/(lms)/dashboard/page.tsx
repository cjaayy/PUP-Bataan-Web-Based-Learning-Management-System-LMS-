import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const { profile } = await requireUser();

  if (profile.role === "superadmin") {
    redirect("/dashboard/admin");
  }

  if (profile.role === "admin") {
    redirect("/dashboard/admin");
  }

  if (profile.role === "faculty") {
    redirect("/dashboard/faculty");
  }

  redirect("/dashboard/student");
}
