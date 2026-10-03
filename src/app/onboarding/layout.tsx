import { requireAuthenticatedSession } from "@/lib/requireAuthenticatedSession";

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuthenticatedSession();

  return children;
}
