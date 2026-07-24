"use client";

import { useState, useEffect } from "react";

interface AnalyticsViewProps {
  userId: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  _count: { leads: number };
}

export function AnalyticsView({ userId }: AnalyticsViewProps) {
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [completedCampaigns, setCompletedCampaigns] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadsRes, campaignsRes] = await Promise.all([
          fetch("/api/leads"),
          fetch("/api/campaigns/stats"),
        ]);
        
        if (leadsRes.ok) {
          const data = await leadsRes.json();
          setTotalLeads(data.leads?.length || 0);
        }
        
        if (campaignsRes.ok) {
          const data = await campaignsRes.json();
          setTotalCampaigns(data.total || 0);
          setCompletedCampaigns(data.completed || 0);
          setTotalMessages(data.messages || 0);
          setCampaigns(data.campaigns?.slice(0, 10) || []);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display-small mb-1">Analytics</h1>
        <p className="text-body-large opacity-70">Track campaign performance and engagement metrics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-surface p-6 shadow-sm">
          <h3 className="text-title-medium opacity-70 mb-2">Total Leads</h3>
          <div className="text-display-medium font-bold">{loading ? "..." : totalLeads}</div>
        </div>
        <div className="card-surface p-6 shadow-sm">
          <h3 className="text-title-medium opacity-70 mb-2">Campaigns Run</h3>
          <div className="text-display-medium font-bold">{loading ? "..." : totalCampaigns}</div>
        </div>
        <div className="card-surface p-6 shadow-sm">
          <h3 className="text-title-medium opacity-70 mb-2">Completed</h3>
          <div className="text-display-medium font-bold text-green-600">{loading ? "..." : completedCampaigns}</div>
        </div>
        <div className="card-surface p-6 shadow-sm">
          <h3 className="text-title-medium opacity-70 mb-2">Total Messages</h3>
          <div className="text-display-medium font-bold">{loading ? "..." : totalMessages}</div>
        </div>
      </div>

      <div className="card-surface p-6">
        <h2 className="text-headline-small mb-6">Campaign Breakdown</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 opacity-60">
            <p className="text-body-large">No campaigns to display. Create your first campaign to see analytics.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-label-small uppercase opacity-60 border-neutral-variant">
                  <th className="p-3 font-medium">Campaign</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-center">Recipients</th>
                  <th className="p-3 font-medium text-center">Sent</th>
                  <th className="p-3 font-medium text-center">Delivered</th>
                  <th className="p-3 font-medium text-center">Read</th>
                  <th className="p-3 font-medium text-center">Replied</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(camp => (
                  <tr key={camp.id} className="border-b hover:bg-gray-50 transition border-neutral-variant-container">
                    <td className="p-3 font-medium">{camp.name}</td>
                    <td className="p-3 text-label-small uppercase opacity-70">{camp.status}</td>
                    <td className="p-3 text-center">{camp._count.leads}</td>
                    <td className="p-3 text-center">—</td>
                    <td className="p-3 text-center">—</td>
                    <td className="p-3 text-center">—</td>
                    <td className="p-3 text-center">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card-surface p-8">
        <h2 className="text-headline-small mb-8">Engagement Funnel</h2>
        <div className="flex flex-col items-center gap-1 max-w-md mx-auto">
          {[
            { label: "Sent", pct: 100, colorClass: "bg-blue-500" },
            { label: "Delivered", pct: 85, colorClass: "bg-blue-500" },
            { label: "Read", pct: 60, colorClass: "bg-green-500" },
            { label: "Replied", pct: 25, colorClass: "bg-green-500" },
          ].map(stage => (
            <div key={stage.label} className="w-full flex items-center gap-4">
              <span className="w-20 text-label-large text-right opacity-70">{stage.label}</span>
              <div className="flex-1 h-10 rounded-lg overflow-hidden bg-gray-100 font-sans">
                <div className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3 opacity-80 ${stage.colorClass}`} style={{ width: `${stage.pct}%` }}>
                  <span className="text-white text-label-small font-bold">{stage.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-body-small text-center mt-6 opacity-50">Funnel percentages shown are illustrative. Real data will populate as campaigns complete.</p>
      </div>
    </div>
  );
}
