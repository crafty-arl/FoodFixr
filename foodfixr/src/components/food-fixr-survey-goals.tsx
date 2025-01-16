'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'
import { Info } from 'lucide-react'
import { ID, Models, Query } from 'appwrite'
import Cookies from 'js-cookie'

import { database } from '@/app/appwrite'
import { useCelebration } from '@/components/celebrate'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

// Database constants
const DATABASE_ID = 'foodfixrdb'
const COLLECTION_USER_GOALS = 'user_goals_log'
const COLLECTION_USER_SURVEYS = 'user_surveryquestions_log'

// Interfaces
interface AppwriteDocument extends Models.Document {
  [key: string]: any;
}

interface Question extends AppwriteDocument {
  QuestionType: string;
  Why: string;
  absolutely: string;
  moderate_for_sure: string;
  not_at_all: string;
  somewhat: string;
  text: string;
  options: Array<{
    text: string;
    value: number;
  }>;
}

interface Response extends AppwriteDocument {
  userid: string;
  questionid: string;
  answer: string;
  score: number;
  category: string;
  created: string;
}

interface CompletedGoal extends AppwriteDocument {
  userid: string;
  category: string;
  goalText: string;
  created: string;
}

interface GoalStatus extends AppwriteDocument {
  userid: string;
  category: string;
  goals: string[];
  date_goals_generated: string;
  isCompleted: boolean;
}

interface CategoryStats {
  sum: number;
  bonus: number;
  count: number;
  healthScore: {
    score: number;
    label: string;
    color: string;
    emoji: string;
  };
  percentage: number;
  answeredCount: number;
  total: number;
}

interface SurveyData {
  surveyCategories: Array<{
    name: string;
    icon: string;
    answeredCount: number;
    questionCount: number;
    hasNotification: boolean;
  }>;
  categoryScores: Record<string, number>;
  answeredQuestions: Set<string>;
}

interface HealthScore {
  score: number;
  label: string;
  color: string;
  emoji: string;
}

interface Survey {
  category: string;
  questions: Question[];
}

// Type guards
const isCategoryStats = (stats: unknown): stats is CategoryStats => {
  if (!stats || typeof stats !== 'object') return false;
  const s = stats as CategoryStats;
  return (
    typeof s.sum === 'number' &&
    typeof s.bonus === 'number' &&
    typeof s.count === 'number' &&
    typeof s.percentage === 'number' &&
    typeof s.answeredCount === 'number' &&
    typeof s.total === 'number' &&
    s.healthScore && typeof s.healthScore === 'object' &&
    typeof s.healthScore.score === 'number' &&
    typeof s.healthScore.label === 'string' &&
    typeof s.healthScore.color === 'string' &&
    typeof s.healthScore.emoji === 'string'
  );
}

// Helper functions
const formatScore = (score: number): string => {
  return score.toFixed(1);
}

const getHealthScore = (score: number): HealthScore => {
  if (score >= 7) {
    return {
      score,
      label: "Excellent",
      color: "text-green-600",
      emoji: "🌟"
    };
  } else if (score >= 5) {
    return {
      score,
      label: "Good",
      color: "text-blue-600",
      emoji: "👍"
    };
  } else if (score >= 3) {
    return {
      score,
      label: "Fair",
      color: "text-yellow-600",
      emoji: "⚠️"
    };
  } else {
    return {
      score,
      label: "Needs Improvement",
      color: "text-red-600",
      emoji: "❗"
    };
  }
}

export function FoodFixrSurveyGoals() {
  const [data, setData] = useState<SurveyData>({
    surveyCategories: [],
    categoryScores: {},
    answeredQuestions: new Set()
  });
  const [responses, setResponses] = useState<Response[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [categoryStats, setCategoryStats] = useState<Record<string, CategoryStats>>({});
  const [overallScore, setOverallScore] = useState<HealthScore>({
    score: 0,
    label: '',
    color: '',
    emoji: ''
  });
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [categoryGoals, setCategoryGoals] = useState<Record<string, GoalStatus>>({});
  const [completedGoalsHistory, setCompletedGoalsHistory] = useState<Record<string, CompletedGoal[]>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const uniqueId = Cookies.get('userId');
  const { celebrateSurveyCompletion } = useCelebration();

  const handleGoalComplete = async (goalId: string, goalIndex: number, completed: boolean, category: string) => {
    if (!uniqueId) return;

    try {
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_USER_GOALS,
        goalId,
        {
          isCompleted: completed,
          updatedAt: new Date().toISOString()
        }
      );

      // Update local state
      setCategoryGoals(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          goals: prev[category].goals.map((goal, idx) => 
            idx === goalIndex ? goal.replace('Completed: false', 'Completed: true') : goal
          )
        }
      }));

    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const areAllQuestionsAnswered = (category: string): boolean => {
    if (!selectedSurvey) return false;
    return selectedSurvey.questions.every(q => 
      responses.some(r => r.questionid === q.$id) || 
      selectedAnswers[`${category}-${selectedSurvey.questions.indexOf(q)}`]
    );
  };

  const areAllSurveysComplete = (categories: SurveyData['surveyCategories']): boolean => {
    return categories.every(cat => cat.answeredCount === cat.questionCount);
  };

  const handleCategorySelect = (category: SurveyData['surveyCategories'][0]) => {
    const survey: Survey = {
      category: category.name,
      questions: questions.filter(q => q.category === category.name)
    };
    setSelectedSurvey(survey);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!uniqueId) return;

      try {
        // Fetch questions
        const questionsResult = await database.listDocuments(
          DATABASE_ID,
          'questions',
          [Query.limit(1000)]
        );
        setQuestions(questionsResult.documents as Question[]);

        // Fetch responses
        const responsesResult = await database.listDocuments(
          DATABASE_ID,
          COLLECTION_USER_SURVEYS,
          [
            Query.equal('userid', uniqueId),
            Query.limit(1000)
          ]
        );
        setResponses(responsesResult.documents as Response[]);

        // Fetch goals
        const goalsResult = await database.listDocuments(
          DATABASE_ID,
          COLLECTION_USER_GOALS,
          [
            Query.equal('userid', uniqueId),
            Query.limit(1000)
          ]
        );

        // Process goals
        const goalsByCategory: Record<string, GoalStatus> = {};
        const historyByCategory: Record<string, CompletedGoal[]> = {};

        goalsResult.documents.forEach(doc => {
          const goal = doc as GoalStatus;
          if (goal.category) {
            goalsByCategory[goal.category] = goal;
            if (!historyByCategory[goal.category]) {
              historyByCategory[goal.category] = [];
            }
            if (goal.isCompleted) {
              historyByCategory[goal.category].push(doc as CompletedGoal);
            }
          }
        });

        setCategoryGoals(goalsByCategory);
        setCompletedGoalsHistory(historyByCategory);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [uniqueId]);

  useEffect(() => {
    if (!responses.length || !questions.length) return;

    // Calculate category stats
    const newCategoryStats: Record<string, CategoryStats> = {};
    const categories = new Set(questions.map(q => q.category));

    categories.forEach(category => {
      const categoryResponses = responses.filter(r => r.category === category);
      const categoryQuestions = questions.filter(q => q.category === category);
      
      const sum = categoryResponses.reduce((acc, r) => acc + r.score, 0);
      const bonus = categoryResponses.filter(r => r.score >= 7).length;
      const count = categoryResponses.length;
      const percentage = count > 0 ? sum / count : 0;

      newCategoryStats[category] = {
        sum,
        bonus,
        count,
        percentage,
        answeredCount: count,
        total: categoryQuestions.length,
        healthScore: getHealthScore(percentage)
      };
    });

    setCategoryStats(newCategoryStats);

    // Calculate overall score
    const totalScore = Object.values(newCategoryStats).reduce((acc, stats) => 
      acc + (stats.percentage || 0), 0
    );
    const categoryCount = Object.keys(newCategoryStats).length;
    const averageScore = categoryCount > 0 ? totalScore / categoryCount : 0;

    setOverallScore(getHealthScore(averageScore));

    // Update survey categories
    setData(prev => ({
      ...prev,
      surveyCategories: Array.from(categories).map(category => ({
        name: category,
        icon: `/icons/${category.toLowerCase()}.svg`,
        answeredCount: newCategoryStats[category].answeredCount,
        questionCount: newCategoryStats[category].total,
        hasNotification: newCategoryStats[category].answeredCount < newCategoryStats[category].total
      }))
    }));

  }, [responses, questions]);

  // ... rest of the component code ...
}
