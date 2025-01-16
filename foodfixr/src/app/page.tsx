'use client'

import { account, databases } from "@/lib/appwrite-config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FoodFixrDashboard } from "@/components/food-fixr-dashboard";
import { FoodFixrMenuDrawerComponent } from "@/components/food-fixr-menu-drawer";
import { useTheme } from "next-themes";
import { Models } from "appwrite";
import { Query } from "appwrite";

type ScoreDisplay = {
  points: number;
  emoji: string;
  label: string;
  color: string;
}

type CategoryScore = {
  totalPoints: number;
  questionCount: number;
  averageScore: number;
  scoreDisplay: ScoreDisplay;
}

interface FoodFixrUser extends Models.User<Models.Preferences> {
  categoryScores?: { [key: string]: CategoryScore };
}

export default function Home() {
  const [session, setSession] = useState<FoodFixrUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    let mounted = true;

    const checkAccount = async () => {
      try {
        const accountResult = await account.get();
        if (mounted) {
          // Fetch category scores
          const uniqueId = `ff${accountResult.$id.slice(0, 34)}`;
          const responses = await databases.listDocuments(
            'foodfixrdb',
            'user_surveryquestions_log',
            [
              Query.equal('userid', uniqueId)
            ]
          );

          const scores: { [key: string]: CategoryScore } = {};
          responses.documents.forEach(response => {
            const category = response.category;
            if (!scores[category]) {
              scores[category] = {
                totalPoints: 0,
                questionCount: 0,
                averageScore: 0,
                scoreDisplay: {
                  points: 0,
                  emoji: "❗",
                  label: "Critical",
                  color: "text-red-700"
                }
              };
            }
            scores[category].totalPoints += response.survey_pts;
            scores[category].questionCount += 1;
            scores[category].averageScore = scores[category].totalPoints / scores[category].questionCount;
          });

          setSession({
            ...accountResult,
            categoryScores: scores
          });
        }
      } catch (error) {
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
