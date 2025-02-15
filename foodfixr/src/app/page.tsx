'use client'

import { account } from "@/app/appwrite";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FoodFixrDashboard } from "@/components/food-fixr-dashboard";
import { FoodFixrMenuDrawerComponent } from "@/components/food-fixr-menu-drawer";
import { useTheme } from "next-themes";
import { Models } from 'appwrite';

// Update the types to match the menu drawer component
export type ScoreDisplay = {
  points: number;
  emoji: string;
  label: string;
  color: string;
}

// Make the CategoryScore interface more explicit
export interface CategoryScore {
  totalPoints: number;
  questionCount: number;
  averageScore: number;
  scoreDisplay: ScoreDisplay;
}

// Add a type for the component props
export interface CategoryScores {
  [key: string]: CategoryScore;
}

// Update the UserWithScores interface
interface UserWithScores extends Models.User<Models.Preferences> {
  categoryScores?: CategoryScores;
}

export default function Home() {
  const [session, setSession] = useState<UserWithScores | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    let mounted = true;

    const checkAccount = async () => {
      try {
        const accountResult = await account.get() as Models.User<Models.Preferences>;
        if (mounted) {
          // Add scoreDisplay to each category score
          const rawScores = (accountResult as UserWithScores).categoryScores || {};
          const formattedScores: CategoryScores = {};
          
          Object.entries(rawScores).forEach(([key, score]) => {
            const typedScore = score as {
              totalPoints: number;
              questionCount: number;
              averageScore: number;
            };
            
            // Calculate the score display based on the average score
            const percentage = (typedScore.averageScore / 8) * 100;
            const points = Math.round((percentage / 100) * 8 * 10) / 10;
            
            let scoreDisplay: ScoreDisplay;
            if (points >= 7.2) scoreDisplay = { points, emoji: "🌟", label: "Outstanding", color: "text-emerald-600" };
            else if (points >= 6.4) scoreDisplay = { points, emoji: "✨", label: "Excellent", color: "text-green-600" };
            else if (points >= 5.6) scoreDisplay = { points, emoji: "😊", label: "Very Good", color: "text-green-500" };
            else if (points >= 4.8) scoreDisplay = { points, emoji: "👍", label: "Good", color: "text-lime-500" };
            else if (points >= 4.0) scoreDisplay = { points, emoji: "😐", label: "Average", color: "text-yellow-500" };
            else if (points >= 3.2) scoreDisplay = { points, emoji: "🤔", label: "Fair", color: "text-orange-500" };
            else if (points >= 2.4) scoreDisplay = { points, emoji: "😕", label: "Below Average", color: "text-orange-600" };
            else if (points >= 1.6) scoreDisplay = { points, emoji: "😟", label: "Poor", color: "text-red-500" };
            else if (points >= 0.8) scoreDisplay = { points, emoji: "😢", label: "Very Poor", color: "text-red-600" };
            else scoreDisplay = { points, emoji: "❗", label: "Critical", color: "text-red-700" };
            
            formattedScores[key] = {
              ...typedScore,
              scoreDisplay
            };
          });

          setSession({
            ...accountResult,
            categoryScores: formattedScores
          });
        }
      } catch (error: unknown) {
        console.error('Error checking account:', error);
        if (mounted) {
          router.replace('/login');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAccount();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (isLoading) {
    return <div className="dark:bg-gray-900 dark:text-white">Loading...</div>;
  }
  
  if (!session) {
    router.replace('/login');
    return <div className="dark:bg-gray-900 dark:text-white">Redirecting...</div>;
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="dark:bg-gray-900">
        <FoodFixrMenuDrawerComponent 
          username={session.name}
          categoryScores={session.categoryScores || {}}
        >
          <FoodFixrDashboard username={session.name} />
        </FoodFixrMenuDrawerComponent>
      </div>
    </div>
  );
}
