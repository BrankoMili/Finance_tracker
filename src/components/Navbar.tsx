"use client";

import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [user, loading, error] = useAuthState(auth);

  return (
    <nav className="bg-componentsBackground border-b border-border">
      <div className="flex items-center px-4 md:px-6 py-4 justify-between md:justify-end">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-hoverBg"
        >
          <svg
            className="w-6 h-6 text-textSecond"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Profile Section */}
        <div className="flex items-center ml-2">
          <Link href={"/myprofile"}>
            <div className="flex items-center hover:bg-hoverBg px-3 py-2 rounded-lg transition-colors">
              {loading ? (
                <Image
                  src={"/assets/images/userIcon.svg"}
                  alt="Profile image"
                  className="w-11 h-11 object-cover rounded-full border-4 border-border"
                  width={44}
                  height={44}
                />
              ) : user === null || error ? (
                <Image
                  src={"/assets/images/userIcon.svg"}
                  alt="Profile image"
                  className="w-11 h-11 object-cover rounded-full border-4 border-border"
                  width={44}
                  height={44}
                />
              ) : (
                <div>
                  <Image
                    src={user?.photoURL || "/assets/images/userIcon.svg"}
                    alt="Profile image"
                    className="w-11 h-11 object-cover rounded-full border-4 border-border"
                    width={44}
                    height={44}
                  />
                </div>
              )}

              <div className="ml-2">
                <p className="text-sm font-medium text-textSecond hover:text-textThird">
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
