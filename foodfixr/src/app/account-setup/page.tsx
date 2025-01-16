'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import AccountSetup, { UserData } from '@/components/account-setup';
import { databases } from '@/lib/appwrite-config';
import Loading from '@/components/loading';

export default function AccountSetupPage() {
  const router = useRouter();
  const [uniqueId, setUniqueId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUniqueId = Cookies.get('uniqueId');
    setUniqueId(storedUniqueId);
    
    if (!storedUniqueId) {
      router.push('/signup');
    }
  }, [router]);

  const handleSaveProfile = async (userData: UserData) => {
    try {
      setLoading(true);
      await databases.createDocument(
        'foodfixrdb',
        'user_profile',
        `user_profile_${uniqueId?.slice(-4)}`,
        {
          Age: parseInt(userData.age),
          Gender: userData.gender,
          Weight: parseInt(userData.weight),
          Height: parseInt(userData.height),
          ActivityLevel: userData.activityLevel,
          HealthConcerns: userData.healthConditions,
          FoodAllergy: userData.foodAllergies,
          DietaryPreference: userData.dietaryPreferences,
          AnxietyLevel: userData.anxietyLevel,
          PainLevel: userData.painLevel,
          userID: uniqueId
        }
      );
      router.push('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 409) {
        console.log('User profile already exists');
      } else {
        console.error('Error creating user profile:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!uniqueId) {
    return null;
  }

  return (
    <>
      <AccountSetup onSave={handleSaveProfile} />
      {loading && <Loading />}
    </>
  );
}
