import { SurveysAndGoalsComponent } from '@/components/food-fixr-survey-goals';
import { FoodFixrMenuDrawerComponent } from '@/components/food-fixr-menu-drawer';

export default function SurveysGoalsPage() {
  return (
    <FoodFixrMenuDrawerComponent>
      <SurveysAndGoalsComponent />
    </FoodFixrMenuDrawerComponent>
  );
}
