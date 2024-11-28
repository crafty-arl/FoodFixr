'use client'

import { FoodFixrMenuDrawerComponent } from '@/components/food-fixr-menu-drawer';
import { database } from '@/app/appwrite';
import { Query } from 'appwrite';
import { ProfileEdit } from '@/components/profile-edit';
import { useEffect, useState } from 'react';
import { UserData } from '@/components/account-setup';

export default function AccountPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data...');
        const result = await database.listDocuments(
          'foodfixrdb',
          'user_profile',
          [Query.equal('userID', 'ff079fd7ebd2a1c51b469db3b61411cc5665')]
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
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        if (error.response) {
          console.error('Error response:', error.response);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <FoodFixrMenuDrawerComponent>
      <div className="p-4">
        {loading ? (
          <div>Loading...</div>
        ) : userData ? (
          <ProfileEdit userData={userData} />
        ) : (
          <div>No user data found</div>
        )}
      </div>
    </FoodFixrMenuDrawerComponent>
  );
}
