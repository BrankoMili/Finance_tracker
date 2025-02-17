"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartPieIcon,
  CurrencyDollarIcon,
  Cog8ToothIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function Sidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: ChartPieIcon },
    { href: "/expenses", label: "Expenses", icon: CurrencyDollarIcon },
    { href: "/settings", label: "Settings", icon: Cog8ToothIcon },
    { href: "/myprofile", label: "My Profile", icon: UserCircleIcon }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
      <div className="p-6">
        <Link href={"/"}>
          <h2 className="text-2xl font-bold text-gray-900">Finance Track</h2>
        </Link>
      </div>

      <nav className="px-4 space-y-1">
        {navItems.map(item => {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                pathname === item.href
                  ? "bg-blue-50 text-primary font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
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
    </aside>
  );
}
