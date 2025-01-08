'use client'

import { FoodFixrLogin } from '@/components/food-fixr-login'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { account } from '@/app/appwrite'
import Cookies from 'js-cookie'
import { database } from '@/app/appwrite'
import { Query } from 'appwrite'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const session = await account.get()
        if (session) {
          router.push('/')
        }
      } catch (error) {
        // User is not logged in, continue showing login page
        console.log('No active session')
      }
    }

    checkSession()
  }, [router])

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    try {
      setLoading(true)
      const session = await account.createEmailPasswordSession(
        email,
        password
      )
      console.log('Login session:', session)
      
      if (!session.$id) {
        throw new Error('Login failed: No session ID')
      }

      // Get user details
      const user = await account.get()
      console.log('User details:', user)
      
      if (!user || !user.$id) {
        throw new Error('Login failed: Could not get user details')
      }
      
      // Store uniqueId in cookies
      const uniqueId = `ff${user.$id.slice(0, 34)}`
      Cookies.set('uniqueId', uniqueId, {
        expires: remember ? 7 : 1,
        path: '/',
        sameSite: 'strict'
      })

      // Check if user has completed profile setup
      try {
        const result = await database.listDocuments(
          'foodfixrdb',
          'user_profile',
          [Query.equal('userID', uniqueId)]
        )

        if (result.documents.length === 0) {
          // No profile found, redirect to account setup
          router.push('/account-setup')
        } else {
          // Profile exists, redirect to dashboard
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking user profile:', error)
        // If we can't check profile, assume it doesn't exist
        router.push('/account-setup')
      }

      // Return the user ID in the expected format
      return { $id: user.$id }
      
    } catch (error) {
      console.error('Login failed:', error)
      throw error // Let the login component handle the error display
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    router.push('/forgot-password')
  }

  const handleSignUp = () => {
    router.push('/signup')
  }

  if (!mounted) {
    return null // or a loading skeleton
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <FoodFixrLogin
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onSignUp={handleSignUp}
        loading={loading}
      />
    </div>
  )
}
