'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { account } from '@/lib/appwrite-config'
import { useToast } from "@/hooks/use-toast"

interface CategoryScore {
  totalPoints: number;
  questionCount: number;
  averageScore: number;
  scoreDisplay: {
    points: number;
    emoji: string;
    label: string;
    color: string;
  };
}

interface FoodFixrMenuDrawerProps {
  username: string;
  children: React.ReactNode;
  categoryScores?: { [key: string]: CategoryScore };
}

export function FoodFixrMenuDrawerComponent({ username, children }: FoodFixrMenuDrawerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await account.deleteSession('current')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50"
        aria-label="Open menu"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[300px] sm:w-[400px] bg-background p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                ✕
              </Button>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold">Welcome, {username}!</h2>
            </div>

            <nav className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/')
                }}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/account-page')
                }}
              >
                Account
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/surveys-goals')
                }}
              >
                Surveys & Goals
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}