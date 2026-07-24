"use client";

import { useState, useEffect } from "react";
import { updateProfile, updatePassword } from "@/lib/auth/profile-actions";
import { saveWhatsappConnection } from "@/lib/onboarding/actions";

interface SettingsViewProps {
  userId: string;
  companyName: string;
}

interface UserData {
  id: string;
  email: string;
  companyName: string;
  createdAt: string;
}

interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  status: string;
  provider: string;
}

export function SettingsView({ userId, companyName }: SettingsViewProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [whatsappAccounts, setWhatsappAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [companyNameInput, setCompanyNameInput] = useState(companyName);
  const [emailInput, setEmailInput] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [showConnectForm, setShowConnectForm] = useState(false);
  const [waConnectLoading, setWaConnectLoading] = useState(false);
  const [waDetails, setWaDetails] = useState({ phoneNumberId: "", accessToken: "" });

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, waRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/whatsapp/accounts"),
        ]);
        
        if (userRes.ok) {
          const data = await userRes.json();
          setUser(data.user);
          setCompanyNameInput(data.user.companyName);
          setEmailInput(data.user.email);
        }
        if (waRes.ok) {
          const data = await waRes.json();
          setWhatsappAccounts(data.accounts || []);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    const result = await updateProfile({ companyName: companyNameInput, email: emailInput });

    if (result.error) {
      setProfileError(result.error);
    } else {
      setProfileSuccess(true);
      setUser(prev => prev ? { ...prev, companyName: companyNameInput, email: emailInput } : null);
    }
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setPasswordLoading(true);
    setPasswordSuccess(false);

    const result = await updatePassword(currentPassword, newPassword);

    if (result.error) {
      setPasswordError(result.error);
    } else {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  };

  const handleConnectWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaConnectLoading(true);
    
    const res = await saveWhatsappConnection({
      phoneNumberId: waDetails.phoneNumberId,
      accessToken: waDetails.accessToken,
    });

    if (res.success) {
      setShowConnectForm(false);
      setWaDetails({ phoneNumberId: "", accessToken: "" });
      const waRes = await fetch("/api/whatsapp/accounts");
      if (waRes.ok) {
         const data = await waRes.json();
         setWhatsappAccounts(data.accounts || []);
      }
    } else {
      alert(res.error || "Failed to connect WhatsApp account");
    }
    setWaConnectLoading(false);
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(newPassword);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];

  if (loading) {
    return <div className="card-surface p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-display-small mb-1">Settings</h1>
        <p className="text-body-large opacity-70">Manage your account and preferences.</p>
      </div>

      <div className="card-surface p-6">
        <h2 className="text-headline-small mb-6 border-b pb-3 border-neutral-variant">Account Profile</h2>
        
        {profileSuccess && <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">Profile updated successfully!</div>}
        {profileError && <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{profileError}</div>}

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="companyNameInput" className="text-label-large font-medium">Company Name</label>
              <input id="companyNameInput" type="text" value={companyNameInput} onChange={e => setCompanyNameInput(e.target.value)} className="input-field" />
            </div>
            <div className="space-y-2">
              <label htmlFor="emailInput" className="text-label-large font-medium">Email Address</label>
              <input id="emailInput" type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} className="input-field" />
            </div>
            {user && (
              <div className="space-y-2">
                <label htmlFor="accountCreatedInput" className="text-label-large font-medium">Account Created</label>
                <input id="accountCreatedInput" type="text" defaultValue={new Date(user.createdAt).toLocaleDateString()} className="input-field" readOnly />
              </div>
            )}
          </div>
          <div className="pt-4 border-t flex justify-end">
            <button type="submit" disabled={profileLoading} className="btn-primary px-6">{profileLoading ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </div>

      <div className="card-surface p-6">
        <h2 className="text-headline-small mb-6 border-b pb-3 border-neutral-variant">Change Password</h2>
        
        {passwordSuccess && <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">Password updated successfully!</div>}
        {passwordError && <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{passwordError}</div>}

        <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <label htmlFor="currentPasswordInput" className="text-label-large font-medium">Current Password</label>
            <input id="currentPasswordInput" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="input-field" />
          </div>
          <div className="space-y-2">
            <label htmlFor="newPasswordInput" className="text-label-large font-medium">New Password</label>
            <input id="newPasswordInput" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} className="input-field" />
            {newPassword.length > 0 && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${strengthColors[strength - 1] || "bg-gray-200"} ${["w-0", "w-1/5", "w-2/5", "w-3/5", "w-4/5", "w-full"][strength] || "w-0"}`} />
                </div>
                <p className={`text-label-small mt-1 ${strength < 2 ? "text-red-500" : strength < 4 ? "text-yellow-600" : "text-green-600"}`}>{strengthLabels[strength - 1] || ""}</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPasswordInput" className="text-label-large font-medium">Confirm New Password</label>
            <input id="confirmPasswordInput" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="input-field" />
            {confirmPassword && newPassword !== confirmPassword && <span className="text-label-small text-red-500">Passwords do not match</span>}
          </div>
          <div className="pt-4">
            <button type="submit" disabled={passwordLoading || newPassword !== confirmPassword || newPassword.length < 8} className="btn-primary px-6">
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      <div className="card-surface p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-6 border-neutral-variant">
          <h2 className="text-headline-small">WhatsApp Business Accounts</h2>
          <button 
            onClick={() => setShowConnectForm(!showConnectForm)} 
            className="btn-outline text-body-medium px-4 py-2"
          >
            {showConnectForm ? "Cancel" : "+ Connect Account"}
          </button>
        </div>
        
        {showConnectForm && (
          <form onSubmit={handleConnectWhatsapp} className="mb-6 p-5 border border-neutral-variant rounded-xl bg-neutral-99 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center">
              <h3 className="text-title-medium font-bold">Connect WhatsApp API</h3>
              <button 
                type="button" 
                onClick={() => setWaDetails({ phoneNumberId: "MOCK_PHONE_123", accessToken: "MOCK_TOKEN_999" })}
                className="text-label-small font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 transition"
              >
                Auto-fill Mock Data
              </button>
            </div>
            <div className="space-y-2">
              <label htmlFor="phoneNumberIdInput" className="text-label-small uppercase font-bold opacity-70">Phone Number ID</label>
              <input 
                id="phoneNumberIdInput"
                type="text" 
                value={waDetails.phoneNumberId} 
                onChange={e => setWaDetails({...waDetails, phoneNumberId: e.target.value})} 
                required 
                className="input-field bg-white" 
                placeholder="e.g. 1042738491..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="accessTokenInput" className="text-label-small uppercase font-bold opacity-70">Access Token</label>
              <input 
                id="accessTokenInput"
                type="password" 
                value={waDetails.accessToken} 
                onChange={e => setWaDetails({...waDetails, accessToken: e.target.value})} 
                required 
                className="input-field bg-white" 
                placeholder="EAAGm0..."
              />
            </div>
            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={waConnectLoading} className="btn-primary">
                {waConnectLoading ? "Connecting..." : "Connect Account"}
              </button>
            </div>
          </form>
        )}

        {whatsappAccounts.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
            </div>
            <p className="text-body-large mb-2">No WhatsApp accounts connected</p>
            <p className="text-body-medium opacity-70 max-w-sm mx-auto">Connect your WhatsApp Business API account to start sending messages.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {whatsappAccounts.map(account => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <div>
                    <span className="font-medium block">{account.phoneNumber}</span>
                    <span className="text-body-small opacity-60">Status: {account.status} · Provider: {account.provider}</span>
                  </div>
                </div>
                <button className="text-body-small text-red-500 hover:underline">Disconnect</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-surface p-6 border border-red-200">
        <h2 className="text-headline-small mb-4 text-red-600">Danger Zone</h2>
        <p className="text-body-medium opacity-70 mb-4">Permanently delete your account and all data. This action cannot be undone.</p>
        <button className="btn-danger px-6" disabled>Delete Account (Coming Soon)</button>
      </div>
    </div>
  );
}
