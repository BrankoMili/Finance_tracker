"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartPieIcon,
  CurrencyDollarIcon,
  Cog8ToothIcon,
  UserCircleIcon,
  ArrowLeftEndOnRectangleIcon
} from "@heroicons/react/24/outline";
import { AuthService } from "@/services/authService";
import { useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function Sidebar({
  isOpen,
  onClose
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: ChartPieIcon },
    { href: "/expenses", label: "Expenses", icon: CurrencyDollarIcon },
    { href: "/settings", label: "Settings", icon: Cog8ToothIcon },
    { href: "/myprofile", label: "My Profile", icon: UserCircleIcon }
  ];
  const router = useRouter();

  // User log out
  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.push("/login");
    } catch (error) {
      console.error("An error occured:", error);
    }
  };

  return (
    <aside
      className={`
    fixed md:static inset-y-0 left-0 z-20
    w-64 bg-componentsBackground border-r border-border
    transform transition-transform duration-200 ease-in-out
    h-screen overflow-y-auto
    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 "}
  `}
    >
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="md:hidden absolute right-4 top-4 p-2 rounded-lg hover:bg-hoverBg"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div className="p-6">
        <Link href={"/"}>
          <h2 className="text-xl sm:text-2xl font-bold text-textSecond">
            Finance Track
          </h2>
        </Link>
      </div>
      <nav className="px-2 sm:px-4 space-y-1">
        {navItems.map(item => {
          return (
            <Link
              onClick={onClose}
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                pathname === item.href
                  ? "bg-blue-50 text-primary font-semibold hover:bg-blue-100"
                  : "text-textSecond hover:bg-hoverBg hover:text-textThird"
              }`}
            >
              <item.icon
                className={`h-6 w-6 mr-3 ${
                  pathname === item.href ? "stroke-primary" : "stroke-gray-500"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-8 px-2 sm:px-4 space-y-1 w-full">
        <button
          onClick={handleLogout}
          className="text-sm border-t border-border w-full flex items-center px-4 py-3 rounded-xl text-textSecond hover:bg-hoverBg transition-colors"
        >
          <ArrowLeftEndOnRectangleIcon className="h-6 w-6 mr-3 stroke-gray-500" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
