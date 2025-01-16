import { HealthScore } from './types';

// Helper function to convert 8-point score to 10-point score
const convertTo10PointScale = (score: number): number => {
  return (score / 8) * 10;
};

// Helper function to get health score label and emoji based on rating
export const getHealthScore = (rating: number): HealthScore => {
  // Convert the rating to 10-point scale for display
  const displayScore = convertTo10PointScale(rating);
  
  if (rating === 0) return {
    score: 0,
    displayScore: 0,
    label: 'Not Started',
    color: 'text-gray-500',
    emoji: '\u{1F636}'  // 😶
  };
  if (rating >= 7) return { 
    score: rating, 
    displayScore: displayScore,
    label: 'Excellent', 
    color: 'text-green-500',
    emoji: '\u{1F604}'  // 😄
  };
  if (rating >= 6) return { 
    score: rating, 
    displayScore: displayScore,
    label: 'Very Good', 
    color: 'text-emerald-500',
    emoji: '\u{1F60A}'  // 😊
  };
  if (rating >= 5) return { 
    score: rating, 
    displayScore: displayScore,
    label: 'Good', 
    color: 'text-blue-500',
    emoji: '\u{1F642}'  // 🙂
  };
  if (rating >= 4) return { 
    score: rating, 
    displayScore: displayScore,
    label: 'Fair', 
    color: 'text-yellow-500',
    emoji: '\u{1F610}'  // 😐
  };
  if (rating >= 3) return { 
    score: rating, 
    displayScore: displayScore,
    label: 'Needs Work', 
    color: 'text-orange-500',
    emoji: '\u{1F615}'  // 😕
  };
  return { 
    score: rating, 
    displayScore: displayScore,
    label: 'Poor', 
    color: 'text-red-500',
    emoji: '\u{1F61F}'  // 😟
  };
};

// Calculate score for a single category
export const calculateCategoryScore = (
  responses: Array<{ survey_pts: number }>,
  completedGoalsCount: number,
  maxScore: number = 8
): number => {
  // Calculate base score from survey responses
  const totalPoints = responses.reduce((sum, response) => sum + (response.survey_pts || 0), 0);
  const baseScore = responses.length > 0 ? totalPoints / responses.length : 0;
  
  // Add bonus from completed goals (0.15 points per completed goal)
  const goalsBonus = completedGoalsCount * 0.15;
  
  // Return final score capped at maxScore
  return Math.min(maxScore, baseScore + goalsBonus);
};

// Calculate overall health score across all categories
export const calculateOverallScore = (categoryScores: { [key: string]: number }): number => {
  const scores = Object.values(categoryScores);
  if (scores.length === 0) return 0;
  
  const total = scores.reduce((sum, score) => sum + score, 0);
  return Number((total / scores.length).toFixed(2));
};

// Calculate completion percentage for a category
export const calculateCompletionPercentage = (
  answeredCount: number,
  totalQuestions: number
): number => {
  return totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
};

// Calculate category statistics
export interface CategoryStats {
  total: number;
  answeredCount: number;
  score: number;
  percentage: number;
  healthScore: HealthScore;
}

export const calculateCategoryStats = (
  responses: Array<{ survey_pts: number }>,
  completedGoalsCount: number,
  totalQuestions: number
): CategoryStats => {
  const score = calculateCategoryScore(responses, completedGoalsCount);
  const answeredCount = responses.length;
  
  return {
    total: totalQuestions,
    answeredCount,
    score: responses.reduce((sum, response) => sum + (response.survey_pts || 0), 0),
    percentage: score,
    healthScore: getHealthScore(score)
  };
};

// Format score for display (out of 10)
export const formatScore = (score: number): string => {
  const displayScore = convertTo10PointScale(score);
  return displayScore.toFixed(1);
}; 