'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bell, CheckCircle2, Apple, Droplet, Leaf, Utensils, Clock, PieChart, Brain, PlayCircle, SearchIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

type SurveyCategory = {
  name: string
  progress: number
  icon: React.ReactNode
}

type Survey = {
  category: string
  questions: SurveyQuestion[]
}

type SurveyQuestion = {
  text: string
  why: string
  options: string[]
}

type Goal = {
  title: string
  description: string
  points: number
  completed: boolean
}

export function SurveysAndGoalsComponent() {
  const [surveyCategories, setSurveyCategories] = useState<SurveyCategory[]>([
    { name: 'Toxins', progress: 0, icon: <Image src="/toxins.png" alt="Toxins" width={40} height={40} /> },
    { name: 'Sugar', progress: 0, icon: <Image src="/sugar.png" alt="Sugar" width={40} height={40} /> },
    { name: 'Alkalinity', progress: 0, icon: <Image src="/alkalinity.png" alt="Alkalinity" width={40} height={40} /> },
    { name: 'Food Combining', progress: 0, icon: <Image src="/foodcombining.png" alt="Food Combining" width={40} height={40} /> },
    { name: 'Timing', progress: 0, icon: <Image src="/mealtiming.png" alt="Timing" width={40} height={40} /> },
    { name: 'Pre/probiotics', progress: 0, icon: <Image src="/pre_probiotics.png" alt="Pre/probiotics" width={40} height={40} /> },
    { name: 'Macros', progress: 0, icon: <Image src="/macronutrient_balance.png" alt="Macros" width={40} height={40} /> },
    { name: 'Gut/Brain Health', progress: 0, icon: <Image src="/gut_brainsupport.png" alt="Gut/Brain Health" width={40} height={40} /> },
  ])

  const [goals, setGoals] = useState<Goal[]>([])
  const [completedSurveys, setCompletedSurveys] = useState<string[]>([])

  const [surveys, setSurveys] = useState<Survey[]>([
    {
      category: 'Toxins',
      questions: [
        {
          text: 'You enjoy fast foods 5 days a week or more',
          why: 'Bad! TFA/Excitotxins/Corn',
          options: ['absolutely', 'moderately for sure', 'sort of', 'barely or rarely', 'never ever']
        },
        {
          text: 'You keep easy to make boxed and canned foods stocked well in your pantry',
          why: 'Bad! TFA/Excitotxins/Corn',
          options: ['absolutely', 'moderately for sure', 'sort of', 'barely or rarely', 'never ever']
        },
      ]
    },
    {
      category: 'Sugar',
      questions: [
        {
          text: 'Deserts after meals, and candies or cookies for snacks are your favorite',
          why: 'High sugar intake and cravings',
          options: ['absolutely', 'moderately for sure', 'sort of', 'barely or rarely', 'never ever']
        },
        {
          text: 'Favorite drinks are Starbucks sweet coffees, orange juice smoothies and soft drinks',
          why: 'High sugar intake and cravings',
          options: ['absolutely', 'moderately for sure', 'sort of', 'barely or rarely', 'never ever']
        },
      ]
    },
  ])

  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)

  const completeSurvey = (category: string) => {
    setCompletedSurveys([...completedSurveys, category])
    setSurveyCategories(prevCategories => 
      prevCategories.map(cat => 
        cat.name === category ? { ...cat, progress: Math.min(cat.progress + 20, 100) } : cat
      )
    )
    if (completedSurveys.length + 1 === surveyCategories.length) {
      setGoals([
        ...goals,
        {
          title: 'Improve Overall Health',
          description: 'Complete all surveys and reach 50% progress in each category',
          points: 100,
          completed: false
        }
      ])
    }
  }

  const toggleGoalCompletion = (index: number) => {
    setGoals(prevGoals => 
      prevGoals.map((goal, i) => 
        i === index ? { ...goal, completed: !goal.completed } : goal
      )
    )
  }

  const surveyIcons = {
    'Toxins': () => <Image src="/toxins.png" alt="Toxins" width={48} height={48} />,
    'Sugar': () => <Image src="/sugar.png" alt="Sugar" width={48} height={48} />,
    'Alkalinity': () => <Image src="/alkalinity.png" alt="Alkalinity" width={48} height={48} />,
    'Food Combining': () => <Image src="/foodcombining.png" alt="Food Combining" width={48} height={48} />,
    'Timing': () => <Image src="/mealtiming.png" alt="Timing" width={48} height={48} />,
    'Pre/probiotics': () => <Image src="/pre_probiotics.png" alt="Pre/probiotics" width={48} height={48} />,
    'Macros': () => <Image src="/macronutrient_balance.png" alt="Macros" width={48} height={48} />,
    'Gut/Brain Health': () => <Image src="/gut_brainsupport.png" alt="Gut/Brain Health" width={48} height={48} />
  }

  return (
    <div className={`container mx-auto p-4 max-w-7xl bg-white ${comfortaa.className}`} role="main">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Image
            src="/foodfixrlogo.png"
            alt="Food Fixr Logo"
            width={100}
            height={50}
            className="w-24 h-auto mr-4"
          />
          <h1 className={`text-3xl font-bold text-[#006666] ${comfortaa.className}`}>Surveys and Goals</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Open Food for Thought">
              <div className="rounded-full shadow-lg p-2">
                <Image 
                  src="/food_forthought_icon.jpg" 
                  alt="Food for Thought" 
                  width={200}
                  height={200}
                  className="rounded-full"
                />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full"></span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={`text-2xl text-[#006666] ${comfortaa.className}`}>
                <div className="flex items-center gap-4">
                  <Image 
                    src="/food_forthought_icon.jpg"
                    alt="Food for Thought"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  Food for Thought
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className={`mt-4 ${lexend.className}`}>
              <Tabs defaultValue="surveys">
                <TabsList aria-label="Survey sections">
                  <TabsTrigger value="surveys">Surveys to Take</TabsTrigger>
                  <TabsTrigger value="report">Survey Report</TabsTrigger>
                </TabsList>
                <TabsContent value="surveys">
                  <div className="mb-4">
                    <div className="relative">
                      <Input
                        placeholder="Search surveys..."
                        className="pl-8 mb-4"
                        aria-label="Search surveys"
                      />
                      <SearchIcon className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" role="list">
                      {surveys
                        .filter(survey => !completedSurveys.includes(survey.category))
                        .map((survey, index) => {
                          const IconComponent = surveyIcons[survey.category as keyof typeof surveyIcons]
                          return (
                            <Card
                              key={index}
                              className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-[#006666]"
                              onClick={() => setSelectedSurvey(survey)}
                              role="listitem"
                              tabIndex={0}
                              aria-label={`${survey.category} survey with ${survey.questions.length} questions`}
                            >
                              <CardContent className="pt-6 px-4 pb-4 flex flex-col items-center text-center">
                                <div className="mb-4 p-3 rounded-full bg-[#006666]/10">
                                  <IconComponent aria-hidden="true" />
                                </div>
                                <p className={`text-[#993366] font-medium ${lexend.className}`}>
                                  {survey.category}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {survey.questions.length} questions
                                </p>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="report">
                  <h3 className="text-lg font-semibold mb-2 text-[#006666]">Completed Surveys</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" role="list">
                    {completedSurveys.map((category, index) => {
                      const IconComponent = surveyIcons[category as keyof typeof surveyIcons]
                      return (
                        <Card key={index} className="bg-gray-50 border-2 border-[#006666]" role="listitem">
                          <CardContent className="pt-6 px-4 pb-4 flex flex-col items-center text-center">
                            <div className="mb-4 p-3 rounded-full bg-green-100">
                              <IconComponent aria-hidden="true" />
                            </div>
                            <p className={`text-[#993366] font-medium ${lexend.className}`}>
                              {category}
                            </p>
                            <Badge className="mt-2 bg-green-100 text-green-800">Completed</Badge>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedSurvey && (
        <Dialog open={!!selectedSurvey} onOpenChange={() => setSelectedSurvey(null)}>
          <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={`text-2xl text-[#006666] ${comfortaa.className}`}>
                {selectedSurvey.category} Survey
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="What are you looking for?"
                  className="pl-8 rounded-full"
                  aria-label="Search questions"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2" role="list" aria-label="Survey tags">
                {['New', 'Fresh', 'Organic', 'Raw'].map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full px-4 py-1 whitespace-nowrap bg-[#006666] text-white"
                    role="listitem"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4" role="list" aria-label="Survey questions">
                {selectedSurvey.questions.map((question, index) => {
                  const IconComponent = surveyIcons[selectedSurvey.category as keyof typeof surveyIcons]
                  return (
                    <Card
                      key={index}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-[#006666]"
                      role="listitem"
                    >
                      <CardContent className="p-6">
                        <div className="mb-4 flex justify-center">
                          <div className="p-3 rounded-full bg-[#006666]/10">
                            <IconComponent />
                          </div>
                        </div>
                        <h3 className={`text-center font-medium text-[#993366] mb-4 ${lexend.className}`}>
                          Question {index + 1}
                        </h3>
                        <p className="text-sm text-center text-muted-foreground mb-4">{question.text}</p>
                        <div className="space-y-3">
                          <RadioGroup aria-label={`Question ${index + 1} options`}>
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${index}-${optionIndex}`} />
                                <Label 
                                  htmlFor={`${index}-${optionIndex}`}
                                  className="text-sm text-muted-foreground"
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          <p className="text-xs text-[#006666] mt-2" aria-label="Additional information">Why: {question.why}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => {
                    completeSurvey(selectedSurvey.category)
                    setSelectedSurvey(null)
                  }} 
                  className="bg-[#006666] text-white hover:bg-[#004d4d]"
                  aria-label={`Complete ${selectedSurvey.category} survey`}
                >
                  Complete Survey
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Card className="w-full bg-[#f5f5f5] shadow-[0_8px_30px_rgba(0,102,102,0.2)] border-2 border-[#006666]">
        <CardHeader>
          <CardTitle className={`text-2xl text-[#006666] ${comfortaa.className}`}>Health Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="goals" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4" aria-label="Dashboard sections">
              <TabsTrigger value="goals" className={`text-[#993366] data-[state=active]:bg-[#006666] data-[state=active]:text-white ${lexend.className}`}>Goals</TabsTrigger>
              <TabsTrigger value="stats" className={`text-[#993366] data-[state=active]:bg-[#006666] data-[state=active]:text-white ${lexend.className}`}>Stats</TabsTrigger>
            </TabsList>
            <TabsContent value="goals">
              <ScrollArea className="h-[600px] w-full pr-4">
                {goals.length > 0 ? (
                  <div role="list" aria-label="Goals list">
                    {goals.map((goal, index) => (
                      <div key={index} className="mb-4" role="listitem">
                        <div className="flex items-start space-x-4">
                          <div className="flex-grow">
                            <h3 className={`font-semibold text-[#993366] ${lexend.className}`}>{goal.title}</h3>
                            <p className={`text-sm text-muted-foreground ${lexend.className}`}>{goal.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <p className={`text-sm font-medium text-[#993366] ${lexend.className}`}>
                                {goal.points} points
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mt-0.5 text-[#993366]"
                            onClick={() => toggleGoalCompletion(index)}
                            aria-label={`${goal.completed ? 'Mark as incomplete' : 'Mark as complete'}: ${goal.title}`}
                          >
                            {goal.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
                            ) : (
                              <PlayCircle className="h-5 w-5 text-[#993366]" aria-hidden="true" />
                            )}
                          </Button>
                        </div>
                        {index < goals.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-center text-[#993366] ${lexend.className}`}>Complete surveys to unlock goals!</p>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Category statistics">
                {surveyCategories.map((category) => (
                  <Card key={category.name} className="overflow-hidden bg-white border-2 border-[#006666]" role="listitem">
                    <CardHeader className="p-4">
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <CardTitle className={`text-lg text-[#006666] ${lexend.className}`}>{category.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Progress 
                        value={category.progress} 
                        className="h-2 bg-[#e6ffff]"
                        indicatorClassName="bg-[#006666]"
                        aria-label={`${category.name} progress`}
                        aria-valuenow={category.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                      <p className={`text-sm text-right mt-1 text-[#006666] ${lexend.className}`}>{category.progress}%</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}