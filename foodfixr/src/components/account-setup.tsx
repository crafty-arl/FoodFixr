'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'
import { Sofa, PersonStanding, Users, Dumbbell, Trophy, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

export const steps = [
  "User Demographics",
  "Activity Level", 
  "Health Conditions",
  "Food Allergies",
  "Dietary Preferences",
  "Emotional Tracking"
]

export type UserData = {
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

export const healthConditionsList = ['Heart Disease', 'Diabetes', 'Obesity', 'Cancer', 'Gut Health', 'Brain Health', 'Immunity', 'Pain & Inflammation', 'Stress & Anxiety']

export const foodAllergiesList = ['Milk Products', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Wheat', 'Soy', 'Sesame', 'Corn', 'Gluten']

export const dietaryPreferencesList = ['Plant-forward eater', 'Dairy and egg vegetarian', 'Vegetarian', 'Pescatarian', 'Vegan', 'Keto', 'Paleo', 'Carnivore', 'Gundry', 'FODMap', 'Lactose intolerant', 'Gluten-free', 'Corn-free', 'Nut-free', 'Dairy-free', 'Caffeine-free', 'Sustainable and organic', 'Grass-fed, pasture-raised, no antibiotic or GMO animal products', 'Raw foods foodie']

type AccountSetupProps = {
  onSave: (userData: UserData) => Promise<void>;
  initialData?: UserData;
  logoSrc?: string;
  cardBgColor?: string;
  cardShadow?: string;
  borderColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
  buttonBgColor?: string;
  buttonHoverColor?: string;
}

export default function AccountSetup({ 
  onSave,
  initialData = {
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
  },
  logoSrc = "/foodfixrlogo.png",
  cardBgColor = "#f5f5f5",
  cardShadow = "0_8px_30px_rgba(0,255,255,0.2)",
  borderColor = "#00FFFF",
  textColor = "#333333",
  secondaryTextColor = "#666666",
  buttonBgColor = "white",
  buttonHoverColor = "#00FFFF/10"
}: AccountSetupProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState<UserData>(initialData)

  const updateUserData = (field: keyof UserData, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSave = async () => {
    try {
      await onSave(userData);
      router.push('/');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to complete account setup. Please try again.');
    }
  }

  const addItem = (field: 'healthConditions' | 'foodAllergies' | 'dietaryPreferences', value: string) => {
    if (value && !userData[field].includes(value)) {
      updateUserData(field, [...userData[field], value])
    }
  }

  const removeItem = (field: 'healthConditions' | 'foodAllergies' | 'dietaryPreferences', item: string) => {
    updateUserData(field, userData[field].filter(i => i !== item))
  }

  const ActivityLevelCard = ({ level, icon: Icon, description }: { level: string, icon: any, description: string }) => (
    <Card 
      className={`cursor-pointer transition-all ${
        userData.activityLevel === level 
          ? `border-[${borderColor}] shadow-[0_0_15px_rgba(0,255,255,0.5)]` 
          : `border-gray-200 hover:border-[${borderColor}] hover:shadow-md`
      }`}
      onClick={() => updateUserData('activityLevel', level)}
    >
      <CardContent className="flex flex-col items-center p-6 text-center">
        <Icon className={`w-12 h-12 mb-4 text-[${borderColor}]`} />
        <h3 className={`text-lg font-semibold mb-2 ${comfortaa.className}`}>{level}</h3>
        <p className={`text-sm text-gray-600 ${lexend.className}`}>{description}</p>
      </CardContent>
    </Card>
  )

  const CheckboxGroup = ({ items, field }: { items: string[], field: 'healthConditions' | 'foodAllergies' | 'dietaryPreferences' }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          />
          <Label htmlFor={item} className={`text-sm ${lexend.className}`}>{item}</Label>
        </div>
      ))}
    </div>
  )

  return (
    <div className={`min-h-screen bg-white p-4 flex flex-col items-center justify-center ${comfortaa.className}`}>
      <Card className={`w-full max-w-4xl bg-[${cardBgColor}] shadow-[${cardShadow}]`}>
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="w-24 h-24 relative">
              <Image
                src={logoSrc}
                alt="Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
          <CardTitle className={`text-2xl font-bold text-[${textColor}]`}>
            Account Setup
          </CardTitle>
          <Progress value={(currentStep + 1) / steps.length * 100} className="mb-4" />
          <p className={`text-sm text-[${secondaryTextColor}] ${lexend.className}`}>
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </p>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="age" className={`text-[${textColor}]`}>Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={userData.age}
                  onChange={(e) => updateUserData('age', e.target.value)}
                  className={`bg-white border-[${borderColor}]`}
                />
              </div>
              <div>
                <Label htmlFor="gender" className={`text-[${textColor}]`}>Gender</Label>
                <Select onValueChange={(value) => updateUserData('gender', value)}>
                  <SelectTrigger id="gender" className={`bg-white border-[${borderColor}]`}>
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
                <Label htmlFor="weight" className={`text-[${textColor}]`}>Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={userData.weight}
                  onChange={(e) => updateUserData('weight', e.target.value)}
                  className={`bg-white border-[${borderColor}]`}
                />
              </div>
              <div>
                <Label htmlFor="height" className={`text-[${textColor}]`}>Height (inches)</Label>
                <Input
                  id="height"
                  type="number"
                  value={userData.height}
                  onChange={(e) => updateUserData('height', e.target.value)}
                  className={`bg-white border-[${borderColor}]`}
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <Label className={`text-[${textColor}] mb-4 block text-center`}>Select your activity level:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Label className={`text-[${textColor}] mb-2 block`}>Select any relevant health concerns:</Label>
              <CheckboxGroup 
                items={healthConditionsList}
                field="healthConditions"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {userData.healthConditions.map(condition => (
                  <Badge key={condition} variant="secondary" className={`text-sm ${lexend.className}`}>
                    {condition}
                    <button
                      className="ml-1 hover:text-destructive"
                      onClick={() => removeItem('healthConditions', condition)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <Label className={`text-[${textColor}] mb-2 block`}>Select any food allergies:</Label>
              <CheckboxGroup 
                items={foodAllergiesList}
                field="foodAllergies"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {userData.foodAllergies.map(allergy => (
                  <Badge key={allergy} variant="secondary" className={`text-sm ${lexend.className}`}>
                    {allergy}
                    <button
                      className="ml-1 hover:text-destructive"
                      onClick={() => removeItem('foodAllergies', allergy)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add custom allergy" 
                  className={`bg-white border-[${borderColor}]`}
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
                  className={`bg-[${buttonBgColor}] text-[${textColor}] border-[${borderColor}] hover:bg-[${buttonHoverColor}] ${lexend.className}`}
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add custom allergy"]') as HTMLInputElement
                    addItem('foodAllergies', input.value)
                    input.value = ''
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <Label className={`text-[${textColor}] mb-2 block`}>Select your dietary preferences:</Label>
              <CheckboxGroup 
                items={dietaryPreferencesList}
                field="dietaryPreferences"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {userData.dietaryPreferences.map(preference => (
                  <Badge key={preference} variant="secondary" className={`text-sm ${lexend.className}`}>
                    {preference}
                    <button
                      className="ml-1 hover:text-destructive"
                      onClick={() => removeItem('dietaryPreferences', preference)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="anxiety-level" className={`text-[${textColor}] mb-2 block`}>Anxiety Level (1-10)</Label>
                <Slider
                  id="anxiety-level"
                  min={1}
                  max={10}
                  step={1}
                  value={[userData.anxietyLevel]}
                  onValueChange={(value) => updateUserData('anxietyLevel', value[0])}
                  className="mb-2"
                />
                <p className={`text-center text-sm ${lexend.className}`}>{userData.anxietyLevel}</p>
              </div>
              <div>
                <Label htmlFor="pain-level" className={`text-[${textColor}] mb-2 block`}>Pain Level (1-10)</Label>
                <Slider
                  id="pain-level"
                  min={1}
                  max={10}
                  step={1}
                  value={[userData.painLevel]}
                  onValueChange={(value) => updateUserData('painLevel', value[0])}
                  className="mb-2"
                />
                <p className={`text-center text-sm ${lexend.className}`}>{userData.painLevel}</p>
              </div>
              <div>
                <Label className={`text-[${textColor}] mb-2 block`}>Stress Push Notifications</Label>
                <p className={`text-sm ${lexend.className}`}>You will receive random push notifications asking for your current stress level and what you're doing at the moment to feel that way.</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            onClick={handlePrevious} 
            disabled={currentStep === 0}
            className={`bg-[${buttonBgColor}] text-[${textColor}] border-[${borderColor}] hover:bg-[${buttonHoverColor}] ${lexend.className}`}
          >
            Previous
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={handleNext}
              className={`bg-[${buttonBgColor}] text-brand-primary border-brand-secondary hover:bg-[${buttonHoverColor}] font-secondary`}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSave}
              className={`bg-[${buttonBgColor}] text-[${textColor}] border-[${borderColor}] hover:bg-[${buttonHoverColor}] ${lexend.className}`}
            >
              Complete Setup
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}