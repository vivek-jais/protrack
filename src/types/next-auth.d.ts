import type { UserRole } from "@/models/User";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role?: UserRole;
    } & DefaultSession["user"];
  }
}
