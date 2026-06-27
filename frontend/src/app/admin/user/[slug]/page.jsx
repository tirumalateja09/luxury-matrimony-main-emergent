"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft, User, Shield, Send, Trash2, Ban, RotateCcw,
  KeyRound, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle,
  Edit3, Mail, Phone, Camera, Save, ChevronDown, X,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

/* ─── helpers ─────────────────────────────── */
const adminFetch = (url, opts = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";
  return fetch(`${API}${url}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...opts.headers },
  });
};

const Field = ({ label, value, onChange, type = "text", options, textarea, disabled }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{label}</label>
    {textarea ? (
      <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        rows={3} disabled={disabled}
        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none resize-none disabled:bg-stone-50" />
    ) : options ? (
      <div className="relative">
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none appearance-none disabled:bg-stone-50">
          <option value="">— select —</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
      </div>
    ) : (
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none disabled:bg-stone-50" />
    )}
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="font-playfair text-base font-bold text-[#2D2424] mb-3 pb-2 border-b border-[#F2E9DE]">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
  </div>
);

const ConfirmModal = ({ title, message, confirmLabel, danger, onConfirm, onCancel, children }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="p-6">
        <h2 className="font-playfair text-xl font-bold text-[#2D2424] mb-2">{title}</h2>
        <p className="text-stone-500 text-sm mb-4">{message}</p>
        {children}
      </div>
      <div className="flex gap-3 px-6 pb-6">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition">Cancel</button>
        <button onClick={onConfirm}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${danger ? "bg-red-600 text-white hover:bg-red-700" : "bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] hover:opacity-90"}`}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ─── main page ────────────────────────────── */
export default function AdminUserDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [form, setForm] = useState({});
  // Request edit
  const [reqField, setReqField] = useState("email");
  const [reqRemarks, setReqRemarks] = useState("");
  const [sending, setSending] = useState(false);
  // Reset password
  const [newPwd, setNewPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  // Modals
  const [modal, setModal] = useState(null); // 'ban' | 'unban' | 'delete'
  const [banReason, setBanReason] = useState("");

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/admin/user-details/profile/${slug}`);
      const data = await res.json();
      if (data.success) {
        setUserData(data.data);
        setForm({ ...(data.data.profile || {}) });
      } else {
        toast.error(data.message || "Failed to load user");
      }
    } catch (e) {
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    if (!t) { router.push("/adminlogin"); return; }
    fetchUser();
  }, [fetchUser, router]);

  const setField = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  /* ─── save profile edits ─── */
  const handleSaveProfile = async () => {
    const userId = userData?.account?._id;
    if (!userId) return;
    setSaving(true);
    try {
      const res = await adminFetch(`/admin/users/${userId}/edit-profile`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile saved & user notified by email");
        fetchUser();
      } else toast.error(data.message || "Save failed");
    } catch (e) { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  /* ─── send request edit email ─── */
  const handleRequestEdit = async () => {
    const userId = userData?.account?._id;
    if (!userId || !reqRemarks.trim()) { toast.error("Please enter remarks"); return; }
    setSending(true);
    try {
      const res = await adminFetch(`/admin/users/${userId}/request-edit`, {
        method: "POST",
        body: JSON.stringify({ field: reqField, remarks: reqRemarks }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setReqRemarks("");
      } else toast.error(data.message);
    } catch (e) { toast.error("Failed to send request"); }
    finally { setSending(false); }
  };

  /* ─── ban / unban ─── */
  const handleBan = async (action) => {
    const userId = userData?.account?._id;
    if (!userId) return;
    try {
      const res = await adminFetch(`/admin/users/${userId}/ban`, {
        method: "POST",
        body: JSON.stringify({ action, reason: banReason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setModal(null);
        setBanReason("");
        fetchUser();
      } else toast.error(data.message);
    } catch (e) { toast.error("Action failed"); }
  };

  /* ─── delete user ─── */
  const handleDelete = async () => {
    const userId = userData?.account?._id;
    if (!userId) return;
    try {
      const res = await adminFetch(`/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("User permanently deleted");
        router.push("/admin");
      } else toast.error(data.message);
    } catch (e) { toast.error("Delete failed"); }
  };

  /* ─── reset password ─── */
  const handleResetPwd = async () => {
    const userId = userData?.account?._id;
    if (!userId || newPwd.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    try {
      const res = await adminFetch(`/admin/users/${userId}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword: newPwd }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Password reset & emailed to user"); setNewPwd(""); }
      else toast.error(data.message);
    } catch (e) { toast.error("Reset failed"); }
  };

  /* ─── KYC verify ─── */
  const [kycRemarks, setKycRemarks] = useState("");
  const handleVerify = async (status) => {
    const profileId = userData?.profile?._id;
    if (!profileId) return;
    if (status === "rejected" && !kycRemarks.trim()) { toast.error("Rejection requires remarks"); return; }
    try {
      const res = await adminFetch(`/admin/verify-profile/${profileId}`, {
        method: "PUT",
        body: JSON.stringify({ status, remarks: kycRemarks }),
      });
      const data = await res.json();
      if (data.success) { toast.success(`Profile ${status}`); fetchUser(); }
      else toast.error(data.message);
    } catch (e) { toast.error("Verification failed"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <p className="text-stone-400">Loading user details...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <p className="text-red-500">User not found</p>
      </div>
    );
  }

  const { account, profile } = userData;
  const isBanned = account?.accountStatus === "suspended";
  const kycStatus = profile?.adminStatus;

  const TABS = [
    { id: "profile", label: "Edit Profile", icon: Edit3 },
    { id: "account", label: "Account Actions", icon: Shield },
    { id: "request", label: "Request User Edit", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push("/admin")}
            className="p-2 rounded-xl hover:bg-[#F2E9DE] text-stone-500 transition">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-playfair text-2xl font-bold text-[#2D2424] truncate">
              {profile?.fullName || account?.email || "User Details"}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-stone-500">{account?.email}</span>
              {account?.phone && <span className="text-stone-300">·</span>}
              {account?.phone && <span className="text-sm text-stone-500">{account.phone}</span>}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isBanned ? "bg-red-100 text-red-700" :
                account?.accountStatus === "active" ? "bg-green-100 text-green-700" :
                "bg-amber-100 text-amber-700"
              }`}>{account?.accountStatus}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                kycStatus === "approved" ? "bg-green-100 text-green-700" :
                kycStatus === "rejected" ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>KYC: {kycStatus}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF6ED] text-[#8B6914]">
                {profile?.membershipType || "Free"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#F2E9DE]">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
                  tab === t.id ? "border-[#E3B450] text-[#2D2424]" : "border-transparent text-stone-400 hover:text-stone-600"
                }`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB: EDIT PROFILE ── */}
        {tab === "profile" && (
          <div>
            <Section title="Personal Information">
              <Field label="Full Name" value={form.fullName} onChange={(v) => setField("fullName", v)} />
              <Field label="Date of Birth" value={form.dob ? new Date(form.dob).toISOString().slice(0, 10) : ""} type="date" onChange={(v) => setField("dob", v)} />
              <Field label="Gender" value={form.gender} onChange={(v) => setField("gender", v)} options={["Male", "Female"]} />
              <Field label="Height (cm)" value={form.height} type="number" onChange={(v) => setField("height", Number(v))} />
              <Field label="Marital Status" value={form.maritalStatus} onChange={(v) => setField("maritalStatus", v)}
                options={["Never Married", "Awaiting Divorce", "Divorced", "Widowed", "Annulled"]} />
              <Field label="Physical Status" value={form.physicalStatus} onChange={(v) => setField("physicalStatus", v)}
                options={["Normal", "Physically Challenged"]} />
              <Field label="Diet" value={form.diet} onChange={(v) => setField("diet", v)}
                options={["Veg", "Non-Veg", "Jain", "Vegan"]} />
              <Field label="Language" value={form.language} onChange={(v) => setField("language", v)} />
              <Field label="Mother Tongue" value={form.motherTongue} onChange={(v) => setField("motherTongue", v)} />
            </Section>

            <Section title="Religion & Community">
              <Field label="Religion" value={form.religion} onChange={(v) => setField("religion", v)} />
              <Field label="Community / Caste" value={form.community} onChange={(v) => setField("community", v)} />
              <Field label="Sub Community" value={form.subCommunity} onChange={(v) => setField("subCommunity", v)} />
            </Section>

            <Section title="Location">
              <Field label="Country" value={form.country} onChange={(v) => setField("country", v)} />
              <Field label="State" value={form.state} onChange={(v) => setField("state", v)} />
              <Field label="City" value={form.city} onChange={(v) => setField("city", v)} />
              <Field label="Citizenship" value={form.citizenship} onChange={(v) => setField("citizenship", v)} />
              <Field label="Resident Status" value={form.residentStatus} onChange={(v) => setField("residentStatus", v)} />
            </Section>

            <Section title="Education & Career">
              <Field label="Highest Education" value={form.highestEducation} onChange={(v) => setField("highestEducation", v)} />
              <Field label="Degree / Specialization" value={form.degree} onChange={(v) => setField("degree", v)} />
              <Field label="Profession" value={form.profession} onChange={(v) => setField("profession", v)} />
              <Field label="Company Name" value={form.companyName} onChange={(v) => setField("companyName", v)} />
              <Field label="Annual Income" value={form.annualIncome} onChange={(v) => setField("annualIncome", v)} />
            </Section>

            <Section title="Family Details">
              <Field label="Family Status" value={form.familyStatus} onChange={(v) => setField("familyStatus", v)}
                options={["Middle class", "Upper middle class", "Rich/Affluent(Elite)"]} />
              <Field label="Family Type" value={form.familyType} onChange={(v) => setField("familyType", v)}
                options={["Nuclear", "Joint"]} />
              <Field label="Father's Occupation" value={form.fathersOccupation} onChange={(v) => setField("fathersOccupation", v)} />
              <Field label="Mother's Occupation" value={form.mothersOccupation} onChange={(v) => setField("mothersOccupation", v)} />
              <Field label="Brothers" value={form.brothers} type="number" onChange={(v) => setField("brothers", Number(v))} />
              <Field label="Sisters" value={form.sisters} type="number" onChange={(v) => setField("sisters", Number(v))} />
              <Field label="Drinking Habits" value={form.drinkingHabits} onChange={(v) => setField("drinkingHabits", v)}
                options={["yes", "no", "occasionally"]} />
              <Field label="Smoking Habits" value={form.smokingHabits} onChange={(v) => setField("smokingHabits", v)}
                options={["yes", "no", "occasionally"]} />
            </Section>

            <Section title="Horoscope">
              <Field label="Rashi" value={form.rashi} onChange={(v) => setField("rashi", v)} />
              <Field label="Nakshatra" value={form.nakshatra} onChange={(v) => setField("nakshatra", v)} />
              <Field label="Gothram" value={form.gothram} onChange={(v) => setField("gothram", v)} />
              <Field label="Manglik" value={form.manglik} onChange={(v) => setField("manglik", v)}
                options={["Yes", "No", "Anshik"]} />
              <Field label="Birth Time" value={form.birthTime} onChange={(v) => setField("birthTime", v)} />
              <Field label="Birth Place" value={form.birthPlace} onChange={(v) => setField("birthPlace", v)} />
            </Section>

            <div className="mb-6">
              <h3 className="font-playfair text-base font-bold text-[#2D2424] mb-3 pb-2 border-b border-[#F2E9DE]">About</h3>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Bio" value={form.bio} textarea onChange={(v) => setField("bio", v)} />
                <Field label="About Family" value={form.aboutFamily} textarea onChange={(v) => setField("aboutFamily", v)} />
                <Field label="Describe Me" value={form.describeMe} textarea onChange={(v) => setField("describeMe", v)} />
                <Field label="About Career" value={form.aboutCareer} textarea onChange={(v) => setField("aboutCareer", v)} />
              </div>
            </div>

            <Section title="Admin Settings">
              <Field label="Membership Type" value={form.membershipType} onChange={(v) => setField("membershipType", v)}
                options={["Free", "Gold", "Premium"]} />
              <Field label="Admin Status (KYC)" value={form.adminStatus} onChange={(v) => setField("adminStatus", v)}
                options={["pending", "approved", "rejected"]} />
              <div className="flex items-center gap-3 mt-6">
                <input type="checkbox" id="featured" checked={!!form.isFeatured} onChange={(e) => setField("isFeatured", e.target.checked)}
                  className="accent-[#E3B450] w-4 h-4" />
                <label htmlFor="featured" className="text-sm text-stone-600">Featured Profile</label>
              </div>
            </Section>

            <div className="mb-6">
              <h3 className="font-playfair text-base font-bold text-[#2D2424] mb-3 pb-2 border-b border-[#F2E9DE]">Admin Remarks (Internal)</h3>
              <Field label="" value={form.adminRemarks} textarea onChange={(v) => setField("adminRemarks", v)} />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSaveProfile} disabled={saving} data-testid="save-profile-btn"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition">
                <Save size={16} /> {saving ? "Saving..." : "Save Changes & Notify User"}
              </button>
              <button onClick={fetchUser} className="px-5 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition">
                Reset
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: ACCOUNT ACTIONS ── */}
        {tab === "account" && (
          <div className="space-y-5">
            {/* KYC Section */}
            <div className="bg-white rounded-2xl border border-[#F2E9DE] shadow-sm p-6">
              <h3 className="font-playfair text-lg font-bold text-[#2D2424] mb-4">KYC Verification</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-stone-500">Current Status:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                  kycStatus === "approved" ? "bg-green-100 text-green-700" :
                  kycStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}>{kycStatus}</span>
              </div>
              <div className="space-y-3">
                <textarea value={kycRemarks} onChange={(e) => setKycRemarks(e.target.value)} rows={2}
                  placeholder="Remarks (required for rejection)"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none resize-none" />
                <div className="flex gap-3">
                  <button onClick={() => handleVerify("approved")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition">
                    <CheckCircle size={15} /> Approve KYC
                  </button>
                  <button onClick={() => handleVerify("rejected")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-100 text-red-700 text-sm font-bold hover:bg-red-200 transition">
                    <XCircle size={15} /> Reject KYC
                  </button>
                </div>
              </div>
            </div>

            {/* Reset Password */}
            <div className="bg-white rounded-2xl border border-[#F2E9DE] shadow-sm p-6">
              <h3 className="font-playfair text-lg font-bold text-[#2D2424] mb-1">Reset Password</h3>
              <p className="text-sm text-stone-500 mb-4">User will receive an email with the new password.</p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input type={showPwd ? "text" : "password"} value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                  <button onClick={() => setShowPwd((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button onClick={handleResetPwd} disabled={newPwd.length < 6}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D2424] text-white text-sm font-bold hover:bg-[#4A3030] disabled:opacity-50 transition">
                  <KeyRound size={15} /> Reset
                </button>
              </div>
            </div>

            {/* Ban / Unban */}
            <div className="bg-white rounded-2xl border border-[#F2E9DE] shadow-sm p-6">
              <h3 className="font-playfair text-lg font-bold text-[#2D2424] mb-1">
                {isBanned ? "Unban User" : "Ban User"}
              </h3>
              <p className="text-sm text-stone-500 mb-4">
                {isBanned
                  ? "Reactivate this user's account."
                  : "Suspend this user. They will be notified by email with the reason."}
              </p>
              {isBanned ? (
                <button onClick={() => setModal("unban")} data-testid="unban-btn"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition">
                  <CheckCircle size={15} /> Unban / Reactivate
                </button>
              ) : (
                <button onClick={() => setModal("ban")} data-testid="ban-btn"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition">
                  <Ban size={15} /> Ban User
                </button>
              )}
            </div>

            {/* Delete User */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
              <h3 className="font-playfair text-lg font-bold text-red-700 mb-1">Delete User</h3>
              <p className="text-sm text-stone-500 mb-4">
                Permanently delete this user and all their data. <strong className="text-red-600">This cannot be undone.</strong>
              </p>
              <button onClick={() => setModal("delete")} data-testid="delete-user-btn"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition">
                <Trash2 size={15} /> Delete Permanently
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: REQUEST USER EDIT ── */}
        {tab === "request" && (
          <div className="bg-white rounded-2xl border border-[#F2E9DE] shadow-sm p-6">
            <h3 className="font-playfair text-lg font-bold text-[#2D2424] mb-1">Request User to Update Their Info</h3>
            <p className="text-sm text-stone-500 mb-6">
              For sensitive fields like email, phone, and photos, send the user an email asking them to update it themselves.
            </p>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">Field to Update</label>
                <div className="relative">
                  <select value={reqField} onChange={(e) => setReqField(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none appearance-none">
                    <option value="email">Email Address</option>
                    <option value="phone">Phone Number</option>
                    <option value="profile photo">Profile Photo</option>
                    <option value="ID proof document">ID Proof Document</option>
                    <option value="verification selfie">Verification Selfie</option>
                    <option value="photo gallery">Photo Gallery</option>
                    <option value="bio">Bio / About Me</option>
                    <option value="horoscope details">Horoscope Details</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">Remarks / Instructions *</label>
                <textarea value={reqRemarks} onChange={(e) => setReqRemarks(e.target.value)} rows={4}
                  placeholder="E.g. Your current photo is blurry. Please upload a clearer recent photo with good lighting."
                  data-testid="request-edit-remarks"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none resize-none" />
              </div>

              <div className="bg-[#FBF6ED] rounded-xl p-4 text-sm text-stone-600">
                <p className="font-semibold text-[#2D2424] mb-1">Email will be sent to:</p>
                <p className="text-stone-500">{account?.email || "No email on file"}</p>
                <p className="mt-2 text-xs text-stone-400">The email will include your remarks and a link to the profile edit page.</p>
              </div>

              <button onClick={handleRequestEdit} disabled={sending || !account?.email || !reqRemarks.trim()}
                data-testid="send-request-btn"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition">
                <Send size={15} /> {sending ? "Sending..." : "Send Edit Request Email"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── BAN MODAL ── */}
      {modal === "ban" && (
        <ConfirmModal
          title="Ban User"
          message="This will suspend the user's account. They will be notified by email."
          confirmLabel="Ban User"
          danger
          onCancel={() => { setModal(null); setBanReason(""); }}
          onConfirm={() => handleBan("ban")}
        >
          <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} rows={3}
            placeholder="Reason for ban (will be included in email to user)"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none resize-none mb-2" />
        </ConfirmModal>
      )}

      {/* ── UNBAN MODAL ── */}
      {modal === "unban" && (
        <ConfirmModal
          title="Reactivate Account"
          message="This will restore the user's access. Are you sure?"
          confirmLabel="Yes, Reactivate"
          onCancel={() => setModal(null)}
          onConfirm={() => handleBan("unban")}
        />
      )}

      {/* ── DELETE MODAL ── */}
      {modal === "delete" && (
        <ConfirmModal
          title="Delete User Permanently"
          message={`This will permanently delete "${profile?.fullName || account?.email}" and ALL their data. This cannot be undone.`}
          confirmLabel="Yes, Delete Forever"
          danger
          onCancel={() => setModal(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
