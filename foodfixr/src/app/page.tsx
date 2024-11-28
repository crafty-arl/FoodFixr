'use client'

import { account } from "@/app/appwrite";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FoodFixrDashboard } from "@/components/food-fixr-dashboard";
import { FoodFixrMenuDrawerComponent } from "@/components/food-fixr-menu-drawer";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
    return <div>Loading...</div>; // Show a loading indicator instead of null
  }
  
  if (!session) {
    router.replace('/login');
    return <div>Redirecting...</div>; // Show a redirect message instead of null
  }

  return (
    <FoodFixrMenuDrawerComponent>
      <FoodFixrDashboard username={session.name} />
    </FoodFixrMenuDrawerComponent>
  );
}
