'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { account } from '@/app/appwrite'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

type PasswordChecks = {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  special: boolean
}

export function FoodFixrSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [error, setError] = useState('')
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })
  const [username, setUsername] = useState('')

  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const checks = {
      length: password.length >= minLength,
      uppercase: hasUpperCase,
      lowercase: hasLowerCase,
      number: hasNumbers,
      special: hasSpecialChar
    }

    setPasswordChecks(checks)

    if (password.length < minLength) return 'Password must be at least 8 characters long'
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter'
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter'
    if (!hasNumbers) return 'Password must contain at least one number'
    if (!hasSpecialChar) return 'Password must contain at least one special character'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const passwordValidationError = validatePassword(password)
    if (passwordValidationError) {
      setPasswordError(passwordValidationError)
      return
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    setPasswordError('')
    setLoading(true)

    try {
      const response = await fetch('/api/crossmint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409 || data.type === 'user_already_exists') {
          throw new Error('An account with this email already exists. Please try logging in instead.')
        }
        throw new Error(data.error || data.message || 'Failed to create account')
      }

      if (!data.publicKey || !data.uniqueId) {
        throw new Error('Invalid response from server - missing required fields')
      }

      Cookies.set('uniqueId', data.uniqueId, {
        expires: 7,
        path: '/',
        sameSite: 'strict'
      })

      try {
        await account.createEmailPasswordSession(email, password)
      } catch (sessionError) {
        console.error('Error creating session after signup:', sessionError)
      }

      router.push('/account-setup')

    } catch (err) {
      let errorMessage = 'Unable to create account. Please try again.'
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-background p-4 flex flex-col items-center justify-center ${comfortaa.className}`} role="main">
      <Card className="w-full max-w-md bg-card shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
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
          <CardTitle className="text-2xl font-bold text-foreground" role="heading" aria-level={1}>
            Food Fixr
          </CardTitle>
          <p className={`text-sm text-muted-foreground ${lexend.className}`} role="contentinfo">
            Start your healthy eating journey today!
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Sign up form">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="chefsmith"
                required
                className="bg-background border-input focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-required="true"
                aria-invalid="false"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="chef@example.com"
                required
                className="bg-background border-input focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-required="true"
                aria-invalid="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                required
                className="bg-background border-input focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-required="true"
                aria-invalid={!!passwordError}
                minLength={8}
                aria-describedby="password-requirements"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError(validatePassword(e.target.value))
                }}
              />
              <ul id="password-requirements" className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  {passwordChecks.length ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  At least 8 characters long
                </li>
                <li className="flex items-center gap-2">
                  {passwordChecks.uppercase ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  At least one uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  {passwordChecks.lowercase ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  At least one lowercase letter
                </li>
                <li className="flex items-center gap-2">
                  {passwordChecks.number ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  At least one number
                </li>
                <li className="flex items-center gap-2">
                  {passwordChecks.special ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-foreground font-medium">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                className="bg-background border-input focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-required="true"
                aria-invalid={!!passwordError}
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordError && (
                <p className="text-xs text-destructive" role="alert">{passwordError}</p>
              )}
              {error && (
                <p className="text-xs text-destructive" role="alert">{error}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className={`w-full bg-background text-foreground border-secondary hover:bg-secondary/10 shadow-[0_4px_0_hsl(var(--muted))] hover:shadow-[0_2px_0_hsl(var(--muted))] active:shadow-none active:translate-y-1 transition-all focus:ring-2 focus:ring-ring focus:ring-offset-2 ${lexend.className}`}
              disabled={loading}
              aria-live="polite"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className={`flex flex-col space-y-2 text-center text-sm text-muted-foreground ${lexend.className}`}>
          <p>Already have an account? <Link href="/login" className="text-primary hover:underline focus:ring-2 focus:ring-ring focus:ring-offset-2">Sign in</Link></p>
          <p>By signing up, you agree to our <Link href="/terms" className="text-primary hover:underline focus:ring-2 focus:ring-ring focus:ring-offset-2">Terms</Link> and <Link href="/privacy" className="text-primary hover:underline focus:ring-2 focus:ring-ring focus:ring-offset-2">Privacy Policy</Link></p>
        </CardFooter>
      </Card>
    </div>
  )
}