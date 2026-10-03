import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOption } from "@/lib/authOption";

export async function requireAuthenticatedSession() {
  const session = await getServerSession(authOption);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}
