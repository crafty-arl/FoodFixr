'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

export function FoodFixrSignup() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

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
            Start your healthy eating journey today!
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Sign up form">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#333333] font-medium">Username</Label>
              <Input
                id="username"
                placeholder="coolchef123"
                required
                className="bg-white border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF] focus:ring-offset-2"
                aria-required="true"
                aria-invalid="false"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#333333] font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="chef@example.com"
                required
                className="bg-white border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF] focus:ring-offset-2"
                aria-required="true"
                aria-invalid="false"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#333333] font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                required
                className="bg-white border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF] focus:ring-offset-2"
                aria-required="true"
                aria-invalid="false"
                minLength={8}
                aria-describedby="password-requirements"
              />
              <p id="password-requirements" className="text-xs text-[#666666]">Password must be at least 8 characters long</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language" className="text-[#333333] font-medium">Preferred Language</Label>
              <Select defaultValue="en" aria-label="Select your preferred language">
                <SelectTrigger id="language" className="bg-white border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF] focus:ring-offset-2">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              className={`w-full bg-white text-[#333333] border-[#00FFFF] hover:bg-[#00FFFF]/10 shadow-[0_4px_0_#00FFFF] hover:shadow-[0_2px_0_#00FFFF] active:shadow-none active:translate-y-1 transition-all focus:ring-2 focus:ring-[#00FFFF] focus:ring-offset-2 ${lexend.className}`}
              disabled={loading}
              aria-live="polite"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className={`flex flex-col space-y-2 text-center text-sm text-[#666666] ${lexend.className}`}>
          <p>Already have an account? <a href="/login" className="text-[#008080] hover:underline focus:ring-2 focus:ring-[#00FFFF] focus:ring-offset-2">Sign in</a></p>
          <p>By signing up, you agree to our <a href="/terms" className="text-[#008080] hover:underline focus:ring-2 focus:ring-[#00FFFF] focus:ring-offset-2">Terms</a> and <a href="/privacy" className="text-[#008080] hover:underline focus:ring-2 focus:ring-[#00FFFF] focus:ring-offset-2">Privacy Policy</a></p>
        </CardFooter>
      </Card>
    </div>
  )
}