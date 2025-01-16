'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Comfortaa } from 'next/font/google'
import { useToast } from "@/hooks/use-toast"

const comfortaa = Comfortaa({ subsets: ['latin'] })

interface FoodFixrSignupProps {
  onSubmit: (email: string, password: string, username: string) => Promise<void>;
  onLogin: () => void;
  loading?: boolean;
}

export function FoodFixrSignup({ onSubmit, onLogin, loading = false }: FoodFixrSignupProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !username) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      await onSubmit(email, password, username)
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign up",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-md bg-card shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
      <CardHeader>
        <CardTitle className={`text-2xl font-bold text-center ${comfortaa.className}`}>
          Create Account
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
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onLogin}
            className="w-full"
          >
            Already have an account? Log in
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}