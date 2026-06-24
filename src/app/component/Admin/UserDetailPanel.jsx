"use client";

import { useEffect, useState } from "react";
import { CircleCheckBig, ExternalLink, FileText, X } from "lucide-react";

export default function UserDetailPanel({
  user,
  remarks,
  onRemarksChange,
  onVerify,
  onAccountStatusChange,
  showBackButton = false,
  onBack,
}) {
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!previewImage) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [previewImage]);

  const formatLabel = (key) => {
    if (key === "verificationSelfieUrl") {
      return "Verification Selfie";
    }
    if (key === "idProofUrl") {
      return "Id Proof";
    }

    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const isLikelyDateString = (value) =>
    typeof value === "string" &&
    !Number.isNaN(Date.parse(value)) &&
    (/^\d{4}-\d{2}-\d{2}/.test(value) || value.includes("T"));

  const formatDateString = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isImageUrl = (value) =>
    typeof value === "string" &&
    /^(https?:\/\/).+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(value);

  const isDocumentUrl = (value) =>
    typeof value === "string" &&
    /^(https?:\/\/).+\.(pdf|doc|docx)(\?.*)?$/i.test(value);

  const getFileLabel = (value) => {
    if (typeof value !== "string") return "Document";
    const match = value.match(/\.([a-z0-9]+)(?:\?|#|$)/i);
    return match?.[1] ? match[1].toUpperCase() : "Document";
  };

  const shouldHideField = (key) => {
    const normalizedKey = String(key).trim().toLowerCase();
    return (
      normalizedKey === "_id" ||
      normalizedKey === "__v" ||
      normalizedKey === "v" ||
      normalizedKey === "password"
    );
  };

  const renderValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-400 italic">N/A</span>;
    }

    if (typeof value === "boolean") {
      return <span>{value ? "Yes" : "No"}</span>;
    }

    if (typeof value === "string") {
      if (isLikelyDateString(value)) {
        return <span>{formatDateString(value)}</span>;
      }

      if (isImageUrl(value)) {
        return (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {value}
          </a>
        );
      }

      return <span className="break-all">{value}</span>;
    }

    if (typeof value === "number") {
      return <span>{value}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">N/A</span>;
      }

      const hasObjectItems = value.some(
        (item) => item && typeof item === "object" && !Array.isArray(item),
      );

      if (!hasObjectItems) {
        return (
          <div className="flex flex-wrap gap-2">
            {value.map((item, index) => (
              <span
                key={index}
                className="rounded-full border border-[#E7D7C6] bg-white px-3 py-1 text-xs font-medium text-[#2D2424] shadow-sm"
              >
                {String(item)}
              </span>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs"
            >
              {typeof item === "object" ? (
                <div className="space-y-1">
                  {Object.entries(item)
                    .filter(([key]) => !shouldHideField(key))
                    .map(([key, nestedValue]) => (
                      <div key={key} className="flex gap-2">
                        <span className="min-w-[90px] text-gray-500">
                          {formatLabel(key)}:
                        </span>
                        <div className="flex-1 text-gray-800">
                          {renderValue(nestedValue)}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <span>{String(item)}</span>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="space-y-1">
          {Object.entries(value)
            .filter(([key]) => !shouldHideField(key))
            .map(([key, nestedValue]) => (
              <div key={key} className="flex gap-2">
                <span className="min-w-[90px] text-gray-500">
                  {formatLabel(key)}:
                </span>
                <div className="flex-1 text-gray-800">
                  {renderValue(nestedValue)}
                </div>
              </div>
            ))}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  const renderProfileFieldValue = (key, value) => {
    if (
      (key === "idProofUrl" || key === "verificationSelfieUrl") &&
      typeof value === "string" &&
      value
    ) {
      if (isImageUrl(value)) {
        return (
          <img
            src={value}
            alt={key}
            onClick={() => setPreviewImage(value)}
            role="button"
            className="h-32 w-32 cursor-zoom-in rounded-xl border border-gray-200 object-cover shadow-sm"
          />
        );
      }

      if (isDocumentUrl(value)) {
        return (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#2D2424] transition hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm">
              <FileText size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">{getFileLabel(value)}</span>
              <span className="text-xs text-gray-500">Open document</span>
            </div>
            <ExternalLink size={16} className="text-gray-500" />
          </a>
        );
      }

      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline break-all"
        >
          Open file
          <ExternalLink size={14} />
        </a>
      );
    }

    return renderValue(value);
  };

  const membershipType = user?.profile?.membershipType;
  const isHighlightedMembership =
    membershipType === "Gold" || membershipType === "Premium";
  const membershipHighlightClass =
    membershipType === "Gold"
      ? "border-yellow-200 bg-gradient-to-r from-yellow-50 via-amber-50 to-white text-yellow-800"
      : "border-[#D7C2A7] bg-gradient-to-r from-[#FBF6ED] via-white to-[#F5EEE3] text-[#6E2F2F]";

  return (
    <>
      <div className="rounded-2xl border border-[#F2E9DE] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 border-b border-[#F2E9DE] pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#2D2424]">
              {user?.profile?.fullName || "Profile Incomplete"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Profile ID: {user?.profile?._id || "N/A"}
            </p>
          </div>

          {showBackButton ? (
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-[#D7C2A7] px-4 py-2 text-sm font-semibold text-[#6E2F2F] transition hover:bg-[#FBF6ED] cursor-pointer"
            >
              Back to Users
            </button>
          ) : null}
        </div>

        {isHighlightedMembership ? (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 shadow-sm ${membershipHighlightClass}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
              Membership
            </p>
            <p className="mt-1 text-lg font-bold">{membershipType} Member</p>
          </div>
        ) : null}

        {user?.profile?.adminStatus === "approved" ? (
          <div className="mb-4 flex items-center rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <CircleCheckBig size={16} className="mr-1" /> This profile is
            approved.
          </div>
        ) : null}

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs uppercase text-gray-400">
              User Account Details
            </p>
            <div className="space-y-2 rounded-xl border border-[#F2E9DE] bg-[#FBF6ED] p-3">
              {Object.entries(user?.account || {})
                .filter(([key]) => !shouldHideField(key))
                .map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2 text-sm">
                    <span className="min-w-[120px] text-gray-500">
                      {formatLabel(key)}:
                    </span>
                    <div className="flex-1 font-medium text-[#2D2424]">
                      {renderValue(value)}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase text-gray-400">
              Gallery Images
            </p>
            <div className="flex flex-wrap gap-2">
              {user?.profile?.profilePhotos?.length > 0 ? (
                user.profile.profilePhotos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.url}
                    alt="User Upload"
                    onClick={() => setPreviewImage(photo.url)}
                    role="button"
                    className="h-20 w-20 cursor-zoom-in rounded-xl border border-gray-100 object-cover shadow-sm"
                  />
                ))
              ) : (
                <div className="w-full rounded-xl bg-gray-50 p-4 text-center text-sm italic text-gray-400">
                  No images available
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase text-gray-400">
              Profile Model Details
            </p>
            <div className="space-y-2 rounded-xl border border-[#F2E9DE] bg-[#FBF6ED] p-3">
              {user?.profile === "No profile created yet" ? (
                <div className="text-sm font-medium text-[#2D2424]">
                  {user.profile}
                </div>
              ) : (
                Object.entries(user?.profile || {})
                  .filter(
                    ([key]) => key !== "profilePhotos" && !shouldHideField(key),
                  )
                  .map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2 text-sm">
                      <span className="min-w-[120px] text-gray-500">
                        {formatLabel(key)}:
                      </span>
                      <div className="flex-1 font-medium text-[#2D2424]">
                        {renderProfileFieldValue(key, value)}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {user?.profile?.adminStatus !== "approved" ? (
          <>
            <div className="mb-6 mt-6">
              <label className="mb-2 block text-xs uppercase text-gray-400">
                Internal Remarks
              </label>
              <textarea
                className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-[#E3B450]"
                rows="3"
                placeholder="State the reason for approval or rejection..."
                value={remarks}
                onChange={(event) => onRemarksChange(event.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onVerify(user?.profile?._id, "approved")}
                className="flex-1 cursor-pointer rounded-full bg-[#2D5F3F] px-4 py-3 font-bold text-white transition hover:bg-[#244B33]"
              >
                Approve
              </button>
              <button
                onClick={() => onVerify(user?.profile?._id, "rejected")}
                className="flex-1 cursor-pointer rounded-full border-2 border-red-500 px-4 py-3 font-bold text-red-500 transition hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          </>
        ) : null}

        {user?.account?.accountStatus === "active" ? (
          <button
            type="button"
            onClick={() =>
              onAccountStatusChange(user?.account?._id, "suspended")
            }
            className="mt-3 w-full cursor-pointer rounded-full border-2 border-red-500 px-4 py-3 font-bold text-red-500 transition hover:bg-red-50"
          >
            Block User
          </button>
        ) : null}

        {user?.account?.accountStatus === "suspended" ? (
          <button
            type="button"
            onClick={() => onAccountStatusChange(user?.account?._id, "active")}
            className="mt-3 w-full cursor-pointer rounded-full bg-[#2D5F3F] px-4 py-3 font-bold text-white transition hover:bg-[#244B33]"
          >
            Active User
          </button>
        ) : null}
      </div>

      {previewImage ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm md:p-8"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 bg-[#FAF8F5] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-[#2D2424]">
                  Image Preview
                </h3>
                <p className="text-xs text-gray-500">Press Esc to close</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  Open
                  <ExternalLink size={14} />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-50"
                  aria-label="Close image preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex min-h-[300px] items-center justify-center bg-[#0F172A] p-4 md:p-6">
              <img
                src={previewImage}
                alt="Preview"
                className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
