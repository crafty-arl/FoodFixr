'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import AccountSetup from '@/components/account-setup';
import { database } from '../appwrite';
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

  const handleSaveProfile = async (userData: any) => {
    try {
      setLoading(true);
      const result = await database.createDocument(
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
      router.push('/dashboard'); // Or wherever you want to redirect after setup
    } catch (err: any) {
      if (err?.code === 409) {
        console.log('User profile already exists');
        // Handle existing profile - maybe update instead of create
      } else {
        console.error('Error creating user profile:', err);
        // Handle other errors
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
