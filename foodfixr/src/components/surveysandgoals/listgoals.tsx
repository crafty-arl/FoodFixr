'use client';

import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite-config';
import { Query } from 'appwrite';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Goal {
  text: string;
  isCompleted: boolean;
}

interface GoalDocument {
  $id: string;
  userid: string;
  category: string;
  goals: string[];
  date_goals_generated: string;
  isCompleted: boolean;
}

interface ListGoalsProps {
  userId: string;
  category: string;
  onGoalComplete?: () => void;
}

export function ListGoals({ userId, category, onGoalComplete }: ListGoalsProps) {
  const [goals, setGoals] = useState<GoalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setIsLoading(true);
        const response = await databases.listDocuments(
          'foodfixrdb',
          'food_fixr_ai_logs',
          [
            Query.equal('userid', userId),
            Query.equal('category', category),
            Query.orderDesc('date_goals_generated'),
            Query.limit(10)
          ]
        );

        setGoals(response.documents as GoalDocument[]);
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && category) {
      fetchGoals();
    }
  }, [userId, category]);

  const parseGoal = (goalString: string): Goal => {
    const isCompleted = goalString.includes('Completed: true');
    return {
      text: goalString.replace('Completed: false', '').replace('Completed: true', '').trim(),
      isCompleted
    };
  };

  const handleGoalComplete = async (documentId: string, goalIndex: number, currentGoal: string) => {
    try {
      const updatedGoals = [...goals];
      const doc = updatedGoals.find(d => d.$id === documentId);
      if (!doc) return;

      // Update the goal string to mark it as completed
      const updatedGoalString = currentGoal.replace('Completed: false', 'Completed: true');
      doc.goals[goalIndex] = updatedGoalString;

      // Check if all goals are completed
      const allCompleted = doc.goals.every(g => g.includes('Completed: true'));

      // Update the document in the database
      await databases.updateDocument(
        'foodfixrdb',
        'food_fixr_ai_logs',
        documentId,
        {
          goals: doc.goals,
          isCompleted: allCompleted
        }
      );

      setGoals(updatedGoals);
      if (onGoalComplete) {
        onGoalComplete();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
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
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006666]"></div>
      </div>
    );
  }

  if (!goals.length) {
    return (
      <div className="text-center p-4 text-gray-500">
        No goals found for this category.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[60vh] w-full pr-4">
      <div className="space-y-4">
        {goals.map((doc) => (
          <Card key={doc.$id} className="border-2 border-[#006666]">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <Badge variant="secondary" className="bg-[#006666] text-white">
                  Generated {formatDate(doc.date_goals_generated)}
                </Badge>
                {doc.isCompleted && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    All Complete
                  </Badge>
                )}
              </div>
              <div className="space-y-4">
                {doc.goals.map((goalString, index) => {
                  const goal = parseGoal(goalString);
                  const [goalText, benefitText, tipsText] = goal.text.split('\n');
                  
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg ${
                        goal.isCompleted 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-[#006666]">
                            {goalText?.replace('Goal:', '').trim()}
                          </p>
                          {benefitText && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Benefit:</span>
                              {benefitText.replace('Benefit:', '').trim()}
                            </p>
                          )}
                          {tipsText && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Tips:</span>
                              {tipsText.replace('Tips:', '').trim()}
                            </p>
                          )}
                        </div>
                        {!goal.isCompleted && (
                          <Button
                            size="sm"
                            onClick={() => handleGoalComplete(doc.$id, index, goalString)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 