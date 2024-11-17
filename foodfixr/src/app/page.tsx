import { FoodFixrDashboard } from "@/components/food-fixr-dashboard";
import { FoodFixrMenuDrawerComponent } from "@/components/food-fixr-menu-drawer";

export default function Home() {
  return (
    <FoodFixrMenuDrawerComponent>
      <FoodFixrDashboard />
    </FoodFixrMenuDrawerComponent>
  );
}
