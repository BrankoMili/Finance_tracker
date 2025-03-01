"use client";

import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import LogoutButton from "@/components/LogoutButton";
import { updateProfile } from "firebase/auth";
import { useState } from "react";
import { deleteUserAccount } from "@/services/userService";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MyProfile() {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [uploading, setUploading] = useState(false);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (user === null) return <p>User not logged in</p>;

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This action is irreversible!"
    );

    if (!confirmation) return;

    try {
      // Provera tipa autentifikacije
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

      // 1. Припрема за Cloudinary Upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      // 2. Подешавање Asset Folder структуре
      const userFolder = `finance-tracker/profile-pictures/${user.uid}`;
      formData.append("folder", userFolder);

      // 3. Форсирање јединственог public_id
      const publicId = `profile_${Date.now()}`;
      formData.append("public_id", publicId);

      // 4. Слање захтева
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

  // 6. Генерисање оптимизованог URL-а
  const getOptimizedImageUrl = (url: string) => {
    if (!url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/c_fill,w_128,h_128,q_auto,f_auto/");
  };

  return user ? (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Profile Section */}
          <div className="md:w-1/3 bg-primary/15 p-8 flex flex-col items-center space-y-6">
            <div>
              <div className="w-32 h-32 mx-auto relative">
                <Image
                  src={
                    user.photoURL
                      ? getOptimizedImageUrl(user.photoURL)
                      : "/assets/images/userIcon.svg"
                  }
                  alt="Profile"
                  fill
                  sizes="(max-width: 768px) 100vw, 128px"
                  style={{
                    objectFit: "cover"
                  }}
                  className="rounded-full border-4 border-border shadow-lg"
                />
              </div>

              <label
                className={`mt-5 inline-block bg-primary text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-secondary transition-colors shadow-md cursor-pointer ${
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
                  <div className="flex items-center space-x-3">
                    <Image
                      src="/assets/images/google_logo.png"
                      alt="Google"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                    <span className="text-textSecond font-medium break-words">
                      Google Account
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              className="bg-secondary text-white px-2 py-1 rounded hover:bg-thirdly"
              onClick={handleDeleteAccount}
            >
              Delete your account
            </button>

            <div className="flex justify-end">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-textMain">User not logged in</p>
  );
}
