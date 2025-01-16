'use client'

import { useState, useEffect } from 'react'
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
import { databases, account } from '@/lib/appwrite-config'
import { Query } from 'appwrite'
import Cookies from 'js-cookie'
import Loading from './loading'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

type ProfileEditProps = {
  onSubmit: (data: ProfileFormData) => void
  onCancel: () => void
  loading?: boolean
}

type ProfileFormData = {
  username: string
  email: string
  healthConditions: string[]
  dietaryRestrictions: string[]
  anxietyLevel: number
  painLevel: number
}

type FormError = {
  message: string
  field?: keyof ProfileFormData
}

interface FormData {
  age: string;
  gender: string;
  weight: string;
  height: string;
  activityLevel: string;
  healthConditions: string[];
  foodAllergies: string[];
  dietaryPreferences: string[];
  anxietyLevel: number;
  painLevel: number;
}

export function ProfileEdit() {
  const [userData, setUserData] = useState<FormData>({
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    healthConditions: [],
    foodAllergies: [],
    dietaryPreferences: [],
    anxietyLevel: 1,
    painLevel: 1
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        console.log('Starting to fetch user data...')

        // First check if user is logged in
        const user = await account.get()
        console.log('Current user:', user)

        if (!user) {
          throw new Error('Not logged in')
        }

        const uniqueId = `ff${user.$id.slice(0, 34)}`
        console.log('Generated uniqueId:', uniqueId)
        
        Cookies.set('uniqueId', uniqueId, {
          expires: 7,
          path: '/',
          sameSite: 'strict'
        })

        // Fetch user profile data
        console.log('Fetching user profile with uniqueId:', uniqueId)
        const result = await databases.listDocuments(
          'foodfixrdb',
          'user_profile',
          [Query.equal('userID', uniqueId)]
        )
        console.log('Database query result:', result)

        if (result.documents.length > 0) {
          const userDoc = result.documents[0]
          console.log('Found user document:', userDoc)
          
          const formattedData = {
            age: userDoc.Age?.toString() || '',
            gender: userDoc.Gender?.toLowerCase() || '',
            weight: userDoc.Weight?.toString() || '',
            height: userDoc.Height?.toString() || '',
            activityLevel: userDoc.ActivityLevel || '',
            healthConditions: Array.isArray(userDoc.HealthConcerns) ? userDoc.HealthConcerns : [],
            foodAllergies: Array.isArray(userDoc.FoodAllergy) ? userDoc.FoodAllergy : [],
            dietaryPreferences: Array.isArray(userDoc.DietaryPreference) ? userDoc.DietaryPreference : [],
            anxietyLevel: Number(userDoc.AnxietyLevel) || 1,
            painLevel: Number(userDoc.PainLevel) || 1
          }
          console.log('Formatted user data:', formattedData)
          setUserData(formattedData)
        } else {
          console.log('No user profile found, attempting to create one...')
          // If no profile exists, create one
          const documentId = `user_profile_${uniqueId.slice(-4)}`
          const initialProfile = {
            Age: 0,
            Gender: '',
            Weight: 0,
            Height: 0,
            ActivityLevel: '',
            HealthConcerns: [],
            FoodAllergy: [],
            DietaryPreference: [],
            AnxietyLevel: 1,
            PainLevel: 1,
            userID: uniqueId
          }

          try {
            const createdDoc = await databases.createDocument(
              'foodfixrdb',
              'user_profile',
              documentId,
              initialProfile
            )
            console.log('Created initial profile:', createdDoc)
            
            // Set initial data in state
            setUserData({
              age: '',
              gender: '',
              weight: '',
              height: '',
              activityLevel: '',
              healthConditions: [],
              foodAllergies: [],
              dietaryPreferences: [],
              anxietyLevel: 1,
              painLevel: 1
            })
            // Automatically enable editing for new profiles
            setIsEditing(true)
          } catch (createError) {
            console.error('Error creating initial profile:', createError)
            throw new Error('Failed to create initial profile')
          }
        }
      } catch (err) {
        console.error('Error in fetchUserData:', err)
        if (err instanceof Error) {
          if (err.message.includes('Session not found')) {
            setError('Please log in to view your profile')
          } else {
            setError(err.message)
          }
        } else {
          setError('Failed to load profile')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleInputChange = (field: keyof FormData, value: string | string[] | number) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget as HTMLFormElement)
    setLoading(true)
    try {
      const user = await account.get()
      const uniqueId = `ff${user.$id.slice(0, 34)}`
      
      const documentId = `user_profile_${uniqueId.slice(-4)}`
      console.log('Generated document ID:', documentId)
      
      const updatedData = {
        Age: parseInt(userData.age) || 0,
        Gender: userData.gender || '',
        Weight: parseInt(userData.weight) || 0,
        Height: parseInt(userData.height) || 0,
        ActivityLevel: userData.activityLevel || '',
        HealthConcerns: userData.healthConditions || [],
        FoodAllergy: userData.foodAllergies || [],
        DietaryPreference: userData.dietaryPreferences || [],
        AnxietyLevel: userData.anxietyLevel || 1,
        PainLevel: userData.painLevel || 1,
        userID: uniqueId
      }
      console.log('Prepared data for database update:', updatedData)

      try {
        // First try to update
        await databases.updateDocument(
          'foodfixrdb',
          'user_profile',
          documentId,
          updatedData
        )
      } catch (updateError) {
        console.log('Update failed, trying to create:', updateError)
        // If update fails, try to create
        await databases.createDocument(
          'foodfixrdb',
          'user_profile',
          documentId,
          updatedData
        )
      }
      
      console.log('Save successful')
      setIsEditing(false)
      setError(null)
    } catch (error) {
      console.error('Error saving profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to save profile changes')
    } finally {
      setLoading(false)
    }
  }

  const ActivityLevelCard = ({ level, icon: Icon, description }: { level: string, icon: any, description: string }) => {
    console.log(`Rendering ActivityLevelCard for level: ${level}`)
    return (
    <Card 
      className={`cursor-pointer transition-all w-full sm:w-40 md:w-44 lg:w-48 h-36 sm:h-40 md:h-44 lg:h-48 ${
        userData.activityLevel === level 
          ? 'border-[#006666] shadow-[0_0_15px_rgba(0,102,102,0.5)]' 
          : 'border-gray-400 hover:border-[#006666] hover:shadow-md'
      }`}
      onClick={() => handleInputChange('activityLevel', level)}
      role="radio"
      aria-checked={userData.activityLevel === level}
    >
      <CardContent className="flex flex-col items-center p-2 sm:p-4 text-center h-full justify-center">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-[#006666]" aria-hidden="true" />
        <h3 className={`text-xs sm:text-sm font-semibold mb-1 text-gray-900 ${comfortaa.className}`}>{level}</h3>
        <p className={`text-[10px] sm:text-xs text-gray-800 ${lexend.className}`}>{description}</p>
      </CardContent>
    </Card>
  )}

  const CheckboxGroup = ({ items, field }: { items: string[], field: 'healthConditions' | 'foodAllergies' | 'dietaryPreferences' }) => {
    console.log(`Rendering CheckboxGroup for ${field} with ${items.length} items`)
    return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4" role="group">
      {items.map((item) => (
        <div key={item} className="flex items-center space-x-2">
          <Checkbox 
            id={item} 
            checked={userData[field].includes(item)}
            onCheckedChange={(checked) => {
              if (checked) {
                handleInputChange(field, [...userData[field], item])
              } else {
                handleInputChange(field, userData[field].filter(i => i !== item))
              }
            }}
            disabled={!isEditing}
          />
          <Label htmlFor={item} className={`text-xs sm:text-sm text-gray-800 ${lexend.className}`}>{item}</Label>
        </div>
      ))}
    </div>
  )}

  console.log('Current userData state:', userData)
  console.log('isEditing state:', isEditing)

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-sm sm:text-base text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white p-2 sm:p-4 flex flex-col items-center justify-center ${comfortaa.className}`}>
      <Card className="w-full max-w-[95%] sm:max-w-4xl bg-[#ffffff] shadow-[0_8px_30px_rgba(0,102,102,0.2)]">
        <CardHeader className="space-y-3 text-center p-4 sm:p-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 relative">
              <Image
                src="/foodfixrlogo.png"
                alt="Food Fixr Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <Tabs defaultValue="demographics" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4" aria-label="Profile sections">
              <TabsTrigger value="demographics" className="text-xs sm:text-base">Demographics</TabsTrigger>
              <TabsTrigger value="health" className="text-xs sm:text-base">Health</TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs sm:text-base">Preferences</TabsTrigger>
            </TabsList>
            <TabsContent value="demographics" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age" className="text-gray-900">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={userData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="bg-white border-[#006666] text-gray-900"
                    disabled={!isEditing}
                    aria-label="Enter your age"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-gray-900">Gender</Label>
                  <Select 
                    onValueChange={(value) => handleInputChange('gender', value)} 
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
                    onChange={(e) => handleInputChange('weight', e.target.value)}
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
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="bg-white border-[#006666] text-gray-900"
                    disabled={!isEditing}
                    aria-label="Enter your height in inches"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-900 mb-4 block">Activity Level:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4" role="radiogroup">
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
                  items={[
                    'Heart Disease', 
                    'Diabetes', 
                    'Obesity', 
                    'Cancer', 
                    'Gut Health', 
                    'Brain Health', 
                    'Immunity', 
                    'Pain & Inflammation', 
                    'Stress & Anxiety',
                    'Injury Prevention',
                    'New Injury Repair',
                    'Pre-op Prep',
                    'Post-op Repair',
                    'Athletic Peak Performance'
                  ]}
                  field="healthConditions"
                />
                <div className="flex flex-wrap gap-2 mt-4" aria-label="Selected health conditions">
                  {userData.healthConditions.map(condition => (
                    <Badge key={condition} variant="secondary" className={`text-xs sm:text-sm text-gray-900 bg-gray-200 ${lexend.className}`}>
                      {condition}
                      {isEditing && (
                        <button
                          className="ml-1 hover:text-red-600"
                          onClick={() => handleInputChange('healthConditions', userData.healthConditions.filter(c => c !== condition))}
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
                    <Badge key={allergy} variant="secondary" className={`text-xs sm:text-sm text-gray-900 bg-gray-200 ${lexend.className}`}>
                      {allergy}
                      {isEditing && (
                        <button
                          className="ml-1 hover:text-red-600"
                          onClick={() => handleInputChange('foodAllergies', userData.foodAllergies.filter(a => a !== allergy))}
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
                          handleInputChange('foodAllergies', [...userData.foodAllergies, target.value])
                          target.value = ''
                        }
                      }}
                    />
                    <Button 
                      type="button"
                      className={`bg-white text-gray-900 border-[#006666] hover:bg-[#006666]/10 ${lexend.className}`}
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add custom allergy"]') as HTMLInputElement
                        handleInputChange('foodAllergies', [...userData.foodAllergies, input.value])
                        input.value = ''
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="anxiety-level" className="text-gray-900 mb-2 block">Anxiety Level (1-10)</Label>
                  <Slider
                    id="anxiety-level"
                    min={1}
                    max={10}
                    step={1}
                    value={[userData.anxietyLevel]}
                    onValueChange={(value) => handleInputChange('anxietyLevel', value[0])}
                    className="mb-2"
                    disabled={!isEditing}
                    aria-valuemin={1}
                    aria-valuemax={10}
                    aria-valuenow={userData.anxietyLevel}
                  />
                  <p className={`text-center text-xs sm:text-sm text-gray-900 ${lexend.className}`}>{userData.anxietyLevel}</p>
                </div>
                <div>
                  <Label htmlFor="pain-level" className="text-gray-900 mb-2 block">Pain Level (1-10)</Label>
                  <Slider
                    id="pain-level"
                    min={1}
                    max={10}
                    step={1}
                    value={[userData.painLevel]}
                    onValueChange={(value) => handleInputChange('painLevel', value[0])}
                    className="mb-2"
                    disabled={!isEditing}
                    aria-valuemin={1}
                    aria-valuemax={10}
                    aria-valuenow={userData.painLevel}
                  />
                  <p className={`text-center text-xs sm:text-sm text-gray-900 ${lexend.className}`}>{userData.painLevel}</p>
                </div>
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
                    <Badge key={preference} variant="secondary" className={`text-xs sm:text-sm text-gray-900 bg-gray-200 ${lexend.className}`}>
                      {preference}
                      {isEditing && (
                        <button
                          className="ml-1 hover:text-red-600"
                          onClick={() => handleInputChange('dietaryPreferences', userData.dietaryPreferences.filter(p => p !== preference))}
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
        <CardFooter className="flex justify-between p-4">
          {isEditing ? (
            <>
              <Button 
                onClick={() => setIsEditing(false)}
                className={`bg-white text-gray-900 border-[#006666] hover:bg-[#006666]/10 ${lexend.className} text-xs sm:text-sm`}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                className={`bg-white text-gray-900 border-[#006666] hover:bg-[#006666]/10 ${lexend.className} text-xs sm:text-sm`}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className={`bg-white text-gray-900 border-[#006666] hover:bg-[#006666]/10 ${lexend.className} text-xs sm:text-sm`}
            >
              Edit Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}