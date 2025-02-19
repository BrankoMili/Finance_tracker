"use client";

import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createUserProfile } from "@/services/userService";
import GoogleSignInBtn from "@/components/GoogleSignInBtn";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);

      // Get token ID
      const idToken = await result.user.getIdToken();
      // Set Cookie
      document.cookie = `session=${idToken}; path=/; Secure; SameSite=Strict; Max-Age=3600`;

      router.push("/");
    } catch (error) {
      console.error("Greška pri prijavi:", error);
    }
  };

  const handleEmailAndPasswordSignIn = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const passwordInput = form.elements.namedItem(
      "password"
    ) as HTMLInputElement;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailInput.value,
        passwordInput.value
      );

      // Get token ID
      const idToken = await userCredential.user.getIdToken();
      // Set Cookie
      document.cookie = `session=${idToken}; path=/; Secure; SameSite=Strict; Max-Age=3600`;

      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-7">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Leva strana sa slikom */}
        <div
          className="sm:w-full xl:w-1/2 flex flex-col p-8 relative bg-cover bg-center bg-no-repeat items-center"
          style={{
            backgroundImage: `url(/assets/images/finance_track_login_image.svg)`,
            backgroundColor: "rgba(29, 78, 216, 0.7)",
            backgroundBlendMode: "multiply"
          }}
        >
          <h2 className="text-5xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-xl text-center text-white opacity-90">
            Manage your finances easily and efficiently with our platform
          </p>
        </div>

        {/* Desna strana sa formom */}
        <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Sign In</h1>

            <form onSubmit={handleEmailAndPasswordSignIn} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Log in
              </button>
            </form>

            <div className="mb-4 mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">OR</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center"
            >
              <GoogleSignInBtn />
            </button>

            <p className="mt-8 text-center text-sm text-gray-900/80">
              Don't have an account?{" "}
              <button
                onClick={() => router.push("/signup")}
                className="text-indigo-500 hover:text-indigo-600 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
