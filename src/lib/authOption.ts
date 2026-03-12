import User from "@/models/User";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDb from "./db";

export const authOption: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      
      
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {

    async signIn({ user, account }) {
        if (account?.provider === "google") {
            if (!user.email) return false;
            try {
                await connectDb();
                const existingUser = await User.findOne({ email: user.email });
                if (!existingUser) {
                    await User.create({
                        name: user.name || "Anonymous User",
                        email: user.email,
                        image: user.image || "",
                        role: "pending",
                    });
                }
                return true;
            } catch (error) {
                console.error("Sign-in Error:", error);
                return false;
            }
        }
        return true;
    },
    async session({ session }) {
        if (session.user?.email) {
            try {
                await connectDb();
                const dbUser = await User.findOne({ email: session.user.email });
                if (dbUser) {
                    // @ts-ignore
                    session.user.id = dbUser._id.toString();
                    // @ts-ignore
                    session.user.role = dbUser.role;
                    //@ts-ignore
                    session.user.image=dbUser.image
                }
            } catch (error) {
                console.error("Session Error:", error);
            }
        }
        return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  }
};
