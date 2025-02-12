'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'
import { Menu, User, LogOut, Sun, Moon } from 'lucide-react'
import { account } from '@/app/appwrite'
import { useTheme } from 'next-themes'
import { database } from '@/app/appwrite'
import { Query } from 'appwrite'
import Cookies from 'js-cookie'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

type ScoreDisplay = {
  points: number;
  emoji: string;
  label: string;
  color: string;
}

type CategoryScore = {
  totalPoints: number;
  questionCount: number;
  averageScore: number;
  scoreDisplay: ScoreDisplay;
}

type SurveyCategory = {
  name: string;
  icon: React.ReactNode;
  hasNotification?: boolean;
  questionCount?: number;
  answeredCount?: number;
}

type FoodFixrMenuDrawerProps = {
  children: React.ReactNode;
  username: string;
  categoryScores?: { [key: string]: CategoryScore };
}

const getScoreDisplay = (percentage: number): ScoreDisplay => {
  const points = Math.round((percentage / 100) * 8 * 10) / 10;
  
  if (points >= 7.2) return { points, emoji: "🌟", label: "Outstanding", color: "text-emerald-600" };
  if (points >= 6.4) return { points, emoji: "✨", label: "Excellent", color: "text-green-600" };
  if (points >= 5.6) return { points, emoji: "😊", label: "Very Good", color: "text-green-500" };
  if (points >= 4.8) return { points, emoji: "👍", label: "Good", color: "text-lime-500" };
  if (points >= 4.0) return { points, emoji: "😐", label: "Average", color: "text-yellow-500" };
  if (points >= 3.2) return { points, emoji: "🤔", label: "Fair", color: "text-orange-500" };
  if (points >= 2.4) return { points, emoji: "😕", label: "Below Average", color: "text-orange-600" };
  if (points >= 1.6) return { points, emoji: "😟", label: "Poor", color: "text-red-500" };
  if (points >= 0.8) return { points, emoji: "😢", label: "Very Poor", color: "text-red-600" };
  return { points, emoji: "❗", label: "Critical", color: "text-red-700" };
};

export function FoodFixrMenuDrawerComponent({ 
  children, 
  username,
  categoryScores = {} 
}: FoodFixrMenuDrawerProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [healthScore, setHealthScore] = useState<ScoreDisplay>({ points: 0, emoji: "❗", label: "Critical", color: "text-red-700" })
  const [storedUsername, setStoredUsername] = useState<string>(username)

  const surveyCategories: SurveyCategory[] = [
    { name: 'Toxins', icon: <Image src="/toxins.png" alt="Toxins" width={24} height={24} />, hasNotification: true },
    { name: 'Sugar', icon: <Image src="/sugar.png" alt="Sugar" width={24} height={24} />, hasNotification: true },
    { name: 'Alkalinity', icon: <Image src="/alkalinity.png" alt="Alkalinity" width={24} height={24} /> },
    { name: 'Food Combining', icon: <Image src="/foodcombining.png" alt="Food Combining" width={24} height={24} /> },
    { name: 'Timing', icon: <Image src="/mealtiming.png" alt="Timing" width={24} height={24} /> },
    { name: 'Pre_probiotics', icon: <Image src="/pre_probiotics.png" alt="Pre/probiotics" width={24} height={24} />, hasNotification: true },
    { name: 'Macros', icon: <Image src="/macronutrient_balance.png" alt="Macros" width={24} height={24} /> },
    { name: 'Gut_BrainHealth', icon: <Image src="/gut_brainsupport.png" alt="Gut/Brain Health" width={24} height={24} />, hasNotification: true },
  ];

  useEffect(() => {
    setMounted(true)
  }, [])

  // Poll for logged in user every 30 seconds
  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const session = await account.getSession('current')
        if (session) {
          const savedUsername = Cookies.get('foodfixr_username')
          if (savedUsername) {
            setStoredUsername(savedUsername)
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Session check failed:', error)
        router.push('/login')
      }
    }

    // Initial check
    checkLoggedInUser()

    // Set up polling interval
    const interval = setInterval(checkLoggedInUser, 30000)

    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    if (username) {
      Cookies.set('foodfixr_username', username, { expires: 7 })
      setStoredUsername(username)
    } else {
      const savedUsername = Cookies.get('foodfixr_username')
      if (savedUsername) {
        setStoredUsername(savedUsername)
      } else {
        router.push('/login')
      }
    }
  }, [username, router])

  useEffect(() => {
    const fetchAndCalculateScores = async () => {
      const uniqueId = Cookies.get('uniqueId')
      if (!uniqueId) return

      try {
        const responses = await database.listDocuments(
          'foodfixrdb',
          'user_surveryquestions_log',
          [
            Query.equal('userid', uniqueId),
            Query.limit(100)
          ]
        )

        const scores: { [key: string]: CategoryScore } = {};
        
        responses.documents.forEach(response => {
          const category = response.category;
          
          if (!scores[category]) {
            scores[category] = {
              totalPoints: 0,
              questionCount: 0,
              averageScore: 0,
              scoreDisplay: getScoreDisplay(0)
            };
          }
          
          scores[category].totalPoints += response.survey_pts;
          scores[category].questionCount += 1;
          scores[category].averageScore = scores[category].totalPoints / scores[category].questionCount;
          
          const percentage = (scores[category].averageScore / 8) * 100;
          scores[category].scoreDisplay = getScoreDisplay(percentage);
        });

        // Calculate total average score
        const categories = Object.values(scores);
        if (categories.length > 0) {
          const totalAverage = categories.reduce((sum, cat) => sum + cat.averageScore, 0) / categories.length;
          const percentage = (totalAverage / 8) * 100;
          setHealthScore(getScoreDisplay(percentage));
        }

      } catch (error) {
        console.error('Error fetching and calculating scores:', error);
      }
    };

    fetchAndCalculateScores();
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current')
      Cookies.remove('foodfixr_username')
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (!mounted || !storedUsername) return null

  return (
    <div className={`min-h-screen bg-background p-4 flex items-center justify-center ${comfortaa.className}`} role="main">
      <Drawer>
        <DrawerTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="fixed top-4 left-4"
            aria-label="Open Menu"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <div className="flex justify-between items-center">
                <DrawerTitle className="text-2xl font-bold text-foreground">FoodFixr Menu</DrawerTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <DrawerDescription className="text-muted-foreground">
                Welcome, {storedUsername}
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              {/* Mini HUD */}
              <Card 
                className="mb-6 p-4 bg-card shadow-[0_4px_10px_rgba(0,0,0,0.2)] cursor-pointer hover:bg-accent"
                onClick={() => router.push('/')}
                role="button"
                aria-label={`View ${storedUsername}'s Profile`}
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-[#00FFFF]/20 p-2">
                    <User className="h-6 w-6 text-[#008080]" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold text-foreground ${lexend.className}`}>
                      {storedUsername}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm ${healthScore.color}`} aria-label={`Health Score is ${healthScore.points.toFixed(1)} out of 8`}>
                        {healthScore.emoji} {healthScore.points.toFixed(1)}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        ({healthScore.label})
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notification Bar */}
              <Card 
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-card shadow-[0_4px_10px_rgba(0,0,0,0.2)]" 
                role="region" 
                aria-label="Survey Notifications"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-base sm:text-lg font-semibold text-foreground ${lexend.className}`}>
                    Survey Alerts
                  </h2>
                  {Object.values(categoryScores).length < surveyCategories.length && (
                    <Badge 
                      variant="secondary" 
                      className="bg-[#00FFFF]/20 text-[#008080] text-xs sm:text-sm px-2 py-1"
                      aria-label={`${surveyCategories.length - Object.values(categoryScores).length} categories remaining`}
                    >
                      {surveyCategories.length - Object.values(categoryScores).length} Categories
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {Object.values(categoryScores).length < surveyCategories.length ? (
                    <div className="max-h-[200px] overflow-y-auto pr-1 -mr-1">
                      {surveyCategories
                        .filter(category => !categoryScores[category.name])
                        .map((category) => (
                          <button 
                            key={category.name} 
                            className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors mb-2 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:ring-offset-2"
                            onClick={() => router.push('/surveys-goals')}
                            aria-label={`Start ${category.name} survey`}
                          >
                            <div className="flex items-center min-w-0">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                                {category.icon}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground ml-2 truncate">
                                Take the {category.name} survey
                              </p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-[#008080] ml-2 text-xs whitespace-nowrap flex-shrink-0"
                            >
                              Start Survey
                            </Badge>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <div 
                      className="text-xs sm:text-sm text-muted-foreground text-center py-2 sm:py-3"
                      role="status"
                      aria-label="Survey completion status"
                    >
                      All surveys completed! 🎉
                    </div>
                  )}
                </div>
              </Card>

              {/* Navigation Buttons */}
              <TooltipProvider>
                <div className="grid grid-cols-3 gap-4 w-full max-w-sm mx-auto" role="navigation">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`flex flex-col items-center gap-2 h-auto py-4 transition-all bg-background border-[#008080] hover:bg-[#00FFFF]/10 shadow-[0_4px_0_#008080] hover:shadow-[0_2px_0_#008080] active:shadow-none active:translate-y-1 ${lexend.className}`}
                        onClick={() => router.push('/account-page')}
                        aria-label="Go to Health and Self section"
                      >
                        <Image
                          src="/healthselficon.png"
                          alt=""
                          width={64}
                          height={64}
                          role="presentation"
                        />
                        <span className="text-xs text-foreground">Health & Self</span>
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
                        className={`flex flex-col items-center gap-2 h-auto py-4 transition-all bg-background border-[#008080] hover:bg-[#00FFFF]/10 shadow-[0_4px_0_#008080] hover:shadow-[0_2px_0_#008080] active:shadow-none active:translate-y-1 ${lexend.className}`}
                        onClick={() => router.push('/surveys-goals')}
                        aria-label="Go to Surveys and Goals section"
                      >
                        <Image
                          src="/2.png"
                          alt=""
                          width={64}
                          height={64}
                          role="presentation"
                        />
                        <span className="text-xs text-foreground">Surveys & Goals</span>
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
                        className={`flex flex-col items-center gap-2 h-auto py-4 transition-all bg-background border-muted hover:bg-background cursor-not-allowed opacity-70 ${lexend.className}`}
                        disabled
                        aria-label="Food Journal section - Coming Soon"
                      >
                        <Image
                          src="/3.png"
                          alt=""
                          width={64}
                          height={64}
                          role="presentation"
                          className="opacity-50"
                        />
                        <span className="text-xs text-foreground">Food Journal</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground">
                          Coming Soon
                        </Badge>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Food Journal feature coming soon!</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
            <DrawerFooter>
              <Button 
                variant="destructive" 
                className="mb-2 bg-red-600 hover:bg-red-700"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" aria-label="Close Menu">Close Menu</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      {children}
    </div>
  )
}