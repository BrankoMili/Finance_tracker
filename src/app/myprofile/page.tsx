"use client";

import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import LogoutButton from "@/components/LogoutButton";
import { updateProfile } from "firebase/auth";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject
} from "firebase/storage";
import { useState } from "react";
import { deleteUserAccount } from "@/services/userService";
import { useRouter } from "next/navigation";

export default function MyProfile() {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [uploading, setUploading] = useState(false);
  const storage = getStorage();

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
    } catch (error: any) {
      console.error("Error deleting account", error);
      alert(error.message || "An error occurred while deleting the account");
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

      // Delete all files of user in storage
      const userFolderRef = storageRef(storage, `profilePictures/${user.uid}`);
      const listResult = await listAll(userFolderRef);

      await Promise.all(listResult.items.map(item => deleteObject(item)));

      const fileRef = storageRef(
        storage,
        `profilePictures/${user.uid}/${Date.now()}_${file.name}`
      );

      const snapshot = await uploadBytes(fileRef, file);

      const downloadURL = await getDownloadURL(snapshot.ref);

      await updateProfile(user, {
        photoURL: downloadURL
      });
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred while changing the image");
    } finally {
      setUploading(false);
    }
  };

  return user ? (
    <div className="bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Profile Section */}
          <div className="md:w-1/3 bg-primary/5 p-8 flex flex-col items-center space-y-6">
            <div>
              <img
                src={user.photoURL || "assets/images/userIcon.svg"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />

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
          <div className="md:w-2/3 p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                My Profile
              </h2>
              <p className="text-gray-500">Manage your profile information</p>
            </div>

            <div className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-primary font-semibold mb-1">Name</p>
                <p className="text-foreground font-medium">
                  {user.displayName}
                </p>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-primary font-semibold mb-1">
                  Email Address
                </p>
                <p className="text-foreground font-medium">{user.email}</p>
              </div>

              {user.providerData[0].providerId === "google.com" && (
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-primary font-semibold mb-2">
                    Connected Social Account
                  </p>
                  <div className="flex items-center space-x-3">
                    <img
                      src="assets/images/google_logo.png"
                      alt="Google"
                      className="w-8 h-8"
                    />
                    <span className="text-foreground font-medium">
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
    <p>User not logged in</p>
  );
}
