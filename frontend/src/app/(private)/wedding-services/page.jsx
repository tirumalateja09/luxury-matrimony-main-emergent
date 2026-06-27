"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Search, MapPin, Phone, Globe, Star, X, Send, Camera, ChefHat, Sparkles, Flower2, Palette, Building2 } from "lucide-react";

const CATEGORIES = ["Photographer", "Caterer", "Decorator", "Mehendi", "Makeup Artist", "Wedding Venue"];

const CATEGORY_ICONS = {
  Photographer: Camera,
  Caterer: ChefHat,
  Decorator: Sparkles,
  Mehendi: Flower2,
  "Makeup Artist": Palette,
  "Wedding Venue": Building2,
};

export default function WeddingServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [contactService, setContactService] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", selectedService: "" });
  const [sending, setSending] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (city) params.set("city", city);
      if (search) params.set("search", search);
      const res = await api.get(`/wedding-services?${params.toString()}`, "private");
      if (res.success) setServices(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [category, city, search]);

  useEffect(() => {
    const t = setTimeout(fetchServices, 400);
    return () => clearTimeout(t);
  }, [fetchServices]);

  const handleContact = async () => {
    if (!form.name || !form.phone) { toast.error("Name and phone are required"); return; }
    setSending(true);
    try {
      const res = await api.post(`/wedding-services/${contactService._id}/contact`, form, "private");
      if (res.success) {
        toast.success("Inquiry sent! The vendor will contact you shortly.");
        setContactService(null);
        setForm({ name: "", phone: "", email: "", message: "", selectedService: "" });
      } else toast.error(res.message);
    } catch (e) { toast.error("Failed to send inquiry"); }
    finally { setSending(false); }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#2D2424] to-[#6E2F2F] px-4 py-12 text-center">
        <p className="text-[#E3B450] text-xs font-bold uppercase tracking-widest mb-2">RVR Luxury Matrimony</p>
        <h1 className="text-white font-playfair text-3xl md:text-4xl font-bold mb-3">Wedding Services</h1>
        <p className="text-white/60 text-sm mb-6">Photographers, caterers, decorators & more — curated for your special day</p>
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..."
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-white text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#E3B450]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          <button onClick={() => setCategory("")} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${!category ? "bg-[#2D2424] text-white border-[#2D2424]" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>All</button>
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c] || Sparkles;
            return (
              <button key={c} onClick={() => setCategory(c)} className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition ${category === c ? "bg-[#2D2424] text-white border-[#2D2424]" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                <Icon size={13} /> {c}
              </button>
            );
          })}
        </div>

        {/* City filter */}
        <div className="relative mb-8 max-w-xs">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Filter by city..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#E3B450]" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-56 bg-stone-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-stone-400">No vendors found. Try adjusting your filters.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => {
              const Icon = CATEGORY_ICONS[s.category] || Sparkles;
              return (
                <div key={s._id} className="bg-white rounded-2xl border border-[#F2E9DE] overflow-hidden hover:shadow-lg transition group">
                  <div className="h-36 bg-gradient-to-br from-[#FBF6ED] to-[#F2E9DE] flex items-center justify-center relative">
                    <Icon size={40} className="text-[#E3B450] opacity-50" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-[#2D2424] text-[#E3B450] px-2.5 py-1 rounded-full">{s.category}</span>
                    </div>
                    {s.isFeatured && <div className="absolute top-3 right-3"><Star size={14} className="text-[#E3B450] fill-[#E3B450]" /></div>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#2D2424] text-base mb-1">{s.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-stone-400 mb-2">
                      <MapPin size={11} /> {s.city}{s.city && s.state ? ", " : ""}{s.state}
                    </div>
                    {s.priceRange?.min > 0 && (
                      <p className="text-xs text-[#8B6914] mb-2 font-medium">₹{s.priceRange.min.toLocaleString()} – ₹{s.priceRange.max.toLocaleString()}</p>
                    )}
                    <p className="text-xs text-stone-500 mb-4 line-clamp-2">{s.description || "Premium service provider"}</p>
                    <button onClick={() => setContactService(s)} data-testid={`contact-vendor-${s._id}`}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
                      <Send size={14} /> Contact Vendor
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {contactService && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#F2E9DE]">
              <div>
                <h2 className="font-playfair text-xl font-bold text-[#2D2424]">Contact Vendor</h2>
                <p className="text-sm text-stone-400">{contactService.name} · {contactService.category}</p>
              </div>
              <button onClick={() => setContactService(null)}><X size={20} className="text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-3">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name *" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Your phone *" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
              <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email (optional)" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
              <input value={form.selectedService} onChange={(e) => setForm((f) => ({ ...f, selectedService: e.target.value }))} placeholder={`Service needed (e.g. ${contactService.category})`} className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
              <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Message or special requirements..." rows={3} className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none resize-none" />
            </div>
            <div className="flex gap-3 p-6 border-t border-[#F2E9DE]">
              <button onClick={() => setContactService(null)} className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition">Cancel</button>
              <button onClick={handleContact} disabled={sending} data-testid="send-inquiry-btn" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition">
                {sending ? "Sending..." : "Send Inquiry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
