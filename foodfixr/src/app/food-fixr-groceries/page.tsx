'use client'

import { FoodJournalComponent } from '@/components/food-journal'
import { FoodFixrMenuDrawerComponent } from '@/components/food-fixr-menu-drawer'
import { useState, useEffect } from 'react'
import { database } from '@/app/appwrite'
import { Query } from 'appwrite'
import Cookies from 'js-cookie'

export default function FoodJournalPage() {
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const uniqueId = Cookies.get('uniqueId')
        if (!uniqueId) return

        const result = await database.listDocuments(
          'foodfixrdb',
          'user_profile',
          [Query.equal('userID', uniqueId)]
        )

        if (result.documents.length > 0) {
          setUsername(result.documents[0].Username || '')
        }
      } catch (error) {
        console.error('Error fetching username:', error)
      }
    }

    fetchUsername()
  }, [])

  return (
    <FoodFixrMenuDrawerComponent username={username}>
      <FoodJournalComponent />
    </FoodFixrMenuDrawerComponent>
  )
}
