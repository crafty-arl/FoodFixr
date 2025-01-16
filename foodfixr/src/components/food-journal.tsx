'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Comfortaa, Lexend } from 'next/font/google'
import { useToast } from "@/hooks/use-toast"
import { databases } from '@/lib/appwrite-config'
import { ID } from 'appwrite'
import Cookies from 'js-cookie'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  notes: string;
  timestamp: string;
}

interface FoodJournalProps {
  onSave?: () => void;
  loading?: boolean;
}

const loadingMessages = [
  "Analyzing your food choices...",
  "Calculating nutritional values...",
  "Generating personalized insights...",
  "Almost there...",
]

export function FoodJournal({ onSave, loading = false }: FoodJournalProps) {
  const [currentItem, setCurrentItem] = useState<FoodItem>({
    id: '',
    name: '',
    quantity: '',
    notes: '',
    timestamp: new Date().toISOString()
  })
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0])
  const { toast } = useToast()

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length
      setLoadingMessage(loadingMessages[currentIndex])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (field: keyof FoodItem, value: string) => {
    setCurrentItem(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddItem = async () => {
    if (!currentItem.name || !currentItem.quantity) {
      toast({
        title: "Error",
        description: "Please fill in at least the food name and quantity.",
        variant: "destructive",
      })
      return
    }

    const uniqueId = Cookies.get('uniqueId')
    if (!uniqueId) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    try {
      const newItem = {
        ...currentItem,
        id: ID.unique(),
        timestamp: new Date().toISOString()
      }

      await databases.createDocument(
        'foodfixrdb',
        'food_journal',
        newItem.id,
        {
          ...newItem,
          userId: uniqueId
        }
      )

      setCurrentItem({
        id: '',
        name: '',
        quantity: '',
        notes: '',
        timestamp: new Date().toISOString()
      })

      toast({
        title: "Success",
        description: "Food item added to your journal.",
      })

      onSave?.()
    } catch (error) {
      console.error('Error adding food item:', error)
      toast({
        title: "Error",
        description: "Failed to save food item. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={`text-sm text-muted-foreground ${lexend.className}`}>
            {loadingMessage}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md bg-card shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
      <CardHeader>
        <CardTitle className={`text-2xl font-bold text-center ${comfortaa.className}`}>
          Food Journal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="food-name">Food Name</Label>
          <Input
            id="food-name"
            placeholder="Enter food name"
            value={currentItem.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            placeholder="e.g., 1 cup, 100g"
            value={currentItem.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes"
            value={currentItem.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-primary hover:bg-primary/90"
          onClick={handleAddItem}
        >
          Add Food Item
        </Button>
      </CardFooter>
    </Card>
  )
}