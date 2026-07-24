"use client";

import { useState, useEffect } from "react";
import { createTemplate, updateTemplate, deleteTemplate } from "@/lib/templates/actions";

interface TemplatesViewProps {
  userId: string;
  onNavigate?: (view: string) => void;
  onBack?: () => void;
  templateId?: string;
  showNewForm?: boolean;
}

interface Template {
  id: string;
  name: string;
  body: string;
  status: string;
  variables: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "APPROVED": return "bg-green-100 text-green-700";
    case "PENDING": return "bg-yellow-100 text-yellow-700";
    case "REJECTED": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export function TemplatesView({ userId, onNavigate, onBack, templateId, showNewForm }: TemplatesViewProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateForm, setShowTemplateForm] = useState(showNewForm || false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: "", body: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const PRESET_TEMPLATES = [
    { name: "Welcome Message", body: "Hi {first_name}, welcome to {company}! We're thrilled to have you on board." },
    { name: "Promo Offer", body: "Hey {first_name}! Use code {discount_code} to get 20% off your next purchase at {company}." },
    { name: "Event Reminder", body: "Hi {first_name}, just a friendly reminder that {event_name} is starting soon. See you there!" },
    { name: "Follow Up", body: "Hi {first_name}, it was great speaking with you. Let me know if you have any questions!" }
  ];

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const formData = new FormData();
    formData.set("name", newTemplate.name);
    formData.set("body", newTemplate.body);

    let result;
    if (editingTemplateId) {
      result = await updateTemplate(editingTemplateId, formData);
    } else {
      result = await createTemplate(formData);
    }

    if (result.error) {
      setFormError(result.error);
    } else {
      setNewTemplate({ name: "", body: "" });
      setEditingTemplateId(null);
      setShowTemplateForm(false);
      fetchTemplates();
    }
    setFormLoading(false);
  };

  const handleEditClick = (e: React.MouseEvent, template: Template) => {
    e.stopPropagation();
    setNewTemplate({ name: template.name, body: template.body });
    setEditingTemplateId(template.id);
    setShowTemplateForm(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    const result = await deleteTemplate(id);
    if (result.error) {
      alert(result.error);
    } else {
      fetchTemplates();
    }
  };

  const insertVariable = (variable: string) => {
    setNewTemplate(prev => ({ ...prev, body: prev.body + `{${variable}} ` }));
  };

  const renderPreview = () => {
    let previewHtml = newTemplate.body;
    const placeholders = Array.from(newTemplate.body.matchAll(/\{([^}]+)\}/g)).map(m => m[1]);
    const uniquePlaceholders = Array.from(new Set(placeholders));
    uniquePlaceholders.forEach(p => {
      const dummy = p === 'first_name' ? 'Jane' : p;
      previewHtml = previewHtml.replace(`{${p}}`, `<span class="px-1 rounded" style="background-color: var(--sys-color-roles-pimary-roles-primary-container-color-role); color: var(--sys-color-roles-pimary-roles-primary-color-role)">${dummy}</span>`);
    });
    return previewHtml;
  };

  // Template Detail View
  if (templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <h1 className="text-display-small mb-4">Template Not Found</h1>
          <button onClick={onBack} className="btn-primary">Return to Templates</button>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} title="Go back" aria-label="Go back" className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-60 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-display-small">{template.name}</h1>
            <span className={`px-3 py-1 text-label-small rounded-full font-bold uppercase ${getStatusBadgeClass(template.status)}`}>
              {template.status}
            </span>
          </div>
        </div>
        <div className="card-surface p-6">
          <h2 className="text-title-medium mb-4">Message Preview</h2>
          <div className="p-4 rounded-xl bg-success-container text-success-on-container text-body-medium whitespace-pre-wrap border border-success max-w-2xl">
            {template.body}
          </div>
        </div>
      </div>
    );
  }

  // New/Edit Template Form
  if (showTemplateForm) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => { setShowTemplateForm(false); setEditingTemplateId(null); setNewTemplate({name: "", body: ""}); }} title="Close form" aria-label="Close form" className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-60 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          </button>
          <div>
            <h1 className="text-display-small mb-1">{editingTemplateId ? "Edit Template" : "Create Template"}</h1>
            <p className="text-body-large opacity-70">Design a message with dynamic variables.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 card-surface p-6">
            {formError && <div className="p-4 mb-6 rounded-lg border bg-error-container text-error border-error">{formError}</div>}
            <form onSubmit={handleSaveTemplate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-label-large font-medium">Template Name</label>
                <input type="text" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} required className="input-field" placeholder="e.g., Webinar Follow Up" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-label-large font-medium">Message Content</label>
                  <span className={`text-body-small ${newTemplate.body.length > 1024 ? 'text-red-500 font-bold' : 'opacity-50'}`}>{newTemplate.body.length} / 1024</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-label-small opacity-60 self-center uppercase mr-1">Quick Start:</span>
                  {PRESET_TEMPLATES.map(preset => (
                    <button 
                      type="button" 
                      key={preset.name}
                      onClick={() => setNewTemplate({ name: preset.name, body: preset.body })}
                      className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 text-secondary font-medium text-label-small rounded-full transition-colors border border-transparent hover:border-secondary/30"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                <div className="border rounded-xl focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden bg-white border-neutral-variant">
                  <textarea value={newTemplate.body} onChange={e => setNewTemplate({...newTemplate, body: e.target.value})} required rows={8} className="w-full p-4 outline-none resize-none bg-transparent" placeholder="Hi {first_name}, thanks for joining..." />
                  <div className="bg-neutral-variant-container p-3 border-t flex flex-wrap gap-2 items-center border-neutral-variant">
                    <span className="text-label-small opacity-60 mr-2 uppercase tracking-wide">Insert:</span>
                    {["first_name", "last_name", "company", "event_name", "discount_code"].map(variable => (
                      <button type="button" key={variable} onClick={() => insertVariable(variable)} className="px-2.5 py-1 bg-white border rounded text-[11px] font-bold uppercase transition shadow-sm hover:shadow text-primary border-primary-container">
                        {`{${variable}}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={() => { setShowTemplateForm(false); setEditingTemplateId(null); setNewTemplate({name: "", body: ""}); }} className="btn-outline">Cancel</button>
                <button type="submit" disabled={formLoading || newTemplate.body.length > 1024} className="btn-primary">{formLoading ? "Saving..." : "Save Template"}</button>
              </div>
            </form>
          </div>
          <div className="w-full lg:w-80">
            <div className="card-surface p-4">
              <h3 className="text-label-large font-semibold mb-3">Preview</h3>
              <div className="p-4 rounded-xl bg-green-50 text-green-800 whitespace-pre-wrap text-body-medium border border-green-200">
                <div dangerouslySetInnerHTML={{ __html: renderPreview() || "Start typing..." }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Templates List View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-small mb-1">Templates</h1>
          <p className="text-body-large opacity-70">Create and manage message templates.</p>
        </div>
        <button onClick={() => { setNewTemplate({name: "", body: ""}); setShowTemplateForm(true); setEditingTemplateId(null); }} className="btn-primary">+ Create Template</button>
      </div>

      {loading ? (
        <div className="card-surface p-8 text-center">Loading...</div>
      ) : templates.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          </div>
          <h2 className="text-title-large mb-2">No templates yet</h2>
          <p className="text-body-medium opacity-60 max-w-sm mb-6">Templates let you save standardized messages with dynamic variables.</p>
          <button onClick={() => { setNewTemplate({name: "", body: ""}); setShowTemplateForm(true); setEditingTemplateId(null); }} className="btn-primary">Create Your First Template</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} onClick={() => onNavigate?.(template.id)} className="card-surface p-6 hover:shadow-lg transition cursor-pointer border border-transparent hover:border-blue-400 group relative">
              <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                <button 
                  onClick={(e) => handleEditClick(e, template)}
                  className="p-1.5 bg-white rounded-md shadow text-primary hover:text-blue-700 transition"
                  title="Edit Template"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => handleDeleteClick(e, template.id)}
                  className="p-1.5 bg-white rounded-md shadow text-error hover:text-red-700 transition"
                  title="Delete Template"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-start mb-4 pr-16">
                <h3 className="text-title-medium transition truncate">{template.name}</h3>
              </div>
              <div className="mb-4">
                <span className={`px-2 py-1 text-[10px] rounded-full font-bold uppercase ${getStatusBadgeClass(template.status)}`}>
                  {template.status}
                </span>
              </div>
              <div className="bg-neutral-99 p-4 rounded-xl border border-neutral line-clamp-4 text-body-medium opacity-80 whitespace-pre-wrap break-words min-h-[100px]">
                {template.body.length > 150 ? `${template.body.substring(0, 150)}...` : template.body}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral flex justify-between items-center text-label-small opacity-60">
                <span>{Object.keys(template.variables || {}).length} Variables</span>
                <span>Edited {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
