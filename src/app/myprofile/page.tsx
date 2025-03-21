"use client";

import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { updateProfile } from "firebase/auth";
import { useState } from "react";
import { deleteUserAccount } from "@/services/userService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/shared/Button";
import ErrorComponent from "@/components/ErrorComponent";
import { AuthService } from "@/services/authService";

export default function MyProfile() {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [uploading, setUploading] = useState(false);

  // User log out
  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.push("/login");
    } catch (error) {
      console.error("An error occured:", error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This action is irreversible!"
    );

    if (!confirmation) return;

    try {
      // Check type of authentication
      const authProvider = user?.providerData[0]?.providerId;

      if (authProvider === "password") {
        const password = prompt("Enter password to confirm:");
        if (!password) return;

        await deleteUserAccount(password);
      } else {
        await deleteUserAccount();
      }

      router.push("/login");
    } catch (error) {
      console.error("Error deleting account", error);
      alert("An error occurred while deleting the account");
    }
  };

  const handleChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !user) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only JPG and PNG formats are allowed");
      return;
    }

    const maxSize = 5242880; // 5 MB
    if (file.size > maxSize) {
      alert("Maximum file size is 5MB");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const userFolder = `finance-tracker/profile-pictures/${user.uid}`;
      formData.append("folder", userFolder);

      const publicId = `profile_${Date.now()}`;
      formData.append("public_id", publicId);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Upload failed");

      await updateProfile(user, { photoURL: data.secure_url });
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred while changing the image");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Section Skeleton */}
            <div className="md:w-1/3 bg-primary/15 p-8 space-y-6">
              <div className="animate-pulse">
                <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto" />
                <div className="h-10 bg-gray-300 rounded-lg mt-6 w-32 mx-auto" />
              </div>
            </div>

            {/* Right Section Skeleton */}
            <div className="md:w-2/3 p-8 space-y-6 bg-componentsBackground">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-gray-300 rounded w-1/3" />
                <div className="space-y-4">
                  <div className="h-20 bg-gray-300 rounded-lg" />
                  <div className="h-20 bg-gray-300 rounded-lg" />
                  <div className="h-20 bg-gray-300 rounded-lg" />
                </div>
                <div className="h-10 bg-gray-300 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (error) return <ErrorComponent error={error} />;
  if (!user)
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-2xl shadow-lg overflow-hidden">
          User not logged in
        </div>
      </div>
    );

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Profile Section */}
          <div className="md:w-1/3 bg-primary/15 p-8 flex flex-col items-center space-y-6">
            <div>
              <div className="w-32 h-32">
                <Image
                  src={
                    user.photoURL
                      ? user.photoURL
                      : "/assets/images/userIcon.svg"
                  }
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full border-4 border-border shadow-lg object-cover"
                />
              </div>

              <label
                className={`mt-5 inline-block text-sm bg-secondary text-white hover:bg-thirdly py-2 px-4 rounded-lg focus:ring-2 focus:primary focus:ring-offset-2 transition-all cursor-pointer ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </div>
                ) : (
                  "Upload Photo"
                )}
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={handleChangeImage}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Right Content Section */}
          <div className="w-full p-4 md:w-2/3 md:p-8 space-y-6 bg-componentsBackground">
            <div>
              <h2 className="text-2xl font-bold text-textSecond mb-2">
                My Profile
              </h2>
              <p className="text-textThird">Manage your profile information</p>
            </div>

            <div className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-primary font-semibold mb-1">Name</p>
                <p className="text-textSecond font-medium break-words">
                  {user.displayName}
                </p>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-primary font-semibold mb-1">
                  Email Address
                </p>
                <p className="text-textSecond font-medium break-words">
                  {user.email}
                </p>
              </div>

              {user.providerData[0].providerId === "google.com" && (
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-primary font-semibold mb-2 break-words">
                    Connected Social Account
                  </p>
                  <div className="flex items-center">
                    <Image
                      src="/assets/images/google_logo.png"
                      alt="Google"
                      width={32}
                      height={32}
                      className="w-8 h-8 mr-3"
                    />
                    <span className="text-textSecond font-medium break-words">
                      Google Account
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleDeleteAccount}
              text="Delete your account"
              buttonWidth="compact"
              buttonSize="small"
            />

            <div className="flex justify-end">
              {/* LOG OUT */}
              <Button
                onClick={handleLogout}
                text="Log Out"
                buttonWidth="compact"
                buttonColor="red"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
