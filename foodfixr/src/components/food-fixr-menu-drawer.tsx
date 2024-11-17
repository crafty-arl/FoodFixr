'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'
import { Bell, Menu, User } from 'lucide-react'

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

export function FoodFixrMenuDrawerComponent({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <div className={`min-h-screen bg-white p-4 flex items-center justify-center ${comfortaa.className}`} role="main">
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
              <DrawerTitle className="text-2xl font-bold text-[#333333]">FoodFixr Menu</DrawerTitle>
              <DrawerDescription className="text-[#666666]">Navigate your health journey</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              {/* Mini HUD */}
              <Card 
                className="mb-6 p-4 bg-[#f5f5f5] shadow-[0_4px_10px_rgba(0,0,0,0.2)] cursor-pointer hover:bg-[#f0f0f0]"
                onClick={() => router.push('/')}
                role="button"
                aria-label="View User Profile"
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-[#00FFFF]/20 p-2">
                    <User className="h-6 w-6 text-[#008080]" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold text-[#333333] ${lexend.className}`}>User Profile</h2>
                    <p className="text-sm text-[#666666]" aria-label="Health Score is 85 out of 100">Health Score: 85/100</p>
                  </div>
                </div>
              </Card>

              {/* Notification Bar */}
              <Card className="mb-6 p-4 bg-[#f5f5f5] shadow-[0_4px_10px_rgba(0,0,0,0.2)]" role="region" aria-label="Notifications">
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold text-[#333333] ${lexend.className}`}>Notifications</h2>
                  <Badge variant="secondary" className="bg-[#00FFFF]/20 text-[#008080]">2 New</Badge>
                </div>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-[#666666]">New health tip available!</p>
                  <p className="text-sm text-[#666666]">Don't forget to log your lunch</p>
                </div>
              </Card>

              {/* Navigation Buttons */}
              <TooltipProvider>
                <div className="grid grid-cols-3 gap-4 w-full max-w-sm mx-auto" role="navigation">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`flex flex-col items-center gap-2 h-auto py-4 transition-all bg-white border-[#008080] hover:bg-[#00FFFF]/10 shadow-[0_4px_0_#008080] hover:shadow-[0_2px_0_#008080] active:shadow-none active:translate-y-1 ${lexend.className}`}
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
                        className={`flex flex-col items-center gap-2 h-auto py-4 transition-all bg-white border-[#008080] hover:bg-[#00FFFF]/10 shadow-[0_4px_0_#008080] hover:shadow-[0_2px_0_#008080] active:shadow-none active:translate-y-1 ${lexend.className}`}
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
                        className={`flex flex-col items-center gap-2 h-auto py-4 transition-all bg-white border-[#008080] hover:bg-[#00FFFF]/10 shadow-[0_4px_0_#008080] hover:shadow-[0_2px_0_#008080] active:shadow-none active:translate-y-1 ${lexend.className}`}
                        onClick={() => router.push('/food-journal')}
                        aria-label="Go to Food Journal section"
                      >
                        <Image
                          src="/3.png"
                          alt=""
                          width={64}
                          height={64}
                          role="presentation"
                        />
                        <span className="text-xs text-[#333333]">Food Journal</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Track your meals and nutrition</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
            <DrawerFooter>
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