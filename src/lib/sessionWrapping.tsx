"use client"
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import React from 'react'

const SessionWrapping = ({children}:{children:React.ReactNode}) => {
    return <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    </SessionProvider>
  
}

export default SessionWrapping