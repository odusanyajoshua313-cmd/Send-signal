"use client";

import { useState, useEffect } from "react";
import { createCampaign } from "@/lib/campaigns/actions";

interface CampaignsViewProps {
  userId: string;
  onNavigate?: (view: string) => void;
  onBack?: () => void;
  campaignId?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  throttleRate: number;
  createdAt: string;
  scheduledAt: string | null;
  template: { name: string; body: string } | null;
  leads: Array<{
    leadId: string;
    status: string;
    lead: { firstName: string | null; lastName: string | null; phoneNumber: string };
  }>;
  _count: { leads: number };
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "DRAFT": return "bg-gray-100 text-gray-700";
    case "SCHEDULED": return "bg-yellow-100 text-yellow-700";
    case "RUNNING": return "bg-blue-100 text-blue-700";
    case "PAUSED": return "bg-purple-100 text-purple-700";
    case "COMPLETED": return "bg-green-100 text-green-700";
    case "FAILED": return "bg-red-100 text-red-700";
    case "CANCELLED": return "bg-gray-100 text-gray-500";
    default: return "bg-gray-100 text-gray-700";
  }
}

export function CampaignsView({ userId, onNavigate, onBack, campaignId }: CampaignsViewProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", templateId: "", throttleRate: 20, leadIds: [] as string[] });
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; body: string; status: string }>>([]);
  const [leads, setLeads] = useState<Array<{ id: string; firstName: string | null; lastName: string | null; phoneNumber: string }>>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [campaignsRes, templatesRes, leadsRes] = await Promise.all([
          fetch("/api/campaigns"),
          fetch("/api/templates"),
          fetch("/api/leads"),
        ]);
        
        if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
        if (templatesRes.ok) {
          const data = await templatesRes.json();
          setTemplates(data.templates || []);
        }
        if (leadsRes.ok) {
          const data = await leadsRes.json();
          setLeads(data.leads || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (campaignId && !campaigns.find(c => c.id === campaignId)?.leads) {
      async function fetchCampaignDetail() {
        try {
          const res = await fetch(`/api/campaigns/${campaignId}`);
          if (res.ok) {
            const data = await res.json();
            setCampaigns(prev => {
              const exists = prev.find(c => c.id === data.id);
              if (exists) {
                return prev.map(c => c.id === data.id ? data : c);
              }
              return [...prev, data];
            });
          }
        } catch (error) {
          console.error("Failed to fetch campaign detail:", error);
        }
      }
      fetchCampaignDetail();
    }
  }, [campaignId]);

  const handleCreateCampaign = async () => {
    if (!formData.name.trim()) { setFormError("Campaign name is required."); return; }
    if (!formData.templateId) { setFormError("Please select a template."); return; }
    if (formData.leadIds.length === 0) { setFormError("Please select at least one recipient."); return; }

    setFormLoading(true);
    setFormError(null);

    const result = await createCampaign({
      name: formData.name,
      templateId: formData.templateId,
      leadIds: formData.leadIds,
      throttleRate: formData.throttleRate,
    });

    if (result.error) {
      setFormError(result.error);
    } else {
      setShowNewCampaignForm(false);
      setStep(1);
      setFormData({ name: "", templateId: "", throttleRate: 20, leadIds: [] });
      const res = await fetch("/api/campaigns");
      if (res.ok) setCampaigns(await res.json());
    }
    setFormLoading(false);
  };

  const toggleLead = (id: string) => {
    setFormData(prev => ({
      ...prev,
      leadIds: prev.leadIds.includes(id) ? prev.leadIds.filter(l => l !== id) : [...prev.leadIds, id]
    }));
  };

  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  // Campaign Detail View
  if (campaignId) {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <h1 className="text-display-small mb-4">Campaign Not Found</h1>
          <button onClick={onBack} className="btn-primary">Return to Campaigns</button>
        </div>
      );
    }

    const sentCount = (campaign.leads || []).filter(l => ["SENT", "DELIVERED", "READ", "REPLIED"].includes(l.status)).length;
    const deliveredCount = (campaign.leads || []).filter(l => ["DELIVERED", "READ", "REPLIED"].includes(l.status)).length;
    const failedCount = (campaign.leads || []).filter(l => l.status === "FAILED").length;

    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-60 hover:opacity-100"
            title="Back to Campaigns"
            aria-label="Back to Campaigns"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-display-small">{campaign.name}</h1>
            <span className={`px-3 py-1 text-label-small rounded-full font-bold uppercase ${getStatusBadgeClass(campaign.status)}`}>
              {campaign.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-surface p-4 text-center"><div className="text-headline-large font-bold">{campaign._count.leads}</div><div className="text-label-small uppercase opacity-60">Recipients</div></div>
          <div className="card-surface p-4 text-center"><div className="text-headline-large font-bold text-blue-600">{sentCount}</div><div className="text-label-small uppercase opacity-60">Sent</div></div>
          <div className="card-surface p-4 text-center"><div className="text-headline-large font-bold text-green-600">{deliveredCount}</div><div className="text-label-small uppercase opacity-60">Delivered</div></div>
          <div className="card-surface p-4 text-center"><div className="text-headline-large font-bold text-red-600">{failedCount}</div><div className="text-label-small uppercase opacity-60">Failed</div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-surface p-6">
            <h2 className="text-title-medium border-b pb-3 mb-4">Campaign Info</h2>
            <div className="space-y-4">
              <div><label className="text-label-small opacity-60 uppercase block">Template</label><span className="text-body-large font-medium">{campaign.template?.name || "Deleted"}</span></div>
              <div><label className="text-label-small opacity-60 uppercase block">Throttle Rate</label><span className="text-body-large">{campaign.throttleRate} msg/min</span></div>
              <div><label className="text-label-small opacity-60 uppercase block">Created</label><span className="text-body-large">{new Date(campaign.createdAt).toLocaleDateString()}</span></div>
            </div>
            {campaign.template && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-label-large font-semibold mb-3">Message Preview</h3>
                <div className="p-4 rounded-xl bg-green-50 text-green-800 whitespace-pre-wrap text-body-medium border border-green-200">
                  {campaign.template.body}
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-2 card-surface p-0 overflow-hidden max-h-[500px] flex flex-col">
            <div className="p-4 border-b bg-neutral-99"><h2 className="text-title-medium">Recipients ({campaign._count.leads})</h2></div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b text-label-small uppercase opacity-60">
                    <th className="p-3 pl-4 font-medium">Name</th>
                    <th className="p-3 font-medium">Phone</th>
                    <th className="p-3 font-medium text-right pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(campaign.leads || []).map(cl => (
                    <tr key={cl.leadId} className="border-b hover:bg-gray-50">
                      <td className="p-3 pl-4">{[cl.lead?.firstName, cl.lead?.lastName].filter(Boolean).join(" ") || "Unknown"}</td>
                      <td className="p-3 text-body-small opacity-70">{cl.lead.phoneNumber}</td>
                      <td className="p-3 text-right pr-4">
                        <span className={`px-2 py-1 text-[10px] rounded-full font-bold uppercase ${cl.status === "PENDING" ? "bg-gray-100 text-gray-600" : cl.status === "SENT" ? "bg-blue-100 text-blue-700" : cl.status === "DELIVERED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {cl.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New Campaign Form
  if (showNewCampaignForm) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setShowNewCampaignForm(false); setStep(1); }} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-60 hover:opacity-100"
            title="Cancel and return to list"
            aria-label="Cancel and return to list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          </button>
          <div>
            <h1 className="text-display-small mb-1">New Campaign</h1>
            <p className="text-body-large opacity-70">Set up and launch an outreach campaign.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= s ? "bg-blue-600 text-white" : "border-2 opacity-50"}`}>{step > s ? "✓" : s}</div>
              <span className={`hidden sm:block text-label-medium ${step >= s ? "font-semibold" : "opacity-50"}`}>{s === 1 ? "Details" : s === 2 ? "Template" : "Recipients"}</span>
              {s < 3 && <div className={`flex-1 h-0.5 rounded ${step > s ? "bg-blue-500" : "bg-gray-200"}`}></div>}
            </div>
          ))}
        </div>

        {formError && <div className="p-4 rounded-lg border bg-error-container text-error border-error">{formError}</div>}

        <div className="card-surface p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-headline-medium mb-2">Campaign Details</h2>
              <div className="space-y-2">
                <label htmlFor="campaignName" className="text-label-large font-medium">Campaign Name *</label>
                <input id="campaignName" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="e.g., Black Friday Promo" />
              </div>
              <div className="space-y-2">
                <label htmlFor="throttleRate" className="text-label-large font-medium">Throttle Rate</label>
                <div className="flex items-center gap-4">
                  <input 
                    id="throttleRate"
                    type="range" 
                    min={1} 
                    max={60} 
                    value={formData.throttleRate} 
                    onChange={e => setFormData({...formData, throttleRate: Number(e.target.value)})} 
                    className="flex-1 accent-blue-600" 
                    title="Adjust message throttle rate"
                  />
                  <span className="w-24 text-center bg-gray-100 py-2 px-3 rounded-lg font-bold">{formData.throttleRate} msg/min</span>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <button onClick={() => formData.name.trim() ? setStep(2) : setFormError("Campaign name is required.")} className="btn-primary px-8">Next: Select Template</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-headline-medium mb-2">Select a Message Template</h2>
              {templates.length === 0 ? (
                <div className="text-center py-8"><p className="opacity-70 mb-4">No templates yet.</p><button onClick={() => setShowNewCampaignForm(false)} className="btn-primary">Create Template</button></div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {templates.filter(t => t.status === "APPROVED").map(t => (
                    <button key={t.id} onClick={() => setFormData({...formData, templateId: t.id})} className={`p-5 border rounded-xl text-left transition ${formData.templateId === t.id ? "ring-2 ring-blue-500 border-blue-400" : "hover:border-blue-300"}`}>
                      <h3 className="text-title-medium mb-2 font-semibold">{t.name}</h3>
                      <p className="text-body-small opacity-70 line-clamp-3 whitespace-pre-wrap">{t.body}</p>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-between pt-4 border-t">
                <button onClick={() => setStep(1)} className="btn-outline px-6">Back</button>
                <button onClick={() => formData.templateId ? setStep(3) : setFormError("Please select a template.")} className="btn-primary px-8" disabled={!formData.templateId}>Next: Select Recipients</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-headline-medium mb-2">Select Recipients</h2>
              {leads.length === 0 ? (
                <div className="text-center py-8"><p className="opacity-70 mb-4">No leads yet.</p><button onClick={() => setShowNewCampaignForm(false)} className="btn-primary">Import Leads</button></div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.leadIds.length === leads.length} onChange={() => setFormData(prev => prev.leadIds.length === leads.length ? {...prev, leadIds: []} : {...prev, leadIds: leads.map(l => l.id)})} className="rounded" />
                      Select All ({leads.length})
                    </label>
                    <span className="font-bold text-blue-600">{formData.leadIds.length} selected</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto border rounded-lg divide-y">
                    {leads.map(lead => (
                      <label key={lead.id} className={`flex items-center gap-4 p-3 cursor-pointer hover:bg-blue-50 transition ${formData.leadIds.includes(lead.id) ? "bg-blue-50/50" : ""}`}>
                        <input type="checkbox" checked={formData.leadIds.includes(lead.id)} onChange={() => toggleLead(lead.id)} className="rounded" />
                        <div className="flex-1">
                          <span className="font-medium block">{[lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unknown"}</span>
                          <span className="text-body-small opacity-60">{lead.phoneNumber}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
              {formData.leadIds.length > 0 && selectedTemplate && (
                <div className="p-5 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50">
                  <h3 className="font-bold text-blue-700 mb-2">Launch Summary</h3>
                  <ul className="text-body-medium space-y-1 text-blue-800">
                    <li><strong>Campaign:</strong> {formData.name}</li>
                    <li><strong>Template:</strong> {selectedTemplate.name}</li>
                    <li><strong>Recipients:</strong> {formData.leadIds.length} leads</li>
                    <li><strong>Throttle:</strong> {formData.throttleRate} msg/min</li>
                  </ul>
                </div>
              )}
              <div className="flex justify-between pt-4 border-t">
                <button onClick={() => setStep(2)} className="btn-outline px-6">Back</button>
                <button onClick={handleCreateCampaign} disabled={formLoading || formData.leadIds.length === 0} className="btn-primary px-8">
                  {formLoading ? "Launching..." : `Launch Campaign (${formData.leadIds.length} recipients)`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Campaigns List View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-small mb-1">Campaigns</h1>
          <p className="text-body-large opacity-70">Automate your outreach at scale.</p>
        </div>
        <button onClick={() => setShowNewCampaignForm(true)} className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          Launch Campaign
        </button>
      </div>

      <div className="card-surface p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.433 4.433 0 002.708-2.708 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
            </div>
            <h2 className="text-title-large mb-2">No campaigns found</h2>
            <p className="text-body-medium opacity-60 max-w-sm mb-6">Launch a campaign to send messages to your leads.</p>
            <button onClick={() => setShowNewCampaignForm(true)} className="btn-primary">Create Campaign</button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-label-medium uppercase opacity-70 border-neutral-variant bg-neutral-variant-99">
                <th className="p-4 pl-6 font-medium whitespace-nowrap">Campaign Name</th>
                <th className="p-4 font-medium whitespace-nowrap">Status</th>
                <th className="p-4 font-medium whitespace-nowrap">Template</th>
                <th className="p-4 font-medium whitespace-nowrap">Recipients</th>
                <th className="p-4 font-medium whitespace-nowrap">Send Rate</th>
                <th className="p-4 font-medium whitespace-nowrap">Created</th>
                <th className="p-4 font-medium whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(camp => (
                <tr key={camp.id} className="border-b hover:bg-gray-50 transition border-neutral-variant">
                  <td className="p-4 pl-6 whitespace-nowrap">
                    <button onClick={() => onNavigate?.(camp.id)} className="font-semibold hover:underline text-primary">{camp.name}</button>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-label-small rounded-full font-bold uppercase ${getStatusBadgeClass(camp.status)}`}>{camp.status}</span>
                  </td>
                  <td className="p-4 whitespace-nowrap text-body-small opacity-80">{camp.template?.name || "Missing"}</td>
                  <td className="p-4 font-medium">{camp._count.leads}</td>
                  <td className="p-4 text-body-small opacity-70">{camp.throttleRate} msg/min</td>
                  <td className="p-4 text-body-small opacity-70">{new Date(camp.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => onNavigate?.(camp.id)} className="text-body-small font-medium hover:underline opacity-70 hover:opacity-100">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
