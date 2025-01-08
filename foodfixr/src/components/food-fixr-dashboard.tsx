'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'
import { useTheme } from 'next-themes'
import { User } from 'lucide-react'
import { database } from '@/app/appwrite'
import { Query } from 'appwrite'
import Cookies from 'js-cookie'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

interface FoodFixrDashboardProps {
  username: string;
}

export function FoodFixrDashboard({ username }: FoodFixrDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastLoginTime, setLastLoginTime] = useState<string | null>(null)
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)

    // Fetch last login time
    const fetchLastLogin = async () => {
      try {
        const uniqueId = Cookies.get('uniqueId')
        if (!uniqueId) return

        const userId = uniqueId.slice(2) // Remove 'ff' prefix
        const response = await database.listDocuments(
          'foodfixrdb',
          'daily_user_login_log',
          [
            Query.equal('userID', userId),
            Query.orderDesc('last_logged_in'),
            Query.limit(2) // Get last 2 to exclude current session
          ]
        )

        if (response.documents.length > 1) {
          // Get the second-to-last login (excluding current session)
          const lastLogin = new Date(response.documents[1].last_logged_in)
          setLastLoginTime(lastLogin.toLocaleString())
        }
      } catch (error) {
        console.error('Error fetching last login:', error)
      }
    }

    fetchLastLogin()
    return () => clearInterval(timer)
  }, [])

  if (!mounted) return null

  return (
    <div className={`min-h-screen bg-background p-2 sm:p-4 lg:p-6 flex items-center justify-center ${comfortaa.className}`} role="main">
      <Card className="w-full max-w-[95%] sm:max-w-xl lg:max-w-2xl mx-auto p-2 sm:p-4 lg:p-6 rounded-3xl bg-card shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
        {/* Welcome and Time Section */}
        <div className="w-full text-center mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-foreground" tabIndex={0}>Welcome, {username}!</h1>
          <p className={`text-sm sm:text-base text-muted-foreground ${lexend.className}`} aria-live="polite" role="timer">
            Current time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {lastLoginTime && (
            <p className={`text-xs sm:text-sm text-muted-foreground mt-2 ${lexend.className}`}>
              Last login: {lastLoginTime}
            </p>
          )}
        </div>

        {/* Logo Section */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 relative">
            <Image
              src="/FoodFixrLogo.png"
              alt="Food Fixr Logo"
              width={192}
              height={192}
              quality={100}
              priority
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <TooltipProvider>
          <nav className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 w-full max-w-full mx-auto" aria-label="Main navigation">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`flex flex-row sm:flex-col items-center gap-2 h-auto py-2 sm:py-3 px-2 sm:px-3 transition-all bg-background border-[#00FFFF] hover:bg-[#00FFFF]/10 focus:ring-2 focus:ring-[#00FFFF] focus:outline-none shadow-[0_4px_0_#00FFFF] hover:shadow-[0_2px_0_#00FFFF] active:shadow-none active:translate-y-1 ${lexend.className}`}
                  onClick={() => router.push('/account-page')}
                  aria-label="Go to Health and Self page"
                >
                  <Image
                    src="/healthselficon.png"
                    alt=""
                    width={96}
                    height={96}
                    quality={100}
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
                  />
                  <span className="text-sm whitespace-nowrap sm:whitespace-normal sm:text-center text-foreground">Health & Self</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Track your health and wellness</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`flex flex-row sm:flex-col items-center gap-2 h-auto py-2 sm:py-3 px-2 sm:px-3 transition-all bg-background border-[#00FFFF] hover:bg-[#00FFFF]/10 focus:ring-2 focus:ring-[#00FFFF] focus:outline-none shadow-[0_4px_0_#00FFFF] hover:shadow-[0_2px_0_#00FFFF] active:shadow-none active:translate-y-1 ${lexend.className}`}
                  onClick={() => router.push('/surveys-goals')}
                  aria-label="Go to Surveys and Goals page"
                >
                  <Image
                    src="/2.png"
                    alt=""
                    width={96}
                    height={96}
                    quality={100}
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
                  />
                  <span className="text-sm whitespace-nowrap sm:whitespace-normal sm:text-center text-foreground">Surveys & Goals</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Complete surveys and set goals</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`flex flex-row sm:flex-col items-center gap-2 h-auto py-2 sm:py-3 px-2 sm:px-3 transition-all bg-background border-[#00FFFF] hover:bg-[#00FFFF]/10 focus:ring-2 focus:ring-[#00FFFF] focus:outline-none shadow-[0_4px_0_#00FFFF] hover:shadow-[0_2px_0_#00FFFF] active:shadow-none active:translate-y-1 ${lexend.className}`}
                  onClick={() => router.push('/food-fixr-groceries')}
                  aria-label="Go to Custom Grocery List page"
                >
                  <Image
                    src="/Groceries-List.png"
                    alt=""
                    width={96}
                    height={96}
                    quality={100}
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
                  />
                  <span className="text-sm whitespace-nowrap sm:whitespace-normal sm:text-center text-foreground">Custom Grocery List</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate your personalized grocery list</p>
              </TooltipContent>
            </Tooltip>
          </nav>
        </TooltipProvider>

        {/* Food For Thought and Food Journal Cards */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Card 
            className="p-2 sm:p-3 bg-card shadow-[0_4px_10px_rgba(0,0,0,0.2)] cursor-pointer hover:bg-accent w-full sm:w-1/2"
            onClick={() => router.push('/food-for-thought')}
            role="button"
            aria-label="View Food For Thought"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="rounded-full bg-[#00FFFF]/20 p-2 sm:p-3">
                <Image
                  src="/food_forthought_icon.jpg"
                  alt=""
                  width={96}
                  height={96}
                  quality={100}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
              </div>
              <div>
                <h2 className={`text-sm sm:text-base font-semibold text-foreground ${lexend.className}`}>Food For Thought</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">The courses to help you THRIVE</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-2 sm:p-3 bg-card shadow-[0_4px_10px_rgba(0,0,0,0.2)] cursor-not-allowed opacity-70 w-full sm:w-1/2"
            role="button"
            aria-label="Food Journal - Coming Soon"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="rounded-full bg-[#00FFFF]/20 p-2 sm:p-3">
                <Image
                  src="/scanner_icon.png"
                  alt=""
                  width={96}
                  height={96}
                  quality={100}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
              </div>
              <div>
                <h2 className={`text-sm sm:text-base font-semibold text-foreground ${lexend.className}`}>
                  Food Journal
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Coming Soon</p>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  )
}