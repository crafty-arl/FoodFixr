import { FoodFixrSignup } from '@/components/food-fixr-signup';

export default function SignupPage() {
  return (
    <div className="flex">
      <FoodFixrSignup />
      <div className="p-4">
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({
            publicKey: typeof window !== 'undefined' ? window.document.cookie.split('; ').find(row => row.startsWith('publicKey='))?.split('=')[1] : null
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
