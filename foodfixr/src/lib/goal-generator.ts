import { databases } from '@/lib/appwrite-config';
import { Query } from 'appwrite';

export interface Goal {
  text: string;
  isCompleted: boolean;
  dateCompleted?: string;
}

export interface CategoryGoals {
  goals: Goal[];
  category: string;
  dateGenerated: string;
}

export async function fetchCategoryGoals(userId: string, category: string): Promise<CategoryGoals | null> {
  try {
    const result = await databases.listDocuments(
      'foodfixrdb',
      'food_fixr_ai_logs',
      [
        Query.equal('userid', userId),
        Query.equal('category', category),
        Query.orderDesc('date_goals_generated'),
        Query.limit(1)
      ]
    );

    if (result.documents.length === 0) return null;

    const doc = result.documents[0];
    return {
      goals: parseGoals(doc.goals),
      category: doc.category,
      dateGenerated: doc.date_goals_generated
    };
  } catch (error) {
    console.error('Error fetching goals:', error);
    return null;
  }
}

export async function fetchAllGoals(userId: string): Promise<{ [category: string]: CategoryGoals }> {
  try {
    const result = await databases.listDocuments(
      'foodfixrdb',
      'food_fixr_ai_logs',
      [
        Query.equal('userid', userId),
        Query.orderDesc('date_goals_generated'),
        Query.limit(100)
      ]
    );

    const goalsByCategory: { [category: string]: CategoryGoals } = {};
    
    result.documents.forEach(doc => {
      if (!goalsByCategory[doc.category]) {
        goalsByCategory[doc.category] = {
          goals: parseGoals(doc.goals),
          category: doc.category,
          dateGenerated: doc.date_goals_generated
        };
      }
    });

    return goalsByCategory;
  } catch (error) {
    console.error('Error fetching all goals:', error);
    return {};
  }
}

export async function markGoalAsCompleted(
  userId: string, 
  category: string, 
  goalIndex: number
): Promise<boolean> {
  try {
    const currentGoals = await fetchCategoryGoals(userId, category);
    if (!currentGoals) return false;

    const updatedGoals = currentGoals.goals.map((goal, index) => {
      if (index === goalIndex) {
        return { ...goal, isCompleted: true, dateCompleted: new Date().toISOString() };
      }
      return goal;
    });

    await databases.updateDocument(
      'foodfixrdb',
      'food_fixr_ai_logs',
      currentGoals.category,
      {
        goals: updatedGoals.map(goal => formatGoalForStorage(goal)),
      }
    );

    return true;
  } catch (error) {
    console.error('Error marking goal as completed:', error);
    return false;
  }
}

function parseGoals(goalsArray: string[]): Goal[] {
  return goalsArray.map(goalText => {
    const isCompleted = goalText.includes('Completed: true');
    const dateCompletedMatch = goalText.match(/DateCompleted: (.+?)(?:\n|$)/);
    
    return {
      text: goalText.replace(/\nCompleted: (?:true|false)/, '')
                   .replace(/\nDateCompleted: .+/, '')
                   .trim(),
      isCompleted,
      dateCompleted: dateCompletedMatch ? dateCompletedMatch[1] : undefined
    };
  });
}

function formatGoalForStorage(goal: Goal): string {
  let formattedGoal = goal.text;
  formattedGoal += `\nCompleted: ${goal.isCompleted}`;
  if (goal.dateCompleted) {
    formattedGoal += `\nDateCompleted: ${goal.dateCompleted}`;
  }
  return formattedGoal;
}

export function calculateGoalProgress(goals: Goal[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = goals.filter(goal => goal.isCompleted).length;
  const total = goals.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return {
    completed,
    total,
    percentage
  };
} 