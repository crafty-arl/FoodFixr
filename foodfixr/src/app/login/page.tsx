'use client'

import { FoodFixrLogin } from '@/components/food-fixr-login'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { account } from '@/app/appwrite'

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
      const result = await account.createEmailPasswordSession(
        email,
        password
      )
      console.log(result)
      
      if (result.$id) {
        router.push('/')
      }
    } catch (error) {
      console.error('Login failed:', error)
      // Handle login error (show toast, error message, etc.)
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
