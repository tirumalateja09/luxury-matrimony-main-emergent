"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Crown, ShieldCheck, Eye, EyeOff } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const ROLES = [
  {
    id: "super_admin",
    label: "Super Admin",
    description: "Full access to all features",
    icon: Crown,
    gradient: "from-[#E3B450] to-[#CAA043]",
    ring: "ring-[#E3B450]",
    bg: "bg-gradient-to-br from-[#FBF6ED] to-[#F5E8C8]",
    badge: "bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-white",
    border: "border-[#E3B450]",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Limited access — no revenue data",
    icon: ShieldCheck,
    gradient: "from-[#6E2F2F] to-[#5A2424]",
    ring: "ring-[#6E2F2F]",
    bg: "bg-gradient-to-br from-[#FAF8F5] to-[#F2E9DE]",
    badge: "bg-[#6E2F2F] text-white",
    border: "border-[#6E2F2F]",
  },
];

export default function AdminLogin() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned invalid response");
      }

      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminRole", data.admin?.role || "admin");
      localStorage.setItem("adminName", data.admin?.name || "");

      toast.success(`Welcome back, ${data.admin?.name || "Admin"}!`);
      router.push("/admin");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FBF6ED] p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <Image
              src="/icon.png"
              alt="RVR Luxury Matrimony"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="font-playfair text-2xl font-bold text-[#2D2424]">
            Admin Panel
          </h1>
          <p className="text-sm text-stone-400 mt-1">RVR Luxury Matrimony</p>
        </div>

        {/* Role Selection (visual only) */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3 text-center">
            Select Role
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  data-testid={`role-card-${role.id}`}
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${role.bg} ${
                    isSelected
                      ? `${role.border} ring-2 ${role.ring} shadow-md scale-[1.02]`
                      : "border-transparent hover:border-stone-200 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-2.5 shadow-sm`}
                  >
                    <Icon size={17} className="text-white" />
                  </div>
                  <p className="font-bold text-[#2D2424] text-sm leading-tight">
                    {role.label}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-tight">
                    {role.description}
                  </p>
                  {isSelected && (
                    <span
                      className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${role.badge}`}
                    >
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded-2xl shadow-sm border border-[#F2E9DE]"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
            {selectedRole
              ? `Logging in as ${ROLES.find((r) => r.id === selectedRole)?.label}`
              : "Enter your credentials"}
          </p>

          <div className="space-y-3 mb-5">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              data-testid="admin-email-input"
              className="w-full text-gray-800 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#E3B450] text-sm bg-[#FAF8F5]"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                data-testid="admin-password-input"
                className="w-full text-gray-800 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#E3B450] text-sm bg-[#FAF8F5] pr-11"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-btn"
            className="w-full cursor-pointer py-3 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Verifying...
              </span>
            ) : (
              "Login to Admin Panel"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-stone-300 mt-4">
          RVR Luxury Matrimony · Admin Access Only
        </p>
      </div>
    </div>
  );
}
