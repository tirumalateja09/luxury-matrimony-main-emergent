"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { City, Country, State } from "country-state-city";
import Image from "next/image";
import { DayPicker } from "react-day-picker";
import { Upload } from "lucide-react";
import CustomSelect from "@/app/component/Register/CustomSelect";
import "react-day-picker/style.css";
import {
  DEGREE_OPTIONS,
  FAMILY_STATUS_OPTIONS,
  HEIGHT_OPTIONS,
  INCOME_SLABS,
  NAKSHATRA_OPTIONS,
  RASHI_OPTIONS,
  RELIGION_OPTIONS,
  PHYSICAL_STATUS_OPTIONS,
  PROFESSION_OPTIONS,
  allTongues,
  CASTES_BY_RELIGION,
} from "@/lib/constants";

const MARITAL_STATUS_OPTIONS = [
  "Never Married",
  "Awaiting Divorce",
  "Divorced",
  "Widowed",
  "Annulled",
];
const GENDER_OPTIONS = ["Male", "Female"];
const PROFILE_CREATED_FOR_OPTIONS = ["Myself", "Daughter", "Son", "Sister", "Brother", "Relative", "Friend"];
const EDUCATION_OPTIONS = [
  "Doctorate",
  "Post graduate/Master's",
  "Graduate/Bachelor's",
  "Diploma/Certifications",
  "Class XII",
  "Class X or below",
];
const FAMILY_TYPE_OPTIONS = ["Nuclear", "Joint"];
const MANGALIK_OPTIONS = ["Yes", "No", "Anshik"];
const DIET_OPTIONS = ["Veg", "Non-Veg", "Eggetarian", "Vegan", "Jain"];
const ACCOUNT_STATUS_OPTIONS = ["active", "inactive"];

const initialForm = {
  email: "",
  phone: "",
  accountStatus: "active",
  profile: {
    fullName: "",
    dob: "",
    height: "",
    gender: "",
    physicalStatus: "Normal",
    numberOfChildren: "",
    childrenLivingTogether: "",
    maritalStatus: "",
    diet: "",
    profileCreatedFor: "",
    language: "",
    motherTongue: "",
    religion: "",
    community: "",
    subCommunity: "",
    bio: "",
    aboutFamily: "",
    fathersOccupation: "",
    mothersOccupation: "",
    brothers: "",
    sisters: "",
    marriedSiblings: "",
    familyIncomeRange: "",
    familyStatus: "",
    familyType: "",
    drinkingHabits: "",
    smokingHabits: "",
    openToPets: "No",
    ownHouse: "No",
    ownCar: "No",
    hobbies: "",
    interests: "",
    country: "",
    state: "",
    city: "",
    citizenship: "",
    residentStatus: "",
    highestEducation: "",
    degree: "",
    profession: "",
    aboutCareer: "",
    describeMe: "",
    annualIncome: "",
    companyName: "",
    rashi: "",
    nakshatra: "",
    gothram: "",
    birthTime: "",
    birthPlace: "",
    manglik: "",
    idProofUrl: "",
    verificationSelfieUrl: "",
    adminRemarks: "",
    profilePhotos: [
      { url: "", isMain: true },
      { url: "", isMain: false },
    ],
  },
};

const exampleCsv = `email,phone,accountStatus,fullName,dob,height,gender,maritalStatus,diet,profileCreatedFor,language,motherTongue,religion,community,subCommunity,country,state,city,highestEducation,degree,profession,annualIncome,companyName,rashi,nakshatra,gothram,birthTime,birthPlace,manglik,idProofUrl,verificationSelfieUrl,adminRemarks,profilePhotos
ramesh.sharma101@example.com,9876500020,active,Ramesh Sharma,1998-05-20,165,Male,Never Married,Veg,Myself,English,Hindi,Hindu,Brahmin,Saryuparin,IN,RJ,Jaipur,Graduate/Bachelor's,B.Tech. - Bachelor of Technology,Software Professional,Rs 2 Lakhs to 3 Lakhs,Infosys,Vrishabha (Taurus),Ashwini,Kashyap,10:30 AM,Pune,No,https://randomuser.me/api/portraits/women/26.jpg,https://randomuser.me/api/portraits/women/21.jpg,Imported by admin,https://randomuser.me/api/portraits/women/25.jpg`;

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  isMandatory = false,
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-[#5D2E26]">
        {label}
        {isMandatory && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#D9D5CF] text-gray-800 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E3B450]"
      />
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
  placeholder = "Select DOB",
  isMandatory = false,
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getParsedDate = (dateStr) => {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const handleDateSelect = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange("");
    }
    setIsCalendarOpen(false);
  };

  const displayDate = value
    ? getParsedDate(value)?.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) || ""
    : "";

  return (
    <div className="space-y-1 relative" ref={calendarRef}>
      <label className="text-sm font-semibold text-[#5D2E26]">
        {label}
        {isMandatory && <span className="text-red-500 ml-1">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsCalendarOpen((prev) => !prev)}
        className="w-full rounded-full border border-[#D9D5CF] bg-white px-6 py-4 text-left text-gray-800 outline-none transition-colors hover:border-[#5D2E26] focus:border-[#5D2E26]"
      >
        <span className={displayDate ? "text-gray-800" : "text-[#888888]"}>
          {displayDate || placeholder}
        </span>
      </button>
      {isCalendarOpen && (
        <div className="absolute left-0 top-full z-20 mt-2 rounded-3xl border border-gray-200 bg-white p-4 shadow-xl">
          <DayPicker
            mode="single"
            selected={value ? getParsedDate(value) : undefined}
            onSelect={handleDateSelect}
            defaultMonth={value ? getParsedDate(value) : new Date(2000, 0)}
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear()}
            style={{
              "--rdp-accent-color": "#2A1D1D",
              "--rdp-accent-background-color": "#e0e7ff",
            }}
          />
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  isMandatory = false,
  allowOther = false,
  otherPlaceholder = "Write here",
  disabled = false,
}) {
  const normalizedBaseOptions = options.map((opt) =>
    typeof opt === "object" ? opt : { value: opt, label: opt },
  );
  const normalizedOptionValues = normalizedBaseOptions.map((opt) => String(opt.value));
  const isCustomValue = allowOther && value && !normalizedOptionValues.includes(String(value));
  const [showOtherInput, setShowOtherInput] = useState(isCustomValue);
  const normalizedOptions = allowOther
    ? [...normalizedBaseOptions, { value: "__other__", label: "Other" }]
    : normalizedBaseOptions;

  useEffect(() => {
    if (!allowOther) return;
    setShowOtherInput(Boolean(isCustomValue));
  }, [allowOther, isCustomValue]);

  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-[#5D2E26]">
        {label}
        {isMandatory && <span className="text-red-500 ml-1">*</span>}
      </label>
      <CustomSelect
        options={normalizedOptions}
        value={
          isCustomValue
            ? normalizedOptions.find((opt) => opt.value === "__other__") || null
            : normalizedOptions.find((opt) => String(opt.value) === String(value)) || null
        }
        onChange={(selected) => {
          if (allowOther && selected?.value === "__other__") {
            setShowOtherInput(true);
            onChange("");
            return;
          }
          setShowOtherInput(false);
          onChange(selected?.value ?? "");
        }}
        placeholder={placeholder}
        disabled={disabled}
      />
      {allowOther && showOtherInput && (
        <input
          type="text"
          value={isCustomValue ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={otherPlaceholder}
          className="w-full rounded-xl border border-[#D9D5CF] text-gray-800 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E3B450]"
        />
      )}
    </div>
  );
}

function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  isMandatory = false,
  disabled = false,
}) {
  const normalizedOptions = options.map((opt) =>
    typeof opt === "object" ? opt : { value: opt, label: opt },
  );

  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-[#5D2E26]">
        {label}
        {isMandatory && <span className="text-red-500 ml-1">*</span>}
      </label>
      <CustomSelect
        options={normalizedOptions}
        value={normalizedOptions.find((opt) => String(opt.value) === String(value)) || null}
        onChange={(selected) => onChange(selected?.value ?? "")}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

const extractUploadedUrls = (responseData) => {
  const photos = responseData?.photos || responseData?.data?.photos || [];
  if (!Array.isArray(photos)) return [];
  return photos.map((photo) => photo?.url).filter(Boolean);
};

export default function AddUserPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [fileInputResetKey, setFileInputResetKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadMessage, setBulkUploadMessage] = useState("");
  const [bulkUploadError, setBulkUploadError] = useState("");
  const [uploading, setUploading] = useState({
    idProof: false,
    selfie: false,
    gallery: {},
  });
  const bulkFileInputRef = useRef(null);

  const countries = useMemo(() => Country.getAllCountries(), []);
  const selectedCountry = useMemo(
    () => countries.find((c) => c.name === form.profile.country),
    [countries, form.profile.country],
  );
  const states = useMemo(() => {
    if (!selectedCountry?.isoCode) return [];
    return State.getStatesOfCountry(selectedCountry.isoCode);
  }, [selectedCountry]);
  const selectedState = useMemo(
    () => states.find((s) => s.name === form.profile.state),
    [states, form.profile.state],
  );
  const cities = useMemo(() => {
    if (!selectedCountry?.isoCode || !selectedState?.isoCode) return [];
    return City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
  }, [selectedCountry, selectedState]);
  const casteOptions = useMemo(() => {
    return CASTES_BY_RELIGION[form.profile.religion] || [];
  }, [form.profile.religion]);

  const updateTopLevel = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateProfile = (key, value) => {
    setForm((prev) => ({
      ...prev,
      profile: { ...prev.profile, [key]: value },
    }));
  };

  const handleCountryChange = (countryName) => {
    setForm((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        country: countryName,
        state: "",
        city: "",
      },
    }));
  };

  const handleStateChange = (stateName) => {
    setForm((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        state: stateName,
        city: "",
      },
    }));
  };

  const handleReligionChange = (religion) => {
    setForm((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        religion,
        community: "",
        subCommunity: "",
      },
    }));
  };

  const setMainPhoto = (index) => {
    setForm((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        profilePhotos: prev.profile.profilePhotos.map((photo, i) => ({
          ...photo,
          isMain: i === index,
        })),
      },
    }));
  };

  const updatePhoto = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        profilePhotos: prev.profile.profilePhotos.map((photo, i) =>
          i === index ? { ...photo, [key]: value } : photo,
        ),
      },
    }));
  };

  const addPhoto = () => {
    setForm((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        profilePhotos: [
          ...prev.profile.profilePhotos,
          { url: "", isMain: false },
        ],
      },
    }));
  };

  const removePhoto = (index) => {
    setForm((prev) => {
      const next = prev.profile.profilePhotos.filter((_, i) => i !== index);
      const hasMain = next.some((p) => p.isMain);
      return {
        ...prev,
        profile: {
          ...prev.profile,
          profilePhotos: hasMain
            ? next
            : next.map((p, i) => ({ ...p, isMain: i === 0 })),
        },
      };
    });
  };

  const uploadImages = async (files) => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      setError("Admin session expired. Please login again.");
      router.push("/adminlogin");
      throw new Error("Unauthorized");
    }

    const uploadData = new FormData();
    files.slice(0, 5).forEach((file) => uploadData.append("images", file));

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos/upload-photos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: uploadData,
    });

    const responseData = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(responseData?.message || "Photo upload failed");
    }

    const urls = extractUploadedUrls(responseData);
    if (!urls.length) {
      throw new Error("No uploaded URL returned from server");
    }
    return urls;
  };

  const handleSingleUpload = async (file, field, type) => {
    if (!file) return;
    setError("");
    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const [url] = await uploadImages([file]);
      updateProfile(field, url);
    } catch (err) {
      setError(err?.message || "Failed to upload file");
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleGalleryUpload = async (index, file) => {
    if (!file) return;
    setError("");
    setUploading((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, [index]: true },
    }));
    try {
      const [url] = await uploadImages([file]);
      updatePhoto(index, "url", url);
    } catch (err) {
      setError(err?.message || "Failed to upload gallery image");
    } finally {
      setUploading((prev) => ({
        ...prev,
        gallery: { ...prev.gallery, [index]: false },
      }));
    }
  };

  const buildPayload = () => {
    const cleanedPhotos = form.profile.profilePhotos
      .filter((p) => p.url.trim())
      .map((p) => ({ url: p.url.trim(), isMain: Boolean(p.isMain) }));

    const profilePayload = {
      ...form.profile,
      height: form.profile.height ? Number(form.profile.height) : undefined,
      profileCreatedBy: form.profile.profileCreatedFor || undefined,
      numberOfChildren: form.profile.numberOfChildren ? Number(form.profile.numberOfChildren) : undefined,
      brothers: form.profile.brothers ? Number(form.profile.brothers) : undefined,
      sisters: form.profile.sisters ? Number(form.profile.sisters) : undefined,
      marriedSiblings: form.profile.marriedSiblings ? Number(form.profile.marriedSiblings) : undefined,
      openToPets: form.profile.openToPets === "Yes",
      ownHouse: form.profile.ownHouse === "Yes",
      ownCar: form.profile.ownCar === "Yes",
      hobbies: (form.profile.hobbies || "").split(",").map(i => i.trim()).filter(Boolean),
      interests: (form.profile.interests || "").split(",").map(i => i.trim()).filter(Boolean),
      profilePhotos: cleanedPhotos,
    };

    const payload = {
      email: form.email.trim(),
      phone: form.phone.trim(),
      accountStatus: form.accountStatus,
      profile: profilePayload,
    };

    return {
      ...payload,
      profile: Object.fromEntries(
        Object.entries(payload.profile).filter(([, value]) => {
          if (value === undefined || value === null) return false;
          if (typeof value === "string" && value.trim() === "") return false;
          if (Array.isArray(value) && value.length === 0) return false;
          return true;
        }),
      ),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      setError("Admin session expired. Please login again.");
      router.push("/adminlogin");
      return;
    }

    const payload = buildPayload();

    try {
      setSubmitting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/manual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("adminToken");
          router.push("/adminlogin");
          return;
        }
        throw new Error(data?.message || "Failed to create user");
      }

      setMessage(data?.message || "User created successfully.");
      setForm(initialForm);
      setFileInputResetKey((prev) => prev + 1);
    } catch (err) {
      setError(err?.message || "Something went wrong while creating user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      setBulkUploadError("Admin session expired. Please login again.");
      router.push("/adminlogin");
      return;
    }

    setBulkUploadMessage("");
    setBulkUploadError("");
    setIsBulkUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/bulk-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          body: formData,
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("adminToken");
          router.push("/adminlogin");
          return;
        }
        throw new Error(data?.message || "Bulk upload failed");
      }

      const createdCount = data?.summary?.createdCount ?? 0;
      const failedCount = data?.summary?.failedCount ?? 0;
      setBulkUploadMessage(
        `${data?.message || "Bulk upload processed"} | Created: ${createdCount}, Failed: ${failedCount}`,
      );
    } catch (err) {
      setBulkUploadError(err?.message || "Failed to upload file");
    } finally {
      setIsBulkUploading(false);
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]  ">
      <div className="p-4 sm:p-8  container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0">
              <Image
                src="/icon.png"
                alt="RVR Luxury Matrimony"
                fill
                className="object-contain object-center md:object-left"
              />
            </div>
            <div>
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-[#2D2424]">
                Add User Manually
              </h1>
              <p className="text-gray-500 text-sm">
                Create user profile from admin panel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-full border border-[#D7C2A7] px-4 py-2 text-sm font-semibold text-[#6E2F2F] hover:bg-[#FBF6ED] transition cursor-pointer"
          >
            Home
          </button>
        </div>
        <div className="mb-6 rounded-2xl border border-[#EEE4D8] bg-white p-5 md:p-6 shadow-sm">
          <input
            ref={bulkFileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            onChange={handleBulkUpload}
            className="hidden"
          />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold text-[#2D2424]">Bulk Upload Users</h2>
              <p className="mt-1 text-sm text-gray-500">
                Import multiple users at once with the sample CSV format.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2  sm:items-center">
              <button
                type="button"
                disabled={isBulkUploading}
                onClick={() => bulkFileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-[#2D5F3F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#244B33] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                <Upload size={16} />
                {isBulkUploading ? "Uploading..." : "Upload Users"}
              </button>
              <a
                href={`data:text/csv;charset=utf-8,${encodeURIComponent(exampleCsv)}`}
                download="bulk_users_example.csv"
                className="text-sm font-medium text-[#2D5F3F] hover:underline"
              >
                Download example file
              </a>
            </div>
          </div>
          {bulkUploadMessage && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {bulkUploadMessage}
            </div>
          )}
          {bulkUploadError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {bulkUploadError}
            </div>
          )}
        </div>
        <div className=" bg-white rounded-2xl border border-[#EEE4D8]  p-5 md:p-8 shadow-sm">


          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => updateTopLevel("email", v)}
                required
                isMandatory
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(v) => updateTopLevel("phone", v)}
                required
                isMandatory
              />
              <Select
                label="Account Status"
                value={form.accountStatus}
                onChange={(v) => updateTopLevel("accountStatus", v)}
                options={ACCOUNT_STATUS_OPTIONS}
                isMandatory
              />
            </div>

            <div className="rounded-2xl border border-[#EEE4D8] p-4 md:p-5">
              <h2 className="font-semibold text-[#2D2424] mb-4">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Select
                  label="Profile Created For"
                  value={form.profile.profileCreatedFor}
                  onChange={(v) => {
                    updateProfile("profileCreatedFor", v);
                    if (v === "Daughter" || v === "Sister") {
                      updateProfile("gender", "Female");
                    } else if (v === "Son" || v === "Brother") {
                      updateProfile("gender", "Male");
                    }
                  }}
                  options={PROFILE_CREATED_FOR_OPTIONS}
                  isMandatory
                />
                <Input
                  label="Full Name"
                  value={form.profile.fullName}
                  onChange={(v) => updateProfile("fullName", v)}
                  isMandatory
                />
                <DateInput
                  label="DOB"
                  value={form.profile.dob}
                  onChange={(v) => updateProfile("dob", v)}
                  placeholder="Select DOB"
                  isMandatory
                />
                <Select
                  label="Height"
                  value={form.profile.height}
                  onChange={(v) => updateProfile("height", v)}
                  options={HEIGHT_OPTIONS}
                  placeholder="Select Height"
                  isMandatory
                />
             
                <Select
                  label="Gender"
                  value={form.profile.gender}
                  onChange={(v) => updateProfile("gender", v)}
                  options={GENDER_OPTIONS}
                />
           
                <Select
                  label="Your Marital Status"
                  value={form.profile.maritalStatus}
                  onChange={(v) => updateProfile("maritalStatus", v)}
                  options={MARITAL_STATUS_OPTIONS}
                  isMandatory
                />
              
                {form.profile.maritalStatus && form.profile.maritalStatus !== "Never Married" && (
                  <>
                    <Input
                      label="Number of Children"
                      type="number"
                      value={form.profile.numberOfChildren}
                      onChange={(v) => updateProfile("numberOfChildren", v)}
                    />
                    <Select
                      label="Children Living Together"
                      value={form.profile.childrenLivingTogether}
                      onChange={(v) => updateProfile("childrenLivingTogether", v)}
                      options={["Yes", "No"]}
                    />
                  </>
                )}
                     <Select
                  label="Physical Status"
                  value={form.profile.physicalStatus}
                  onChange={(v) => updateProfile("physicalStatus", v)}
                  options={PHYSICAL_STATUS_OPTIONS}
                />
                <Select
                  label="Diet"
                  value={form.profile.diet}
                  onChange={(v) => updateProfile("diet", v)}
                  options={DIET_OPTIONS}
                />
                <Select
                  label="Language"
                  value={form.profile.language}
                  onChange={(v) => updateProfile("language", v)}
                  options={["Tamil", "Telugu", "Kannada", "Malayalam", "English"]}
                />
                <Input
                  label="Citizenship"
                  value={form.profile.citizenship}
                  onChange={(v) => updateProfile("citizenship", v)}
                />
                <Select
                  label="Resident Status"
                  value={form.profile.residentStatus}
                  onChange={(v) => updateProfile("residentStatus", v)}
                  options={["Citizen", "Permanent Resident", "Work Permit", "Student Visa", "Temporary Visa"]}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#EEE4D8] p-4 md:p-5">
              <h2 className="font-semibold text-[#2D2424] mb-4">
                Language & Religion
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Mother Tongue"
                  value={form.profile.motherTongue}
                  onChange={(v) => updateProfile("motherTongue", v)}
                  options={allTongues}
                  isMandatory
                />
                <Select
                  label="Religion"
                  value={form.profile.religion}
                  onChange={handleReligionChange}
                  options={RELIGION_OPTIONS}
                />
                <Select
                  label="Caste"
                  value={form.profile.community}
                  onChange={(v) => updateProfile("community", v)}
                  options={casteOptions}
                  placeholder={form.profile.religion ? "Select Caste" : "Select Religion First"}
                  allowOther
                  otherPlaceholder="Type caste"
                  disabled={!form.profile.religion}
                />
                <Input
                  label="Sub-Caste"
                  value={form.profile.subCommunity}
                  onChange={(v) => updateProfile("subCommunity", v)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#EEE4D8] p-4 md:p-5">
              <h2 className="font-semibold text-[#2D2424] mb-4">
                Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             
                <SearchableSelect
                  label="Country"
                  value={form.profile.country}
                  onChange={handleCountryChange}
                  options={countries.map((country) => ({
                    value: country.name,
                    label: country.name,
                  }))}
                  placeholder="Select Country"
                />
                <SearchableSelect
                  label="State"
                  value={form.profile.state}
                  onChange={handleStateChange}
                  options={states.map((state) => ({
                    value: state.name,
                    label: state.name,
                  }))}
                  placeholder="Select State"
                  disabled={!form.profile.country}
                />
                <SearchableSelect
                  label="City"
                  value={form.profile.city}
                  onChange={(v) => updateProfile("city", v)}
                  options={cities.map((city) => ({
                    value: city.name,
                    label: city.name,
                  }))}
                  placeholder="Select City"
                  disabled={!form.profile.state}
                />
              </div>
            </div>
         <div className="rounded-2xl border border-[#EEE4D8] p-4 md:p-5">
              <h2 className="font-semibold text-[#2D2424] mb-4">
                Education & Profession
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Highest Education"
                  value={form.profile.highestEducation}
                  onChange={(v) => updateProfile("highestEducation", v)}
                  options={EDUCATION_OPTIONS}
                />
                <Select
                  label="Degree"
                  value={form.profile.degree}
                  onChange={(v) => updateProfile("degree", v)}
                  options={DEGREE_OPTIONS}
                />
                <Select
                  label="Profession"
                  value={form.profile.profession}
                  onChange={(v) => updateProfile("profession", v)}
                  options={PROFESSION_OPTIONS}
                />
                <Select
                  label="Annual Income"
                  value={form.profile.annualIncome}
                  onChange={(v) => updateProfile("annualIncome", v)}
                  options={INCOME_SLABS}
                />
                <Input
                  label="Company Name"
                  value={form.profile.companyName}
                  onChange={(v) => updateProfile("companyName", v)}
                />
                <Input
                  label="About Career"
                  value={form.profile.aboutCareer}
                  onChange={(v) => updateProfile("aboutCareer", v)}
                />
                <Input
                  label="Describe Me"
                  value={form.profile.describeMe}
                  onChange={(v) => updateProfile("describeMe", v)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#EEE4D8] p-4 md:p-5">
              <h2 className="font-semibold text-[#2D2424] mb-4">Horoscope</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Select
                  label="Nakshatra"
                  value={form.profile.nakshatra}
                  onChange={(v) => updateProfile("nakshatra", v)}
                  options={NAKSHATRA_OPTIONS}
                />
                <Select
                  label="Rashi"
                  value={form.profile.rashi}
                  onChange={(v) => updateProfile("rashi", v)}
                  options={RASHI_OPTIONS}
                />
               
                <Select
                  label="Manglik"
                  value={form.profile.manglik}
                  onChange={(v) => updateProfile("manglik", v)}
                  options={MANGALIK_OPTIONS}
                />
                <Input
                  label="Gothram"
                  value={form.profile.gothram}
                  onChange={(v) => updateProfile("gothram", v)}
                />
                <Input
                  label="Birth Time"
                  type="time"
                  value={form.profile.birthTime}
                  onChange={(v) => updateProfile("birthTime", v)}
                />
                <Input
                  label="Birth Place"
                  value={form.profile.birthPlace}
                  onChange={(v) => updateProfile("birthPlace", v)}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-[#EEE4D8] p-4 md:p-5">
              <h2 className="font-semibold text-[#2D2424] mb-4">
                About & Family
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Bio"
                  value={form.profile.bio}
                  onChange={(v) => updateProfile("bio", v)}
                />
                <Input
                  label="About Family"
                  value={form.profile.aboutFamily}
                  onChange={(v) => updateProfile("aboutFamily", v)}
                  placeholder="Share a few lines about your family"
                />
                <Input
                  label="Father's Occupation"
                  value={form.profile.fathersOccupation}
                  onChange={(v) => updateProfile("fathersOccupation", v)}
                />
                <Input
                  label="Mother's Occupation"
                  value={form.profile.mothersOccupation}
                  onChange={(v) => updateProfile("mothersOccupation", v)}
                />
                <Input
                  label="Brothers"
                  type="number"
                  value={form.profile.brothers}
                  onChange={(v) => updateProfile("brothers", v)}
                />
                <Input
                  label="Sisters"
                  type="number"
                  value={form.profile.sisters}
                  onChange={(v) => updateProfile("sisters", v)}
                />
                <Input
                  label="Married Siblings"
                  type="number"
                  value={form.profile.marriedSiblings}
                  onChange={(v) => updateProfile("marriedSiblings", v)}
                />
                <Select
                  label="Family Income Range"
                  value={form.profile.familyIncomeRange}
                  onChange={(v) => updateProfile("familyIncomeRange", v)}
                  options={INCOME_SLABS}
                />
                <Select
                  label="Family Status"
                  value={form.profile.familyStatus}
                  onChange={(v) => updateProfile("familyStatus", v)}
                  options={FAMILY_STATUS_OPTIONS}
                />
                <Select
                  label="Family Type"
                  value={form.profile.familyType}
                  onChange={(v) => updateProfile("familyType", v)}
                  options={FAMILY_TYPE_OPTIONS}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#EEE4D8] p-4 md:p-5">
              <h2 className="font-semibold text-[#2D2424] mb-4">
                Lifestyle & Habits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Drinking Habits"
                  value={form.profile.drinkingHabits}
                  onChange={(v) => updateProfile("drinkingHabits", v)}
                  options={["yes", "no", "occasionally"]}
                />
                <Select
                  label="Smoking Habits"
                  value={form.profile.smokingHabits}
                  onChange={(v) => updateProfile("smokingHabits", v)}
                  options={["yes", "no", "occasionally"]}
                />
                <Select
                  label="Open to Pets"
                  value={form.profile.openToPets}
                  onChange={(v) => updateProfile("openToPets", v)}
                  options={["Yes", "No"]}
                />
                <Select
                  label="Own House"
                  value={form.profile.ownHouse}
                  onChange={(v) => updateProfile("ownHouse", v)}
                  options={["Yes", "No"]}
                />
                <Select
                  label="Own Car"
                  value={form.profile.ownCar}
                  onChange={(v) => updateProfile("ownCar", v)}
                  options={["Yes", "No"]}
                />
                <Input
                  label="Hobbies (comma separated)"
                  value={form.profile.hobbies}
                  onChange={(v) => updateProfile("hobbies", v)}
                />
                <Input
                  label="Interests (comma separated)"
                  value={form.profile.interests}
                  onChange={(v) => updateProfile("interests", v)}
                />
              </div>
            </div>


            <div className="rounded-2xl border border-[#EEE4D8] p-4 md:p-5">
              <h2 className="font-semibold text-[#2D2424] mb-4">
                Verification & Admin
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#5D2E26]">ID Proof</label>
                  <input
                    key={`id-proof-${fileInputResetKey}`}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      handleSingleUpload(e.target.files?.[0], "idProofUrl", "idProof")
                    }
                    className="w-full rounded-xl text-gray-800 border border-[#D9D5CF] bg-white px-3 py-2"
                  />
                  {uploading.idProof && (
                    <p className="text-xs text-gray-500">Uploading ID proof...</p>
                  )}
                  {form.profile.idProofUrl && (
                    <p className="text-xs text-green-700 break-all">
                      Uploaded: {form.profile.idProofUrl}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#5D2E26]">
                    Verification Selfie
                  </label>
                  <input
                    key={`verification-selfie-${fileInputResetKey}`}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) =>
                      handleSingleUpload(
                        e.target.files?.[0],
                        "verificationSelfieUrl",
                        "selfie",
                      )
                    }
                    className="w-full text-gray-800 rounded-xl border border-[#D9D5CF] bg-white px-3 py-2"
                  />
                  {uploading.selfie && (
                    <p className="text-xs text-gray-500">Uploading selfie...</p>
                  )}
                  {form.profile.verificationSelfieUrl && (
                    <p className="text-xs text-green-700 break-all">
                      Uploaded: {form.profile.verificationSelfieUrl}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <label className="text-sm font-semibold text-[#5D2E26]">
                  Admin Remarks
                </label>
                <textarea
                  rows={3}
                  value={form.profile.adminRemarks}
                  onChange={(e) => updateProfile("adminRemarks", e.target.value)}
                  className="w-full text-gray-800 rounded-xl border border-[#D9D5CF] bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E3B450]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#EEE4D8] p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-[#2D2424]">Profile Photos</h2>
                <button
                  type="button"
                  onClick={addPhoto}
                  className="rounded-full border border-[#D9D5CF] px-4 py-2 text-sm font-semibold text-[#5D2E26] hover:bg-[#FAF3E9] cursor-pointer"
                >
                  Add Photo
                </button>
              </div>
              <div className="space-y-3">
                {form.profile.profilePhotos.map((photo, index) => (
                  <div
                    key={`photo-${index}`}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                  >
                    <div className="md:col-span-8 space-y-1">
                      <label className="text-sm font-semibold text-[#5D2E26]">
                        Photo {index + 1}
                      </label>
                      <input
                        key={`gallery-photo-${index}-${fileInputResetKey}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleGalleryUpload(index, e.target.files?.[0])}
                        className="w-full text-gray-800 rounded-xl border border-[#D9D5CF] bg-white px-3 py-2"
                      />
                      {uploading.gallery[index] && (
                        <p className="text-xs text-gray-500">Uploading photo...</p>
                      )}
                      {photo.url && (
                        <p className="text-xs text-green-700 break-all">
                          Uploaded: {photo.url}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2 pt-6">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          checked={photo.isMain}
                          onChange={() => setMainPhoto(index)}
                          name="mainPhoto"
                        />
                        Main
                      </label>
                    </div>
                    <div className="md:col-span-2 pt-5">
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        disabled={form.profile.profilePhotos.length === 1}
                        className="w-full rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto rounded-full bg-[#2D5F3F] px-8 py-3 font-semibold text-white hover:bg-[#244B33] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Creating User..." : "Create User"}
            </button>
          </form>  </div>
      </div>
    </div>
  );
}
