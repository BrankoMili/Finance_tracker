import { Button } from "./shared/Button";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/authService";

interface ErrorComponentProps {
  error: Error;
}

export default function ErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();

  // User log out
  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.push("/login");
    } catch (error) {
      console.error("An error occured:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-red-50/80 border border-red-200 text-red-600 p-8 rounded-2xl shadow-lg">
        <div className="flex items-start gap-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Error Content */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-red-600">
              Oops! Something went wrong
            </h3>
            <p className="text-sm break-words">{error.message}</p>

            {/* Actions */}
            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => window.location.reload()}
                text="Try Again"
                buttonSize="small"
              />
              <Button
                onClick={handleLogout}
                text="Back to Login"
                buttonSize="small"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
