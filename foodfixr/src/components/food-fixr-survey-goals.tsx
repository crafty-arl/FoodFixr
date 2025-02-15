'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from 'lucide-react'
import Image, { StaticImageData } from 'next/image'
import { Comfortaa, Lexend } from 'next/font/google'
import { database } from '@/app/appwrite'
import { Query } from 'appwrite'
import Cookies from 'js-cookie'
import LoadingSpinner from '@/components/loading'
import { Models } from 'appwrite'

const comfortaa = Comfortaa({ subsets: ['latin'] })
const lexend = Lexend({ subsets: ['latin'] })

// Types
interface SurveyCategory {
  name: string;
  progress: number;
  icon: string | StaticImageData;
  questionCount: number;
  answeredCount: number;
  hasNotification: boolean;
}

interface CategoryScore {
  totalPoints: number;
  questionCount: number;
  averageScore: number;
  scoreDisplay: ScoreDisplay;
}

interface SurveyData {
  surveyCategories: SurveyCategory[];
  categoryScores: { [key: string]: CategoryScore };
  answeredQuestions: Set<string>;
}

interface Survey {
  category: string;
  questions: {
    text: string;
    why: string;
    $id: string;
    options: {
      text: string;
      value: number;
    }[];
  }[];
}

interface ScoreDisplay {
  points: number;
  emoji: string;
  label: string;
  color: string;
}

// Add new interfaces for health scores
interface HealthScore {
  score: number;
  label: string;
  color: string;
  emoji: string;
}

interface CategoryStats {
  score: number;
  total: number;
  percentage: number;
  healthScore: HealthScore;
  answeredCount: number;
}

// Add new interfaces for questions
interface Question extends BaseDocument {
  $id: string;
  QuestionType: string;
  Why: string;
  absolutely: number;
  moderate_for_sure: number;
  sort_of: number;
  barely_or_rarely: number;
  never_ever: number;
  Question: string;
  user_specfic_question_id?: string;
}

interface Response extends Models.Document {  // Change from BaseDocument to Models.Document
  userid: string;
  questionid: string;
  surveytaken: string;
  survey_pts: number;
  selectedAnswer: string;
  category: string;
  question: string;
}

// Add new interface for goals
interface GoalLog {
  $id?: string;
  userid: string;
  category: string;
  goals: string[];
  date_goals_generated: string;
  isCompleted: boolean;
  completedGoals?: boolean[];  // Track completion status for each goal
}

interface GoalResponse {
  goal: string;
  category: string;
  benefit: string;
  tips: string;
}

// Add type guard
function isValidGoalResponse(goal: unknown): goal is GoalResponse {
  const goalResponse = goal as Partial<GoalResponse>;
  return typeof goalResponse === 'object' && 
         goalResponse !== null &&
         typeof goalResponse.goal === 'string' &&
         typeof goalResponse.category === 'string' &&
         typeof goalResponse.benefit === 'string' &&
         typeof goalResponse.tips === 'string';
}

const INITIAL_CATEGORIES: SurveyCategory[] = [
  {
    name: 'Toxins',
    progress: 0,
    icon: '/toxins.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Sugar',
    progress: 0,
    icon: '/sugar.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Alkalinity',
    progress: 0,
    icon: '/alkalinity.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Food Combining',
    progress: 0,
    icon: '/foodcombining.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Timing',
    progress: 0,
    icon: '/mealtiming.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Pre_probiotics',
    progress: 0,
    icon: '/pre_probiotics.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Macros',
    progress: 0,
    icon: '/macronutrient_balance.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  },
  {
    name: 'Gut_BrainHealth',
    progress: 0,
    icon: '/gut_brainsupport.png',
    questionCount: 0,
    answeredCount: 0,
    hasNotification: true
  }
];

// Add getHealthScore helper function
const getHealthScore = (rating: number): HealthScore => {
  if (rating === 0) return {
    score: 0,
    label: 'Not Started',
    color: 'text-gray-500',
    emoji: '\u{1F636}'  // 😶
  };
  if (rating >= 7) return { 
    score: rating, 
    label: 'Excellent', 
    color: 'text-green-500',
    emoji: '\u{1F604}'  // 😄
  };
  if (rating >= 6) return { 
    score: rating, 
    label: 'Very Good', 
    color: 'text-emerald-500',
    emoji: '\u{1F60A}'  // 😊
  };
  if (rating >= 5) return { 
    score: rating, 
    label: 'Good', 
    color: 'text-blue-500',
    emoji: '\u{1F642}'  // 🙂
  };
  if (rating >= 4) return { 
    score: rating, 
    label: 'Fair', 
    color: 'text-yellow-500',
    emoji: '\u{1F610}'  // 😐
  };
  if (rating >= 3) return { 
    score: rating, 
    label: 'Needs Work', 
    color: 'text-orange-500',
    emoji: '\u{1F615}'  // 😕
  };
  return { 
    score: rating, 
    label: 'Poor', 
    color: 'text-red-500',
    emoji: '\u{1F61F}'  // 😟
  };
};

// Add polling interval constant at the top with other constants
const POLLING_INTERVAL = 15000; // 15 seconds in milliseconds

// Add type guard function at the top of the file
const isSurveyCategory = (category: string | undefined): category is string => {
  return typeof category === 'string' && INITIAL_CATEGORIES.some(c => c.name === category);
};

// Add polling function
export const pollForUpdatedGoals = async (uniqueId: string, category: string, maxAttempts = 5) => {
  let attempts = 0;
  
  const poll = async () => {
    try {
      const goalsResult = await database.listDocuments(
        'foodfixrdb',
        'food_fixr_ai_logs',
        [
          Query.equal('userid', uniqueId),
          Query.equal('category', category),
          Query.orderDesc('date_goals_generated'),
          Query.limit(1)
        ]
      );

      if (goalsResult.documents.length > 0) {
        const latestGoals = goalsResult.documents[0];
        return latestGoals;
      }
    } catch (error) {
      console.error('Error polling for goals:', error);
    }
    return null;
  };

  while (attempts < maxAttempts) {
    const result = await poll();
    if (result) {
      return result;
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between attempts
  }

  return null;
};

// // Add helper function to count completed goals from a goal log
// const countCompletedGoals = (goals: string[]) => {
//   return goals.filter(goalText => goalText.includes('Completed: true')).length;
// };

// Modify calculateCategoryScore to include historical goals
const calculateCategoryScore = (baseScore: number, currentCompletedCount: number, historicalCompletedCount: number): number => {
  try {
    // Validate inputs
    const validBaseScore = Number(baseScore) || 0;
    const validCurrentCount = Number(currentCompletedCount) || 0;
    const validHistoricalCount = Number(historicalCompletedCount) || 0;
    
    // Calculate total completed goals bonus (0.5 points per completed goal)
    const totalCompletedGoals = validCurrentCount + validHistoricalCount;
    const goalBonus = totalCompletedGoals * 0.5;
    
    // Calculate total score and cap at 8.0
    const totalScore = Math.min(8, validBaseScore + goalBonus);
    
    console.log('Score calculation:', {
      baseScore: validBaseScore,
      currentCompleted: validCurrentCount,
      historicalCompleted: validHistoricalCount,
      totalCompleted: totalCompletedGoals,
      bonus: goalBonus,
      totalScore
    });
    
    // Return rounded score to 2 decimal places
    return Number(totalScore.toFixed(2));
  } catch (error) {
    console.error('Error calculating category score:', error);
    return baseScore; // Return original score if calculation fails
  }
};

// Modify the areAllSurveysComplete function to include more detailed logging
const areAllSurveysComplete = (categories: SurveyCategory[]) => {
  console.log('\n🔍 CHECKING SURVEY COMPLETION STATUS');
  
  const allComplete = categories.every(cat => {
    const isComplete = cat.answeredCount === cat.questionCount && cat.questionCount > 0;
    console.log(`Category ${cat.name}:`, {
      answered: cat.answeredCount,
      total: cat.questionCount,
      isComplete
    });
    return isComplete;
  });

  console.log(`Final Status: ${allComplete ? '✅ ALL COMPLETE' : '❌ NOT ALL COMPLETE'}\n`);
  return allComplete;
};

// Add these type definitions at the top of the file
interface BaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
}

interface GoalDocumentData {
  userid: string;
  category: string;
  goals: string[];
  date_goals_generated: string;
  isCompleted: boolean;
}

interface GoalDocument extends BaseDocument, GoalDocumentData {}

// Add type guard
function isGoalDocument(doc: unknown): doc is GoalDocument {
  if (!doc || typeof doc !== 'object') {
    return false;
  }

  const goalDoc = doc as Partial<GoalDocument>;
  return typeof goalDoc.userid === 'string' && 
         typeof goalDoc.category === 'string' && 
         Array.isArray(goalDoc.goals) &&
         typeof goalDoc.date_goals_generated === 'string' &&
         typeof goalDoc.isCompleted === 'boolean';
}

interface UserProfile extends BaseDocument {
  userID: string;
  healthConcerns: string[];
  foodAllergies: string[];
  dietaryPreferences: string[];
  anxietyLevel: number;
  painLevel: number;
  activityLevel: string;
}

// Update the AppwriteDatabase interface to match Appwrite's types
interface AppwriteDatabase {
  listDocuments: <T extends Models.Document>(
    databaseId: string,
    collectionId: string,
    queries?: string[]
  ) => Promise<Models.DocumentList<T>>;
  createDocument: <T extends Models.Document>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Omit<T, keyof Models.Document>,
    permissions?: string[]
  ) => Promise<T>;
  updateDocument: <T extends Models.Document>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Omit<T, keyof Models.Document>
  ) => Promise<T>;
  getDocument: <T extends Models.Document>(
    databaseId: string,
    collectionId: string,
    documentId: string
  ) => Promise<T>;
}

interface CategoryStats {
  total: number;
  answeredCount: number;
  score: number;
  percentage: number;
  healthScore: HealthScore;
}

interface CategoryStatsMap {
  [key: string]: CategoryStats;
}

// Now update the function signatures to use these types
const generateGoalsForCategory = async (
  uniqueId: string,
  category: string,
  categoryStats: CategoryStatsMap,
  overallScore: HealthScore,
  responses: Response[],
  database: AppwriteDatabase,
  questions: Question[],
  setCategoryGoals: React.Dispatch<React.SetStateAction<{ [key: string]: GoalLog }>>,
  categoryGoals: { [key: string]: GoalLog },
  setSelectedSurvey?: React.Dispatch<React.SetStateAction<Survey | null>>
) => {
  try {
    // Check if all surveys are complete before generating goals
    const allSurveysComplete = Object.entries(categoryStats).every(([, stats]: [string, CategoryStatistics]) => 
      stats.answeredCount === stats.total && stats.total > 0
    );

    if (!allSurveysComplete) {
      console.log('❌ Cannot generate goals: Not all surveys are complete');
      return false;
    }

    console.log(`\n🎯 Generating goals for category: ${category}`);
    console.log('📈 Category Stats:', {
      score: categoryStats[category].percentage,
      answered: categoryStats[category].answeredCount,
      total: categoryStats[category].total
    });

    // Get user profile data
    const userProfileResult = await database.listDocuments<UserProfile>(
      'foodfixrdb',
      'user_profile',
      [Query.equal('userID', uniqueId)]
    );

    if (!userProfileResult.documents.length) {
      throw new Error('User profile not found');
    }

    const userProfile = userProfileResult.documents[0];
    console.log('👤 User Profile loaded');

    // Prepare webhook payload with specific category data
    const webhookData = {
      task: 'generate_goals',
      userId: uniqueId,
      category: category,
      score: categoryStats[category].percentage,
      categoryScores: categoryStats,
      userProfile: {
        healthConditions: userProfile.healthConcerns || [],
        foodAllergies: userProfile.foodAllergies || [],
        dietaryPreferences: userProfile.dietaryPreferences || [],
        anxietyLevel: userProfile.anxietyLevel || 1,
        painLevel: userProfile.painLevel || 1,
        activityLevel: userProfile.activityLevel || 'Sedentary',
        overallHealth: {
          score: overallScore.score,
          label: overallScore.label,
          emoji: overallScore.emoji
        }
      },
      surveyResponses: responses.filter(r => r.category === category).map(response => ({
        question: response.question,
        answer: response.selectedAnswer,
        score: response.survey_pts,
        dateTaken: response.surveytaken,
        category: response.category,
        why: questions.find(q => q.$id === response.questionid)?.Why || ''
      }))
    };

    console.log('📤 Sending webhook request with user profile:', {
      category,
      score: webhookData.score,
      responseCount: webhookData.surveyResponses.length,
      overallHealth: webhookData.userProfile.overallHealth,
      userProfile: {
        healthConditions: webhookData.userProfile.healthConditions.length,
        foodAllergies: webhookData.userProfile.foodAllergies.length,
        dietaryPreferences: webhookData.userProfile.dietaryPreferences.length,
        anxietyLevel: webhookData.userProfile.anxietyLevel,
        painLevel: webhookData.userProfile.painLevel,
        activityLevel: webhookData.userProfile.activityLevel
      }
    });

    // Send to webhook endpoint
    const response = await fetch('/api/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      console.error('❌ Webhook request failed:', response.statusText);
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Webhook response received:', {
      status: result.status,
      message: result.message,
      goalsCount: result.webhookResponse?.output?.length || 0
    });

    // Store the generated goals in the database
    if (result.webhookResponse?.output && result.status === 'success' && typeof category === 'string') {
      console.log('🎯 Processing webhook response for goals:', {
        category,
        outputLength: result.webhookResponse.output.length,
        firstGoal: result.webhookResponse.output[0]
      });

      const goalsArray = result.webhookResponse.output
        .filter(isValidGoalResponse)
        .map((goal: GoalResponse) => {
          const parts = [
            `Goal: ${goal.goal}`,
            `Category: ${goal.category}`,
            `Benefit: ${goal.benefit}`,
            `Tips: ${goal.tips}`
          ];
          return parts.join('\n');
        });

      console.log('📝 Processed goals array:', {
        category,
        goalsCount: goalsArray.length,
        goals: goalsArray
      });

      if (goalsArray.length > 0) {
        console.log(`💾 Storing ${goalsArray.length} goals for ${category}`);
        const newGoalDoc = await database.createDocument<GoalDocument>(
          'foodfixrdb',
          'food_fixr_ai_logs',
          'unique()',
          {
            userid: uniqueId as string,
            category: category,
            goals: goalsArray,
            date_goals_generated: new Date().toISOString(),
            isCompleted: false
          } as GoalDocumentData
        );
        console.log('✅ Goals stored with document ID:', newGoalDoc.$id);

        // Update local state immediately with the new goals
        const newGoalLog: GoalLog = {
          userid: uniqueId as string,
          category: category,
          goals: goalsArray,
          date_goals_generated: new Date().toISOString(),
          isCompleted: false,
          $id: newGoalDoc.$id
        };

        // Update categoryGoals state
        setCategoryGoals(prev => ({
          ...prev,
          [category]: newGoalLog
        }));

        // Force a re-render of the selected survey
        if (setSelectedSurvey) {
          setSelectedSurvey(prevSurvey => {
            if (prevSurvey?.category === category) {
              return { ...prevSurvey };
            }
            return prevSurvey;
          });
        }

        // Log current category goals state
        console.log('🔄 Updated category goals state:', {
          category,
          goals: goalsArray,
          allCategories: Object.keys(categoryGoals)
        });
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error generating goals for ${category}:`, error);
    return false;
  }
};

// Modify generateGoalsForLowScoreCategories to check for scores below Good (5.0)
const generateGoalsForLowScoreCategories = async (
  uniqueId: string,
  categoryStats: CategoryStatsMap,
  overallScore: HealthScore,
  responses: Response[],
  database: AppwriteDatabase,
  setIsGeneratingGoals: (value: boolean) => void,
  setShowLoadingDialog: (value: boolean) => void,
  questions: Question[],
  setCategoryGoals: React.Dispatch<React.SetStateAction<{ [key: string]: GoalLog }>>,
  categoryGoals: { [key: string]: GoalLog },
  setSelectedSurvey?: React.Dispatch<React.SetStateAction<Survey | null>>
) => {
  try {
    console.log('\n🚀 Starting bulk goal generation');
    setIsGeneratingGoals(true);
    setShowLoadingDialog(true);

    // Get all categories that need new goals (completed surveys with score below Good)
    const categoriesNeedingGoals = Object.entries(categoryStats)
      .filter(([category, stats]: [string, CategoryStatistics]) => {
        if (!category) return false;
        const hasCompletedSurvey = stats.answeredCount === stats.total && stats.total > 0;
        const isBelowGood = stats.percentage < 5.0; // Score below Good threshold
        console.log(`Category ${category}:`, {
          hasCompletedSurvey,
          score: stats.percentage,
          isBelowGood,
          answeredCount: stats.answeredCount,
          total: stats.total
        });
        return hasCompletedSurvey && isBelowGood;
      })
      .map(([category]) => category);

    console.log('🎯 Categories needing goals (below Good):', categoriesNeedingGoals);
    console.log('📈 Category Stats:', Object.fromEntries(
      Object.entries(categoryStats).map(([cat, stats]: [string, CategoryStatistics]) => [
        cat,
        {
          score: stats.percentage,
          answered: stats.answeredCount,
          total: stats.total,
          needsGoals: stats.percentage < 5.0
        }
      ])
    ));

    for (const category of categoriesNeedingGoals) {
      console.log(`\n📝 Processing category: ${category} (Score: ${categoryStats[category].percentage})`);
      await generateGoalsForCategory(
        uniqueId as string, // Type assertion since we've checked it exists
        category,
        categoryStats,
        overallScore,
        responses,
        database,
        questions,
        setCategoryGoals,
        categoryGoals,
        setSelectedSurvey
      );
      // Add a small delay between requests to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Bulk goal generation completed');
    if (categoriesNeedingGoals.length === 0) {
      console.log('ℹ️ No categories below Good score (5.0) need goals');
    }
  } catch (error) {
    console.error('❌ Error in bulk goal generation:', error);
  } finally {
    setIsGeneratingGoals(false);
    setShowLoadingDialog(false);
  }
};

// Add this function near the top of the component
const triggerCelebration = (message: string) => {
  // You can implement celebration logic here
  console.log('Celebration:', message);
};

interface GoalsState {
  [key: string]: GoalLog;
}

interface AllCompletedGoalsState {
  [key: string]: GoalLog[];
}

interface CategoryStatistics {
  answeredCount: number;
  total: number;
  percentage: number;
  score: number;
  healthScore: HealthScore;
}

interface CompletedGoalsMap {
  [key: string]: number;
}

interface CategoryResponseMap {
  [key: string]: Response[];
}

// Add back necessary interfaces
interface UserProfile {
  HealthConcerns: string[];
  FoodAllergy: string[];
  DietaryPreference: string[];
  AnxietyLevel: number;
  PainLevel: number;
  ActivityLevel: string;
}

// Update the calculateCompletedGoalsByCategory function to handle BaseDocument
const calculateCompletedGoalsByCategory = (documents: BaseDocument[]): CompletedGoalsMap => {
  return documents.reduce<CompletedGoalsMap>((acc, doc) => {
    // Use type guard to ensure document is a valid GoalDocument
    if (!isGoalDocument(doc)) {
      return acc;
    }
    
    if (!acc[doc.category]) {
      acc[doc.category] = 0;
    }
    
    const completedGoalsCount = doc.goals.filter(goal => 
      goal.includes('Completed: true')
    ).length;
    
    acc[doc.category] += completedGoalsCount * 0.15;
    return acc;
  }, {} as CompletedGoalsMap);
};

// Add a helper function to calculate overall progress
const calculateOverallProgress = (
  categoryStats: CategoryStatsMap,
  completedGoals: CompletedGoalsMap
): { score: number; totalAnswered: number; progressPercentage: number } => {
  let totalScore = 0;
  let totalAnswered = 0;
  let totalPossible = 0;

  Object.entries(categoryStats).forEach(([category, stats]) => {
    if (stats.answeredCount > 0) {
      const baseScore = stats.percentage || 0;
      const goalsBonus = completedGoals[category] || 0;
      const finalScore = Math.min(8, baseScore + goalsBonus);
      
      totalScore += finalScore;
      totalAnswered += stats.answeredCount;
      totalPossible += stats.total * 8;
    }
  });

  return {
    score: totalScore,
    totalAnswered,
    progressPercentage: totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0
  };
};

export const SurveysAndGoalsComponent = function FoodFixrSurveyGoals() {
  // Remove unused imports and state
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<SurveyData>({
    surveyCategories: INITIAL_CATEGORIES,
    categoryScores: {},
    answeredQuestions: new Set()
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStatsMap>({});
  const [overallScore, setOverallScore] = useState<HealthScore>({ 
    score: 0, 
    label: 'Not Started', 
    color: 'text-gray-500',
    emoji: '📊'
  });
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const uniqueId = Cookies.get('uniqueId');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [categoryGoals, setCategoryGoals] = useState<GoalsState>({});
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [allCompletedGoals, setAllCompletedGoals] = useState<AllCompletedGoalsState>({});

  // Initialize database with proper typing
  const [appwriteDb] = useState<AppwriteDatabase>(() => {
    if (!database) {
      throw new Error('Database not initialized');
    }
    return database as unknown as AppwriteDatabase;
  });

  // Use appwriteDb as the single source of database access
  const dbInstance = appwriteDb;

  // Add function to handle category selection
  const handleCategorySelect = async (category: SurveyCategory) => {
    try {
      console.log('=== CATEGORY SELECTION DEBUG ===');
      console.log('Selected category:', category.name);

      // First, fetch all risk assessment questions for this category
      const riskQuestionsResult = await dbInstance.listDocuments(
        'foodfixrdb',
        'risk_assesment_questions',
        [
          Query.equal('QuestionType', category.name),
          Query.limit(1000)
        ]
      );
      const categoryQuestions = riskQuestionsResult.documents as unknown as Question[];
      console.log('Risk Assessment Questions:', categoryQuestions.map(q => ({
        id: q.$id,
        type: q.QuestionType,
        question: q.Question
      })));

      // Then fetch user's responses for this specific category
      const responsesResult = await dbInstance.listDocuments(
        'foodfixrdb',
        'user_surveryquestions_log',
        [
          Query.equal('userid', uniqueId || ''),
          Query.equal('category', category.name),
          Query.limit(1000)
        ]
      );
      const fetchedResponses = responsesResult.documents as unknown as Response[];
      console.log('User Survey Responses:', fetchedResponses.map(r => ({
        id: r.$id,
        questionId: r.questionid,
        answer: r.selectedAnswer
      })));

      // Create a map of answered questions for quick lookup
      const answeredQuestionsMap = new Map(fetchedResponses.map(r => [r.questionid, r]));
      console.log('Answered Questions Map:', Array.from(answeredQuestionsMap.keys()));

      // Filter questions to only show unanswered ones
      const unansweredQuestions = categoryQuestions.filter(q => !answeredQuestionsMap.has(q.$id));
      console.log('Unanswered Questions:', unansweredQuestions.map(q => ({
        id: q.$id,
        question: q.Question
      })));

      // Update responses state with only valid responses (those that match existing questions)
      const validResponses = fetchedResponses.filter(r => 
        categoryQuestions.some(q => q.$id === r.questionid)
      );
      console.log('Valid Responses:', validResponses.length);

      setResponses(validResponses);

      // Set selected survey with fresh data
    setSelectedSurvey({
      category: category.name,
      questions: categoryQuestions.map(q => ({
        text: q.Question,
        why: q.Why,
        $id: q.$id,
        options: [
          { text: 'Absolutely', value: q.absolutely },
          { text: 'Moderate For Sure', value: q.moderate_for_sure },
          { text: 'Sort Of', value: q.sort_of },
          { text: 'Barely or Rarely', value: q.barely_or_rarely },
          { text: 'Never Ever', value: q.never_ever }
        ]
      }))
    });

      // Update category stats
      const updatedStats = { ...categoryStats };
      const categoryTotalScore = validResponses.reduce((sum, response) => 
        sum + response.survey_pts
      , 0);

      const averageScore = validResponses.length > 0 ? 
        (categoryTotalScore / validResponses.length) : 0;

      updatedStats[category.name] = {
        ...updatedStats[category.name],
        score: categoryTotalScore,
        answeredCount: validResponses.length,
        percentage: averageScore,
        healthScore: getHealthScore(averageScore)
      };

      setCategoryStats(updatedStats);

      // Update category data
      setData(prevData => ({
        ...prevData,
        surveyCategories: prevData.surveyCategories.map(cat => {
          if (cat.name === category.name) {
            return {
              ...cat,
              progress: averageScore,
              questionCount: categoryQuestions.length,
              answeredCount: validResponses.length,
              hasNotification: categoryQuestions.length > validResponses.length
            };
          }
          return cat;
        })
      }));

    } catch (error) {
      console.error('Error in handleCategorySelect:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const pollQuestions = async () => {
      try {
        const questionsResult = await dbInstance.listDocuments(
          'foodfixrdb',
          'risk_assesment_questions',
          [Query.limit(1000)]
        );

        if (!isMounted) return;

        const fetchedQuestions = questionsResult.documents as unknown as Question[];
        
        // Only update if we have new or different questions
        if (JSON.stringify(fetchedQuestions) !== JSON.stringify(questions)) {
          console.log('New questions detected, updating state...');
          setQuestions(fetchedQuestions);
          setIsLoading(true); // Trigger a full refresh
        }
      } catch (error) {
        console.error('Error polling questions:', error);
      }
    };

    const pollInterval: NodeJS.Timeout = setInterval(pollQuestions, POLLING_INTERVAL);

    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [questions, dbInstance]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!uniqueId || !dbInstance) {
        console.log('Missing required dependencies for initialization');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Starting initialization...');

        const [questionsResult, responsesResult, goalsResult] = await Promise.all([
          dbInstance.listDocuments<Question>(
            'foodfixrdb',
            'risk_assesment_questions',
            [Query.limit(1000)]
          ),
          dbInstance.listDocuments<Response>(
            'foodfixrdb',
            'user_surveryquestions_log',
            [Query.equal('userid', uniqueId), Query.limit(1000)]
          ),
          dbInstance.listDocuments<GoalDocument>(
            'foodfixrdb',
            'food_fixr_ai_logs',
            [Query.equal('userid', uniqueId), Query.limit(1000)]
          )
        ]);

        if (!isMounted) return;

        const fetchedQuestions = questionsResult.documents;
        const validResponses = responsesResult.documents as unknown as Response[];
        const completedGoals = calculateCompletedGoalsByCategory(goalsResult.documents);

        // Calculate category stats
        const stats: CategoryStatsMap = {};
        INITIAL_CATEGORIES.forEach(category => {
          const categoryResponses = validResponses.filter(r => r.category === category.name);
          const categoryQuestions = fetchedQuestions.filter(q => q.QuestionType === category.name);
          
          const responsesScore = categoryResponses.reduce((sum: number, r) => sum + (r.survey_pts || 0), 0);
          const baseScore = categoryResponses.length > 0 ? 
            responsesScore / categoryResponses.length : 0;
          
          const goalsBonus = completedGoals[category.name] || 0;
          const finalScore = Math.min(8, baseScore + goalsBonus);

          stats[category.name] = {
            score: responsesScore,
            answeredCount: categoryResponses.length,
            total: categoryQuestions.length,
            percentage: finalScore,
            healthScore: getHealthScore(finalScore)
          };
        });

        // Calculate overall progress
        const progress = calculateOverallProgress(stats, completedGoals);
        const overallScore = progress.totalAnswered > 0 ? 
          progress.score / progress.totalAnswered : 0;

        if (isMounted) {
          setQuestions(fetchedQuestions);
          setResponses(validResponses);
          setCategoryStats(stats);
          setOverallScore(getHealthScore(overallScore));
          setData(prevData => ({
            ...prevData,
            surveyCategories: prevData.surveyCategories.map(cat => ({
              ...cat,
              progress: stats[cat.name]?.percentage || 0,
              questionCount: stats[cat.name]?.total || 0,
              answeredCount: stats[cat.name]?.answeredCount || 0,
              hasNotification: (stats[cat.name]?.total || 0) > (stats[cat.name]?.answeredCount || 0)
            }))
          }));
          setIsLoading(false);
        }

      } catch (error) {
        console.error('Error in initialization:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [uniqueId, dbInstance]);

  // Add polling effect after the main initialization effect
  useEffect(() => {
    const pollQuestions = async () => {
      if (!uniqueId) return;

      try {
        const result = await dbInstance.listDocuments(
          'foodfixrdb',
          'risk_assesment_questions',
          [Query.limit(1000)]
        );

        const fetchedQuestions = result.documents as unknown as Question[];
        
        // Only update if we have new or different questions
        const currentIds = new Set(questions.map(q => q.$id));
        const hasNewQuestions = fetchedQuestions.some(q => !currentIds.has(q.$id));
        const hasDifferentQuestions = questions.some(q => 
          !fetchedQuestions.find(fq => fq.$id === q.$id)
        );

        if (hasNewQuestions || hasDifferentQuestions) {
          console.log('New or modified questions detected, updating state...');
          setQuestions(fetchedQuestions);
          setIsLoading(true); // Trigger a full refresh
        }
      } catch (error) {
        console.error('Error polling questions:', error);
      }
    };

    // Start polling
    const interval = setInterval(pollQuestions, POLLING_INTERVAL);

    // Cleanup
    return () => clearInterval(interval);
  }, [uniqueId, questions, setQuestions, setIsLoading, dbInstance]);

  // Add goals fetching to the initialization useEffect
  useEffect(() => {
    let isMounted = true;

    const fetchGoals = async () => {
      if (!uniqueId) return;

      try {
        const goalsResult = await database.listDocuments(
          'foodfixrdb',
          'food_fixr_ai_logs',
          [
            Query.equal('userid', uniqueId as string),
            Query.orderDesc('date_goals_generated'),
            Query.limit(1000)
          ]
        );

        if (!isMounted) return;

        // Group all goals by category
        // Fix for line 1513 - Replace any with proper interface
        const allGoalsByCategory = goalsResult.documents.reduce<{ [key: string]: GoalLog[] }>((acc, doc) => {
          // Check if doc is a valid GoalDocument using the type guard
          if (!isGoalDocument(doc)) {
            return acc;
          }

          if (!acc[doc.category]) {
            acc[doc.category] = [];
          }
          acc[doc.category].push({
            userid: doc.userid,
            category: doc.category,
            goals: doc.goals,
            date_goals_generated: doc.date_goals_generated,
            isCompleted: doc.isCompleted || false,
            $id: doc.$id
          });
          return acc;
        }, {} as { [key: string]: GoalLog[] });

        console.log('🎯 Processed goals by category:', allGoalsByCategory);
        
        // Transform the goals array into a single goal object per category
        const latestGoalsByCategory = Object.entries(allGoalsByCategory).reduce((acc: GoalsState, [category, goals]) => {
          if (goals.length > 0) {
            acc[category] = goals[0]; // Take the most recent goal
          }
          return acc;
        }, {});

        setCategoryGoals(latestGoalsByCategory);
        setAllCompletedGoals(allGoalsByCategory);
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    fetchGoals();
    return () => { isMounted = false; };
  }, [uniqueId, dbInstance]);

  // Update the handleGoalComplete function
  const handleGoalComplete = async (
    goalId: string,
    goalIndex: number,
    isCompleted: boolean,
    category: string,
    db: AppwriteDatabase
  ) => {
    try {
      const goalDoc = await db.getDocument<GoalDocument>(
        'foodfixrdb',
        'food_fixr_ai_logs',
        goalId
      );

      const updatedGoals = goalDoc.goals.map((goal, index) => {
        if (index === goalIndex) {
          const parts = goal.split('\n');
          const updatedParts = parts.map(part => {
            if (part.startsWith('Completed:')) {
              return `Completed: ${isCompleted}`;
            }
            return part;
          });
          return updatedParts.join('\n');
        }
        return goal;
      });

      await db.updateDocument<GoalDocument>(
        'foodfixrdb',
        'food_fixr_ai_logs',
        goalId,
        {
          goals: updatedGoals,
          isCompleted: updatedGoals.every(goal => goal.includes('Completed: true'))
        }
      );

      // Update local state
      setCategoryGoals(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          goals: updatedGoals,
          isCompleted: updatedGoals.every(goal => goal.includes('Completed: true'))
        }
      }));

    } catch (error) {
      console.error('Error updating goal completion:', error);
    }
  };

  // Add loading dialog component
  const LoadingDialog = () => (
    <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Generating Goals</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#006666] mb-4"></div>
          <p className="text-center text-muted-foreground">
            Please wait while we analyze your responses and generate personalized goals...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Add this helper function to check if all questions are answered
  const areAllQuestionsAnswered = (category: string) => {
    const categoryQuestions = selectedSurvey?.questions || [];
    const answeredQuestions = Object.keys(selectedAnswers).filter(key => key.startsWith(category));
    return categoryQuestions.length === answeredQuestions.length;
  };

  // Add this useEffect after the other useEffects in the component
  useEffect(() => {
    const loadExistingGoals = async () => {
      if (!uniqueId) return;

      try {
        const goalsResult = await dbInstance.listDocuments(
          'foodfixrdb',
          'food_fixr_ai_logs',
          [
            Query.equal('userid', uniqueId),
            Query.orderDesc('date_goals_generated'),
            Query.limit(1000)
          ]
        );

        const completedGoals = calculateCompletedGoalsByCategory(goalsResult.documents);
        const overallProgress = calculateOverallProgress(categoryStats, completedGoals);

        // Update UI with overall progress
        setOverallScore(getHealthScore(overallProgress.score / Math.max(1, overallProgress.totalAnswered)));

        // Group all goals by category and update state
        const allGoalsByCategory = goalsResult.documents.reduce<{ [key: string]: GoalLog[] }>((acc, doc) => {
          // Check if doc is a valid GoalDocument using the type guard
          if (!isGoalDocument(doc)) {
            return acc;
          }

          if (!acc[doc.category]) {
            acc[doc.category] = [];
          }
          acc[doc.category].push({
            userid: doc.userid,
            category: doc.category,
            goals: doc.goals,
            date_goals_generated: doc.date_goals_generated,
            isCompleted: doc.isCompleted || false,
            $id: doc.$id
          });
          return acc;
        }, {} as { [key: string]: GoalLog[] });

        setCategoryGoals(
          Object.entries(allGoalsByCategory).reduce((acc: GoalsState, [category, goals]) => {
            if (goals.length > 0) {
              acc[category] = goals[0];
            }
            return acc;
          }, {})
        );
        setAllCompletedGoals(allGoalsByCategory);

      } catch (error) {
        console.error('Error loading existing goals:', error);
      }
    };

    loadExistingGoals();
  }, [uniqueId, dbInstance, categoryStats]); // Added categoryStats to dependencies

  useEffect(() => {
    const calculateScores = async () => {
      try {
        if (!uniqueId) return;

        // Fetch all completed goals
        const goalsResult = await database.listDocuments(
          'foodfixrdb',
          'food_fixr_ai_logs',
          [
            Query.equal('userid', uniqueId as string),
            Query.limit(1000)
          ]
        );

        // Calculate completed goals bonus by category
        const completedGoalsByCategory = goalsResult.documents.reduce<Record<string, number>>((acc, doc) => {
          const category = doc.category as string;
          if (!acc[category]) {
            acc[category] = 0;
          }
          
          const completedGoalsCount = (doc.goals as string[]).filter((goal: string) => 
            goal.includes('Completed: true')
          ).length;
          
          acc[category] += completedGoalsCount * 0.15;
          return acc;
        }, {});

        // Update category stats with completed goals bonus
        const updatedStats = { ...categoryStats };
        let totalScore = 0;
        let categoryCount = 0;
        Object.entries(updatedStats).forEach(([category, stats]: [string, CategoryStats]) => {
          const baseScore = stats.percentage || 0;
          const goalsBonus = completedGoalsByCategory[category] || 0;
          const newScore = Math.min(8, baseScore + goalsBonus);

          updatedStats[category] = {
            ...stats,
            percentage: newScore,
            healthScore: getHealthScore(newScore)
          };

          totalScore += newScore;
          categoryCount++;
        });

        // Calculate new overall score
        const newOverallScore = categoryCount > 0 ? totalScore / categoryCount : 0;

        setCategoryStats(updatedStats);
        setOverallScore(getHealthScore(newOverallScore));

        // Update categories data with new scores
        setData(prevData => ({
          ...prevData,
          surveyCategories: prevData.surveyCategories.map(cat => ({
            ...cat,
            progress: updatedStats[cat.name]?.percentage || 0
          }))
        }));

      } catch (error) {
        console.error('Error calculating scores:', error);
      }
    };

    calculateScores();
  }, [uniqueId, responses, categoryGoals, dbInstance, categoryStats]);

  useEffect(() => {
    const calculateInitialScores = async () => {
      try {
        if (!uniqueId) {
          console.log('No uniqueId found, skipping initial score calculation');
          return;
        }

        console.log('Calculating initial scores...');

        // Fetch all responses and goals
        const [responsesResult, goalsResult] = await Promise.all([
          database.listDocuments(
            'foodfixrdb',
            'user_surveryquestions_log',
            [
              Query.equal('userid', uniqueId as string),
              Query.limit(1000)
            ]
          ),
          database.listDocuments(
            'foodfixrdb',
            'food_fixr_ai_logs',
            [
              Query.equal('userid', uniqueId as string),
              Query.limit(1000)
            ]
          )
        ]);

        // Group responses by category
        const responsesByCategory = responsesResult.documents.reduce<CategoryResponseMap>((acc, response) => {
          const typedResponse = response as unknown as Response;
          if (!acc[typedResponse.category]) {
            acc[typedResponse.category] = [];
          }
          acc[typedResponse.category].push(typedResponse);
          return acc;
        }, {});

        // Count completed goals by category
        const completedGoalsByCategory = goalsResult.documents.reduce<Record<string, number>>((acc, doc) => {
          const category = doc.category;
          if (!acc[category]) {
            acc[category] = 0;
          }
          const completedGoalsCount = (doc.goals || []).filter((goal: string) => 
            goal.includes('Completed: true')
          ).length;
          
          acc[category] = (acc[category] || 0) + completedGoalsCount;
          return acc;
        }, {} as { [key: string]: number });

        console.log('Completed goals by category:', completedGoalsByCategory);

        // Calculate scores for each category
        const updatedStats = { ...categoryStats };
        let totalScore = 0;
        let categoryCount = 0;

        Object.entries(responsesByCategory).forEach(([category, responses]) => {
          const totalPoints = responses.reduce((sum: number, response: { survey_pts?: number }) => sum + (response.survey_pts || 0), 0);
          const baseScore = responses.length > 0 ? totalPoints / responses.length : 0;
          
          const completedGoalsCount = completedGoalsByCategory[category] || 0;
          const finalScore = calculateCategoryScore(baseScore, completedGoalsCount, 0);

          console.log(`Category ${category} score calculation:`, {
            baseScore,
            completedGoals: completedGoalsCount,
            finalScore
          });

          updatedStats[category] = {
            ...updatedStats[category],
            percentage: finalScore,
            healthScore: getHealthScore(finalScore),
            answeredCount: responses.length,
            total: questions.filter(q => q.QuestionType === category).length
          };

          totalScore += finalScore;
          categoryCount++;
        });

        const overallAverage = categoryCount > 0 ? totalScore / categoryCount : 0;

        setCategoryStats(updatedStats);
        setOverallScore(getHealthScore(overallAverage));

        setData(prevData => ({
          ...prevData,
          surveyCategories: prevData.surveyCategories.map(cat => ({
            ...cat,
            progress: updatedStats[cat.name]?.percentage || 0,
            answeredCount: updatedStats[cat.name]?.answeredCount || 0,
            questionCount: updatedStats[cat.name]?.total || 0
          }))
        }));

      } catch (error) {
        console.error('Error calculating initial scores:', error);
      }
    };

    calculateInitialScores();
  }, [uniqueId, questions, categoryStats, dbInstance]);

  // Add this new effect hook near your other useEffect hooks
  useEffect(() => {
    const generateInitialGoalsIfNeeded = async () => {
      const category = selectedSurvey?.category;
      if (!category || !isSurveyCategory(category)) return;

      const currentGoals = categoryGoals[category];
      const categoryScore = categoryStats[category]?.percentage || 0;

      // Only generate goals if we have no current goals and score is below 5.0
      if (!currentGoals && categoryScore < 5.0) {
        setShowLoadingDialog(true);
        try {
          const success = await generateGoalsForCategory(
            uniqueId as string, // Type assertion since we've checked it exists
            category,
            categoryStats,
            overallScore,
            responses,
            database,
            questions,
            setCategoryGoals,
            categoryGoals,
            setSelectedSurvey
          );

          if (success) {
            const updatedGoalsResult = await database.listDocuments(
              'foodfixrdb',
              'food_fixr_ai_logs',
              [
                Query.equal('userid', uniqueId as string),
                Query.equal('category', category),
                Query.orderDesc('date_goals_generated'),
                Query.limit(1)
              ]
            );

            if (updatedGoalsResult.documents.length > 0) {
              const latestGoals = updatedGoalsResult.documents[0];
              setCategoryGoals(prev => ({
                ...prev,
                [category]: {
                  userid: latestGoals.userid,
                  category: latestGoals.category,
                  goals: latestGoals.goals,
                  date_goals_generated: latestGoals.date_goals_generated,
                  isCompleted: false,
                  $id: latestGoals.$id
                }
              }));
              setSelectedSurvey(prev => ({...prev!}));
            }
          }
        } catch (error) {
          console.error('Error generating initial goals:', error);
        } finally {
          setShowLoadingDialog(false);
        }
      }
    };

    generateInitialGoalsIfNeeded();
  }, [selectedSurvey?.category, categoryGoals, categoryStats, uniqueId, overallScore, responses, database, questions]); // Added questions

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`container mx-auto p-2 sm:p-4 max-w-7xl bg-white ${comfortaa.className}`} role="main">
      <LoadingDialog />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8">
        <div className="flex items-center mb-4 sm:mb-0">
          <Image
            src="/FoodFixrLogo.png"
            alt="Food Fixr Logo"
            width={100}
            height={50}
            className="w-16 sm:w-24 h-auto mr-2 sm:mr-4"
            priority
          />
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold text-[#006666] ${comfortaa.className}`}>Surveys</h1>
        </div>
        {/* Only show score if there are any answered questions */}
        {responses.length > 0 && (
          <div className="flex flex-col items-end">
            <div className={`text-lg sm:text-xl font-semibold ${overallScore.color}`}>
              Overall Health Score: {overallScore.score.toFixed(1)}/8 {overallScore.emoji}
            </div>
            <div className={`text-sm ${overallScore.color}`}>
              {overallScore.label}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4" role="list" aria-label="Category statistics">
        {data.surveyCategories.map(category => (
          <Card 
            key={category.name} 
            className={`overflow-hidden bg-white border-2 border-[#006666] transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer relative`}
            onClick={() => handleCategorySelect(category)}
          >
            <CardHeader className="text-center p-2 sm:p-4">
              <CardTitle className={`${comfortaa.className} text-base sm:text-lg`}>
                {category.name === 'Pre_probiotics' ? 'Pre/Probiotics' : 
                 category.name === 'Gut_BrainHealth' ? 'Gut-Brain Health' : 
                 category.name}
              </CardTitle>
              {categoryStats[category.name] && (
                <div className={`text-sm font-medium ${categoryStats[category.name].healthScore.color}`}>
                  {categoryStats[category.name].healthScore.label} {categoryStats[category.name].healthScore.emoji}
                </div>
              )}
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2 sm:gap-4 p-2 sm:p-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20">
                <Image
                  src={category.icon}
                  alt={`${category.name} icon`}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <Progress 
                value={(categoryStats[category.name]?.percentage || 0) * 100 / 8}
                className="w-full" 
              />
              <div className="text-center mt-1 sm:mt-2">
                <div className="text-xs sm:text-sm mt-2 font-medium">
                  {category.answeredCount || 0}/{category.questionCount || 0} Questions Completed
                  {category.questionCount > 0 && (
                    <span className="text-gray-500">
                      {' '}({((category.answeredCount / category.questionCount) * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
                {categoryStats[category.name] && (
                  <div className={`text-sm font-medium ${categoryStats[category.name].healthScore.color}`}>
                    Score: {categoryStats[category.name].percentage.toFixed(1)}/8 {categoryStats[category.name].healthScore.emoji}
                  </div>
                )}
                {category.hasNotification && (
                  <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-800">
                    {category.answeredCount === 0 ? 'Start Survey' : 'Continue Survey'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSurvey && (
        <Dialog 
          open={!!selectedSurvey} 
          onOpenChange={async (open) => {
            if (!open) {
              setSelectedSurvey(null);
              return;
            }
            
            try {
              console.log('=== DIALOG OPEN DEBUG ===');
              console.log('Current responses before refresh:', responses);
              
              // Fetch latest responses when dialog opens
              const responsesResult = await dbInstance.listDocuments(
                'foodfixrdb',
                'user_surveryquestions_log',
                [
                  Query.equal('userid', uniqueId || ''),
                  Query.limit(1000)
                ]
              );

              // Update responses state with fresh data
              const fetchedResponses = responsesResult.documents as unknown as Response[];
              console.log('Fetched responses on dialog open:', fetchedResponses);
              console.log('Response differences:', {
                before: responses.length,
                after: fetchedResponses.length,
                removedIds: responses.filter(r => !fetchedResponses.find(fr => fr.$id === r.$id)).map(r => r.$id)
              });

              setResponses(fetchedResponses);
            } catch (error) {
              console.error('Error in dialog open:', error);
            }
          }}
        >
          <DialogContent className="w-[95vw] sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-center mb-4">
                <DialogTitle className={`text-xl sm:text-2xl text-[#006666] ${comfortaa.className}`}>
                  {selectedSurvey.category} Survey
                </DialogTitle>
              </div>
            </DialogHeader>

            <Tabs defaultValue={selectedSurvey.questions.filter(q => !responses.some(r => r.questionid === q.$id)).length > 0 ? "incomplete" : "goals"} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="incomplete" disabled={selectedSurvey.questions.filter(q => !responses.some(r => r.questionid === q.$id)).length === 0}>
                  Incomplete ({selectedSurvey.questions.filter(q => !responses.some(r => r.questionid === q.$id)).length})
                </TabsTrigger>
                <TabsTrigger value="goals">Active Goals</TabsTrigger>
                <TabsTrigger value="completed_goals">Completed Goals</TabsTrigger>
                <TabsTrigger value="taken" disabled={selectedSurvey.questions.filter(q => responses.some(r => r.questionid === q.$id)).length === 0}>
                  Surveys Taken ({selectedSurvey.questions.filter(q => responses.some(r => r.questionid === q.$id)).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="incomplete" className="mt-4">
                <div className="space-y-4">
                  <div className="flex flex-col gap-4" role="list" aria-label="Incomplete survey questions">
                    {selectedSurvey.questions
                      .filter(question => !responses.some(r => r.questionid === question.$id))
                      .map((question, index) => (
                        <Card
                          key={question.$id}
                          className={`transition-shadow border-2 ${
                            responses.some(r => r.questionid === question.$id) ? 'border-green-500 bg-green-50' : 'border-[#006666]'
                          }`}
                          role="listitem"
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col items-center">
                              {/* Top Section with Logo and Question */}
                              <div className="flex items-center gap-4 mb-6 text-center">
                                {/* Category Logo */}
                                <div className={`flex-shrink-0 p-3 rounded-full ${
                                  responses.some(r => r.questionid === question.$id) ? 'bg-green-100' : 'bg-[#006666]/10'
                                }`}>
                                  <div className="w-12 h-12">
                                    <Image
                                      src={data.surveyCategories.find(cat => cat.name === selectedSurvey.category)?.icon ?? ''}
                                      alt={`${selectedSurvey.category} icon`}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-contain"
                                      priority
                                    />
                                  </div>
                                </div>

                                {/* Question Content */}
                                <div className="text-center">
                                  <h3 className={`font-medium text-[#993366] ${lexend.className} text-base mb-2`}>
                                    Question {index + 1} {responses.some(r => r.questionid === question.$id) && '✓'}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">{question.text}</p>
                                </div>
                              </div>

                              {/* Response Display */}
                              {(() => {
                                const response = responses.find(r => r.questionid === question.$id);
                                return response && (
                                  <div className="text-sm text-green-600 mb-4 text-center">
                                    {response.selectedAnswer && (
                                      <span className="mr-4">Your Answer: {response.selectedAnswer}</span>
                                    )}
                                    {response.survey_pts !== undefined && response.survey_pts !== null && !isNaN(response.survey_pts) && (
                                      <span>Score: {response.survey_pts.toFixed(1)}/8</span>
                                    )}
                                  </div>
                                );
                              })()}

                              {/* Answer Options - Horizontal Layout */}
                              <div className="w-full">
                                <RadioGroup 
                                  aria-label={`Question ${index + 1} options`}
                                  onValueChange={(value) => {
                                    setSelectedAnswers(prev => ({
                                      ...prev,
                                      [`${selectedSurvey.category}-${index}`]: value
                                    }));
                                  }}
                                  value={responses.find(r => r.questionid === question.$id)?.selectedAnswer || selectedAnswers[`${selectedSurvey.category}-${index}`] || ''}
                                  disabled={responses.some(r => r.questionid === question.$id)}
                                  className="flex justify-center gap-4 flex-wrap"
                                >
                                  {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center gap-2">
                                      <RadioGroupItem value={option.text} id={`${index}-${optionIndex}`} />
                                      <Label 
                                        htmlFor={`${index}-${optionIndex}`}
                                        className="text-sm text-muted-foreground whitespace-nowrap"
                                      >
                                        {option.text}
                                      </Label>
                </div>
                                  ))}
                                </RadioGroup>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                  
                  {/* Add Submit Survey button at the bottom */}
                  {selectedSurvey.questions.filter(q => !responses.some(r => r.questionid === q.$id)).length > 0 && (
                    <div className="sticky bottom-4 flex justify-center pt-4 mt-8 border-t">
                      <Button 
                        className="bg-[#006666] hover:bg-[#005555] disabled:bg-gray-300 w-full sm:w-auto"
                        disabled={!areAllQuestionsAnswered(selectedSurvey.category)}
                        onClick={async () => {
                          try {
                            setIsGeneratingGoals(true);
                            const category = selectedSurvey.category;

                            // Submit answers and get new responses
                            const answersToSubmit = Object.entries(selectedAnswers)
                              .filter(([key]) => key.startsWith(category))
                              .map(([key, value]) => {
                                const index = parseInt(key.split('-')[1]);
                                return {
                                  index,
                                  answer: value,
                                  question: selectedSurvey.questions[index]
                                };
                              });

                            const newResponses = await Promise.all(answersToSubmit.map(async ({ question, answer }) => {
                              const questionObj = questions.find(q => q.$id === question.$id);
                              if (!questionObj) return null;

                              let score = 0;
                              switch (answer) {
                                case 'Absolutely': score = questionObj.absolutely; break;
                                case 'Moderate For Sure': score = questionObj.moderate_for_sure; break;
                                case 'Sort Of': score = questionObj.sort_of; break;
                                case 'Barely or Rarely': score = questionObj.barely_or_rarely; break;
                                case 'Never Ever': score = questionObj.never_ever; break;
                              }

                              const result = await database.createDocument(
                                'foodfixrdb',
                                'user_surveryquestions_log',
                                'unique()',
                                {
                                  userid: uniqueId,
                                  questionid: questionObj.$id,
                                  surveytaken: new Date().toISOString(),
                                  survey_pts: score,
                                  selectedAnswer: answer,
                                  category: questionObj.QuestionType,
                                  question: questionObj.Question
                                }
                              );

                              return {
                                $id: result.$id,
                                userid: result.userid,
                                questionid: result.questionid,
                                surveytaken: result.surveytaken,
                                survey_pts: result.survey_pts,
                                selectedAnswer: result.selectedAnswer,
                                category: result.category,
                                question: result.question
                              };
                            }));

                            // Update responses state with new valid responses
                            const validNewResponses = newResponses.filter(r => r !== null);
                            const updatedResponses = [...responses, ...validNewResponses];
                            setResponses(updatedResponses as Response[]);

                            // Calculate new category stats
                            const categoryResponses = updatedResponses.filter(r => r.category === category);
                            const categoryTotalScore = categoryResponses.reduce((sum, response) => 
                              sum + (response.survey_pts || 0)
                            , 0);
                            const averageScore = categoryResponses.length > 0 ? 
                              (categoryTotalScore / categoryResponses.length) : 0;

                            // Update category stats
                            const updatedCategoryStats = {
                              ...categoryStats,
                              [category]: {
                                ...categoryStats[category],
                                score: categoryTotalScore,
                                answeredCount: categoryResponses.length,
                                percentage: averageScore,
                                healthScore: getHealthScore(averageScore)
                              }
                            };
                            setCategoryStats(updatedCategoryStats);

                            // Calculate new overall score
                            let overallTotalScore = 0;
                            let totalAnsweredQuestions = 0;

                            // Sum up scores from all categories
                            Object.values(updatedCategoryStats).forEach(stats => {
                              if (stats.answeredCount > 0) {
                                overallTotalScore += stats.score;
                                totalAnsweredQuestions += stats.answeredCount;
                              }
                            });

                            const newOverallScore = totalAnsweredQuestions > 0 ? 
                              (overallTotalScore / totalAnsweredQuestions) : 0;

                            // Update overall score
                            setOverallScore(getHealthScore(newOverallScore));

                            // Update survey categories data with new completion status
                            const updatedCategories = data.surveyCategories.map(cat => {
                              if (cat.name === category) {
                                const totalQuestions = selectedSurvey.questions.length;
                                const answeredCount = categoryResponses.length;
                                return {
                                  ...cat,
                                  progress: averageScore,
                                  questionCount: totalQuestions,
                                  answeredCount: answeredCount,
                                  hasNotification: totalQuestions > answeredCount
                                };
                              }
                              return cat;
                            });

                            // Update the data state
                            setData(prevData => ({
                              ...prevData,
                              surveyCategories: updatedCategories
                            }));

                            // Clear states and close dialog
                            setSelectedAnswers({});
                            setSelectedSurvey(null);
                            setIsGeneratingGoals(false);

                            // Check completion status using the newly updated categories
                            const isAllComplete = areAllSurveysComplete(updatedCategories);
                            console.log('🔄 Checking completion with updated categories:', {
                              category,
                              isAllComplete,
                              updatedCategories: updatedCategories.map(cat => ({
                                name: cat.name,
                                answered: cat.answeredCount,
                                total: cat.questionCount
                              }))
                            });

                            triggerCelebration(`Great job! Your ${category} score is now ${averageScore.toFixed(1)}/8 🎯`);

                            // After successful submission, check if all surveys are complete
                            if (isAllComplete) {
                              // Generate goals for all categories with low scores
                              setShowLoadingDialog(true); // Make sure dialog shows before starting
                              await generateGoalsForLowScoreCategories(
                                uniqueId as string, // Type assertion since we've checked it exists
                                updatedCategoryStats,
                                getHealthScore(newOverallScore),
                                updatedResponses as Response[],
                                database,
                                setIsGeneratingGoals,
                                setShowLoadingDialog,
                                questions,
                                setCategoryGoals,
                                categoryGoals,
                                setSelectedSurvey
                              );
                            }

                          } catch (error) {
                            console.error('Error submitting answers:', error);
                            setIsGeneratingGoals(false);
                          }
                        }}
                      >
                        {isGeneratingGoals ? (
                          <>
                            <span className="opacity-0">Submit Survey</span>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          </>
                        ) : (
                          <>
                            Submit Survey ({Object.keys(selectedAnswers).filter(key => 
                              key.startsWith(selectedSurvey.category)).length} / {selectedSurvey.questions.length})
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="goals" className="mt-4">
                <Card>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const category = selectedSurvey?.category;
                        
                        if (!category) return null;
                        
                        // Check if ALL surveys are complete
                        const allSurveysComplete = Object.entries(categoryStats).every(([, stats]: [string, CategoryStatistics]) => 
                          stats.answeredCount === stats.total && stats.total > 0
                        );

                        // If not all surveys are complete, show which ones need to be completed
                        if (!allSurveysComplete) {
                          const incompleteSurveys = Object.entries(categoryStats)
                            .filter(([, stats]: [string, CategoryStatistics]) => 
                              stats.answeredCount !== stats.total || stats.total === 0
                            )
                            .map(([cat]) => cat);

                          return (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm text-yellow-700">
                                    <p className="mb-2">
                                      All risk assessments must be completed before personalized goals can be recommended.
                                    </p>
                                    <div>
                                      <span className="font-semibold">
                                        Please complete the following assessments:
                                      </span>
                                      <ul className="list-disc ml-4 mt-2">
                                        {incompleteSurveys.map(survey => (
                                          <li key={survey}>
                                            {survey === 'Pre_probiotics' ? 'Pre/Probiotics' : 
                                             survey === 'Gut_BrainHealth' ? 'Gut-Brain Health' : 
                                             survey}
                                            {' '}
                                            ({categoryStats[survey].answeredCount}/{categoryStats[survey].total} completed)
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Now we know all surveys are complete, continue with normal goal display logic
                        if (!isSurveyCategory(category)) {
                          console.log('❌ Invalid category:', category);
                          return null;
                        }

                        const currentGoals = categoryGoals[category];
                        const categoryScore = categoryStats[category]?.percentage || 0;
                        
                        // Show loading state while goals are being generated
                        if (!currentGoals && categoryScore < 5.0) {
                          return (
                            <div className="text-center py-8">
                              <div className="animate-pulse">
                                <p className="text-gray-600">Generating personalized goals...</p>
                              </div>
                            </div>
                          );
                        }

                        // Show current goals if they exist
                        if (currentGoals) {
                          const showExcellentMessage = categoryScore > 5.0;

                          return (
                            <div className="mt-6">
                              {showExcellentMessage && (
                                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                                  <div className="flex">
                                    <div className="flex-shrink-0">
                                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-sm text-green-700">
                                        Excellent work! Your score is above 5.0. Keep maintaining these healthy habits!
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="text-sm font-medium text-gray-600 mb-4">
                                Current Goals (Generated on {new Date(currentGoals.date_goals_generated).toLocaleDateString()}):
                              </div>
                              <div className="space-y-2">
                                {currentGoals.goals.map((goalText, index) => {
                                  const isCompleted = goalText.includes('Completed: true');
                                  const parts = goalText.split('\n');
                                  const goalPart = parts.find(part => part.startsWith('Goal:'))?.replace('Goal:', '').trim() || '';
                                  const benefitPart = parts.find(part => part.startsWith('Benefit:'))?.replace('Benefit:', '').trim() || '';
                                  const tipsPart = parts.find(part => part.startsWith('Tips:'))?.replace('Tips:', '').trim() || '';
                                  
                                  return (
                                    <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                                      <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                          <input
                                            type="checkbox"
                                            checked={isCompleted}
                                            onChange={async (e) => {
                                              const newStatus = e.target.checked;
                                              const currentCategory = selectedSurvey?.category;
                                              if (currentCategory && currentGoals.$id) {
                                                await handleGoalComplete(
                                                  currentGoals.$id,
                                                  index,
                                                  newStatus,
                                                  currentCategory,
                                                  dbInstance
                                                );
                                              }
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-[#006666] focus:ring-[#006666]"
                                          />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                          <div className={`text-sm font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                            {goalPart}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {benefitPart && (
                                              <div className="mt-1">
                                                <span className="font-medium">Benefit:</span> {benefitPart}
                                              </div>
                                            )}
                                            {tipsPart && (
                                              <div className="mt-1">
                                                <span className="font-medium">Tips:</span> {tipsPart}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed_goals" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Completed {selectedSurvey.category} Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const category = selectedSurvey?.category;
                        const completedGoalSets = allCompletedGoals[category]?.filter(goalSet => goalSet.isCompleted) || [];

                        if (completedGoalSets.length === 0) {
                          return (
                            <div className="text-center text-gray-500 py-8">
                              <p>No completed goals yet for this category.</p>
                            </div>
                          );
                        }

                        return completedGoalSets.map((goalSet, setIndex) => (
                          <div key={goalSet.$id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="text-sm font-medium text-gray-600 mb-4">
                              Completed on: {new Date(goalSet.date_goals_generated).toLocaleDateString()}
                            </div>
                            <div className="space-y-2">
                              {goalSet.goals.map((goalText, index) => {
                                const parts = goalText.split('\n');
                                const goal = parts.find(p => p.startsWith('Goal:'))?.replace('Goal: ', '') || '';
                                const benefit = parts.find(p => p.startsWith('Benefit:'))?.replace('Benefit: ', '') || '';
                                const tips = parts.find(p => p.startsWith('Tips:'))?.replace('Tips: ', '') || '';

                                return (
                                  <div 
                                    key={`${setIndex}-${index}`}
                                    className="flex items-center justify-between p-2 bg-white rounded"
                                  >
                                    <div className="flex items-center gap-2">
                                      <svg 
                                        className="h-4 w-4 text-green-500" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                      >
                                        <path 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                          strokeWidth={2} 
                                          d="M5 13l4 4L19 7" 
                                        />
                                      </svg>
                                      <span className="text-sm text-gray-600">{goal}</span>
                                    </div>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-[#006666] hover:text-[#005555] transition-colors"
                                          >
                                            <Info className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent 
                                          side="left"
                                          align="center"
                                          className="max-w-[300px] p-4 text-sm bg-white border border-[#006666] shadow-lg"
                                        >
                                          <div className="space-y-2">
                                            <div>
                                              <p className="text-[#006666] font-semibold">Benefits:</p>
                                              <p className="text-[#006666]">{benefit}</p>
                                            </div>
                                            <div>
                                              <p className="text-[#006666] font-semibold">Tips:</p>
                                              <p className="text-[#006666]">{tips}</p>
                                            </div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="taken" className="mt-4">
                <div className="space-y-4">
                  <div className="flex flex-col gap-4" role="list" aria-label="Completed survey questions">
                    {selectedSurvey.questions
                      .filter(question => responses.some(r => r.questionid === question.$id))
                      .map((question, index) => (
                      <Card
                        key={question.$id}
                        className={`transition-shadow border-2 ${
                            responses.some(r => r.questionid === question.$id) ? 'border-green-500 bg-green-50' : 'border-[#006666]'
                        }`}
                        role="listitem"
                      >
                        <CardContent className="p-4">
                            <div className="flex flex-col items-center">
                              {/* Top Section with Logo and Question */}
                              <div className="flex items-center gap-4 mb-6 text-center">
                            {/* Category Logo */}
                            <div className={`flex-shrink-0 p-3 rounded-full ${
                                  responses.some(r => r.questionid === question.$id) ? 'bg-green-100' : 'bg-[#006666]/10'
                            }`}>
                                  <div className="w-12 h-12">
                                <Image
                                  src={data.surveyCategories.find(cat => cat.name === selectedSurvey.category)?.icon ?? ''}
                                  alt={`${selectedSurvey.category} icon`}
                                      width={48}
                                      height={48}
                                  className="w-full h-full object-contain"
                                  priority
                                />
                              </div>
                            </div>

                            {/* Question Content */}
                                <div className="text-center">
                                  <h3 className={`font-medium text-[#993366] ${lexend.className} text-base mb-2`}>
                                    Question {index + 1} {responses.some(r => r.questionid === question.$id) && '✓'}
                                </h3>
                                  <p className="text-sm text-muted-foreground">{question.text}</p>
                              </div>
                                </div>

                              {/* Response Display */}
                              {(() => {
                                const response = responses.find(r => r.questionid === question.$id);
                                return response && (
                                  <div className="text-sm text-green-600 mb-4 text-center">
                                    {response.selectedAnswer && (
                                      <span className="mr-4">Your Answer: {response.selectedAnswer}</span>
                                    )}
                                    {response.survey_pts !== undefined && response.survey_pts !== null && !isNaN(response.survey_pts) && (
                                      <span>Score: {response.survey_pts.toFixed(1)}/8</span>
                                    )}
                                  </div>
                                );
                              })()}

                              {/* Answer Options - Horizontal Layout */}
                              <div className="w-full">
                              <RadioGroup 
                                aria-label={`Question ${index + 1} options`}
                                onValueChange={(value) => {
                                  setSelectedAnswers(prev => ({
                                    ...prev,
                                    [`${selectedSurvey.category}-${index}`]: value
                                  }));
                                }}
                                  value={responses.find(r => r.questionid === question.$id)?.selectedAnswer || selectedAnswers[`${selectedSurvey.category}-${index}`] || ''}
                                  disabled={responses.some(r => r.questionid === question.$id)}
                                  className="flex justify-center gap-4 flex-wrap"
                              >
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <RadioGroupItem value={option.text} id={`${index}-${optionIndex}`} />
                                    <Label 
                                      htmlFor={`${index}-${optionIndex}`}
                                        className="text-sm text-muted-foreground whitespace-nowrap"
                                    >
                                      {option.text}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};