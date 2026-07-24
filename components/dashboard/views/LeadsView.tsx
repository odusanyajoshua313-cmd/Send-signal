"use client";

import { useState, useEffect, useCallback } from "react";
import { createSingleLead } from "@/lib/leads/create-action";
import { updateLead } from "@/lib/leads/actions";
import { LeadStatus } from "@prisma/client";

interface LeadsViewProps {
  userId: string;
  onNavigate?: (view: string) => void;
  onBack?: () => void;
  leadId?: string;
  showNewForm?: boolean;
}

interface Lead {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string;
  status: string;
  email: string | null;
  source: string | null;
  createdAt: string;
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "NEW": return "bg-blue-100 text-blue-700";
    case "CONTACTED": return "bg-purple-100 text-purple-700";
    case "REPLIED": return "bg-green-100 text-green-700";
    case "INTERESTED": return "bg-emerald-100 text-emerald-700";
    case "NOT_INTERESTED": return "bg-gray-100 text-gray-700";
    case "UNSUBSCRIBED": return "bg-red-100 text-red-700";
    case "CONVERTED": return "bg-yellow-100 text-yellow-700";
    case "BOUNCED": return "bg-orange-100 text-orange-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export function LeadsView({ userId, onNavigate, onBack, leadId, showNewForm }: LeadsViewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Lead form state
  const [showLeadForm, setShowLeadForm] = useState(showNewForm || false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [leadFormData, setLeadFormData] = useState({ firstName: "", lastName: "", phoneNumber: "", email: "", status: "NEW" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Fetch error state for displaying API failures
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      setFetchError(error instanceof Error ? error.message : String(error));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (leadId) {
      const lead = leads.find(l => l.id === leadId);
      setSelectedLead(lead || null);
    } else {
      setSelectedLead(null);
    }
  }, [leadId, leads]);

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingLeadId) {
        const result = await updateLead(editingLeadId, {
          firstName: leadFormData.firstName,
          lastName: leadFormData.lastName,
          phoneNumber: leadFormData.phoneNumber,
          email: leadFormData.email,
          status: leadFormData.status as LeadStatus
        });
        if (result.error) {
          setFormError(result.error);
        } else {
          setShowLeadForm(false);
          setEditingLeadId(null);
          fetchLeads();
        }
      } else {
        const formData = new FormData();
        formData.set("firstName", leadFormData.firstName);
        formData.set("lastName", leadFormData.lastName);
        formData.set("phoneNumber", leadFormData.phoneNumber);
        formData.set("email", leadFormData.email);
        formData.set("optIn", "true");

        const result = await createSingleLead(formData);
        if (result.error) {
          setFormError(result.error);
        } else {
          setLeadFormData({ firstName: "", lastName: "", phoneNumber: "", email: "", status: "NEW" });
          setShowLeadForm(false);
          fetchLeads();
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
    setFormLoading(false);
  };

  const handleEditClick = (lead: Lead) => {
    setLeadFormData({
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      phoneNumber: lead.phoneNumber,
      email: lead.email || "",
      status: lead.status
    });
    setEditingLeadId(lead.id);
    setShowLeadForm(true);
  };

  const handleAddNewClick = () => {
    setLeadFormData({ firstName: "", lastName: "", phoneNumber: "", email: "", status: "NEW" });
    setEditingLeadId(null);
    setShowLeadForm(true);
  };

  const filteredLeads = leads.filter(lead => {
    const fullName = `${lead.firstName || ""} ${lead.lastName || ""}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      lead.phoneNumber.includes(search) ||
      (lead.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  });

  // Delete lead helper
  const deleteLead = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Delete lead failed', { status: res.status, error: errorData });
        throw new Error(`Failed to delete lead (status ${res.status})`);
      }
      // Refresh list after deletion
      fetchLeads();
    } catch (err) {
      console.error('deleteLead error:', err);
      // Optionally set a UI error state here
    }
  };

  // Lead Detail View
  if (leadId && selectedLead) {
    const fullName = [selectedLead.firstName, selectedLead.lastName].filter(Boolean).join(" ") || "Unknown";
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-60 hover:opacity-100" title="Back">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-display-small">{fullName}</h1>
              <span className={`px-3 py-1 text-label-small rounded-full font-bold uppercase ${getStatusBadgeClass(selectedLead.status)}`}>
                {selectedLead.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-surface p-6">
            <h2 className="text-title-medium border-b pb-3 mb-4">Profile Details</h2>
            <div className="space-y-4">
              <div><label className="text-label-small opacity-60 uppercase block">Phone Number</label><span className="text-body-large font-medium">{selectedLead.phoneNumber}</span></div>
              {selectedLead.email && <div><label className="text-label-small opacity-60 uppercase block">Email</label><span className="text-body-large">{selectedLead.email}</span></div>}
              <div><label className="text-label-small opacity-60 uppercase block">Source</label><span className="text-body-large">{selectedLead.source || "Manual Entry"}</span></div>
              <div><label className="text-label-small opacity-60 uppercase block">Created</label><span className="text-body-large">{formatDate(selectedLead.createdAt)}</span></div>
            </div>
          </div>
          <div className="lg:col-span-2 card-surface p-6">
            <h2 className="text-title-medium border-b pb-3 mb-4">Conversation History</h2>
            <div className="text-center py-12 opacity-60">
              <p>No messages sent yet.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lead Form
  if (showLeadForm) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowLeadForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-60 hover:opacity-100" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          </button>
          <div>
            <h1 className="text-display-small mb-1">{editingLeadId ? "Edit Lead" : "Add New Lead"}</h1>
            <p className="text-body-large opacity-70">{editingLeadId ? "Update lead details." : "Manually add a contact."}</p>
          </div>
        </div>

        <div className="card-surface p-8">
          {formError && <div className="p-4 mb-6 rounded-lg border bg-error-container text-error border-error">{formError}</div>}
          <form onSubmit={handleSubmitLead} className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="firstName" className="text-label-large font-medium">First Name</label>
                <input id="firstName" type="text" value={leadFormData.firstName} onChange={e => setLeadFormData({...leadFormData, firstName: e.target.value})} className="input-field" placeholder="Jane" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="lastName" className="text-label-large font-medium">Last Name</label>
                <input id="lastName" type="text" value={leadFormData.lastName} onChange={e => setLeadFormData({...leadFormData, lastName: e.target.value})} className="input-field" placeholder="Doe" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="phoneNumber" className="text-label-large font-medium">Phone Number *</label>
              <input id="phoneNumber" type="tel" value={leadFormData.phoneNumber} onChange={e => setLeadFormData({...leadFormData, phoneNumber: e.target.value})} required className="input-field" placeholder="+1 (555) 012-3456" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-label-large font-medium">Email</label>
              <input id="email" type="email" value={leadFormData.email} onChange={e => setLeadFormData({...leadFormData, email: e.target.value})} className="input-field" placeholder="jane@example.com" />
            </div>
            {editingLeadId && (
              <div className="flex flex-col gap-2">
                <label htmlFor="leadStatus" className="text-label-large font-medium">Status</label>
                <select 
                  id="leadStatus"
                  value={leadFormData.status} 
                  onChange={e => setLeadFormData({...leadFormData, status: e.target.value})}
                  className="input-field"
                  title="Lead Status"
                  aria-label="Select lead status"
                >
                  {Object.values(LeadStatus).map(s => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-4 border-t pt-6">
              <button type="button" onClick={() => setShowLeadForm(false)} className="btn-outline px-6">Cancel</button>
              <button type="submit" disabled={formLoading} className="btn-primary px-8">{formLoading ? "Saving..." : "Save Lead"}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Leads List View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-small mb-1">Leads</h1>
          <p className="text-body-large opacity-70">Manage your contacts.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate?.("import")} className="btn-outline">Import CSV</button>
          <button onClick={handleAddNewClick} className="btn-primary">+ Add Lead</button>
        </div>
      </div>

      {/* Fetch error banner */}
      {fetchError && (
        <div className="p-4 mb-4 rounded-lg border bg-error-container text-error border-error">
          {fetchError}
        </div>
      )}

      <div className="card-surface p-0">
        <div className="p-4 border-b flex gap-4 bg-neutral-99 border-neutral-variant">
          <input
            type="search"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field max-w-xs"
            title="Search Leads"
            aria-label="Search leads"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            </div>
            <h2 className="text-title-large mb-2">No leads yet</h2>
            <p className="text-body-medium opacity-60 max-sm mb-6">Import leads from CSV or add them manually.</p>
            <button onClick={handleAddNewClick} className="btn-primary">Add First Lead</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-label-medium uppercase opacity-70 border-neutral-variant bg-neutral-variant-99">
                  <th className="p-4 pl-6 font-medium whitespace-nowrap">Name</th>
                  <th className="p-4 font-medium whitespace-nowrap">Phone</th>
                  <th className="p-4 font-medium whitespace-nowrap">Email</th>
                  <th className="p-4 font-medium whitespace-nowrap">Status</th>
                  <th className="p-4 font-medium whitespace-nowrap">Added</th>
                  <th className="p-4 font-medium whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50 transition border-neutral-variant">
                    <td className="p-4 pl-6 whitespace-nowrap">
                      <button onClick={() => onNavigate?.(lead.id)} className="font-semibold hover:underline text-primary">
                        {[lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unknown"}
                      </button>
                    </td>
                    <td className="p-4 whitespace-nowrap text-body-medium">{lead.phoneNumber}</td>
                    <td className="p-4 whitespace-nowrap text-body-small opacity-70">{lead.email || "—"}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-label-small rounded-full font-bold uppercase ${getStatusBadgeClass(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-body-small opacity-70">{formatDate(lead.createdAt)}</td>
                    <td className="p-4 whitespace-nowrap flex items-center gap-2">
                      <button onClick={() => handleEditClick(lead)} className="text-primary hover:opacity-70" title="Edit Lead">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                        </svg>
                      </button>
                      <button onClick={() => deleteLead(lead.id)} className="text-error hover:text-error-dark" title="Delete Lead">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M6 7a1 1 0 011-1h10a1 1 0 011 1v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" />
                          <path d="M9 4a1 1 0 011-1h4a1 1 0 011 1v1H9V4z" fillRule="evenodd" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
