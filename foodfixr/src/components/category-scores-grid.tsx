'use client';

import { CategoryStats, SurveyCategory } from '@/lib/types';
import { CategoryScoreDisplay } from './category-score-display';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatScore } from '@/lib/score-calculator';

interface CategoryScoresGridProps {
  categories: SurveyCategory[];
  categoryStats: { [key: string]: CategoryStats };
  overallScore: {
    score: number;
    displayScore: number;
    label: string;
    color: string;
    emoji: string;
  };
  onCategoryClick?: (category: SurveyCategory) => void;
}

export function CategoryScoresGrid({ 
  categories, 
  categoryStats, 
  overallScore,
  onCategoryClick 
}: CategoryScoresGridProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="bg-white border-2 border-[#006666]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Overall Health Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className={`text-4xl font-bold ${overallScore.color}`}>
            {formatScore(overallScore.score)}/10 {overallScore.emoji}
          </div>
          <div className={`text-xl mt-2 ${overallScore.color}`}>
            {overallScore.label}
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(category => (
          <CategoryScoreDisplay
            key={category.name}
            category={category}
            stats={categoryStats[category.name]}
            onClick={() => onCategoryClick?.(category)}
          />
        ))}
      </div>
    </div>
  );
} 