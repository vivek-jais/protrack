import { requireAuthenticatedSession } from "@/lib/requireAuthenticatedSession";

export default async function SignOutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuthenticatedSession();

  return children;
}
