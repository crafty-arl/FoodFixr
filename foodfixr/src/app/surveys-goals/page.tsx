'use client';

import { 
  Suspense, 
  useState, 
  useEffect 
} from 'react';

import { 
  SurveysAndGoalsComponent 
} from '@/components/food-fixr-survey-goals';

import { 
  FoodFixrMenuDrawerComponent 
} from '@/components/food-fixr-menu-drawer';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Loading from '@/components/loading';

export default function SurveysGoalsPage() {
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Single authentication check on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const savedUsername = Cookies.get('foodfixr_username');
        const uniqueId = Cookies.get('uniqueId');
        
        console.log('SurveysGoalsPage: Auth check', { 
          hasUsername: !!savedUsername, 
          hasUniqueId: !!uniqueId 
        });

        if (!savedUsername || !uniqueId) {
          console.log('SurveysGoalsPage: No auth found, redirecting to login');
          router.push('/login');
          return;
        }

        if (isMounted) {
          setUsername(savedUsername);
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('SurveysGoalsPage: Error during auth check:', error);
        if (isMounted) {
          router.push('/login');
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <FoodFixrMenuDrawerComponent username={username}>
      <div className="min-h-screen bg-background">
        <SurveysAndGoalsComponent />
      </div>
    </FoodFixrMenuDrawerComponent>
  );
}
