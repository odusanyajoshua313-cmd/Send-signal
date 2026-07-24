"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ViewType } from "../Sidebar";

interface OverviewViewProps {
  userId: string;
  onNavigate: (view: ViewType) => void;
}

interface Stats {
  totalLeads: number;
  totalCampaigns: number;
  completedCampaigns: number;
  totalMessages: number;
}

interface RecentCampaign {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  _count: { leads: number };
}

export function OverviewView({ userId, onNavigate }: OverviewViewProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<RecentCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadsRes, campaignsRes] = await Promise.all([
          fetch("/api/leads"),
          fetch("/api/campaigns/stats"),
        ]);
        
        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          setStats(prev => prev ? { ...prev, totalLeads: leadsData.leads?.length || 0 } : { totalLeads: leadsData.leads?.length || 0, totalCampaigns: 0, completedCampaigns: 0, totalMessages: 0 });
        }
        
        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json();
          setRecentCampaigns(campaignsData.campaigns?.slice(0, 5) || []);
          setStats(prev => prev ? { 
            ...prev, 
            totalCampaigns: campaignsData.total || 0,
            completedCampaigns: campaignsData.completed || 0,
            totalMessages: campaignsData.messages || 0
          } : { totalLeads: 0, totalCampaigns: campaignsData.total || 0, completedCampaigns: campaignsData.completed || 0, totalMessages: campaignsData.messages || 0 });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display-small mb-1">Dashboard</h1>
        <p className="text-body-large opacity-70">Welcome back! Here&apos;s an overview of your activity.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-surface p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("leads")}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>
          <div className="text-display-medium font-bold">{loading ? "..." : stats?.totalLeads || 0}</div>
          <div className="text-label-large opacity-70">Total Leads</div>
        </div>

        <div className="card-surface p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("campaigns")}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.088-.71l-.828-.682M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-display-medium font-bold">{loading ? "..." : stats?.totalCampaigns || 0}</div>
          <div className="text-label-large opacity-70">Campaigns</div>
        </div>

        <div className="card-surface p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("campaigns")}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-display-medium font-bold text-green-600">{loading ? "..." : stats?.completedCampaigns || 0}</div>
          <div className="text-label-large opacity-70">Completed</div>
        </div>

        <div className="card-surface p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("analytics")}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-orange-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
          </div>
          <div className="text-display-medium font-bold">{loading ? "..." : stats?.totalMessages || 0}</div>
          <div className="text-label-large opacity-70">Messages Sent</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-surface p-6">
        <h2 className="text-title-large font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => onNavigate("leads")} className="p-4 border rounded-xl hover:bg-gray-50 transition flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold">Import Leads</div>
              <div className="text-body-small opacity-60">Bulk import from CSV</div>
            </div>
          </button>

          <button onClick={() => onNavigate("campaigns")} className="p-4 border rounded-xl hover:bg-gray-50 transition flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold">Launch Campaign</div>
              <div className="text-body-small opacity-60">Start sending messages</div>
            </div>
          </button>

          <button onClick={() => onNavigate("templates")} className="p-4 border rounded-xl hover:bg-gray-50 transition flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold">Create Template</div>
              <div className="text-body-small opacity-60">Design a message</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="card-surface p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-title-large font-semibold">Recent Campaigns</h2>
          <button onClick={() => onNavigate("campaigns")} className="text-primary text-body-medium hover:underline">View All</button>
        </div>
        {recentCampaigns.length === 0 ? (
          <div className="text-center py-8 opacity-60">
            <p className="text-body-large">No campaigns yet. Create your first campaign to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-body-small opacity-60">{campaign._count.leads} recipients</div>
                </div>
                <span className={`px-3 py-1 text-label-small rounded-full font-bold uppercase ${
                  campaign.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  campaign.status === "RUNNING" ? "bg-blue-100 text-blue-700" :
                  campaign.status === "PAUSED" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
