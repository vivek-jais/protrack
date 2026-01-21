import { authOption } from "@/lib/authOption";
import NextAuth from "next-auth";


const handle  = NextAuth(authOption)

export {handle as GET,handle as POST}