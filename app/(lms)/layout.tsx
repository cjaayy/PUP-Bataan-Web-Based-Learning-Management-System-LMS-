import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

type Props = { children: ReactNode };
type NotificationRow = {
  id: string;
  title: string;
  created_at: string;
  courses: Array<{ title: string }>;
};

export default async function LMSLayout({ children }: Props) {
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("announcements")
    .select("id, title, created_at, courses(title)")
    .order("created_at", { ascending: false })
    .limit(6);

  if (!user || !profile) {
    redirect("/auth/login");
  }

  const formattedNotifications = (
    (notifications || []) as NotificationRow[]
  ).map((n) => ({
    id: n.id,
    title: n.title,
    created_at: n.created_at,
    course: n.courses?.[0]?.title ?? null,
  }));

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar role={profile.role} />
      <div className="ml-[240px] flex min-w-0 flex-1 flex-col">
        <Topbar
          fullName={profile.full_name}
          notifications={formattedNotifications}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
