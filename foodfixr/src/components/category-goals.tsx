'use client';

import { useEffect, useState, useCallback } from 'react';
import { CategoryGoals, fetchCategoryGoals, markGoalAsCompleted, calculateGoalProgress } from '@/lib/goal-generator';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface CategoryGoalsProps {
  userId: string;
  category: string;
  onGoalComplete?: () => void;
}

export function CategoryGoals({ userId, category, onGoalComplete }: CategoryGoalsProps) {
  const [goals, setGoals] = useState<CategoryGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });

  const loadGoals = useCallback(async () => {
    setIsLoading(true);
    try {
      const categoryGoals = await fetchCategoryGoals(userId, category);
      setGoals(categoryGoals);
      if (categoryGoals) {
        setProgress(calculateGoalProgress(categoryGoals.goals));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, category]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleGoalComplete = async (goalIndex: number) => {
    if (!goals) return;

    try {
      const success = await markGoalAsCompleted(userId, category, goalIndex);
      if (success) {
        await loadGoals();
        onGoalComplete?.();
      }
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006666]"></div>
      </div>
    );
  }

  if (!goals) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No goals found for this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#006666]">Current Goals</h3>
          <p className="text-sm text-gray-500">
            Generated on {formatDate(goals.dateGenerated)}
          </p>
        </div>
        <Badge variant="secondary" className="bg-[#006666] text-white">
          {progress.completed}/{progress.total} Completed
        </Badge>
      </div>

      <Progress 
        value={progress.percentage} 
        className="h-2 w-full"
      />

      <div className="space-y-4">
        {goals.goals.map((goal, index) => (
          <Card 
            key={index}
            className={`border-2 transition-colors ${
              goal.isCompleted 
                ? 'border-green-500 bg-green-50' 
                : 'border-[#006666]/30 hover:border-[#006666]'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-1">
                  <Checkbox
                    checked={goal.isCompleted}
                    onCheckedChange={() => !goal.isCompleted && handleGoalComplete(index)}
                    disabled={goal.isCompleted}
                    className="border-2 border-[#006666] data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${goal.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {goal.text}
                    </p>
                    {goal.isCompleted && goal.dateCompleted && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        Completed {formatDate(goal.dateCompleted)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 