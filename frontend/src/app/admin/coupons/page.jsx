"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Tag, ToggleLeft, ToggleRight } from "lucide-react";

const EMPTY_FORM = {
  code: "",
  discountType: "percentage",
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscountAmount: "",
  maxUses: "",
  expiresAt: "",
  applicablePlans: [],
  description: "",
  isActive: true,
};

const PLANS = ["GOLD", "PREMIUM", "ELITE"];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/coupons/admin", "admin");
      if (res.success) setCoupons(res.data);
    } catch (e) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c._id);
    setForm({
      ...c,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : "",
      maxUses: c.maxUses ?? "",
      maxDiscountAmount: c.maxDiscountAmount ?? "",
      applicablePlans: c.applicablePlans || [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) {
      toast.error("Code and discount value are required");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      code: form.code.toUpperCase().trim(),
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
    };
    try {
      const res = editing
        ? await api.put(`/coupons/admin/${editing}`, payload, "admin")
        : await api.post("/coupons/admin", payload, "admin");
      if (res.success) {
        toast.success(editing ? "Coupon updated!" : "Coupon created!");
        setShowModal(false);
        fetchCoupons();
      } else {
        toast.error(res.message || "Save failed");
      }
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon? This cannot be undone.")) return;
    try {
      const res = await api.del(`/coupons/admin/${id}`, "admin");
      if (res.success) { toast.success("Deleted"); fetchCoupons(); }
      else toast.error("Delete failed");
    } catch (e) { toast.error("Delete failed"); }
  };

  const toggleActive = async (c) => {
    try {
      const res = await api.put(`/coupons/admin/${c._id}`, { isActive: !c.isActive }, "admin");
      if (res.success) { toast.success(c.isActive ? "Coupon disabled" : "Coupon enabled"); fetchCoupons(); }
    } catch (e) { toast.error("Toggle failed"); }
  };

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const togglePlan = (plan) => {
    setForm((p) => ({
      ...p,
      applicablePlans: p.applicablePlans.includes(plan)
        ? p.applicablePlans.filter((x) => x !== plan)
        : [...p.applicablePlans, plan],
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-[#2D2424]">Coupons</h1>
            <p className="text-stone-500 mt-1">Create and manage discount codes for subscribers</p>
          </div>
          <button onClick={openCreate} data-testid="add-coupon-btn"
            className="flex items-center gap-2 bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition">
            <Plus size={16} /> New Coupon
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <Tag size={36} className="mx-auto mb-3 opacity-30" />
            <p>No coupons yet. Create your first discount code.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c._id} data-testid={`coupon-row-${c.code}`}
                className={`bg-white rounded-2xl border p-5 flex items-center justify-between shadow-sm transition ${c.isActive ? "border-[#F2E9DE]" : "border-stone-100 opacity-60"}`}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FBF6ED] flex items-center justify-center shrink-0">
                    <Tag size={18} className="text-[#E3B450]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2D2424] font-mono tracking-wider">{c.code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                        {c.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {c.discountType === "flat" ? `₹${c.discountValue} off` : `${c.discountValue}% off`}
                      {c.minOrderAmount > 0 ? ` · Min ₹${c.minOrderAmount}` : ""}
                      {c.maxDiscountAmount ? ` · Max ₹${c.maxDiscountAmount}` : ""}
                      {c.maxUses ? ` · ${c.usedCount}/${c.maxUses} used` : ` · ${c.usedCount} used`}
                      {c.expiresAt ? ` · Expires ${new Date(c.expiresAt).toLocaleDateString("en-IN")}` : ""}
                    </p>
                    {c.description && <p className="text-xs text-stone-400 mt-0.5 truncate max-w-xs">{c.description}</p>}
                    {c.applicablePlans?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {c.applicablePlans.map((p) => (
                          <span key={p} className="text-[10px] bg-[#F2E9DE] text-[#6E2F2F] px-1.5 py-0.5 rounded-full font-semibold">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button onClick={() => toggleActive(c)} title={c.isActive ? "Disable" : "Enable"}
                    className="p-2 rounded-xl border border-[#F2E9DE] hover:bg-[#FBF6ED] transition text-stone-400">
                    {c.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => openEdit(c)}
                    className="p-2 rounded-xl border border-[#F2E9DE] text-[#8B6914] hover:bg-[#FBF6ED] transition">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(c._id)}
                    className="p-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#F2E9DE]">
              <h2 className="font-playfair text-xl font-bold text-[#2D2424]">{editing ? "Edit Coupon" : "New Coupon"}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 mb-1 block">Coupon Code *</label>
                <input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER30"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono tracking-wider text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Discount Type</label>
                  <select value={form.discountType} onChange={(e) => set("discountType", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">
                    {form.discountType === "percentage" ? "Discount %" : "Discount ₹"} *
                  </label>
                  <input type="number" value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)}
                    placeholder={form.discountType === "percentage" ? "10" : "500"}
                    min={1} max={form.discountType === "percentage" ? 100 : undefined}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Min Order Amount (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", e.target.value)}
                    placeholder="0" min={0}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Max Discount Cap (₹)</label>
                  <input type="number" value={form.maxDiscountAmount} onChange={(e) => set("maxDiscountAmount", e.target.value)}
                    placeholder="Leave blank for no cap" min={0}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Max Uses</label>
                  <input type="number" value={form.maxUses} onChange={(e) => set("maxUses", e.target.value)}
                    placeholder="Unlimited" min={1}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Expiry Date</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 mb-2 block">Applicable Plans (leave empty for all)</label>
                <div className="flex gap-2">
                  {PLANS.map((plan) => (
                    <button key={plan} type="button" onClick={() => togglePlan(plan)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${form.applicablePlans.includes(plan) ? "bg-[#2D2424] text-white border-[#2D2424]" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                      {plan}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 mb-1 block">Internal Description</label>
                <input value={form.description} onChange={(e) => set("description", e.target.value)}
                  placeholder="e.g. Summer campaign 2025"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!!form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="accent-[#E3B450] w-4 h-4" />
                <span className="text-sm text-stone-600">Active (visible to users)</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#F2E9DE]">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} data-testid="save-coupon-btn"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition">
                {saving ? "Saving..." : "Save Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
