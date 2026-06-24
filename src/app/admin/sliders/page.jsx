"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Loader2, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

const initialForm = {
  image: "",
  isActive: true,
  order: 0,
};

const formatDate = (value) => {
  if (!value) return "-";

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

export default function AdminSlidersPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (!savedToken) {
      router.push("/adminlogin");
      return;
    }

    setToken(savedToken);
  }, [router]);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("adminToken");
    router.push("/adminlogin");
  }, [router]);

  const fetchSliders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sliders`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch sliders.");
      }

      setSliders(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err?.message || "Failed to fetch sliders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSliders();
  }, [fetchSliders]);

  const openCreateModal = () => {
    setEditingSlider(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (slider) => {
    setEditingSlider(slider);
    setForm({
      image: slider?.image || "",
      isActive:
        typeof slider?.isActive === "boolean" ? slider.isActive : true,
      order:
        typeof slider?.order === "number"
          ? slider.order
          : Number(slider?.order || 0),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setEditingSlider(null);
    setForm(initialForm);
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const uploadImages = useCallback(
    async (files) => {
      if (!token) {
        toast.error("Admin session expired. Please login again.");
        router.push("/adminlogin");
        throw new Error("Unauthorized");
      }

      const uploadData = new FormData();
      files.slice(0, 5).forEach((file) => uploadData.append("images", file));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/photos/upload-photos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        },
      );

      const responseData = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleUnauthorized();
          throw new Error("Unauthorized");
        }

        throw new Error(responseData?.message || "Photo upload failed");
      }

      const photos = responseData?.photos || responseData?.data?.photos || [];
      const urls = Array.isArray(photos)
        ? photos.map((photo) => photo?.url).filter(Boolean)
        : [];

      if (!urls.length) {
        throw new Error("No uploaded URL returned from server");
      }

      return urls;
    },
    [handleUnauthorized, router, token],
  );

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploadingImage(true);

    try {
      const [url] = await uploadImages([file]);
      updateForm("image", url);
      toast.success("Slider image uploaded successfully.");
    } catch (err) {
      if (err?.message !== "Unauthorized") {
        toast.error(err?.message || "Failed to upload slider image.");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const payload = useMemo(
    () => ({
      image: form.image.trim(),
      isActive: Boolean(form.isActive),
      order: Number.isNaN(Number(form.order)) ? 0 : Number(form.order),
    }),
    [form],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Admin session expired. Please login again.");
      router.push("/adminlogin");
      return;
    }

    if (!payload.image) {
      toast.error("Image is required.");
      return;
    }

    setSubmitting(true);

    try {
      const isEdit = Boolean(editingSlider?._id);
      const endpoint = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/sliders/${editingSlider._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/sliders`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleUnauthorized();
          return;
        }

        throw new Error(data?.message || "Failed to save slider.");
      }

      toast.success(
        isEdit ? "Slider updated successfully." : "Slider created successfully.",
      );
      closeModal();
      fetchSliders();
    } catch (err) {
      toast.error(err?.message || "Failed to save slider.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sliderId) => {
    if (!sliderId || !token) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this slider?",
    );
    if (!confirmed) return;

    setDeletingId(sliderId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sliders/${sliderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleUnauthorized();
          return;
        }

        throw new Error(data?.message || "Failed to delete slider.");
      }

      toast.success("Slider deleted successfully.");
      setSliders((prev) => prev.filter((item) => item?._id !== sliderId));
    } catch (err) {
      toast.error(err?.message || "Failed to delete slider.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-[#EEE4D8] bg-white p-5 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-[#2D2424]">
              Dashboard Slider Management
            </h1>
            <p className="text-gray-500">
              Add, edit and remove dashboard sliders from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#2D5F3F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#244B33]"
          >
            <Plus size={16} />
            Add Dashboard Slider
          </button>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-full border border-[#D7C2A7] px-4 py-2 text-sm font-semibold text-[#6E2F2F] transition hover:bg-[#FBF6ED] cursor-pointer"
            >
              Home
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#2D5F3F]" />
          </div>
        ) : sliders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E7DCCF] bg-[#FCFAF7] px-6 py-16 text-center">
            <p className="font-playfair text-lg text-[#2D2424]">
              No sliders added yet
            </p>
            <p className="mt-2 text-sm text-stone-500">
              Create your first slider to start managing homepage banners.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#F2E9DE]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FBF6ED] text-sm uppercase tracking-wider text-[#6E2F2F]">
                  <th className="p-4">Preview</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sliders.map((slider, index) => (
                  <tr
                    key={slider?._id || `slider-${index}`}
                    className="border-b border-gray-50 align-top transition hover:bg-gray-50"
                  >
                    <td className="p-4">
                      {slider?.image ? (
                        <img
                          src={slider.image}
                          alt={`Slider ${index + 1}`}
                          className="h-20 w-32 rounded-xl border border-[#F2E9DE] object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-32 items-center justify-center rounded-xl border border-dashed border-[#E7DCCF] bg-[#FCFAF7] text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">
                      {slider?.order ?? 0}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          slider?.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {slider?.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(slider?.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(slider)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D7C2A7] px-3 py-2 text-sm font-semibold text-[#6E2F2F] transition hover:bg-[#FBF6ED]"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(slider?._id)}
                          disabled={deletingId === slider?._id}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={14} />
                          {deletingId === slider?._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[999]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="absolute inset-0 overflow-y-auto p-4">
            <div className="flex min-h-full items-center justify-center">
            <div
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#EADFD1] bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#F2E9DE] px-5 py-4">
                <div>
              <h2 className="text-xl font-bold text-[#2D2424]">
                {editingSlider ? "Edit Dashboard Slider" : "Add Dashboard Slider"}
              </h2>
              <p className="text-sm text-gray-500">
                Fill in the dashboard slider details below.
              </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-50"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-5 md:p-6"
              >
                <div className="space-y-5">
                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-[#5D2E26]">
                      Slider Image *
                    </label>
                    <div className="rounded-xl border border-dashed border-[#D9D5CF] bg-[#FCFAF7] p-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          handleImageUpload(event.target.files?.[0])
                        }
                        className="w-full rounded-xl border border-[#D9D5CF] bg-white px-3 py-2 text-gray-800"
                        required
                      />
                      <p className="mt-2 text-xs text-stone-500">
                        Upload an image and we will use its URL automatically.
                      </p>
                      {uploadingImage ? (
                        <p className="mt-1 text-xs text-[#2D5F3F]">
                          Uploading...
                        </p>
                      ) : null}
                      {form.image ? (
                        <p className="mt-1 break-all text-xs text-green-700">
                          {form.image}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-[#5D2E26]">
                        Order
                      </label>
                      <input
                        type="number"
                        value={form.order}
                        onChange={(event) => updateForm("order", event.target.value)}
                        className="w-full rounded-xl border border-[#D9D5CF] bg-white px-3 py-2.5 text-gray-800 outline-none focus:ring-2 focus:ring-[#E3B450]"
                        placeholder="0"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="inline-flex items-center gap-2 rounded-xl border border-[#D9D5CF] px-4 py-3 text-sm font-medium text-gray-700 w-full justify-center md:justify-start">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(event) =>
                            updateForm("isActive", event.target.checked)
                          }
                        />
                        Active slider
                      </label>
                    </div>
                  </div>
                </div>

                {form.image ? (
                  <div className="rounded-2xl border border-[#F2E9DE] bg-[#FCFAF7] p-4">
                    <p className="mb-3 text-sm font-semibold text-[#2D2424]">
                      Preview
                    </p>
                    <img
                      src={form.image}
                      alt="Slider preview"
                      className="h-52 w-full rounded-2xl object-cover"
                    />
                  </div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 border-t border-[#F2E9DE] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="cursor-pointer rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-stone-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="cursor-pointer rounded-full bg-[#2D5F3F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#244B33] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploadingImage
                      ? "Uploading Image..."
                      : submitting
                      ? editingSlider
                        ? "Updating..."
                        : "Creating..."
                      : editingSlider
                        ? "Update Slider"
                        : "Create Slider"}
                  </button>
                </div>
                </div>
              </form>
            </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
