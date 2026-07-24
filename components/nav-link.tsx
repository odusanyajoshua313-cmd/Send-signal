"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  icon: string;
  children: React.ReactNode;
}

export function NavLink({ href, icon, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 text-label-large ${
        isActive 
          ? "bg-blue-50 text-blue-700 font-semibold" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
      style={
        isActive 
          ? { 
              backgroundColor: "var(--sys-color-roles-pimary-roles-primary-container-color-role)", 
              color: "var(--sys-color-roles-pimary-roles-primary-color-role)" 
            } 
          : { color: "var(--sys-color-roles-neutral-variant-roles-neutral-varient-color-role)"}
      }
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={isActive ? 2 : 1.5} 
        stroke="currentColor" 
        className="w-5 h-5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {children}
    </Link>
  );
}
