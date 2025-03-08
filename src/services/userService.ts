import { db } from "@/lib/firebase";
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDoc,
  writeBatch,
  setDoc,
  getDocs
} from "firebase/firestore";
import { auth, provider } from "@/lib/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  User
} from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { AccountDeletionState } from "@/services/accountDeletionState";

// Create User profile in Firebase database
export const createUserProfile = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date(),
      currency: "EUR",
      categories: [
        "Food",
        "Housing",
        "Transport",
        "Health",
        "Entertainment and Hobbies",
        "Personal Care",
        "Education",
        "Travel",
        "Family and Kids",
        "Other"
      ].map(item => {
        return {
          id: uuidv4(),
          name: item
        };
      })
    });
  }
};

const deleteCloudinaryUserImages = async (userId: string) => {
  try {
    const response = await fetch("/api/deleteCloudinaryImages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId })
    });

    const data = await response.json();
    console.log("API response:", data); // Ispisuje odgovor API rute

    if (!response.ok) {
      throw new Error(data.message || "Greška pri brisanju slika");
    }
  } catch (error) {
    console.error("Detalji greške:", error); // Detaljna greška
    throw new Error("Došlo je do greške pri brisanju slika");
  }
};

// Delete user profile and user data
export const deleteUserAccount = async (password?: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    // Set the flag to prevent token refreshing during account deletion
    AccountDeletionState.startDeletion();

    // Your existing re-authentication code...
    const mainProvider = user.providerData[0]?.providerId;

    try {
      if (mainProvider === "password" && password) {
        const email = user.email;
        if (!email) throw new Error("Email not available");

        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);
      } else if (mainProvider === "google.com") {
        await reauthenticateWithPopup(user, provider);
      } else {
        throw new Error(`Recent login required for provider: ${mainProvider}`);
      }
    } catch (error: unknown) {
      // Reset the flag if re-authentication fails
      AccountDeletionState.endDeletion();
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error during re-authentication";
      throw new Error(`Re-authentication failed: ${errorMessage}`);
    }

    // Delete all expenses from the user
    const expensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(expensesQuery);

    const batch = writeBatch(db);
    querySnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete user document
    const userDocRef = doc(db, "users", user.uid);
    await deleteDoc(userDocRef);

    // Delete user images from Cloudinary
    await deleteCloudinaryUserImages(user.uid);

    // Delete the user account
    await user.delete();

    // Delete session cookie
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    return { success: true, message: "Account deleted successfully" };
  } catch (error: unknown) {
    console.error("Error deleting account:", error);
    throw error;
  } finally {
    AccountDeletionState.endDeletion();
  }
};
