'use client'

import { signIn } from 'next-auth/react'
import React from 'react'

const GoogleSignInButton = () => {
  return (
    <div className="flex items-center justify-center  bg-gray-100 dark:bg-gray-700">
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="flex items-center bg-white dark:bg-gray-900 border border-gray-300 rounded-lg shadow-md px-6 py-2 text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <svg
          className="h-6 w-6 mr-2"
          viewBox="-0.5 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="#FBBC05" d="M9.827 24c0-1.524.253-2.986.705-4.356L2.623 13.604C1.082 16.734.214 20.26.214 24c0 3.737.867 7.261 2.62 10.388l7.905-6.051A14.3 14.3 0 0 1 9.827 24" />
          <path fill="#EB4335" d="M23.714 10.133c3.311 0 6.302 1.174 8.652 3.094l6.836-6.827C35.036 2.773 29.695.533 23.714.533c-9.287 0-17.269 5.31-21.09 13.07l7.908 6.04c1.822-5.531 7.016-9.51 13.182-9.51" />
          <path fill="#34A853" d="M23.714 37.867c-6.165 0-11.36-3.979-13.182-9.511l-7.908 6.039c3.821 7.761 11.803 13.072 21.09 13.072 5.732 0 11.204-2.035 15.311-5.849l-7.507-5.804c-2.118 1.335-4.786 2.053-7.804 2.053" />
          <path fill="#4285F4" d="M46.145 24c0-1.387-.214-2.88-.534-4.267H23.714V28.8h12.604c-.63 3.091-2.346 5.468-4.8 7.014l7.507 5.804C43.34 37.614 46.145 31.649 46.145 24" />
        </svg>
        <span>Continue with Google</span>
      </button>
    </div>
  )
}

export default GoogleSignInButton
