"use client";
import { useState, useCallback } from "react";
import { Download, FileSpreadsheet, FileText, X, SlidersHorizontal, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Parsi", "Jewish", "No Religion", "Other"];
const EDUCATIONS = ["10th", "12th", "Diploma", "Bachelor", "Master", "PhD", "Other"];
const MEMBERSHIPS = ["Free", "Gold", "Premium"];
const STATUSES = ["active", "pending", "suspended", "deleted"];
const KYC_STATUSES = ["pending", "approved", "rejected"];

const InputRow = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">{label}</label>
    {children}
  </div>
);

const StyledSelect = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-[#E3B450] outline-none">
    <option value="">{placeholder || "All"}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

const StyledInput = ({ value, onChange, placeholder, type = "text" }) => (
  <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
);

export default function ExportPanel({ token }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(null); // 'excel' | 'pdf' | null

  const [filters, setFilters] = useState({
    gender: "", religion: "", membershipType: "", status: "",
    approveStatus: "", education: "", state: "", city: "",
    minAge: "", maxAge: "", dateFrom: "", dateTo: "",
  });

  const set = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  const buildParams = useCallback((format) => {
    const params = new URLSearchParams({ format });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    return params.toString();
  }, [filters]);

  const handleExcel = async () => {
    setExporting("excel");
    try {
      const qs = buildParams("xlsx");
      const res = await fetch(`${API}/admin/export/users?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { alert("Export failed: " + res.statusText); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed: " + e.message);
    } finally {
      setExporting(null);
    }
  };

  const handlePDF = async () => {
    setExporting("pdf");
    try {
      const qs = buildParams("json");
      const res = await fetch(`${API}/admin/export/users?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!result.success) { alert("Export failed: " + result.message); return; }

      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      // Header
      doc.setFillColor(45, 36, 36);
      doc.rect(0, 0, 297, 20, "F");
      doc.setTextColor(227, 180, 80);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RVR Luxury Matrimony — User Export", 14, 13);
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")} · Total: ${result.data.length} records`, 14, 19);

      const columns = Object.keys(result.data[0] || {});
      const rows = result.data.map((r) => columns.map((c) => String(r[c] ?? "")));

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 24,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [45, 36, 36], textColor: [227, 180, 80], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [251, 246, 237] },
        margin: { left: 10, right: 10 },
      });

      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(180);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" });
      }

      doc.save(`users_export_${Date.now()}.pdf`);
    } catch (e) {
      alert("PDF export failed: " + e.message);
    } finally {
      setExporting(null);
    }
  };

  const clearFilters = () => setFilters({
    gender: "", religion: "", membershipType: "", status: "",
    approveStatus: "", education: "", state: "", city: "",
    minAge: "", maxAge: "", dateFrom: "", dateTo: "",
  });

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-[#F2E9DE] bg-white p-6 shadow-sm mt-5" data-testid="export-panel-section">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#2D2424] font-playfair flex items-center gap-2">
            <Download size={18} className="text-[#E3B450]" /> Export Users
          </h2>
          <p className="text-sm text-stone-400 mt-0.5">Filter and download user data as Excel or PDF</p>
        </div>
        <button onClick={() => setOpen((p) => !p)} data-testid="toggle-export-filters-btn"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${open ? "border-[#2D2424] bg-[#2D2424] text-white" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
          <SlidersHorizontal size={15} />
          Filters {activeCount > 0 ? <span className="bg-[#E3B450] text-[#2D2424] text-xs font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span> : null}
        </button>
      </div>

      {/* Filter Grid */}
      {open && (
        <div className="bg-[#FAF8F5] rounded-2xl p-5 mb-5 border border-[#F2E9DE]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <InputRow label="Gender">
              <StyledSelect value={filters.gender} onChange={(v) => set("gender", v)} options={["Male", "Female"]} />
            </InputRow>
            <InputRow label="Religion">
              <StyledSelect value={filters.religion} onChange={(v) => set("religion", v)} options={RELIGIONS} />
            </InputRow>
            <InputRow label="Membership">
              <StyledSelect value={filters.membershipType} onChange={(v) => set("membershipType", v)} options={MEMBERSHIPS} />
            </InputRow>
            <InputRow label="Account Status">
              <StyledSelect value={filters.status} onChange={(v) => set("status", v)} options={STATUSES} />
            </InputRow>
            <InputRow label="KYC Status">
              <StyledSelect value={filters.approveStatus} onChange={(v) => set("approveStatus", v)} options={KYC_STATUSES} />
            </InputRow>
            <InputRow label="Education">
              <StyledSelect value={filters.education} onChange={(v) => set("education", v)} options={EDUCATIONS} />
            </InputRow>
            <InputRow label="State">
              <StyledInput value={filters.state} onChange={(v) => set("state", v)} placeholder="e.g. Maharashtra" />
            </InputRow>
            <InputRow label="City">
              <StyledInput value={filters.city} onChange={(v) => set("city", v)} placeholder="e.g. Mumbai" />
            </InputRow>
            <InputRow label="Min Age">
              <StyledInput value={filters.minAge} onChange={(v) => set("minAge", v)} placeholder="18" type="number" />
            </InputRow>
            <InputRow label="Max Age">
              <StyledInput value={filters.maxAge} onChange={(v) => set("maxAge", v)} placeholder="60" type="number" />
            </InputRow>
            <InputRow label="Registered From">
              <StyledInput value={filters.dateFrom} onChange={(v) => set("dateFrom", v)} type="date" />
            </InputRow>
            <InputRow label="Registered To">
              <StyledInput value={filters.dateTo} onChange={(v) => set("dateTo", v)} type="date" />
            </InputRow>
          </div>
          {activeCount > 0 && (
            <div className="mt-4 flex justify-end">
              <button onClick={clearFilters} className="text-xs text-stone-500 hover:text-red-500 transition flex items-center gap-1">
                <X size={12} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Download Buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleExcel} disabled={!!exporting} data-testid="export-excel-btn"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#217346] to-[#1e6840] text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition shadow-sm">
          {exporting === "excel" ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
          {exporting === "excel" ? "Preparing..." : "Download Excel"}
        </button>
        <button onClick={handlePDF} disabled={!!exporting} data-testid="export-pdf-btn"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#c0392b] to-[#a93226] text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition shadow-sm">
          {exporting === "pdf" ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          {exporting === "pdf" ? "Generating PDF..." : "Download PDF"}
        </button>
        {activeCount > 0 && (
          <span className="flex items-center text-sm text-stone-500 ml-1">
            {activeCount} filter{activeCount > 1 ? "s" : ""} applied
          </span>
        )}
      </div>
    </div>
  );
}
