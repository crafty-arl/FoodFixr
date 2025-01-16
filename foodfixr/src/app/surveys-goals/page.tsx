'use client';

import { useState, useCallback, useEffect } from 'react';
import { INITIAL_CATEGORIES } from '@/lib/constants';
import { CategoryStats, SurveyResponse } from '@/lib/types';
import { databases } from '@/lib/appwrite-config';
import { Query, Models } from 'appwrite';
import { calculateCategoryStats } from '@/lib/score-calculator';
import Cookies from 'js-cookie';

interface AppwriteDocument extends Models.Document {
  [key: string]: unknown;
}

interface Question extends AppwriteDocument {
  QuestionType: string;
  Question: string;
  Why: string;
  absolutely: number;
  moderate_for_sure: number;
  sort_of: number;
  barely_or_rarely: number;
  never_ever: number;
}

interface GoalDocument extends AppwriteDocument {
  category: string;
  goals: Array<{ completed?: boolean }>;
}

export default function SurveysGoalsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [categoryStats, setCategoryStats] = useState<{ [key: string]: CategoryStats }>({});
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const uniqueId = Cookies.get('uniqueId');
    if (uniqueId) {
      setUserId(uniqueId);
    }
  }, []);

  const initializeCategories = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      // Fetch questions
      const questionsResult = await databases.listDocuments(
        'foodfixrdb',
        'risk_assesment_questions',
        [Query.limit(1000)]
      );

      // Store responses for later use
      const responsesResult = await databases.listDocuments(
        'foodfixrdb',
        'user_surveryquestions_log',
        [
          Query.equal('userid', userId),
          Query.limit(1000)
        ]
      );

      const newResponses = responsesResult.documents.map(r => ({
        survey_pts: r.survey_pts,
        category: r.category,
        questionid: r.questionid,
        selectedAnswer: r.selectedAnswer,
        surveytaken: r.surveytaken
      }));
      setResponses(newResponses);

      // Fetch completed goals
      const goalsResult = await databases.listDocuments(
        'foodfixrdb',
        'food_fixr_ai_logs',
        [
          Query.equal('userid', userId),
          Query.limit(1000)
        ]
      );

      // Group questions by category
      const questionsByCategory = (questionsResult.documents as Question[]).reduce<Record<string, Question[]>>((acc, question) => {
        const category = question.QuestionType;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(question);
        return acc;
      }, {});

      // Count completed goals by category
      const completedGoalsByCategory = (goalsResult.documents as GoalDocument[]).reduce<Record<string, number>>((acc, doc) => {
        if (!acc[doc.category]) {
          acc[doc.category] = 0;
        }
        const completedGoals = doc.goals?.filter(goal => goal.completed === true).length || 0;
        acc[doc.category] += completedGoals;
        return acc;
      }, {});

      // Calculate stats for each category
      const stats: { [key: string]: CategoryStats } = {};

      // Initialize categories with stats
      INITIAL_CATEGORIES.forEach(cat => {
        const categoryResponses = newResponses
          .filter(r => r.category === cat.name);

        const completedGoalsCount = completedGoalsByCategory[cat.name] || 0;
        const totalQuestions = questionsByCategory[cat.name]?.length || 0;

        // Calculate category stats
        const categoryStats = calculateCategoryStats(
          categoryResponses,
          completedGoalsCount,
          totalQuestions
        );

        stats[cat.name] = categoryStats;
      });

      setCategoryStats(stats);
    } catch (error) {
      console.error('Error initializing categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      initializeCategories();
    }
  }, [userId, initializeCategories]);

  if (isLoading) {
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Surveys and Goals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(categoryStats).map(([category, stats]) => (
          <div key={category} className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold">{category}</h2>
            <p>Completion: {stats.percentage.toFixed(1)}%</p>
            <p>Responses: {responses.filter(r => r.category === category).length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
