'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'
import { database } from '@/app/appwrite'
import { ID } from 'appwrite'
import Cookies from 'js-cookie'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

interface FoodFixrLoginProps {
  onSubmit?: (email: string, password: string, remember: boolean) => Promise<{ $id: string }>;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  loading?: boolean;
}

export function FoodFixrLogin({ 
  onSubmit,
  onForgotPassword,
  onSignUp,
  loading: externalLoading
}: FoodFixrLoginProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      setLoading(true)
      setError(null)
      try {
        // Step 1: Login with Appwrite
        console.log('=== Step 1: Appwrite Login ===')
        console.log('Attempting login with email:', email)
        const response = await onSubmit(email, password, remember)
        
        // Validate response
        if (!response || !response.$id) {
          console.error('Invalid response from Appwrite login')
          console.error('Response received:', response)
          throw new Error('Login failed: Invalid response from server')
        }

        console.log('✓ Appwrite Login Successful')
        console.log('Response:', response)
        console.log('User ID:', response.$id)

        // Step 2: Store Login Log in Appwrite
        console.log('\n=== Step 2: Storing Login Log ===')
        const loginData = {
          userID: response.$id,
          last_logged_in: new Date().toISOString()
        }
        console.log('Login Data:', loginData)

        try {
          const savedLogin = await database.createDocument(
            'foodfixrdb',
            'daily_user_login_log',
            ID.unique(),
            loginData,
            ["read(\"any\")", "write(\"any\")"]
          )
          console.log('✓ Login Log Stored Successfully')
          console.log('Document ID:', savedLogin.$id)
          console.log('Login Time:', savedLogin.last_logged_in)
        } catch (dbError: any) {
          console.error('✕ Failed to Store Login Log')
          console.error('Full Error:', dbError)
          console.error('Error Message:', dbError?.message)
          console.error('Error Code:', dbError?.code)
          // Continue with login process despite log storage failure
        }

        // Step 3: Store Cookies
        console.log('\n=== Step 3: Setting Cookies ===')
        const uniqueId = `ff${response.$id.slice(0, 34)}`
        Cookies.set('uniqueId', uniqueId, {
          expires: 7,
          path: '/',
          sameSite: 'strict'
        })
        console.log('✓ Cookies Set Successfully')
        console.log('Unique ID:', uniqueId)

        // Step 4: Navigation
        console.log('\n=== Step 4: Navigation ===')
        console.log('Redirecting to /dashboard')
        
      } catch (err: any) {
        console.error('\n=== Login Error ===')
        console.error('Full Error Object:', err)
        let errorMessage = 'Invalid email or password. Please try again.'
        
        if (err?.code === 401) {
          errorMessage = 'Invalid email or password. Please try again.'
        } else if (err?.code === 429) {
          errorMessage = 'Too many login attempts. Please try again later.'
        } else if (err?.code === 503) {
          errorMessage = 'Service temporarily unavailable. Please try again later.'
        } else if (err instanceof Error) {
          errorMessage = err.message
        }
        
        console.error('Error Message:', errorMessage)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
  }

  const isLoading = externalLoading || loading

  return (
    <div className={`min-h-screen bg-white p-4 flex flex-col items-center justify-center ${comfortaa.className}`} role="main">
      <Card className="w-full max-w-md bg-[#f5f5f5] shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="w-24 h-24 relative">
              <Image
                src="/foodfixrlogo.png"
                alt="Food Fixr Logo"
                layout="fill"
                objectFit="contain"
                priority
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#333333]" role="heading" aria-level={1}>
            Food Fixr
          </CardTitle>
          <p className={`text-sm text-[#666666] ${lexend.className}`} role="contentinfo">
            Welcome back! Let's continue your healthy journey.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
            <div id="error-container">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200" role="alert">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#333333] font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="chef@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-white border-gray-300 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 ${error ? 'border-red-500' : ''}`}
                aria-required="true"
                aria-invalid={error ? "true" : "false"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#333333] font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-white border-gray-300 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 ${error ? 'border-red-500' : ''}`}
                aria-required="true"
                aria-invalid={error ? "true" : "false"}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked as boolean)}
                aria-label="Remember me checkbox"
              />
              <Label htmlFor="remember" className={`text-sm font-normal text-[#666666] ${lexend.className}`}>Remember me</Label>
            </div>
            <Button 
              type="submit" 
              className={`w-full bg-white text-[#333333] border-[#00FFFF] hover:bg-[#00FFFF]/10 shadow-[0_4px_0_#808080] hover:shadow-[0_2px_0_#808080] active:shadow-none active:translate-y-1 transition-all focus:ring-2 focus:ring-[#00FFFF] focus:ring-offset-2 ${lexend.className}`}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Submitting to Appwrite...' : 'Log In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className={`flex flex-col space-y-2 text-center text-sm text-[#666666] ${lexend.className}`}>
          <button 
            onClick={onForgotPassword}
            className="text-[#008080] hover:underline focus:ring-2 focus:ring-[#00FFFF] focus:ring-offset-2" 
            aria-label="Forgot password link"
          >
            Forgot password?
          </button>
          <p>
            Don't have an account?{' '}
            <button
              onClick={onSignUp}
              className="text-[#008080] hover:underline focus:ring-2 focus:ring-[#00FFFF] focus:ring-offset-2"
              aria-label="Sign up link"
            >
              Sign up
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}