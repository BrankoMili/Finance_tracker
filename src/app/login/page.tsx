"use client";

import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createUserProfile } from "@/services/userService";
import GoogleSignInBtn from "@/components/GoogleSignInBtn";
import {
  signInWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { showToast } from "@/utils/showToast";
import { FirebaseError } from "@firebase/util";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const [notVerified, setNotVerified] = useState(false);

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
      console.error("Error during sign-in:", error);

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/popup-closed-by-user":
            showToast("error", "Sign-in was canceled by closing the popup");
            break;
          case "auth/network-request-failed":
            showToast("error", "Network connection error");
            break;
          default:
            showToast("error", "An error occurred during Google sign-in");
        }
      } else {
        showToast("error", "An unknown error occurred during sign-in");
      }
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

      const user = userCredential.user;
      // Provera da li je email verifikovan
      if (!user.emailVerified) {
        await auth.signOut();
        setNotVerified(true);
        showToast(
          "error",
          "Please check your email before signing up! Check your inbox."
        );

        return;
      }

      // Get token ID
      const idToken = await userCredential.user.getIdToken();
      // Set Cookie
      document.cookie = `session=${idToken}; path=/; Secure; SameSite=Strict; Max-Age=3600`;

      router.push("/");
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error(error.code);
        switch (error.code) {
          case "auth/invalid-credential":
            showToast("error", "Incorrect email or password");
            break;
          case "auth/too-many-requests":
            showToast(
              "error",
              "Too many failed attempts, please try again later"
            );
            break;
          case "auth/user-disabled":
            showToast("error", "User account has been disabled");
            break;
          case "auth/user-not-found":
            showToast("error", "User does not exist");
            break;
          case "auth/wrong-password":
            showToast("error", "Incorrect password");
            break;
          default:
            showToast("error", "An error occurred during sign-in");
        }
      } else {
        showToast("error", "An unknown error occurred during sign-in");
        console.error("Non-Firebase error:", error);
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const emailInput = form.elements.namedItem(
      "resetEmail"
    ) as HTMLInputElement;
    const email = emailInput.value;

    try {
      await sendPasswordResetEmail(auth, email);
      showToast("success", "Password reset email sent. Check your inbox.");
      setShowResetPassword(false);
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
            showToast("error", "No user found with this email.");
            break;
          case "auth/invalid-email":
            showToast("error", "Invalid email format.");
            break;
          default:
            showToast("error", "Error sending reset email. Please try again.");
        }
      }
    }
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      showToast("success", "A new verification email has been sent!");
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
          <div className="w-full max-w-md min-h-[500px]">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              {showResetPassword ? "Reset Password" : "Sign In"}
            </h1>

            {showResetPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-6 ">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="resetEmail"
                    required
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Send Reset Link
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetPassword(false)}
                  className="w-full mt-4 text-center text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              <>
                <form
                  onSubmit={handleEmailAndPasswordSignIn}
                  className="space-y-6"
                >
                  {/* Existing email field */}
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

                  {/* Existing password field */}
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

                  {/* Forgot Password link */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      className="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {notVerified && !auth.currentUser && (
                    <button
                      onClick={handleResendVerification}
                      className="text-indigo-500 hover:text-indigo-600 text-sm"
                    >
                      Resend the verification email
                    </button>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Log in
                  </button>
                </form>

                {/* Existing social login and signup links */}
                <div className="mb-4 mt-4">{/* OR divider */}</div>
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center"
                >
                  <GoogleSignInBtn />
                </button>
                <p className="mt-8 text-center text-sm text-gray-900/80">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => router.push("/signup")}
                    className="text-indigo-500 hover:text-indigo-600 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
