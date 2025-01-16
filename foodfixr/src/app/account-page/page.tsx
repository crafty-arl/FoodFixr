'use client'

import { FoodFixrMenuDrawerComponent } from '@/components/food-fixr-menu-drawer';
import { databases as database } from '@/lib/appwrite-config';
import { Query } from 'appwrite';
import { ProfileEdit } from '@/components/profile-edit';
import { useEffect, useState } from 'react';
import { UserData } from '@/components/account-setup';
import Cookies from 'js-cookie';

export default function AccountPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const uniqueId = Cookies.get('uniqueId');
      if (!uniqueId) {
        console.error('No uniqueId found in cookies');
        setLoading(false);
        return;
      }

      const result = await database.listDocuments(
        'foodfixrdb',
        'user_profile',
        [Query.equal('userID', uniqueId)]
      );

      console.log('Raw API response:', result);
      console.log('Documents found:', result.documents.length);

      if (result.documents.length > 0) {
        const userDoc = result.documents[0];
        console.log('User document:', userDoc);
        
        const formattedData: UserData = {
          age: userDoc.Age.toString(),
          gender: userDoc.Gender.toLowerCase(),
          weight: userDoc.Weight.toString(),
          height: userDoc.Height.toString(),
          activityLevel: userDoc.ActivityLevel,
          healthConditions: Array.isArray(userDoc.HealthConcerns) ? userDoc.HealthConcerns : [userDoc.HealthConcerns],
          foodAllergies: Array.isArray(userDoc.FoodAllergy) ? userDoc.FoodAllergy : [userDoc.FoodAllergy],
          dietaryPreferences: Array.isArray(userDoc.DietaryPreference) ? userDoc.DietaryPreference : [userDoc.DietaryPreference],
          anxietyLevel: Number(userDoc.AnxietyLevel),
          painLevel: Number(userDoc.PainLevel)
        };
        console.log('Formatted user data:', formattedData);
        setUserData(formattedData);
      } else {
        console.log('No documents found for user');
      }
    } catch (error: unknown) {
      console.error('Error fetching user data:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        console.error('Error response:', (error as { response: unknown }).response);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedData: UserData) => {
    setUserData(updatedData);
    await fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <FoodFixrMenuDrawerComponent>
      <div className="p-4">
        {loading ? (
          <div>Loading...</div>
        ) : userData ? (
          <ProfileEdit 
            userData={userData} 
            onSave={handleSave}
          />
        ) : (
          <div>No user data found</div>
        )}
      </div>
    </FoodFixrMenuDrawerComponent>
  );
}
