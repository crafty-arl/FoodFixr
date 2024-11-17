'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'
import { Sofa, PersonStanding, Users, Dumbbell, Trophy, X } from 'lucide-react'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

type UserData = {
  age: string
  gender: string
  weight: string
  height: string
  activityLevel: string
  healthConditions: string[]
  foodAllergies: string[]
  dietaryPreferences: string[]
  anxietyLevel: number
  painLevel: number
}

// Mock initial user data
const initialUserData: UserData = {
  age: '30',
  gender: 'female',
  weight: '150',
  height: '65',
  activityLevel: 'Moderate',
  healthConditions: ['Stress & Anxiety'],
  foodAllergies: ['Peanuts'],
  dietaryPreferences: ['Vegetarian'],
  anxietyLevel: 4,
  painLevel: 2
}

export function ProfileEdit() {
  const [userData, setUserData] = useState<UserData>(initialUserData)
  const [isEditing, setIsEditing] = useState(false)

  const updateUserData = (field: keyof UserData, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }))
  }

  const addItem = (field: 'healthConditions' | 'foodAllergies' | 'dietaryPreferences', value: string) => {
    if (value && !userData[field].includes(value)) {
      updateUserData(field, [...userData[field], value])
    }
  }

  const removeItem = (field: 'healthConditions' | 'foodAllergies' | 'dietaryPreferences', item: string) => {
    updateUserData(field, userData[field].filter(i => i !== item))
  }

  const handleSave = async () => {
    console.log('Saving user data:', userData)
    // Here you would typically send this data to your backend
    setIsEditing(false)
    alert('Profile updated successfully!')
  }

  const ActivityLevelCard = ({ level, icon: Icon, description }: { level: string, icon: any, description: string }) => (
    <Card 
      className={`cursor-pointer transition-all ${
        userData.activityLevel === level 
          ? 'border-[#006666] shadow-[0_0_15px_rgba(0,102,102,0.5)]' 
          : 'border-gray-400 hover:border-[#006666] hover:shadow-md'
      }`}
      onClick={() => updateUserData('activityLevel', level)}
      role="radio"
      aria-checked={userData.activityLevel === level}
    >
      <CardContent className="flex flex-col items-center p-6 text-center">
        <Icon className="w-12 h-12 mb-4 text-[#006666]" aria-hidden="true" />
        <h3 className={`text-lg font-semibold mb-2 text-gray-900 ${comfortaa.className}`}>{level}</h3>
        <p className={`text-sm text-gray-800 ${lexend.className}`}>{description}</p>
      </CardContent>
    </Card>
  )

  const CheckboxGroup = ({ items, field }: { items: string[], field: 'healthConditions' | 'foodAllergies' | 'dietaryPreferences' }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="group">
      {items.map((item) => (
        <div key={item} className="flex items-center space-x-2">
          <Checkbox 
            id={item} 
            checked={userData[field].includes(item)}
            onCheckedChange={(checked) => {
              if (checked) {
                addItem(field, item)
              } else {
                removeItem(field, item)
              }
            }}
            disabled={!isEditing}
          />
          <Label htmlFor={item} className={`text-sm text-gray-800 ${lexend.className}`}>{item}</Label>
        </div>
      ))}
    </div>
  )

  return (
    <div className={`min-h-screen bg-white p-4 flex flex-col items-center justify-center ${comfortaa.className}`}>
      <Card className="w-full max-w-4xl bg-[#ffffff] shadow-[0_8px_30px_rgba(0,102,102,0.2)]">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="w-24 h-24 relative">
              <Image
                src="/foodfixrlogo.png"
                alt="Food Fixr Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="demographics" className="w-full">
            <TabsList className="grid w-full grid-cols-3" aria-label="Profile sections">
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            <TabsContent value="demographics" className="space-y-4">
              <div>
                <Label htmlFor="age" className="text-gray-900">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={userData.age}
                  onChange={(e) => updateUserData('age', e.target.value)}
                  className="bg-white border-[#006666] text-gray-900"
                  disabled={!isEditing}
                  aria-label="Enter your age"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-gray-900">Gender</Label>
                <Select 
                  onValueChange={(value) => updateUserData('gender', value)} 
                  value={userData.gender}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="gender" className="bg-white border-[#006666] text-gray-900">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weight" className="text-gray-900">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={userData.weight}
                  onChange={(e) => updateUserData('weight', e.target.value)}
                  className="bg-white border-[#006666] text-gray-900"
                  disabled={!isEditing}
                  aria-label="Enter your weight in pounds"
                />
              </div>
              <div>
                <Label htmlFor="height" className="text-gray-900">Height (inches)</Label>
                <Input
                  id="height"
                  type="number"
                  value={userData.height}
                  onChange={(e) => updateUserData('height', e.target.value)}
                  className="bg-white border-[#006666] text-gray-900"
                  disabled={!isEditing}
                  aria-label="Enter your height in inches"
                />
              </div>
              <div>
                <Label className="text-gray-900 mb-4 block">Activity Level:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup">
                  <ActivityLevelCard 
                    level="Sedentary" 
                    icon={Sofa} 
                    description="Lives on couch and computer" 
                  />
                  <ActivityLevelCard 
                    level="Light" 
                    icon={PersonStanding} 
                    description="Walks between screen time or shows" 
                  />
                  <ActivityLevelCard 
                    level="Moderate" 
                    icon={Users} 
                    description="Social and active with family, pets, and friends" 
                  />
                  <ActivityLevelCard 
                    level="Active" 
                    icon={Dumbbell} 
                    description="Gets sweaty 30-40 minutes at least 3 times a week" 
                  />
                  <ActivityLevelCard 
                    level="Very Active" 
                    icon={Trophy} 
                    description="Daily fitness routine, may train for races and competitions" 
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="health" className="space-y-4">
              <div>
                <Label className="text-gray-900 mb-2 block">Health Concerns:</Label>
                <CheckboxGroup 
                  items={['Heart Disease', 'Diabetes', 'Obesity', 'Cancer', 'Gut Health', 'Brain Health', 'Immunity', 'Pain & Inflammation', 'Stress & Anxiety']}
                  field="healthConditions"
                />
                <div className="flex flex-wrap gap-2 mt-4" aria-label="Selected health conditions">
                  {userData.healthConditions.map(condition => (
                    <Badge key={condition} variant="secondary" className={`text-sm text-gray-900 bg-gray-200 ${lexend.className}`}>
                      {condition}
                      {isEditing && (
                        <button
                          className="ml-1 hover:text-red-600"
                          onClick={() => removeItem('healthConditions', condition)}
                          aria-label={`Remove ${condition}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-gray-900 mb-2 block">Food Allergies:</Label>
                <CheckboxGroup 
                  items={['Milk Products', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Wheat', 'Soy', 'Sesame', 'Corn', 'Gluten']}
                  field="foodAllergies"
                />
                <div className="flex flex-wrap gap-2 mt-4" aria-label="Selected food allergies">
                  {userData.foodAllergies.map(allergy => (
                    <Badge key={allergy} variant="secondary" className={`text-sm text-gray-900 bg-gray-200 ${lexend.className}`}>
                      {allergy}
                      {isEditing && (
                        <button
                          className="ml-1 hover:text-red-600"
                          onClick={() => removeItem('foodAllergies', allergy)}
                          aria-label={`Remove ${allergy}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2 mt-4">
                    <Input 
                      placeholder="Add custom allergy" 
                      className="bg-white border-[#006666] text-gray-900"
                      aria-label="Enter a custom food allergy"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement
                          addItem('foodAllergies', target.value)
                          target.value = ''
                        }
                      }}
                    />
                    <Button 
                      type="button"
                      className={`bg-white text-gray-900 border-[#006666] hover:bg-[#006666]/10 ${lexend.className}`}
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add custom allergy"]') as HTMLInputElement
                        addItem('foodAllergies', input.value)
                        input.value = ''
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="anxiety-level" className="text-gray-900 mb-2 block">Anxiety Level (1-10)</Label>
                <Slider
                  id="anxiety-level"
                  min={1}
                  max={10}
                  step={1}
                  value={[userData.anxietyLevel]}
                  onValueChange={(value) => updateUserData('anxietyLevel', value[0])}
                  className="mb-2"
                  disabled={!isEditing}
                  aria-valuemin={1}
                  aria-valuemax={10}
                  aria-valuenow={userData.anxietyLevel}
                />
                <p className={`text-center text-sm text-gray-900 ${lexend.className}`}>{userData.anxietyLevel}</p>
              </div>
              <div>
                <Label htmlFor="pain-level" className="text-gray-900 mb-2 block">Pain Level (1-10)</Label>
                <Slider
                  id="pain-level"
                  min={1}
                  max={10}
                  step={1}
                  value={[userData.painLevel]}
                  onValueChange={(value) => updateUserData('painLevel', value[0])}
                  className="mb-2"
                  disabled={!isEditing}
                  aria-valuemin={1}
                  aria-valuemax={10}
                  aria-valuenow={userData.painLevel}
                />
                <p className={`text-center text-sm text-gray-900 ${lexend.className}`}>{userData.painLevel}</p>
              </div>
            </TabsContent>
            <TabsContent value="preferences" className="space-y-4">
              <div>
                <Label className="text-gray-900 mb-2 block">Dietary Preferences:</Label>
                <CheckboxGroup 
                  items={['Plant-forward eater', 'Dairy and egg vegetarian', 'Vegetarian', 'Pescatarian', 'Vegan', 'Keto', 'Paleo', 'Carnivore', 'Gundry', 'FODMap', 'Lactose intolerant', 'Gluten-free', 'Corn-free', 'Nut-free', 'Dairy-free', 'Caffeine-free', 'Sustainable and organic', 'Grass-fed, pasture-raised, no antibiotic or GMO animal products', 'Raw foods foodie']}
                  field="dietaryPreferences"
                />
                <div className="flex flex-wrap gap-2 mt-4" aria-label="Selected dietary preferences">
                  {userData.dietaryPreferences.map(preference => (
                    <Badge key={preference} variant="secondary" className={`text-sm text-gray-900 bg-gray-200 ${lexend.className}`}>
                      {preference}
                      {isEditing && (
                        <button
                          className="ml-1 hover:text-red-600"
                          onClick={() => removeItem('dietaryPreferences', preference)}
                          aria-label={`Remove ${preference}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <>
              <Button 
                onClick={() => setIsEditing(false)}
                className={`bg-white text-gray-900 border-[#006666] hover:bg-[#006666]/10 ${lexend.className}`}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className={`bg-white text-gray-900 border-[#006666] hover:bg-[#006666]/10 ${lexend.className}`}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className={`bg-white text-gray-900 border-[#006666] hover:bg-[#006666]/10 ${lexend.className}`}
            >
              Edit Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}