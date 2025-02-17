import { db, storage } from "@/lib/firebase";
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
import { deleteObject, ref, listAll } from "firebase/storage";
import { auth, provider } from "@/lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";

// Napravi novi profil
export const createUserProfile = async (user: any) => {
  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  const user1 = auth.currentUser;
  console.log(user1);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date(),
      currency: "EUR"
    });
  }
};

export const deleteUserAccount = async (password?: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    // Provera poslednje autentifikacije
    const lastSignIn = user.metadata.lastSignInTime;
    const creationTime = user.metadata.creationTime;
    const lastLogin = new Date(lastSignIn || creationTime || 0).getTime();
    const fiveMinutesAgo = Date.now() - 300000;

    if (lastLogin < fiveMinutesAgo) {
      // Handle different auth providers
      const mainProvider = user.providerData[0]?.providerId;

      if (mainProvider === "password" && password) {
        const email = user.email;
        if (!email) throw new Error("Email not available");

        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);
      } else if (mainProvider === "google.com") {
        await signInWithPopup(auth, provider);
      } else {
        throw new Error("Recent login required for this provider");
      }
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

    // Delete user document from collection users
    const userDocRef = doc(db, "users", user.uid);
    await deleteDoc(userDocRef);

    // Delete profile pictures
    const storageRef = ref(storage, `profilePictures/${user.uid}`);
    const listResult = await listAll(storageRef);

    await Promise.all(listResult.items.map(itemRef => deleteObject(itemRef)));

    await user.delete();

    // Delete session cookie
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};
