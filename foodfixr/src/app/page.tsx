'use client'

import { account } from "@/app/appwrite";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FoodFixrDashboard } from "@/components/food-fixr-dashboard";
import { FoodFixrMenuDrawerComponent } from "@/components/food-fixr-menu-drawer";
import { useTheme } from "next-themes";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    let mounted = true;

    const checkAccount = async () => {
      try {
        const accountResult = await account.get();
        if (mounted) {
          setSession(accountResult);
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
