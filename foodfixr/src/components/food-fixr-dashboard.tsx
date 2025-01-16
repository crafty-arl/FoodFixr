'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from 'lucide-react'
import { Comfortaa } from 'next/font/google'
import Image from 'next/image'
import { databases } from '@/lib/appwrite-config'
import { Query } from 'appwrite'
import Cookies from 'js-cookie'

const comfortaa = Comfortaa({ subsets: ['latin'] })

interface FoodFixrDashboardProps {
  username: string;
}

export function FoodFixrDashboard({ username }: FoodFixrDashboardProps) {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastLoginTime, setLastLoginTime] = useState<Date | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchLastLogin = async () => {
      const uniqueId = Cookies.get('uniqueId')
      if (!uniqueId) return

      try {
        const response = await databases.listDocuments(
          'foodfixrdb',
          'user_sessions',
          [Query.equal('userId', uniqueId)]
        )

        if (response.documents.length > 0) {
          const lastLogin = new Date(response.documents[0].lastLogin)
          setLastLoginTime(lastLogin)
        }
      } catch (error) {
        console.error('Error fetching last login:', error)
      }
    }

    fetchLastLogin()
  }, [])

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-white w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 relative mb-4">
            <Image 
              src="/foodfixrlogo.png" 
              alt="FoodFixr Logo" 
              fill
              className="object-contain"
            />
          </div>
          <h1 className={`text-2xl font-bold text-[#008080] mb-4 ${comfortaa.className}`}>
            Welcome back, {username}!
          </h1>
          <div className="text-center mb-4">
            <p className="text-gray-600">
              Current Time: {currentTime.toLocaleTimeString()}
            </p>
            {lastLoginTime && (
              <p className="text-gray-600">
                Last Login: {lastLoginTime.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
            <CardHeader>
              <CardTitle className={`text-xl font-bold text-center ${comfortaa.className}`}>
                Food Journal
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <p className="text-gray-600 text-center mb-4">
                Track your daily meals and get personalized insights
              </p>
              <Button 
                onClick={() => handleNavigate('/food-journal')}
                className="bg-[#008080] hover:bg-[#006666] text-white"
              >
                Open Food Journal
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
            <CardHeader>
              <CardTitle className={`text-xl font-bold text-center ${comfortaa.className}`}>
                Grocery List
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <p className="text-gray-600 text-center mb-4">
                Get personalized grocery recommendations
              </p>
              <Button 
                onClick={() => handleNavigate('/grocery-list')}
                className="bg-[#008080] hover:bg-[#006666] text-white"
              >
                View Grocery List
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
            <CardHeader>
              <CardTitle className={`text-xl font-bold text-center ${comfortaa.className}`}>
                Health Survey
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <p className="text-gray-600 text-center mb-4">
                Update your health profile and preferences
              </p>
              <Button 
                onClick={() => handleNavigate('/surveys-goals')}
                className="bg-[#008080] hover:bg-[#006666] text-white"
              >
                Take Survey
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
            <CardHeader>
              <CardTitle className={`text-xl font-bold text-center ${comfortaa.className}`}>
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <p className="text-gray-600 text-center mb-4">
                Manage your account settings and preferences
              </p>
              <Button 
                onClick={() => handleNavigate('/profile')}
                className="bg-[#008080] hover:bg-[#006666] text-white"
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Need Help?
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click on any card to access its features</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}