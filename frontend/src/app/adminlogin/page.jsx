"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Crown, ShieldCheck, Loader2 } from "lucide-react";

const ROLES = [
  {
    id: "super_admin",
    label: "Super Admin",
    description: "Full access — dashboard, revenue, users, audit logs & admin management",
    icon: Crown,
    gradient: "from-[#E3B450] to-[#CAA043]",
    ring: "ring-[#E3B450]",
    bg: "bg-gradient-to-br from-[#FBF6ED] to-[#F5E8C8]",
    badge: "bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-white",
    border: "border-[#E3B450]",
    hoverBorder: "hover:border-[#E3B450]",
    hoverRing: "hover:ring-[#E3B450]",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Limited access — user management, verifications & reports only",
    icon: ShieldCheck,
    gradient: "from-[#6E2F2F] to-[#5A2424]",
    ring: "ring-[#6E2F2F]",
    bg: "bg-gradient-to-br from-[#FAF8F5] to-[#F2E9DE]",
    badge: "bg-[#6E2F2F] text-white",
    border: "border-[#6E2F2F]",
    hoverBorder: "hover:border-[#6E2F2F]",
    hoverRing: "hover:ring-[#6E2F2F]",
  },
];

export default function AdminLogin() {
  const [loading, setLoading] = useState(null);
  const router = useRouter();

  const handleRoleLogin = async (role) => {
    if (loading) return;
    setLoading(role.id);
    try {
      const res = await fetch("/api/admin/role-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminRole", data.admin?.role || "admin");
      localStorage.setItem("adminName", data.admin?.name || "");

      toast.success(`Welcome, ${data.admin?.name || role.label}!`);
      router.push("/admin");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FBF6ED] p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
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

        {/* Role Selection */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 text-center">
            Select your role to login
          </p>

          {ROLES.map((role) => {
            const Icon = role.icon;
            const isLoading = loading === role.id;
            const isDisabled = loading !== null;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleLogin(role)}
                disabled={isDisabled}
                data-testid={`role-card-${role.id}`}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left
                  transition-all duration-200
                  ${role.bg}
                  ${isLoading
                    ? `${role.border} ring-2 ${role.ring} shadow-md`
                    : `border-transparent ${role.hoverBorder} hover:ring-2 ${role.hoverRing} hover:shadow-md hover:scale-[1.01]`
                  }
                  ${isDisabled && !isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-sm`}
                >
                  {isLoading ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <Icon size={20} className="text-white" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#2D2424] text-sm">
                      {role.label}
                    </p>
                    {isLoading && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role.badge}`}
                      >
                        Signing in...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                    {role.description}
                  </p>
                </div>

                {/* Arrow */}
                {!isLoading && (
                  <svg
                    className="flex-shrink-0 w-4 h-4 text-stone-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-stone-300 mt-6">
          RVR Luxury Matrimony · Admin Access Only
        </p>
      </div>
    </div>
  );
}
