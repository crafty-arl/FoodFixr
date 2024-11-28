'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

interface FoodFixrDashboardProps {
  username: string;
}

export function FoodFixrDashboard({ username }: FoodFixrDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={`min-h-screen bg-white p-4 flex items-center justify-center ${comfortaa.className}`} role="main">
      <Card className="w-full max-w-md mx-auto p-6 rounded-3xl bg-[#f5f5f5] shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
        {/* Welcome and Time Section */}
        <div className="w-full text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#333333]" tabIndex={0}>Welcome, {username}!</h1>
          <p className={`text-lg text-[#666666] ${lexend.className}`} aria-live="polite" role="timer">
            Current time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <div className="w-40 h-40 md:w-48 md:h-48 relative">
            <Image
              src="/foodfixrlogo.png"
              alt="Food Fixr Logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <TooltipProvider>
          <nav className="grid grid-cols-3 gap-4 w-full max-w-sm mx-auto" aria-label="Main navigation">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`flex flex-col items-center gap-2 h-auto py-4 transition-all bg-white border-[#00FFFF] hover:bg-[#00FFFF]/10 focus:ring-2 focus:ring-[#00FFFF] focus:outline-none shadow-[0_4px_0_#00FFFF] hover:shadow-[0_2px_0_#00FFFF] active:shadow-none active:translate-y-1 ${lexend.className}`}
                  onClick={() => router.push('/account-page')}
                  aria-label="Go to Health and Self page"
                >
                  <Image
                    src="/healthselficon.png"
                    alt=""
                    width={64}
                    height={64}
                  />
                  <span className="text-xs text-[#333333]">Health & Self</span>
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
                  className={`flex flex-col items-center gap-2 h-auto py-4 transition-all bg-white border-[#00FFFF] hover:bg-[#00FFFF]/10 focus:ring-2 focus:ring-[#00FFFF] focus:outline-none shadow-[0_4px_0_#00FFFF] hover:shadow-[0_2px_0_#00FFFF] active:shadow-none active:translate-y-1 ${lexend.className}`}
                  onClick={() => router.push('/surveys-goals')}
                  aria-label="Go to Surveys and Goals page"
                >
                  <Image
                    src="/2.png"
                    alt=""
                    width={64}
                    height={64}
                  />
                  <span className="text-xs text-[#333333]">Surveys & Goals</span>
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
                  className={`flex flex-col items-center gap-2 h-auto py-4 transition-all bg-white border-[#00FFFF] hover:bg-[#00FFFF]/10 focus:ring-2 focus:ring-[#00FFFF] focus:outline-none shadow-[0_4px_0_#00FFFF] hover:shadow-[0_2px_0_#00FFFF] active:shadow-none active:translate-y-1 ${lexend.className}`}
                  onClick={() => router.push('/food-journal')}
                  aria-label="Go to Food Journal page"
                >
                  <Image
                    src="/3.png"
                    alt=""
                    width={64}
                    height={64}
                  />
                  <span className="text-xs text-[#333333]">Food Journal</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Track your meals and nutrition</p>
              </TooltipContent>
            </Tooltip>
          </nav>
        </TooltipProvider>
      </Card>
    </div>
  )
}