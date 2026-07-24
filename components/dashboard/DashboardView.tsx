"use client";

import { useState } from "react";
import { ViewType } from "./Sidebar";
import { OverviewView } from "./views/OverviewView";
import { LeadsView } from "./views/LeadsView";
import { TemplatesView } from "./views/TemplatesView";
import { CampaignsView } from "./views/CampaignsView";
import { AnalyticsView } from "./views/AnalyticsView";
import { SettingsView } from "./views/SettingsView";
import { ImportLeadsView } from "./views/ImportLeadsView";
import { ProfileDropdown } from "./ProfileDropdown";

interface DashboardViewProps {
  userId: string;
  companyName: string;
}

export function DashboardView({ userId, companyName }: DashboardViewProps) {
  const [activeView, setActiveView] = useState<ViewType>("overview");
  const [subView, setSubView] = useState<string | null>(null);

  const renderView = () => {
    if (subView) {
      switch (activeView) {
        case "leads":
          if (subView === "new") return <LeadsView userId={userId} onBack={() => setSubView(null)} showNewForm />;
          if (subView === "import") return <ImportLeadsView userId={userId} onBack={() => setSubView(null)} />;
          return <LeadsView userId={userId} onBack={() => setSubView(null)} leadId={subView} />;
        case "templates":
          if (subView === "new") return <TemplatesView userId={userId} onBack={() => setSubView(null)} showNewForm />;
          return <TemplatesView userId={userId} onBack={() => setSubView(null)} templateId={subView} />;
        case "campaigns":
          return <CampaignsView userId={userId} onBack={() => setSubView(null)} campaignId={subView} />;
        default:
          return null;
      }
    }

    switch (activeView) {
      case "overview":
        return <OverviewView userId={userId} onNavigate={setActiveView} />;
      case "leads":
        return <LeadsView userId={userId} onNavigate={setSubView} />;
      case "templates":
        return <TemplatesView userId={userId} onNavigate={setSubView} />;
      case "campaigns":
        return <CampaignsView userId={userId} onNavigate={setSubView} />;
      case "analytics":
        return <AnalyticsView userId={userId} />;
      case "settings":
        return <SettingsView userId={userId} companyName={companyName} />;
      default:
        return <OverviewView userId={userId} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-onboarding-container flex-col md:flex-row">
      <Sidebar activeView={activeView} onNavigate={(view) => { setActiveView(view); setSubView(null); }} companyName={companyName} />
      <main className="flex-1 overflow-y-auto">
        <div className="flex justify-end p-4">
          <ProfileDropdown name={companyName} />
        </div>
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

import { Sidebar } from "./Sidebar";
