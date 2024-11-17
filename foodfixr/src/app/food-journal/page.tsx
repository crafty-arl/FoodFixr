import { FoodJournalComponent } from '@/components/food-journal'
import { FoodFixrMenuDrawerComponent } from '@/components/food-fixr-menu-drawer'

export default function FoodJournalPage() {
  return (
    <FoodFixrMenuDrawerComponent>
      <FoodJournalComponent />
    </FoodFixrMenuDrawerComponent>
  )
}
