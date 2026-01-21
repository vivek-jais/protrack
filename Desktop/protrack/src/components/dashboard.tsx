'use client'
import { signIn, signOut, useSession } from 'next-auth/react'
import React from 'react'
import GoogleSignInButton from './googleSignIn';

function DashboardPage() {
    const {data:session} = useSession();
    console.log();
    
  return (
   <>
   {session?(<>
   <img src={session?.user?.image as string} alt=''/>
    <h1>Welcome,back {session?.user?.email} ,{session.user?.name}</h1>
    <button className='border border-black rounded-lg px-2 bg-red-500 ' onClick={()=>signOut()} >Sign Out</button>
   </>):(
    <>
   <h1>You are not login</h1>
   <div ><GoogleSignInButton/></div>
   

   </>)}
   </>
  )
}

export default DashboardPage