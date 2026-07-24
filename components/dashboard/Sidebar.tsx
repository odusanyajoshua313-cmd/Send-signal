"use client";

import { Logo } from "@/components/ui/logo";

export type ViewType = "overview" | "leads" | "templates" | "campaigns" | "analytics" | "settings";

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  companyName: string;
}

export function Sidebar({ activeView, onNavigate, companyName }: SidebarProps) {
  const navItems: { view: ViewType; label: string; icon: string }[] = [
    { view: "overview", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { view: "leads", label: "Leads", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { view: "templates", label: "Templates", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { view: "campaigns", label: "Campaigns", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
    { view: "analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { view: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r flex flex-col min-h-[calc(100vh)] border-neutral-variant">
      <div className="p-6 border-b flex items-center gap-3 border-neutral-variant">
        <Logo size={32} iconOnly />
        <div>
          <span className="font-semibold text-title-medium block leading-tight">{companyName}</span>
          <span className="text-body-small opacity-60 block">Send Signal</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-4 flex-grow">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 text-label-large text-left ${
              activeView === item.view
                ? "font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            style={
              activeView === item.view
                ? {
                    backgroundColor: "var(--sys-color-roles-pimary-roles-primary-container-color-role)",
                    color: "var(--sys-color-roles-pimary-roles-primary-color-role)"
                  }
                : { color: "var(--sys-color-roles-neutral-variant-roles-neutral-varient-color-role)" }
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={activeView === item.view ? 2 : 1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
