import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
export const authOption : NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret : process.env.GOOGLE_CLIENT_SECRET as string
        })
    ],
    pages: {
    signIn: "/login", // <--- THIS TELLS NEXTAUTH TO USE YOUR PAGE
    error: "/login",  // Redirect to login page on error
  },
}