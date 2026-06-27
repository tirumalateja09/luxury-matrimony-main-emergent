"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Eye, Users } from "lucide-react";

const CATEGORIES = ["Photographer", "Caterer", "Decorator", "Mehendi", "Makeup Artist", "Wedding Venue"];

const EMPTY_FORM = {
  name: "", category: "Photographer", description: "", location: "",
  city: "", state: "", contactPerson: "", phone: "", email: "", website: "",
  priceRange: { min: 0, max: 0 }, isActive: true, isFeatured: false,
};

export default function AdminWeddingServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/wedding-services/admin/list${filterCat ? `?category=${filterCat}` : ""}`, "admin");
      if (res.success) setServices(res.data);
    } catch (e) { toast.error("Failed to load services"); }
    finally { setLoading(false); }
  }, [filterCat]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (s) => { setEditing(s._id); setForm({ ...s, priceRange: s.priceRange || { min: 0, max: 0 } }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.location) { toast.error("Name and Location are required"); return; }
    setSaving(true);
    try {
      const res = editing
        ? await api.put(`/wedding-services/admin/${editing}`, form, "admin")
        : await api.post("/wedding-services/admin/create", form, "admin");
      if (res.success) { toast.success(editing ? "Updated!" : "Created!"); setShowModal(false); fetchServices(); }
      else toast.error(res.message);
    } catch (e) { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;
    const res = await api.del(`/wedding-services/admin/${id}`, "admin");
    if (res.success) { toast.success("Deleted"); fetchServices(); }
    else toast.error("Delete failed");
  };

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const setPriceRange = (key, val) => setForm((f) => ({ ...f, priceRange: { ...f.priceRange, [key]: parseInt(val) || 0 } }));

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-[#2D2424]">Wedding Services</h1>
            <p className="text-stone-500 mt-1">Manage vendor listings across 6 categories</p>
          </div>
          <button onClick={openCreate} data-testid="add-service-btn"
            className="flex items-center gap-2 bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition">
            <Plus size={16} /> Add Service
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setFilterCat("")} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${!filterCat ? "bg-[#2D2424] text-white border-[#2D2424]" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilterCat(c)} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${filterCat === c ? "bg-[#2D2424] text-white border-[#2D2424]" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{c}</button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400">Loading...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-stone-400">No services found. Add your first vendor.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div key={s._id} className="bg-white rounded-2xl border border-[#F2E9DE] p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E3B450] bg-[#FBF6ED] px-2 py-0.5 rounded-full">{s.category}</span>
                    <h3 className="font-bold text-[#2D2424] mt-1.5">{s.name}</h3>
                    <p className="text-xs text-stone-400">{s.city}{s.city && s.state ? ", " : ""}{s.state}</p>
                  </div>
                  <div className="flex gap-1">
                    {s.isFeatured && <span className="text-[9px] font-bold bg-[#E3B450] text-white px-1.5 py-0.5 rounded-full">Featured</span>}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{s.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
                <p className="text-xs text-stone-500 mb-3 line-clamp-2">{s.description || "—"}</p>
                <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
                  <span>{s.phone || "—"}</span>
                  <span className="flex items-center gap-1"><Users size={11} /> {s.contactInquiries?.length || 0} inquiries</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-[#E3B450] text-[#8B6914] text-xs font-medium hover:bg-[#FBF6ED] transition">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(s._id)} className="px-3 py-2 rounded-xl border border-red-100 text-red-500 text-xs font-medium hover:bg-red-50 transition">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#F2E9DE]">
              <h2 className="font-playfair text-xl font-bold text-[#2D2424]">{editing ? "Edit Service" : "Add New Service"}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Business Name *</label>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Royal Frames Photography" className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Category *</label>
                  <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none bg-white">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">City</label>
                  <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">State</label>
                  <input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="State" className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Location (Area) *</label>
                  <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Jubilee Hills, Hyderabad" className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Phone</label>
                  <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Min Price (₹)</label>
                  <input type="number" value={form.priceRange?.min || 0} onChange={(e) => setPriceRange("min", e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Max Price (₹)</label>
                  <input type="number" value={form.priceRange?.max || 0} onChange={(e) => setPriceRange("max", e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Description</label>
                  <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Describe the service..." className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none resize-none" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="accent-[#E3B450] w-4 h-4" />
                    <span className="text-sm text-stone-600">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="accent-[#E3B450] w-4 h-4" />
                    <span className="text-sm text-stone-600">Featured</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#F2E9DE]">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} data-testid="save-service-btn" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition">
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
