"use client";
import { useRouter, usePathname } from "next/navigation";
import { useAdminContext } from "@/context/AdminContext";
import Image from "next/image";
import {
  LayoutDashboard, Users, CheckCircle2, Heart, AlertTriangle,
  Bell, MessageSquareText, Images, UserPlus, Crown, TrendingUp,
  Settings, ShieldCheck, LogOut, ChevronRight, UserCog, ScrollText,
} from "lucide-react";

const navItemBase =
  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group w-full text-left cursor-pointer";
const navItemActive = "bg-[#6E2F2F] text-white shadow-sm";
const navItemInactive =
  "text-stone-600 hover:bg-[#FBF6ED] hover:text-[#6E2F2F]";

function NavItem({ href, icon: Icon, label, active, superAdminOnly, isSuperAdmin }) {
  const router = useRouter();
  if (superAdminOnly && !isSuperAdmin) return null;
  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={`${navItemBase} ${active ? navItemActive : navItemInactive}`}
    >
      <Icon size={17} className={active ? "text-white" : "text-[#B08B4F] group-hover:text-[#6E2F2F]"} />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight size={14} className="text-white/70" />}
    </button>
  );
}

export default function AdminSidebar({ isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const { adminRole, adminName, isSuperAdmin, clearAdmin } = useAdminContext();

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const handleSignOut = () => {
    clearAdmin();
    router.push("/adminlogin");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header / Brand */}
      <div className="px-5 py-5 border-b border-[#F2E9DE]">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative h-10 w-10 shrink-0">
            <Image src="/icon.png" alt="RVR" fill className="object-contain" />
          </div>
          <div className="min-w-0">
            <p className="font-playfair font-bold text-[#2D2424] text-sm leading-tight truncate">
              RVR Luxury
            </p>
            <p className="text-xs text-stone-400">Admin Panel</p>
          </div>
        </div>
        {/* Role Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold w-fit ${
            isSuperAdmin
              ? "bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-white"
              : "bg-[#F2E9DE] text-[#6E2F2F]"
          }`}
        >
          {isSuperAdmin ? <Crown size={12} /> : <ShieldCheck size={12} />}
          {isSuperAdmin ? "Super Admin" : "Admin"}
        </div>
        {adminName && (
          <p className="text-xs text-stone-400 mt-1.5 truncate">{adminName}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {/* Always visible */}
        <p className="px-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-300">
          Main
        </p>
        <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" active={isActive("/admin")} isSuperAdmin={isSuperAdmin} />
        <NavItem href="/admin?section=users" icon={Users} label="Users" active={false} isSuperAdmin={isSuperAdmin} />
        <NavItem href="/admin/pending-verification" icon={CheckCircle2} label="KYC Verification" active={isActive("/admin/pending-verification")} isSuperAdmin={isSuperAdmin} />
        <NavItem href="/admin/matches" icon={Heart} label="Successful Matches" active={isActive("/admin/matches")} isSuperAdmin={isSuperAdmin} />
        <NavItem href="/admin/reported-profiles" icon={AlertTriangle} label="Reported Profiles" active={isActive("/admin/reported-profiles")} isSuperAdmin={isSuperAdmin} />
        <NavItem href="/admin/notifications" icon={Bell} label="Notifications" active={isActive("/admin/notifications")} isSuperAdmin={isSuperAdmin} />

        {/* Super Admin sections */}
        {isSuperAdmin && (
          <>
            <p className="px-4 pt-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-300">
              Business
            </p>
            <NavItem href="/admin/subscribers" icon={Crown} label="Subscribers" active={isActive("/admin/subscribers")} superAdminOnly isSuperAdmin={isSuperAdmin} />
            <NavItem href="/admin/contact-us" icon={MessageSquareText} label="Contact Queries" active={isActive("/admin/contact-us")} superAdminOnly isSuperAdmin={isSuperAdmin} />
            <NavItem href="/admin/add-user" icon={UserPlus} label="Add User" active={isActive("/admin/add-user")} superAdminOnly isSuperAdmin={isSuperAdmin} />

            <p className="px-4 pt-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-300">
              Content
            </p>
            <NavItem href="/admin/sliders" icon={Images} label="Dashboard Sliders" active={isActive("/admin/sliders")} superAdminOnly isSuperAdmin={isSuperAdmin} />
            <NavItem href="/admin/home-sliders" icon={Images} label="Homepage Sliders" active={isActive("/admin/home-sliders")} superAdminOnly isSuperAdmin={isSuperAdmin} />

            <p className="px-4 pt-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-300">
              System
            </p>
            <NavItem href="/admin/admins" icon={UserCog} label="Manage Admins" active={isActive("/admin/admins")} superAdminOnly isSuperAdmin={isSuperAdmin} />
            <NavItem href="/admin/audit-logs" icon={ScrollText} label="Audit Logs" active={isActive("/admin/audit-logs")} superAdminOnly isSuperAdmin={isSuperAdmin} />
          </>
        )}
      </nav>

      {/* Sign Out */}
      <div className="px-3 pb-5 pt-2 border-t border-[#F2E9DE]">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition w-full cursor-pointer"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-white border-r border-[#F2E9DE] shadow-sm flex-col z-30">
        {sidebarContent}
      </aside>

      {/* Mobile: slide-in drawer */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-[#F2E9DE] shadow-lg flex flex-col z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2E9DE]">
          <span className="font-playfair font-bold text-[#2D2424]">Menu</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#FBF6ED] text-stone-500" aria-label="Close sidebar">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
