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
import { Sofa, PersonStanding, Users, Dumbbell, Trophy, LucideIcon } from 'lucide-react'
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

export const healthConditionsList = [
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
]

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

  const updateUserData = <K extends keyof UserData>(field: K, value: UserData[K]) => {
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

  const ActivityLevelCard = ({ level, icon: Icon, description }: { level: string, icon: LucideIcon, description: string }) => (
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
                  description="Little to no regular exercise, desk job or mostly sitting"
                />
                <ActivityLevelCard 
                  level="Lightly Active"
                  icon={PersonStanding}
                  description="Light exercise 1-3 days/week, active job with lots of walking"
                />
                <ActivityLevelCard 
                  level="Moderately Active"
                  icon={Users}
                  description="Moderate exercise 3-5 days/week, active lifestyle"
                />
                <ActivityLevelCard 
                  level="Very Active"
                  icon={Dumbbell}
                  description="Hard exercise 6-7 days/week, very physically demanding job"
                />
                <ActivityLevelCard 
                  level="Extremely Active"
                  icon={Trophy}
                  description="Hard daily exercise/sports & physical job or training twice per day"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Label className={`text-[${textColor}] mb-4 block text-center`}>Select any health conditions you&apos;d like to address:</Label>
              <CheckboxGroup items={healthConditionsList} field="healthConditions" />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <Label className={`text-[${textColor}] mb-4 block text-center`}>Select any food allergies you have:</Label>
              <CheckboxGroup items={foodAllergiesList} field="foodAllergies" />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <Label className={`text-[${textColor}] mb-4 block text-center`}>Select your dietary preferences:</Label>
              <CheckboxGroup items={dietaryPreferencesList} field="dietaryPreferences" />
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className={`text-[${textColor}] mb-4 block text-center`}>Rate your current anxiety level:</Label>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm text-[${textColor}]`}>Low</span>
                  <span className={`text-sm text-[${textColor}]`}>High</span>
                </div>
                <Slider
                  value={[userData.anxietyLevel]}
                  onValueChange={([value]) => updateUserData('anxietyLevel', value)}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="text-center">
                  <Badge variant="outline" className={`bg-white border-[${borderColor}]`}>
                    {userData.anxietyLevel}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <Label className={`text-[${textColor}] mb-4 block text-center`}>Rate your current pain level:</Label>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm text-[${textColor}]`}>Low</span>
                  <span className={`text-sm text-[${textColor}]`}>High</span>
                </div>
                <Slider
                  value={[userData.painLevel]}
                  onValueChange={([value]) => updateUserData('painLevel', value)}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="text-center">
                  <Badge variant="outline" className={`bg-white border-[${borderColor}]`}>
                    {userData.painLevel}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`bg-[${buttonBgColor}] border-[${borderColor}] hover:bg-[${buttonHoverColor}]`}
          >
            Previous
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button 
              onClick={handleSave}
              className={`bg-[${buttonBgColor}] border-[${borderColor}] hover:bg-[${buttonHoverColor}]`}
            >
              Complete Setup
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className={`bg-[${buttonBgColor}] border-[${borderColor}] hover:bg-[${buttonHoverColor}]`}
            >
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}