'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Comfortaa, Lexend } from 'next/font/google'
import Image from 'next/image'
import { useToast } from "@/hooks/use-toast"

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

interface LoginError {
  message: string;
  code?: number;
}

interface LoginResponse {
  $id: string;
}

interface FoodFixrLoginProps {
  onSubmit: (email: string, password: string, remember: boolean) => Promise<LoginResponse>;
  onForgotPassword: () => void;
  onSignUp: () => void;
  loading?: boolean;
}

export function FoodFixrLogin({ onSubmit, onForgotPassword, onSignUp, loading = false }: FoodFixrLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      await onSubmit(email, password, remember)
    } catch (err: unknown) {
      const error = err as LoginError;
      console.error('Login error:', error)
      
      let errorMessage = 'An error occurred during login'
      if (error.message) {
        if (error.message.includes('Invalid credentials')) {
          errorMessage = 'Invalid email or password'
        } else if (error.message.includes('Rate limit exceeded')) {
          errorMessage = 'Too many login attempts. Please try again later.'
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      setError(errorMessage)
    }
  }

  return (
    <Card className="w-full max-w-md bg-card shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
      <CardHeader className="space-y-3">
        <div className="flex justify-center">
          <div className="w-24 h-24 relative">
            <Image
              src="/FoodFixrLogo.png"
              alt="Food Fixr Logo"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
        <CardTitle className={`text-2xl font-bold text-center ${comfortaa.className}`}>
          Welcome Back!
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background"
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked as boolean)}
                disabled={loading}
              />
              <Label
                htmlFor="remember"
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${lexend.className}`}
              >
                Remember me
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              className={`px-0 font-semibold text-primary ${lexend.className}`}
              onClick={onForgotPassword}
              disabled={loading}
            >
              Forgot password?
            </Button>
          </div>
          {error && (
            <div className="text-sm text-destructive text-center" role="alert">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Button
              type="button"
              variant="link"
              className="p-0 font-semibold text-primary"
              onClick={onSignUp}
              disabled={loading}
            >
              Sign up
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}