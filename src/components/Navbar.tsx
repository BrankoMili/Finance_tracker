"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const [user, loading, error] = useAuthState(auth);

  return (
    <nav className="bg-componentsBackground border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <MagnifyingGlassIcon className="h-5 w-5 text-textThird" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className=" pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-textMain placeholder-textThird"
          />
        </div>

        {/* Profile Section */}
        <div className="ml-6 flex items-center">
          <Link href={"/myprofile"}>
            <div className="flex items-center hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
              {loading ? (
                <img
                  src={"/assets/images/userIcon.svg"}
                  alt="Profile image"
                  className="w-7"
                />
              ) : user === null || error ? (
                <img
                  src={"/assets/images/userIcon.svg"}
                  alt="Profile image"
                  className="w-7"
                />
              ) : (
                <div>
                  <img
                    src={user?.photoURL || "/assets/images/userIcon.svg"}
                    alt="Profile image"
                    className="w-7"
                  />
                </div>
              )}

              <div className="ml-3">
                <p className="text-sm font-medium text-textSecond">
                  {user?.displayName}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
