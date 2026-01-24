'use client'
import { signIn, signOut, useSession } from 'next-auth/react'
import React from 'react'
import GoogleSignInButton from './googleSignIn';
import { redirect } from 'next/navigation';


function DashboardPage() {
    const {data:session} = useSession();
    console.log();
    if(!session) {
      redirect("/login")
    }
    
  return (
   <>
  
   </>
  )
}

export default DashboardPage