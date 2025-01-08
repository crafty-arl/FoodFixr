'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Plus, Info, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Comfortaa } from 'next/font/google'
import { toast } from "@/hooks/use-toast"
import Cookies from 'js-cookie'
import { Query } from 'appwrite'
import { database } from '@/app/appwrite'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const comfortaa = Comfortaa({ subsets: ['latin'] })

type GroceryItem = {
  name: string
  completed: boolean
  date: Date
  fun_fact?: string
  why?: string
  usage_suggestions?: string
  category?: string
}

type Recommendation = {
  name: string
  category: string
  benefits: string
  fun_fact: string
  usage: string[]
}

// Add type for ingredients
type Ingredient = {
  name: string;
  category: string;
  fun_fact: string;
  benefits: string;
  usage: string[];
}

export function FoodJournalComponent() {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([])
  const [newItem, setNewItem] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Loading messages array
  const loadingMessages = [
    "Hmm... thinking about those proteins 🤔",
    "Checking what's fresh in the veggie aisle 🥬",
    "Hunting for the best healthy fats 🥑",
    "Making sure everything fits your diet 🍽️",
    "Calculating nutritional benefits 🧮",
    "Finding fun food facts 🤓",
    "Matching ingredients to your goals 🎯",
    "Cooking up some recipe ideas 👨‍🍳",
    "Double-checking allergies 🔍",
    "Almost done with your personalized list! ✨"
  ]

  // Function to cycle through loading messages
  useEffect(() => {
    if (isLoading) {
      let messageIndex = 0
      const interval = setInterval(() => {
        setLoadingMessage(loadingMessages[messageIndex])
        messageIndex = (messageIndex + 1) % loadingMessages.length
      }, 2000) // Change message every 2 seconds

      return () => clearInterval(interval)
    }
  }, [isLoading])

  // Fetch and log grocery items
  const fetchGroceryItems = async () => {
    const uniqueId = Cookies.get('uniqueId')
    if (!uniqueId) {
      console.log('No user ID found')
      return
    }

    try {
      const existingGroceryResult = await database.listDocuments(
        'foodfixrdb',
        'food_fixr_grocery_items',
        [Query.equal('userId', uniqueId)]
      )

      console.log('=== User Grocery List Items ===')
      existingGroceryResult.documents.forEach(doc => {
        // Handle both array and single string cases
        const items = typeof doc.grocery_items === 'string' 
          ? [doc.grocery_items] 
          : doc.grocery_items || []
        
        // Also get items from fun facts if they exist
        const funFactItems = doc.grocery_fun_facts 
          ? doc.grocery_fun_facts.map((ff: { ingredient: string }) => ff.ingredient)
          : []
        
        const allItems = [...items, ...funFactItems]
        
        allItems.forEach((item: string, index: number) => {
          if (item) {
            console.log(`
Document ID: ${doc.$id}
User ID: ${doc.userId}
Grocery Gen ID: ${doc.grocery_genID}
Item ${index + 1}: ${item}
Generated Date: ${doc.grocery_gen_date}
${doc.grocery_fun_facts?.[index]?.fun_fact ? `Fun Fact: ${doc.grocery_fun_facts[index].fun_fact}` : ''}
----------------------------------------`)
          }
        })
      })

      // Initialize groceryList state with existing items
      const formattedItems = existingGroceryResult.documents.flatMap(doc => {
        const items = typeof doc.grocery_items === 'string' 
          ? [doc.grocery_items] 
          : doc.grocery_items || []
        
        const funFacts = doc.grocery_fun_facts || []
        const genDate = doc.grocery_gen_date 
          ? new Date(doc.grocery_gen_date)
          : new Date()

        return items.map((item: string, index: number) => {
          // Parse the fun facts string if it exists
          let funFactData = { category: '', fun_fact: '', benefits: '', usage: '' }
          if (funFacts[index]) {
            const [name, category, fun_fact, benefits, usage] = funFacts[index].split('|')
            funFactData = { category, fun_fact, benefits, usage }
          }

          // Extract category from item name if present (e.g., "Salmon (Proteins)")
          let itemName = item
          let itemCategory = funFactData.category
          const categoryMatch = item.match(/\((.*?)\)$/)
          if (categoryMatch) {
            itemName = item.replace(` (${categoryMatch[1]})`, '').trim()
            itemCategory = categoryMatch[1]
          }

          return {
            name: itemName,
            category: itemCategory,
            completed: false,
            date: genDate,
            fun_fact: funFactData.fun_fact,
            why: funFactData.benefits,
            usage_suggestions: funFactData.usage
          }
        })
      })
      
      // Sort items by date, newest first
      const sortedItems = formattedItems.sort((a, b) => b.date.getTime() - a.date.getTime())
      setGroceryList(sortedItems)

    } catch (error) {
      console.error('Error fetching grocery items:', error)
    }
  }

  // Use fetchGroceryItems in useEffect
  useEffect(() => {
    fetchGroceryItems()
  }, []) // Empty dependency array means this runs once on mount

  const addItem = async () => {
    if (newItem.trim()) {
      const timestamp = new Date()
      const uniqueId = Cookies.get('uniqueId')
      
      if (!uniqueId) {
        toast({
          title: "Error",
          description: "User ID not found. Please log in.",
          variant: "destructive"
        })
        return
      }

      try {
        // Create document data
        const documentId = Math.floor(Math.random() * 999999999).toString()
        const groceryGenId = Math.floor(Math.random() * 999999999).toString()
        
        const documentData = {
          userId: uniqueId,
          grocery_genID: groceryGenId,
          grocery_items: [newItem.trim()],
          grocery_gen_date: timestamp.toISOString(),
          grocery_fun_facts: [] // Empty array for manually added items
        }

        // Save to database
        const savedDoc = await database.createDocument(
          'foodfixrdb',
          'food_fixr_grocery_items',
          documentId,
          documentData,
          ["read(\"any\")"]
        )

        // Update UI
        setGroceryList(prev => [
          {
            name: newItem.trim(),
            completed: false,
            date: timestamp
          },
          ...prev
        ])

        setNewItem('')
        
        toast({
          title: "Success",
          description: "Item added to your list",
        })
      } catch (error) {
        console.error('Failed to save item to database:', error)
        toast({
          title: "Warning",
          description: "Failed to save item to database",
          variant: "destructive"
        })
      }
    }
  }

  const toggleItem = (itemToToggle: GroceryItem) => {
    setGroceryList(prev => 
      prev.map(item => 
        item === itemToToggle ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const removeItem = (index: number) => {
    setGroceryList(prev => prev.filter((_, i) => i !== index))
  }

  const handleGetRecommendations = async () => {
    setIsLoading(true)
    try {
      const uniqueId = Cookies.get('uniqueId')
      if (!uniqueId) {
        toast({
          title: "Error",
          description: "Please log in to get recommendations",
          variant: "destructive"
        })
        return
      }

      // Fetch user profile
      const userProfileResult = await database.listDocuments(
        'foodfixrdb',
        'user_profile',
        [Query.equal('userID', uniqueId)]
      )

      if (!userProfileResult.documents.length) {
        throw new Error('User profile not found')
      }

      const userProfile = userProfileResult.documents[0]
      console.log('Raw user profile data:', userProfile) // Debug log

      // Create profile data object with correct field names
      const profileData = {
        demographics: {
          age: userProfile.Age || 'Not specified',
          gender: userProfile.Gender || 'Not specified',
          weight: userProfile.Weight || 'Not specified',
          height: userProfile.Height || 'Not specified',
          activityLevel: userProfile.ActivityLevel || 'Not specified',
        },
        health: {
          conditions: Array.isArray(userProfile.HealthConcerns) ? userProfile.HealthConcerns : [],
          allergies: Array.isArray(userProfile.FoodAllergy) ? userProfile.FoodAllergy : [],
          anxietyLevel: userProfile.AnxietyLevel || 0,
          painLevel: userProfile.PainLevel || 0,
        },
        preferences: {
          dietary: Array.isArray(userProfile.DietaryPreference) ? userProfile.DietaryPreference : [],
        }
      }

      // Send request to webhooks endpoint
      try {
        const response = await fetch('/api/webhooks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: uniqueId,
            userProfile: profileData,
            task: {
              type: "generate_grocery_list",
              description: `Based on my profile:
- Health: Consider my ${userProfile.HealthConcerns?.length ? `health conditions (${userProfile.HealthConcerns.join(', ')})` : 'general health'}
${userProfile.FoodAllergy?.length ? `- Allergies: avoiding ${userProfile.FoodAllergy.join(', ')}` : ''}
- Diet: ${userProfile.DietaryPreference?.length ? `Following ${userProfile.DietaryPreference.join(', ')} diet(s)` : 'No specific diet'}
- Activity: ${userProfile.ActivityLevel || 'Standard'} activity level
- Physical State: ${userProfile.PainLevel > 5 ? 'Managing pain and inflammation' : 'General wellness'}, ${userProfile.AnxietyLevel > 5 ? 'managing stress/anxiety' : 'maintaining wellbeing'}

Current grocery items: ${groceryList.map((item: GroceryItem) => item.name).join(', ') || 'None'}

Please suggest nutrient-dense ingredients distributed across these categories:
1. Proteins: High-quality protein sources for muscle maintenance and repair
2. Carbohydrates: Mix of fruits and vegetables for vitamins, minerals, and fiber
3. Healthy Fats: Essential fatty acids and nutrient-dense fat sources

For each ingredient, provide:
1. The ingredient name
2. Why it's specifically beneficial for my health profile and goals
3. An interesting nutritional or historical fun fact
4. At least two practical ways to use it in meals or recipes`
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.text()
          console.error('Webhook response error:', errorData)
          throw new Error(`Failed to get recommendations: ${errorData}`)
        }

        const data = await response.json()
        console.log('Webhook response data:', data)
        
        // Check for ingredients in the correct response format
        const ingredients = data.webhookResponse?.output?.ingredients || data.webhookResponse?.ingredients
        if (!ingredients) {
          throw new Error('No ingredients found in response')
        }

        try {
          const documentId = Math.floor(Math.random() * 999999999).toString()
          const groceryGenId = Math.floor(Math.random() * 999999999).toString()
          const timestamp = new Date().toISOString()

          // Format the data for database
          const documentData = {
            userId: uniqueId,
            grocery_genID: groceryGenId,
            grocery_items: ingredients.map((item: Ingredient) => `${item.name} (${item.category})`),
            grocery_gen_date: timestamp,
            grocery_fun_facts: ingredients.map((item: Ingredient) => 
              `${item.name}|${item.category}|${item.fun_fact}|${item.benefits}|${item.usage.join('; ')}`
            )
          }

          // Save to database
          await database.createDocument(
            'foodfixrdb',
            'food_fixr_grocery_items',
            documentId,
            documentData,
            ["read(\"any\")"]
          )

          // Refresh the grocery list
          await fetchGroceryItems()

          toast({
            title: "Success",
            description: `Generated and saved ${ingredients.length} recommendations`,
          })
        } catch (error) {
          console.error('Error saving recommendations to database:', error)
          toast({
            title: "Warning",
            description: "Failed to save recommendations to database",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Fetch error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch recommendations')
      }
    } catch (error) {
      console.error('Error getting recommendations:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get recommendations",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white w-full px-4 sm:px-6 lg:px-8 py-6" role="main">
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
            Daily Ingredient Recommendations
          </h1>
        </div>

        <div className="flex flex-col items-center gap-2 mb-6">
          <Button 
            onClick={handleGetRecommendations}
            disabled={isLoading}
            className="bg-[#008080] hover:bg-[#006666] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Getting Recommendations...
              </div>
            ) : (
              'Get Recommend Groceries'
            )}
          </Button>
          {isLoading && (
            <div className="text-[#008080] text-sm animate-pulse mt-2">
              {loadingMessage}
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add ingredient to your list..."
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            className="flex-1"
          />
          <Button onClick={addItem}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#008080]">Your Grocery List</h2>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Proteins">🥩 Proteins</SelectItem>
              <SelectItem value="Carbohydrates">🥬 Carbohydrates</SelectItem>
              <SelectItem value="Healthy Fats">🥑 Healthy Fats</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {groceryList
            .filter((item: GroceryItem) => selectedCategory === 'all' || item.category === selectedCategory)
            .map((item: GroceryItem, index) => (
              <div 
                key={`${item.name}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleItem(item)}
                    className="w-4 h-4"
                  />
                  <span className={item.completed ? 'line-through text-gray-500' : ''}>
                    {item.name}
                    {item.category && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({item.category})
                      </span>
                    )}
                  </span>
                </div>
                <TooltipProvider>
                  <Tooltip defaultOpen={false}>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-[#008080] hover:text-[#006666] transition-colors"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="left"
                      align="center"
                      className="max-w-[300px] p-4 text-sm bg-white border border-[#008080] shadow-lg"
                    >
                      <div className="space-y-2">
                        {item.category && (
                          <>
                            <p className="text-[#006666] font-semibold">Category:</p>
                            <p className="text-[#006666]">
                              {item.category}
                            </p>
                          </>
                        )}
                        
                        <p className="text-[#006666] font-semibold">Benefits:</p>
                        <p className="text-[#006666]">
                          {item.why || "No benefits information available"}
                        </p>
                        
                        <p className="text-[#006666] font-semibold mt-2">How to Use:</p>
                        <p className="text-[#006666]">
                          {item.usage_suggestions || "No usage suggestions available"}
                        </p>

                        <p className="text-[#006666] font-semibold mt-2">Fun Fact:</p>
                        <p className="text-[#006666]">
                          {item.fun_fact || "No fun fact available"}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}