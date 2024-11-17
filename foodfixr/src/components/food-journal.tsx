'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera, Plus, X, Barcode, Calendar } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

type Ingredient = {
  name: string
  barcode: string
}

type FoodEntry = {
  food: string
  timeOfDay: string
  type: 'meal' | 'drink' | 'snack'
  image?: string
  date: string
  ingredients: Ingredient[]
}

const foodDatabase = [
  "Apple", "Banana", "Chicken Breast", "Salmon", "Broccoli", "Rice", "Pasta", "Egg", "Milk", "Bread",
  // Add more food items as needed
]

export function FoodJournalComponent() {
  const [entries, setEntries] = useState<FoodEntry[]>([
    {
      food: "Avocado Toast",
      timeOfDay: "morning",
      type: "meal",
      image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500&h=500&fit=crop",
      date: "2024-11-16",
      ingredients: [
        { name: "Whole Grain Bread", barcode: "123456789" },
        { name: "Avocado", barcode: "987654321" }
      ]
    },
    {
      food: "Green Smoothie", 
      timeOfDay: "morning",
      type: "drink",
      image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&h=500&fit=crop",
      date: "2024-11-16",
      ingredients: [
        { name: "Spinach", barcode: "111222333" },
        { name: "Banana", barcode: "444555666" },
        { name: "Almond Milk", barcode: "777888999" }
      ]
    },
  ])
  const [currentEntry, setCurrentEntry] = useState<FoodEntry>({
    food: '',
    timeOfDay: '',
    type: 'meal',
    date: new Date().toISOString().split('T')[0],
    ingredients: []
  })
  const [openAutocomplete, setOpenAutocomplete] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient>({ name: '', barcode: '' })

  const handleInputChange = (field: keyof FoodEntry, value: string) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (currentEntry.food && currentEntry.timeOfDay) {
      setEntries(prev => [...prev, { ...currentEntry, image: capturedImage || undefined }])
      setCurrentEntry({ food: '', timeOfDay: '', type: 'meal', date: selectedDate, ingredients: [] })
      setCapturedImage(null)
      setIsAddingEntry(false)
    }
  }

  const handleCameraCapture = () => {
    const simulatedImage = '/placeholder.svg?height=300&width=300'
    setCapturedImage(simulatedImage)
    
    setTimeout(() => {
      setCurrentEntry(prev => ({
        ...prev,
        food: 'Grilled Chicken Salad',
        type: 'meal'
      }))
    }, 1000)
  }

  const handleBarcodeCapture = () => {
    const simulatedBarcode = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
    setCurrentIngredient(prev => ({ ...prev, barcode: simulatedBarcode }))
  }

  const addIngredient = () => {
    if (currentIngredient.name && currentIngredient.barcode) {
      setCurrentEntry(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, currentIngredient]
      }))
      setCurrentIngredient({ name: '', barcode: '' })
    }
  }

  const removeIngredient = (index: number) => {
    setCurrentEntry(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className={`container mx-auto p-4 max-w-7xl bg-white min-h-screen ${comfortaa.className}`} role="main">
      <div className="flex flex-col items-center mb-8">
        <Image src="/foodfixrlogo.png" alt="FoodFixr Logo" width={150} height={150} className="mb-4" />
        <h1 className={`text-3xl font-bold text-[#008080] mb-4 ${comfortaa.className}`}>Food Journal</h1>
        <Button 
          onClick={() => setIsAddingEntry(true)} 
          className="bg-[#008080] hover:bg-[#006666] text-white font-bold text-lg"
          aria-label="Add new food entry"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Entry
        </Button>
      </div>
      
      <Tabs defaultValue={selectedDate} className="w-full mb-6">
        <TabsList className="grid grid-cols-7 gap-2" aria-label="Select date">
          {[...Array(7)].map((_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateString = date.toISOString().split('T')[0]
            return (
              <TabsTrigger
                key={dateString}
                value={dateString}
                onClick={() => setSelectedDate(dateString)}
                className="flex flex-col items-center p-2 text-[#333333] hover:bg-[#f0f0f0]"
                aria-label={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              >
                <span className="text-sm">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="text-lg font-bold">{date.getDate()}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className={`text-[#008080] text-2xl ${comfortaa.className}`}>Add New Food Entry</DialogTitle>
            <DialogDescription className="text-[#666666] text-lg">
              Capture the meal and add ingredients with barcodes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleCameraCapture} 
                className="bg-[#008080] hover:bg-[#006666] text-white font-bold"
                aria-label="Take photo of food"
              >
                <Camera className="mr-2 h-4 w-4" /> Capture Food
              </Button>
            </div>
            {capturedImage && (
              <img src={capturedImage} alt="Captured food" className="w-full h-48 object-cover rounded" />
            )}

            <Popover open={openAutocomplete} onOpenChange={setOpenAutocomplete}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-[#333333] border-2 border-[#008080]"
                  aria-label="Select food item"
                >
                  {currentEntry.food ? currentEntry.food : "Select food..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" side="bottom" align="start">
                <Command>
                  <CommandInput placeholder="Search food..." />
                  <CommandEmpty>No food found.</CommandEmpty>
                  <CommandGroup>
                    {foodDatabase.map((food) => (
                      <CommandItem
                        key={food}
                        onSelect={() => {
                          handleInputChange('food', food)
                          setOpenAutocomplete(false)
                        }}
                      >
                        {food}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeOfDay" className="text-[#333333] text-lg">Time of Day</Label>
                <Select
                  value={currentEntry.timeOfDay}
                  onValueChange={(value) => handleInputChange('timeOfDay', value)}
                >
                  <SelectTrigger id="timeOfDay" className="border-2 border-[#008080]">
                    <SelectValue placeholder="Select time..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-[#333333] text-lg">Type</Label>
                <Select
                  value={currentEntry.type}
                  onValueChange={(value) => handleInputChange('type', value as 'meal' | 'drink' | 'snack')}
                >
                  <SelectTrigger id="type" className="border-2 border-[#008080]">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meal">Meal</SelectItem>
                    <SelectItem value="drink">Drink</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#333333] text-lg">Ingredients</Label>
              <div className="flex space-x-2">
                <Input
                  value={currentIngredient.name}
                  onChange={(e) => setCurrentIngredient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ingredient name"
                  className="border-2 border-[#008080]"
                  aria-label="Enter ingredient name"
                />
                <Button 
                  onClick={handleBarcodeCapture} 
                  className="bg-[#008080] hover:bg-[#006666] text-white"
                  aria-label="Scan ingredient barcode"
                >
                  <Barcode className="h-4 w-4" />
                </Button>
              </div>
              {currentIngredient.barcode && (
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-lg text-[#333333] ${lexend.className}`}>Barcode: {currentIngredient.barcode}</span>
                  <Button 
                    onClick={addIngredient} 
                    size="sm" 
                    className="bg-[#008080] hover:bg-[#006666] text-white font-bold"
                    aria-label="Add ingredient to list"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="h-[100px] w-full border-2 border-[#008080] rounded-md p-2">
              {currentEntry.ingredients.map((ingredient, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <span className={`text-lg text-[#333333] ${lexend.className}`}>{ingredient.name} - {ingredient.barcode}</span>
                  <Button 
                    onClick={() => removeIngredient(index)} 
                    size="sm" 
                    variant="ghost"
                    aria-label={`Remove ${ingredient.name}`}
                    className="text-[#cc0000] hover:text-[#990000]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>

            <Button 
              onClick={handleSave} 
              className="w-full bg-[#008080] hover:bg-[#006666] text-white text-lg font-bold"
              aria-label="Save food entry"
            >
              Save Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries
          .filter(entry => entry.date === selectedDate)
          .map((entry, index) => (
            <Card key={index} className="overflow-hidden border-2 border-[#008080]">
              <div className="aspect-square relative">
                <img 
                  src={entry.image || '/placeholder.svg?height=300&width=300'} 
                  alt={`Photo of ${entry.food}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-[#008080] bg-opacity-90 text-white p-4">
                  <p className={`font-bold text-xl ${lexend.className}`}>{entry.food}</p>
                  <p className={`text-lg ${lexend.className}`}>
                    {entry.timeOfDay} - {entry.type}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {entry.ingredients.map((ingredient, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="text-sm bg-white text-[#008080] font-bold px-2 py-1"
                      >
                        {ingredient.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  )
}