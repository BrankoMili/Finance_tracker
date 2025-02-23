"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import {
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "firebase/auth";
import { showToast } from "@/utils/showToast";
import { Theme } from "@/types/theme";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { FaAngleRight, FaAngleDown } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

export default function Settings() {
  const [userCurrency, setUserCurrency] = useState("");
  const [name, setName] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authProvider, setAuthProvider] = useState<
    "password" | "google" | null
  >(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [newCategory, setNewCategory] = useState("");
  const { userCategories } = useUserPreferences();
  const [showCategories, setShowCategories] = useState<boolean>(false);

  // Type guard for Firebase errors
  function isFirebaseError(error: unknown): error is { code: string } {
    return typeof error === "object" && error !== null && "code" in error;
  }

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = (await getDoc(userDocRef)).data();

      if (!userDocSnap) return;

      // Change currency if it's not the same
      if (userDocSnap.currency !== userCurrency) {
        await updateDoc(userDocRef, { currency: userCurrency });
      }

      // Change name if it's valid
      if (name) {
        if (userDocSnap.displayName === name) {
          showToast("error", "The same name has already been set");
          return;
        }
        if (name.length <= 3) {
          showToast("error", "Name needs to have more than 3 characters");
          return;
        }
        await updateDoc(userDocRef, { displayName: name });
        await updateProfile(user, {
          displayName: name
        });
        setName("");
      }

      // Change password
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          showToast("error", "Passwords do not match");
          return;
        }
        if (newPassword.length < 6) {
          showToast("error", "Password must be at least 6 characters long");
          return;
        }
        if (!currentPassword) {
          showToast("error", "You have entered the same password");
          return;
        }

        const credential = EmailAuthProvider.credential(
          user.email!,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      showToast("success", "Successfully Changed");
    } catch (error) {
      console.error(error);
      if (isFirebaseError(error)) {
        switch (error.code) {
          case "auth/wrong-password":
            showToast("error", "Incorrect password");
            break;
          default:
            showToast("error", "An error occurred");
        }
      } else {
        showToast("error", "An error occurred");
      }
    }
  };

  // Pokrece se samo prvi put
  useEffect(() => {
    const fetchUserCurrency = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const savedTheme = localStorage.getItem("theme");
      setTheme(savedTheme as Theme);

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserCurrency(userDocSnap.data().currency);
        }

        const providers = user.providerData.map(
          provider => provider.providerId
        );
        if (providers.includes("password")) {
          setAuthProvider("password");
        } else if (providers.includes("google.com")) {
          setAuthProvider("google");
        } else {
          setAuthProvider(null);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchUserCurrency();
    });

    return unsubscribe;
  }, []);

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    const user = auth.currentUser;
    if (!user) return;

    try {
      const currentTheme = localStorage.getItem("theme");
      if (currentTheme !== newTheme) {
        localStorage.setItem("theme", newTheme);
      }
      document.documentElement.setAttribute("data-theme", newTheme);
      showToast("success", "Theme updated");
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to update theme");
    }
  };

  const handleAddNewCategory = async () => {
    const categoryToAdd = newCategory.trim();
    if (!categoryToAdd) {
      showToast("error", "Category name cannot be empty");
      return;
    }

    if (
      userCategories?.some(
        cat => cat.name.toLowerCase() === categoryToAdd.toLowerCase()
      )
    ) {
      showToast("error", "Category already exists");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const newCategoryObj = {
        id: uuidv4(),
        name: categoryToAdd
      };

      await updateDoc(userDocRef, { categories: arrayUnion(newCategoryObj) });

      setNewCategory("");
      showToast("success", "Category successfully added");
    } catch (error) {
      console.error(error);
      showToast("error", "Error adding category");
    }
  };

  const deleteCategoryItem = async (categoryId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);

      // Find the category to delete from the current userCategories
      const categoryToDelete = userCategories?.find(
        cat => cat.id === categoryId
      );

      if (!categoryToDelete) {
        showToast("error", "Category not found");
        return;
      }

      // Remove the category object from Firestore array
      await updateDoc(userDocRef, {
        categories: arrayRemove(categoryToDelete)
      });

      showToast("success", "Category deleted successfully");
    } catch (error) {
      console.error(error);
      showToast("error", "Error deleting category");
    }
  };

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-semibold text-textSecond">Settings</h1>
        <div className="bg-componentsBackground rounded-xl p-6 mt-5 shadow-lg hover:shadow-xl transition-shadow duration-300 ">
          <p className="mt-4 text-xl font-semibold text-textSecond text-xl mb-4">
            Change your basic account settings
          </p>
          <form onSubmit={handleSaveSettings}>
            <div className="mb-4">
              <label className="block text-textMain">Name</label>
              <input
                type="text"
                autoComplete="username"
                className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-3"
                placeholder="John Doe"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                }}
              />
            </div>
            <p className="mt-6 text-xl font-semibold text-textSecond text-xl mb-4">
              Preferences
            </p>
            <p className="mt-3 text-textMain">Currency</p>
            <select
              value={userCurrency}
              onChange={e => {
                setUserCurrency(e.target.value);
              }}
              className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-3"
            >
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">US Dolar (USD)</option>
              <option value="RSD">Serbian dinar (RSD)</option>
            </select>
            <div className="mb-4">
              <p className="mt-6 text-xl font-semibold text-textSecond mb-4">
                Theme
              </p>
              <div className="flex gap-4">
                <div className="flex gap-6">
                  {/* Light Theme */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`p-3 rounded-lg border-2 ${
                      theme === "light"
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="w-24 h-24 flex flex-col items-center justify-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-textMain"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                        />
                      </svg>
                      <span className="text-sm text-textMain">Light</span>
                    </div>
                  </button>

                  {/* Dark Theme */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`p-3 rounded-lg border-2 ${
                      theme === "dark"
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="w-24 h-24 flex flex-col items-center justify-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-textMain"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      </svg>
                      <span className="text-sm text-textMain">Dark</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            {authProvider === "password" && (
              <div>
                <p className="mt-6 text-xl font-semibold text-textSecond mb-4">
                  Change password
                </p>
                <div className="mb-4">
                  <label className="block text-textMain">
                    Current password
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-3"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-textMain">New password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-3"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-textMain">
                    Repeat new password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-3"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div
              className="mt-6 text-xl font-semibold text-textSecond mb-4 cursor-pointer block w-fit hover:text-textMain flex items-center"
              onClick={() => setShowCategories(!showCategories)}
            >
              User's Categories
              {showCategories ? (
                <div>
                  <FaAngleDown />{" "}
                </div>
              ) : (
                <div>
                  <FaAngleRight />
                </div>
              )}
            </div>{" "}
            {showCategories && (
              <div className="mb-6">
                <div className="mb-4">
                  <label className="block text-textMain mb-2">
                    Add new category
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-3"
                      placeholder="Enter category name"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                    />
                    <button
                      type="button"
                      className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary transition-colors"
                      onClick={handleAddNewCategory}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-textMain font-medium mb-2">
                    Current categories:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {userCategories?.map(category => (
                      <div
                        key={category.id}
                        className="bg-background px-3 py-1 rounded-full text-sm"
                      >
                        <span className="text-textMain">{category.name} </span>
                        <p
                          className="text-textThird inline cursor-pointer"
                          onClick={() => deleteCategoryItem(category.id)}
                        >
                          x
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <button
              type="submit"
              className="bg-secondary text-white mt-8 px-3 py-2 rounded-md hover:bg-primary"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
