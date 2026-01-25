import DashboardPage from '@/components/dashboard'
import React from 'react'
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";

const Home = async () => {

  const session = await getServerSession(authOption);

  // @ts-ignore
  if (session?.user?.role === "pending") {
    redirect("/onboarding");
  }
    
  return (
    <>
      <DashboardPage/>
    </>
  )
}

export default Home