import { redirect } from "next/navigation";
import { requireAuthenticatedSession } from "@/lib/requireAuthenticatedSession";

export default async function TeacherDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAuthenticatedSession();
  const role = session.user?.role;

  if (role !== "teacher") {
    redirect(role === "student" ? "/dashboard" : "/onboarding");
  }

  return children;
}
