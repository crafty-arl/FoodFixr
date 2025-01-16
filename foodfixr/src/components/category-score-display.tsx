'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';
import Image from 'next/image';
import { CategoryStats, SurveyCategory } from '@/lib/types';
import { formatScore } from '@/lib/score-calculator';
import { Comfortaa } from 'next/font/google';

const comfortaa = Comfortaa({ subsets: ['latin'] });

interface CategoryScoreDisplayProps {
  category: SurveyCategory;
  stats: CategoryStats;
  onClick?: () => void;
}

export function CategoryScoreDisplay({ category, stats, onClick }: CategoryScoreDisplayProps) {
  const completionPercentage = (stats.answeredCount / stats.total) * 100;
  const scorePercentage = (stats.percentage / 8) * 100; // Keep internal calculation out of 8

  return (
    <Card 
      className={`
        overflow-hidden bg-white border-2 border-[#006666] 
        transition-all duration-300 hover:scale-105 hover:shadow-lg 
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      <CardHeader className="text-center p-2 sm:p-4">
        <div className="flex items-center justify-center gap-2">
          <CardTitle className={`${comfortaa.className} text-base sm:text-lg`}>
            {category.name === 'Pre_probiotics' ? 'Pre/Probiotics' : 
             category.name === 'Gut_BrainHealth' ? 'Gut-Brain Health' : 
             category.name}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Category Health Score: {formatScore(stats.percentage)}/10</p>
                <p>Status: {stats.healthScore.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className={`text-sm font-medium ${stats.healthScore.color}`}>
          {stats.healthScore.label} {stats.healthScore.emoji}
        </div>
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

        {/* Score Progress */}
        <div className="w-full space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Score</span>
            <span>{formatScore(stats.percentage)}/10</span>
          </div>
          <Progress 
            value={scorePercentage}
            className="h-2 bg-gray-100" 
          />
        </div>

        {/* Completion Progress */}
        <div className="w-full space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Completion</span>
            <span>{completionPercentage.toFixed(0)}%</span>
          </div>
          <Progress 
            value={completionPercentage}
            className="h-2 bg-gray-100" 
          />
        </div>

        <div className="text-center mt-1 sm:mt-2">
          <div className="text-xs sm:text-sm mt-2 font-medium">
            {stats.answeredCount}/{stats.total} Questions Completed
          </div>
          <div className="flex gap-2 justify-center mt-2">
            {stats.answeredCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Score: {formatScore(stats.percentage)}/10
              </Badge>
            )}
            {stats.answeredCount < stats.total && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {stats.total - stats.answeredCount} Remaining
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 