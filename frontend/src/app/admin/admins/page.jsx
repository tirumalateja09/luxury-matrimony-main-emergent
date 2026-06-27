"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminContext } from "@/context/AdminContext";
import { UserCog, Plus, Trash2, Edit3, Crown, ShieldCheck, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageAdminsPage() {
  const router = useRouter();
  const { isSuperAdmin, adminId } = useAdminContext();
  const [token, setToken] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [saving, setSaving] = useState(false);

  // Role guard
  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (!savedToken) { router.push("/adminlogin"); return; }
    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (isSuperAdmin === false) {
      router.replace("/admin/403");
    }
  }, [isSuperAdmin, router]);

  const fetchAdmins = useCallback(async (authToken) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/admins`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 403) { router.replace("/admin/403"); return; }
      const data = await res.json();
      if (data.success) setAdmins(data.data || []);
    } catch (e) {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { if (token) fetchAdmins(token); }, [token, fetchAdmins]);

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error("Name and email are required");
    if (!editAdmin && !form.password) return toast.error("Password is required for new admins");
    setSaving(true);
    try {
      const url = editAdmin
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/admins/${editAdmin._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/admins`;
      const method = editAdmin ? "PUT" : "POST";
      const body = editAdmin
        ? { name: form.name, role: form.role, ...(form.password ? { password: form.password } : {}) }
        : { name: form.name, email: form.email, password: form.password, role: form.role };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(editAdmin ? "Admin updated" : "Admin created");
      setShowModal(false);
      setEditAdmin(null);
      setForm({ name: "", email: "", password: "", role: "admin" });
      fetchAdmins(token);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!confirm(`Delete admin ${email}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/admins/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("Admin deleted");
      fetchAdmins(token);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const openEdit = (admin) => {
    setEditAdmin(admin);
    setForm({ name: admin.name, email: admin.email, password: "", role: admin.role });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditAdmin(null);
    setForm({ name: "", email: "", password: "", role: "admin" });
    setShowModal(true);
  };

  if (!isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#E3B450] to-[#CAA043] flex items-center justify-center">
            <UserCog size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#2D2424]">Manage Admins</h1>
            <p className="text-sm text-stone-400">Create, edit and manage admin accounts</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-[#6E2F2F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5A2424] transition cursor-pointer"
        >
          <Plus size={16} /> Add Admin
        </button>
      </div>

      <div className="rounded-2xl border border-[#F2E9DE] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-stone-400">Loading admins...</div>
        ) : admins.length === 0 ? (
          <div className="p-10 text-center text-stone-400">No admins found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FBF6ED] text-xs uppercase tracking-wider text-[#6E2F2F]">
                  <th className="p-4 rounded-tl-2xl">Admin</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a._id} className="border-b border-[#F2E9DE] hover:bg-[#FDFAF7] transition">
                    <td className="p-4">
                      <p className="font-semibold text-[#2D2424]">{a.name}</p>
                      <p className="text-xs text-stone-400">{a.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        a.role === "super_admin"
                          ? "bg-gradient-to-r from-[#E3B450]/20 to-[#CAA043]/20 text-[#B08B4F]"
                          : "bg-[#F2E9DE] text-[#6E2F2F]"
                      }`}>
                        {a.role === "super_admin" ? <Crown size={11} /> : <ShieldCheck size={11} />}
                        {a.role === "super_admin" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-stone-500">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(a)}
                          className="flex items-center gap-1.5 rounded-lg border border-[#D7C2A7] px-3 py-1.5 text-xs font-medium text-[#6E2F2F] hover:bg-[#FBF6ED] transition cursor-pointer"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        {a._id !== adminId && (
                          <button
                            onClick={() => handleDelete(a._id, a.email)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-playfair text-lg font-bold text-[#2D2424]">
                {editAdmin ? "Edit Admin" : "Create Admin"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-stone-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">Name *</label>
                <input
                  type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E3B450] text-gray-700"
                  placeholder="Admin Name"
                />
              </div>
              {!editAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5">Email *</label>
                  <input
                    type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E3B450] text-gray-700"
                    placeholder="admin@example.com"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                  Password {editAdmin ? "(leave blank to keep current)" : "*"}
                </label>
                <input
                  type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E3B450] text-gray-700"
                  placeholder={editAdmin ? "Leave blank to keep current" : "Min. 6 characters"}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E3B450] text-gray-700"
                >
                  <option value="admin">Admin (Limited Access)</option>
                  <option value="super_admin">Super Admin (Full Access)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-stone-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-[#6E2F2F] py-2.5 text-sm font-semibold text-white hover:bg-[#5A2424] disabled:opacity-60 transition cursor-pointer"
              >
                {saving ? "Saving..." : editAdmin ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
