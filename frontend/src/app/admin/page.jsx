"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  Filter,
  Images,
  MessageSquareText,
  UserPlus,
  X,
  Heart,
  ClipboardCheck,
  AlertTriangle,
  Crown,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import DashboardStats from "@/app/component/Admin/DashboardStats";
import CustomSelect from "@/app/component/Register/CustomSelect";
import ExportPanel from "@/app/component/Admin/ExportPanel";
import { useAdminContext } from "@/context/AdminContext";

const ACCOUNT_STATUS_OPTIONS = ["pending", "active", "suspended", "deleted"];
const ADMIN_STATUS_OPTIONS = ["pending", "approved", "rejected"];
const MEMBERSHIP_TYPE_OPTIONS = ["Free", "Gold", "Premium"];
const ACCOUNT_STATUS_SELECT_OPTIONS = ACCOUNT_STATUS_OPTIONS.map((option) => ({
  label: option.charAt(0).toUpperCase() + option.slice(1),
  value: option,
}));
const ADMIN_STATUS_SELECT_OPTIONS = ADMIN_STATUS_OPTIONS.map((option) => ({
  label: option.charAt(0).toUpperCase() + option.slice(1),
  value: option,
}));
const MEMBERSHIP_TYPE_SELECT_OPTIONS = MEMBERSHIP_TYPE_OPTIONS.map((option) => ({
  label: option,
  value: option,
}));

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { adminRole, adminName, isSuperAdmin } = useAdminContext();
  const initialSearchParam = searchParams.get("search") || "";
  const initialPageParam = Number(searchParams.get("page") || "1");
  const initialStatusParam = searchParams.get("status") || "";
  const initialApproveStatusParam = searchParams.get("approveStatus") || "";
  const initialMembershipTypeParam = searchParams.get("membershipType") || "";
  const initialPage =
    Number.isFinite(initialPageParam) && initialPageParam > 0
      ? initialPageParam
      : 1;

  const [users, setUsers] = useState([]);
  const [token, setToken] = useState(null);
  const [search, setSearch] = useState(initialSearchParam);
  const [statusFilter, setStatusFilter] = useState(initialStatusParam);
  const [approveStatusFilter, setApproveStatusFilter] = useState(
    initialApproveStatusParam,
  );
  const [membershipTypeFilter, setMembershipTypeFilter] = useState(
    initialMembershipTypeParam,
  );
  const [draftStatusFilter, setDraftStatusFilter] = useState(initialStatusParam);
  const [draftApproveStatusFilter, setDraftApproveStatusFilter] = useState(
    initialApproveStatusParam,
  );
  const [draftMembershipTypeFilter, setDraftMembershipTypeFilter] = useState(
    initialMembershipTypeParam,
  );
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSlidersOpen, setIsSlidersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  const getUserKey = (user) => user?.account?._id || user?.profile?._id || "";
  const getProfileId = (user) => user?.profile?._id || "";

  const fetchUsers = useCallback(
    async (authToken, options = {}) => {
      const {
        page: nextPage = 1,
        searchTerm = "",
        status = "",
        approveStatus = "",
        membershipType = "",
      } = options;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(nextPage));
        params.set("limit", String(PAGE_SIZE));

        if (searchTerm && searchTerm.trim()) {
          const trimmedSearch = searchTerm.trim();
          params.set("search", trimmedSearch);
          params.set("name", trimmedSearch);
        }

        if (status) {
          params.set("status", status);
        }

        if (approveStatus) {
          params.set("approveStatus", approveStatus);
        }

        if (membershipType) {
          params.set("membershipType", membershipType);
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          const nextUsers = data.data || [];
          setUsers(() => {
            const uniqueById = new Map();
            nextUsers.forEach((user) => {
              const key = getUserKey(user);
              if (!key || uniqueById.has(key)) return;
              uniqueById.set(key, user);
            });
            return Array.from(uniqueById.values());
          });
          setPage(data.currentPage || nextPage);
          setTotalPages(data.totalPages || 1);
        } else if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("adminToken");
          router.push("/adminlogin");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (!savedToken) {
      router.push("/adminlogin");
      return;
    }

    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (!token || page < 1) return;

    const handler = setTimeout(() => {
      fetchUsers(token, {
        page,
        searchTerm: search,
        status: statusFilter,
        approveStatus: approveStatusFilter,
        membershipType: membershipTypeFilter,
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [
    approveStatusFilter,
    fetchUsers,
    membershipTypeFilter,
    page,
    search,
    statusFilter,
    token,
  ]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));

    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    if (statusFilter) {
      params.set("status", statusFilter);
    }

    if (approveStatusFilter) {
      params.set("approveStatus", approveStatusFilter);
    }

    if (membershipTypeFilter) {
      params.set("membershipType", membershipTypeFilter);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [
    approveStatusFilter,
    membershipTypeFilter,
    page,
    pathname,
    router,
    search,
    statusFilter,
  ]);

  useEffect(() => {
    if (!isFilterDrawerOpen) {
      setDraftStatusFilter(statusFilter);
      setDraftApproveStatusFilter(approveStatusFilter);
      setDraftMembershipTypeFilter(membershipTypeFilter);
    }
  }, [
    approveStatusFilter,
    isFilterDrawerOpen,
    membershipTypeFilter,
    statusFilter,
  ]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setApproveStatusFilter("");
    setMembershipTypeFilter("");
    setDraftStatusFilter("");
    setDraftApproveStatusFilter("");
    setDraftMembershipTypeFilter("");
    setPage(1);
    setIsFilterDrawerOpen(false);
    router.replace(pathname, { scroll: false });
  };

  const handleApplyFilters = () => {
    setStatusFilter(draftStatusFilter);
    setApproveStatusFilter(draftApproveStatusFilter);
    setMembershipTypeFilter(draftMembershipTypeFilter);
    setPage(1);
    setIsFilterDrawerOpen(false);
  };

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("adminToken");
    router.push("/adminlogin");
  }, [router]);

  const handleDashboardNavigate = (section, params = {}) => {
    switch (section) {
      case "users":
        if (params.status) {
          setStatusFilter(params.status);
          setPage(1);
        }
        break;
      case "matches":
        router.push("/admin/matches");
        break;
      case "pending-verification":
        router.push("/admin/pending-verification");
        break;
      case "reported-profiles":
        router.push("/admin/reported-profiles");
        break;
      case "subscribers":
        const sp = new URLSearchParams();
        if (params.planName) sp.set("planName", params.planName);
        if (params.boostType) sp.set("boostType", params.boostType);
        if (params.membershipType) sp.set("membershipType", params.membershipType);
        router.push(`/admin/subscribers?${sp.toString()}`);
        break;
      case "revenue":
        // Scroll to revenue section (already visible in dashboard)
        break;
      default:
        break;
    }
  };

  const activeFilterCount = [
    statusFilter,
    approveStatusFilter,
    membershipTypeFilter,
  ].filter(Boolean).length;

  if (loading && !token) {
    return <div className="p-10 text-center">Authenticating session...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 font-sans md:p-8" data-testid="admin-dashboard">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 md:h-14 md:w-14">
            <Image
              src="/icon.png"
              alt="RVR Luxury Matrimony"
              fill
              className="object-contain object-center md:object-left"
            />
          </div>
          <div>
            <h1 className="font-playfair text-3xl font-bold text-[#2D2424]">
              Admin Dashboard
            </h1>
            <p className="text-gray-500">
              {adminName ? `Welcome back, ${adminName}` : "Review and manage your platform"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/add-user")}
            data-testid="add-user-btn"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D7C2A7] px-4 py-2 font-semibold text-[#6E2F2F] transition hover:bg-[#FBF6ED]"
          >
            <UserPlus size={16} />
            Add User
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/matches")}
            data-testid="matches-nav-btn"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D7C2A7] px-4 py-2 font-semibold text-[#6E2F2F] transition hover:bg-[#FBF6ED]"
          >
            <Heart size={16} />
            Matches
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/contact-us")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D7C2A7] px-4 py-2 font-semibold text-[#6E2F2F] transition hover:bg-[#FBF6ED]"
          >
            <MessageSquareText size={16} />
            Contact Queries
          </button>
          <div className="relative">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D7C2A7] px-4 py-2 font-semibold text-[#6E2F2F] transition hover:bg-[#FBF6ED]"
              onClick={() => setIsSlidersOpen(!isSlidersOpen)}
            >
              <Images size={16} />
              Sliders
              <svg className={`w-4 h-4 transition-transform ${isSlidersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isSlidersOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#D7C2A7] rounded-xl shadow-lg z-50">
                <button
                  onClick={() => {
                    router.push('/admin/sliders');
                    setIsSlidersOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-semibold text-[#6E2F2F] hover:bg-[#FBF6ED] rounded-t-xl"
                >
                  Dashboard Sliders
                </button>
                <button
                  onClick={() => {
                    router.push('/admin/home-sliders');
                    setIsSlidersOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-semibold text-[#6E2F2F] hover:bg-[#FBF6ED] rounded-b-xl"
                >
                  Homepage Sliders
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/notifications")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D7C2A7] px-4 py-2 font-semibold text-[#6E2F2F] transition hover:bg-[#FBF6ED]"
          >
            <Bell size={16} />
            Notifications
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/adminlogin");
            }}
            data-testid="sign-out-btn"
            className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-6 py-2 font-semibold text-red-600 transition hover:bg-red-100"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Enhanced Dashboard Stats */}
      <DashboardStats token={token} onUnauthorized={handleUnauthorized} onNavigate={handleDashboardNavigate} role={adminRole} />

      {/* Users Table */}
      <div className="rounded-2xl border border-[#F2E9DE] bg-white p-6 shadow-sm" data-testid="users-table-section">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2D2424] font-playfair">All Users</h2>
        </div>
        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Search by name, email or phone number..."
              className="w-full rounded-full border border-gray-200 p-3 pl-5 text-gray-800 outline-none transition focus:ring-2 focus:ring-[#E3B450]"
              value={search}
              data-testid="users-search-input"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              data-testid="filter-btn"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-gray-50"
            >
              <Filter size={16} />
              Filters
              {activeFilterCount > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6E2F2F] px-1.5 text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              data-testid="reset-filters-btn"
              className="cursor-pointer rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#FBF6ED] text-sm uppercase tracking-wider text-[#6E2F2F]">
                <th className="rounded-l-xl p-4">User Details</th>
                <th className="p-4">Membership</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Approve Status</th>
                <th className="rounded-r-xl p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">
                    Loading user data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400" data-testid="users-empty">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const profileId = getProfileId(user);

                  return (
                    <tr
                      key={
                        user.account?._id ||
                        user.profile?._id ||
                        `user-row-${index}`
                      }
                      className="border-b border-gray-50 transition hover:bg-gray-50"
                      data-testid={`user-row-${user.account?._id || index}`}
                    >
                      <td className="p-4">
                        <div className="font-bold text-[#2D2424]">
                          {user.profile?.fullName || "Profile Incomplete"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.account?.email || user.account?.phone || "-"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.profile?.membershipType === "Premium"
                              ? "bg-[#FBF6ED] text-[#6E2F2F]"
                              : user.profile?.membershipType === "Gold"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.profile?.membershipType || "Free"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.account?.accountStatus === "active"
                              ? "bg-green-100 text-green-700"
                              : user.account?.accountStatus === "suspended"
                                ? "bg-red-100 text-red-700"
                                : user.account?.accountStatus === "deleted"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {user.account?.accountStatus || "pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.profile?.adminStatus === "approved"
                              ? "bg-green-100 text-green-700"
                              : user.profile?.adminStatus === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {user.profile?.adminStatus || "pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() =>
                            profileId && router.push(`/admin/user/${profileId}`)
                          }
                          disabled={!profileId}
                          data-testid={`view-user-${user.account?._id || index}`}
                          className="cursor-pointer font-semibold text-[#B08B4F] hover:underline disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page {page} of {Math.max(totalPages, 1)}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              data-testid="users-prev-btn"
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((prev) => Math.min(Math.max(totalPages, 1), prev + 1))
              }
              data-testid="users-next-btn"
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Export Users Panel */}
      {isSuperAdmin && <ExportPanel token={token} />}

      {isFilterDrawerOpen ? (
        <div className="fixed inset-0 z-[998]">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F2E9DE] px-5 py-4">
              <h3 className="text-lg font-semibold text-[#2D2424]">
                Filter Users
              </h3>

              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-50"
                aria-label="Close filters"
                data-testid="close-filter-drawer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#2D2424]">
                  Account Status
                </label>
                <CustomSelect
                  options={ACCOUNT_STATUS_SELECT_OPTIONS}
                  value={draftStatusFilter}
                  onChange={(selectedOption) =>
                    setDraftStatusFilter(selectedOption?.value || "")
                  }
                  placeholder="All account status"
                  isSearchable={false}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#2D2424]">
                  Approve Status
                </label>
                <CustomSelect
                  options={ADMIN_STATUS_SELECT_OPTIONS}
                  value={draftApproveStatusFilter}
                  onChange={(selectedOption) =>
                    setDraftApproveStatusFilter(selectedOption?.value || "")
                  }
                  placeholder="All approval status"
                  isSearchable={false}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#2D2424]">
                  Membership Type
                </label>
                <CustomSelect
                  options={MEMBERSHIP_TYPE_SELECT_OPTIONS}
                  value={draftMembershipTypeFilter}
                  onChange={(selectedOption) =>
                    setDraftMembershipTypeFilter(selectedOption?.value || "")
                  }
                  placeholder="All membership types"
                  isSearchable={false}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-[#F2E9DE] px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setDraftStatusFilter("");
                  setDraftApproveStatusFilter("");
                  setDraftMembershipTypeFilter("");
                }}
                className="flex-1 cursor-pointer rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                data-testid="apply-filters-btn"
                className="flex-1 cursor-pointer rounded-full bg-[#2D5F3F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#244B33]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
