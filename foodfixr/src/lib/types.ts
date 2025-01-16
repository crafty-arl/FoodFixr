// Health Score Types
export interface HealthScore {
  score: number;
  displayScore: number;
  label: string;
  color: string;
  emoji: string;
}

// Survey Response Types
export interface SurveyResponse {
  survey_pts: number;
  category: string;
  questionid: string;
  selectedAnswer: string;
  surveytaken: string;
}

// Category Types
export interface CategoryScore {
  totalPoints: number;
  questionCount: number;
  averageScore: number;
  scoreDisplay: HealthScore;
}

export interface CategoryStats {
  total: number;
  answeredCount: number;
  score: number;
  percentage: number;
  healthScore: HealthScore;
}

export interface SurveyCategory {
  name: string;
  icon: string;
  progress: number;
  questionCount: number;
  answeredCount: number;
  hasNotification?: boolean;
}

// Question Types
export interface Question {
  $id: string;
  QuestionType: string;
  Question: string;
  Why: string;
  absolutely: number;
  moderate_for_sure: number;
  sort_of: number;
  barely_or_rarely: number;
  never_ever: number;
}

// Goal Types
export interface GoalLog {
  goals: string[];
  category: string;
  userid: string;
  $id: string;
} 