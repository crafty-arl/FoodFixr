import { ProfileEdit } from '@/components/profile-edit';
import { FoodFixrMenuDrawerComponent } from '@/components/food-fixr-menu-drawer';

export default function AccountPage() {
  return (
    <FoodFixrMenuDrawerComponent>
      <ProfileEdit />
    </FoodFixrMenuDrawerComponent>
  );
}
