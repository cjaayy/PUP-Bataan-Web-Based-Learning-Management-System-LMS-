import { requireRole } from "@/lib/auth";
import Image from "next/image";

export default async function AdminDashboardPage() {
  await requireRole(["admin", "superadmin"]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Image
        src="/icons/pngkey.com-phillies-logo-png-528919.png"
        alt="PUP Bataan logo"
        width={360}
        height={360}
        priority
        className="h-auto w-[240px] sm:w-[300px] md:w-[360px]"
      />
    </div>
  );
}
