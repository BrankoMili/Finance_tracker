"use client";

import GoogleSignInBtn from "@/components/GoogleSignInBtn";
import { useState } from "react";
import { signupForm } from "@/types/signupForm";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createUserProfile } from "@/services/userService";
import { auth, provider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";

export default function Signup() {
  interface Notification {
    status: "success" | "error";
    message: string;
  }

  const router = useRouter();
  const [notification, setNotification] = useState<Notification>({
    status: "success",
    message: ""
  });

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);

      // Get token ID
      const idToken = await result.user.getIdToken();
      // Set Cookie
      document.cookie = `session=${idToken}; path=/; Secure; SameSite=Strict; Max-Age=3600`;

      setNotification({
        status: "success",
        message: "You have successfully created an account."
      });
      router.push("/");
    } catch (error) {
      let errorMessage = "An error occurred";
      if (error instanceof FirebaseError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setNotification({
        status: "error",
        message: "An notification occurred:" + errorMessage
      });
    }
  };

  const [formData, setFormData] = useState<signupForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setNotification({
        status: "error",
        message: "Password do not match"
      });
      return;
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Update user profile with username
      await updateProfile(user, { displayName: formData.username });

      // Create user profile in database
      await createUserProfile(user);

      setNotification({
        status: "success",
        message: "You have successfully created an account."
      });

      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error("error:", error);
      let errorMessage = "An error occurred during registration";

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "Email already in use";
            break;
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address";
            break;
        }
      }

      setNotification({
        status: "error",
        message: errorMessage
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Create Account
        </h1>

        {notification.message && (
          <div
            className={`mb-4 p-3 ${
              notification.status === "success" ? "bg-green-600" : "bg-red-400"
            } text-white rounded-md text-sm`}
          >
            {notification.message}
          </div>
        )}

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              required
              autoComplete="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.username}
              onChange={e =>
                setFormData(prev => ({ ...prev, username: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.email}
              onChange={e =>
                setFormData(prev => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.password}
              onChange={e =>
                setFormData(prev => ({ ...prev, password: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.confirmPassword}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))
              }
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center"
            >
              <GoogleSignInBtn />
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-900/80">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-indigo-500 hover:text-indigo-600 font-medium"
          >
            Log in
          </button>
        </p>
      </div>
    </main>
  );
}
