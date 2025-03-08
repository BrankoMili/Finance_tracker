import { auth } from "@/lib/firebase";

export const AuthService = {
  logout: async () => {
    try {
      await auth.signOut();
      // Remove cookie
      document.cookie =
        "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict";
    } catch (error) {
      console.error("An error occured:", error);
      throw error;
    }
  }
};
