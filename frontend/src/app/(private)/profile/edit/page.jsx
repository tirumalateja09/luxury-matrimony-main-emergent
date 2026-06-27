"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Select from "react-select";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Country, State, City } from "country-state-city";
import {
  Camera,
  ChevronLeft,
  Loader2,
  LoaderCircle,
  Save,
  SquarePen,
  X,
} from "lucide-react";
import VerifyPhotoCard from "@/app/component/Private/VerifyPhotoCard";
import EditPhotoGallery from "./EditPhotoGallery";
import { api } from "@/lib/apiClient";
import {
  DEGREE_OPTIONS,
  FAMILY_STATUS_OPTIONS,
  PHYSICAL_STATUS_OPTIONS,
  INCOME_SLABS,
  NAKSHATRA_OPTIONS,
  RASHI_OPTIONS,
  RELIGION_OPTIONS,
  allCommunities,
  allTongues,
  CASTES_BY_RELIGION
} from "@/lib/constants";
import MobileHeaderText from "@/app/component/MobileHeaderText";
import ProfileImageSlider from "./ProfileImageSlider";

const MARITAL_STATUS_OPTIONS = [
  "Never Married",
  "Awaiting Divorce",
  "Divorced",
  "Widowed",
  "Annulled",
];

const GENDER_OPTIONS = ["Male", "Female"];
const MANGILIK_OPTIONS = ["Yes", "No", "Anshik"];
const profileCreatedForOptions = [
  { value: "Myself", label: "Myself" },
  { value: "Daughter", label: "Daughter" },
  { value: "Son", label: "Son" },
  { value: "Sister", label: "Sister" },
  { value: "Brother", label: "Brother" },
  { value: "Relative", label: "Relative" },
  { value: "Friend", label: "Friend" },
];
const EDUCATION_OPTIONS = [
  "Doctorate",
  "Post graduate/Master's",
  "Graduate/Bachelor's",
  "Diploma/Certifications",
  "Class XII",
  "Class X or below",
];
const FAMILY_TYPE_OPTIONS = ["Nuclear", "Joint"];
const DIET_OPTIONS = ["Veg", "Non-Veg", "Jain", "Vegan"];
const HABIT_OPTIONS = ["yes", "no", "occasionally"];
const HOBBY_OPTIONS = [
  "Reading",
  "Music",
  "Travel",
  "Fitness",
  "Cooking",
  "Sports",
  "Movies",
  "Photography",
  "Dancing",
  "Gaming",
  "Art",
  "Gardening",
];
const INTEREST_OPTIONS = [
  "Technology",
  "Business",
  "Entrepreneurship",
  "Politics",
  "Spirituality",
  "Social Work",
  "Fashion",
  "Food",
  "Nature",
  "History",
  "Literature",
  "Wellness",
];

const CROP_BOX_SIZE = 280;
const CROPPED_IMAGE_SIZE = 1080;

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

const emptyProfileForm = {
  fullName: "",
  gender: "",
  dob: "",
  height: "",
  maritalStatus: "",
  religion: "",
  motherTongue: "",
  community: "",
  subCommunity: "",
  city: "",
  state: "",
  country: "",
  highestEducation: "",
  degree: "",
  profession: "",
  aboutCareer: "",
  incomeRange: "",
  company: "",
  rashi: "",
  manglik: "",
  nakshatra: "",
  gothram: "",
  birthTime: "",
  birthPlace: "",
  profileCreatedFor: "",
  describeMe: "",
  bio: "",
  diet: "",
  drinkingHabits: "",
  smokingHabits: "",
  openToPets: "",
  ownHouse: "",
  ownCar: "",
  hobbies: [],
  interests: [],
  aboutFamily: "",
  fathersOccupation: "",
  mothersOccupation: "",
  brothers: "",
  sisters: "",
  marriedSiblings: "",
  familyIncomeRange: "",
  familyType: "",
  familyStatus: "",
  physicalStatus: "",
  numberOfChildren: "",
  childrenLivingTogether: "",
  citizenship: "",
  residentStatus: "",
};

const mapProfileToForm = (profile = {}) => ({
  ...emptyProfileForm,
  fullName: profile.fullName || "",
  gender: profile.gender || "",
  dob: profile.dob ? new Date(profile.dob).toISOString().slice(0, 10) : "",
  height: profile.height || "",
  maritalStatus: profile.maritalStatus || "",
  religion: profile.religion || "",
  motherTongue: profile.motherTongue || "",
  community: profile.community || "",
  subCommunity: profile.subCommunity || "",
  city: profile.city || "",
  state: profile.state || "",
  country: profile.country || "",
  highestEducation: profile.highestEducation || "",
  degree: profile.degree || "",
  profession: profile.profession || "",
  aboutCareer: profile.aboutCareer || "",
  incomeRange: profile.annualIncome || profile.incomeRange || "",
  company: profile.companyName || profile.company || "",
  rashi: profile.rashi || "",
  manglik: profile.manglik || "",
  nakshatra: profile.nakshatra || "",
  gothram: profile.gothram || "",
  birthTime: profile.birthTime || "",
  birthPlace: profile.birthPlace || "",
  profileCreatedFor:
    profile.profileCreatedFor || profile.profileCreatedBy || "",
  describeMe: profile.describeMe || "",
  bio: profile.bio || "",
  diet: profile.diet || "",
  drinkingHabits: profile.drinkingHabits || "",
  smokingHabits: profile.smokingHabits || "",
  openToPets:
    typeof profile.openToPets === "boolean" ? profile.openToPets : "",
  ownHouse: typeof profile.ownHouse === "boolean" ? profile.ownHouse : "",
  ownCar: typeof profile.ownCar === "boolean" ? profile.ownCar : "",
  hobbies: Array.isArray(profile.hobbies) ? profile.hobbies : [],
  interests: Array.isArray(profile.interests) ? profile.interests : [],
  aboutFamily: profile.aboutFamily || "",
  fathersOccupation: profile.fathersOccupation || "",
  mothersOccupation: profile.mothersOccupation || "",
  brothers:
    profile.brothers === 0 || profile.brothers
      ? String(profile.brothers)
      : "",
  sisters:
    profile.sisters === 0 || profile.sisters ? String(profile.sisters) : "",
  marriedSiblings:
    profile.marriedSiblings === 0 || profile.marriedSiblings
      ? String(profile.marriedSiblings)
      : "",
  familyIncomeRange: profile.familyIncomeRange || "",
  familyType: profile.familyType || "",
  familyStatus: profile.familyStatus || "",
  physicalStatus: profile.physicalStatus || "",
  numberOfChildren:
    profile.numberOfChildren === 0 || profile.numberOfChildren
      ? String(profile.numberOfChildren)
      : "",
  childrenLivingTogether: profile.childrenLivingTogether || "",
  citizenship: profile.citizenship || "",
  residentStatus: profile.residentStatus || "",
});

const toApiPayload = (formData) => {
  const payload = {
    fullName: formData.fullName,
    gender: formData.gender,
    dob: formData.dob,
    height: formData.height ? Number(formData.height) : undefined,
    maritalStatus: formData.maritalStatus,
    religion: formData.religion,
    motherTongue: formData.motherTongue,
    community: formData.community,
    subCommunity: formData.subCommunity,
    city: formData.city,
    state: formData.state,
    country: formData.country,
    highestEducation: formData.highestEducation,
    degree: formData.degree,
    profession: formData.profession,
    aboutCareer: formData.aboutCareer,
    incomeRange: formData.incomeRange,
    annualIncome: formData.incomeRange,
    company: formData.company,
    companyName: formData.company,
    rashi: formData.rashi,
    manglik: formData.manglik,
    nakshatra: formData.nakshatra,
    gothram: formData.gothram,
    birthTime: formData.birthTime,
    birthPlace: formData.birthPlace,
    profileCreatedFor: formData.profileCreatedFor,
    describeMe: formData.describeMe,
    bio: formData.bio,
    diet: formData.diet,
    drinkingHabits: formData.drinkingHabits,
    smokingHabits: formData.smokingHabits,
    openToPets:
      typeof formData.openToPets === "boolean" ? formData.openToPets : undefined,
    ownHouse:
      typeof formData.ownHouse === "boolean" ? formData.ownHouse : undefined,
    ownCar:
      typeof formData.ownCar === "boolean" ? formData.ownCar : undefined,
    hobbies: formData.hobbies,
    interests: formData.interests,
    aboutFamily: formData.aboutFamily,
    fathersOccupation: formData.fathersOccupation,
    mothersOccupation: formData.mothersOccupation,
    brothers:
      formData.brothers !== "" ? Number(formData.brothers) : undefined,
    sisters: formData.sisters !== "" ? Number(formData.sisters) : undefined,
    marriedSiblings:
      formData.marriedSiblings !== ""
        ? Number(formData.marriedSiblings)
        : undefined,
    familyIncomeRange: formData.familyIncomeRange,
    familyType: formData.familyType,
    familyStatus: formData.familyStatus,
    physicalStatus: formData.physicalStatus,
    numberOfChildren:
      formData.numberOfChildren !== ""
        ? Number(formData.numberOfChildren)
        : undefined,
    childrenLivingTogether: formData.childrenLivingTogether,
    citizenship: formData.citizenship,
    residentStatus: formData.residentStatus,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );
};

const calculateAge = (dob) => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age;
};

const formatHeight = (heightInCm) => {
  const cm = Number(heightInCm);
  if (!cm) return "-";
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm / 2.54) % 12);
  return `${feet}'${inches}" (${cm} cm)`;
};

const formatYesNo = (value) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "-";
};

const normalizePhone = (value = "") => value.replace(/\D/g, "").slice(0, 10);
const isValidPhone = (value = "") => /^[6-9]\d{9}$/.test(value);
const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const selectStyles = {
  menu: (base) => ({
    ...base,
    position: "absolute",
    marginTop: "8px",
    borderRadius: "16px",
    padding: "4px",
    zIndex: 50,
  }),
  control: (base, state) => ({
    ...base,
    minHeight: "48px",
    borderRadius: "9999px",
    borderColor: state.isFocused ? "rgba(127, 29, 29, 0.35)" : "rgb(214, 211, 209)",
    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(127, 29, 29, 0.15)"
      : "none",
    "&:hover": {
      borderColor: "rgb(168, 162, 158)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 16px",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgb(120, 113, 108)",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    color: "rgb(41, 37, 36)",
    fontSize: "0.95rem",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    paddingRight: "8px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgba(254, 215, 170, 0.6)"
      : state.isFocused
        ? "rgba(254, 215, 170, 0.35)"
        : "white",
    color: "rgb(41, 37, 36)",
    borderRadius: "12px",
    margin: "2px 0",
  }),
};

export default function EditProfilePage() {
  const [isEditingGallery, setIsEditingGallery] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isProfilePhotoUploading, setIsProfilePhotoUploading] = useState(false);
  const [profilePhotoCropSource, setProfilePhotoCropSource] = useState(null);
  const [isProfilePhotoCropOpen, setIsProfilePhotoCropOpen] = useState(false);
  const [profilePhotoZoom, setProfilePhotoZoom] = useState(1);
  const [profilePhotoOffsetX, setProfilePhotoOffsetX] = useState(0);
  const [profilePhotoOffsetY, setProfilePhotoOffsetY] = useState(0);
  const [profilePhotoImageDimensions, setProfilePhotoImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState(emptyProfileForm);
  const [contactDraft, setContactDraft] = useState({ email: "", phone: "" });
  const [contactOtp, setContactOtp] = useState({ email: "", phone: "" });
  const [contactOtpSent, setContactOtpSent] = useState({
    email: false,
    phone: false,
  });
  const [activeContactField, setActiveContactField] = useState(null);
  const [contactVerified, setContactVerified] = useState({
    email: false,
    phone: false,
  });
  const [contactLoadingState, setContactLoadingState] = useState({
    sendingEmail: false,
    verifyingEmail: false,
    sendingPhone: false,
    verifyingPhone: false,
  });
  const profilePhotoInputRef = useRef(null);
  const profilePhotoCropImageRef = useRef(null);

  useEffect(() => {
    return () => {
      if (profilePhotoCropSource?.startsWith("blob:")) {
        URL.revokeObjectURL(profilePhotoCropSource);
      }
    };
  }, [profilePhotoCropSource]);

  const countries = useMemo(() => Country.getAllCountries(), []);

  const states = useMemo(
    () => (formData.country ? State.getStatesOfCountry(formData.country) : []),
    [formData.country],
  );

  const cities = useMemo(
    () =>
      formData.country && formData.state
        ? City.getCitiesOfState(formData.country, formData.state)
        : [],
    [formData.country, formData.state],
  );

  const handleCountryChange = (countryCode) => {
    handleFieldChange("country", countryCode);
    handleFieldChange("state", "");
    handleFieldChange("city", "");
  };

  const handleStateChange = (stateCode) => {
    handleFieldChange("state", stateCode);
    handleFieldChange("city", "");
  };

  const countryOptions = countries.map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));

  const stateOptions = states.map((s) => ({
    value: s.isoCode,
    label: s.name,
  }));

  const cityOptions = cities.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  const loadProfile = async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const response = await api.get("/profile/me", "private");
      if (response?.success) {
        const profile = response?.data?.profile || {};
        setProfileData(response.data);
        setFormData(mapProfileToForm(profile));
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching profile for edit:", error);
      throw error;
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }

    return null;
  };

  useEffect(() => {
    loadProfile({ showLoader: true }).catch(() => {});
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactFieldChange = (field, value) => {
    const nextValue =
      field === "phone" ? normalizePhone(value) : value.trimStart();

    setContactDraft((prev) => ({ ...prev, [field]: nextValue }));
    setContactOtp((prev) => ({ ...prev, [field]: "" }));
    setContactOtpSent((prev) => ({ ...prev, [field]: false }));
    setContactVerified((prev) => ({ ...prev, [field]: false }));
  };

  const resetContactEditor = (emailValue, phoneValue) => {
    setContactDraft({
      email: emailValue || "",
      phone: phoneValue || "",
    });
    setContactOtp({ email: "", phone: "" });
    setContactOtpSent({ email: false, phone: false });
    setContactVerified({ email: false, phone: false });
    setActiveContactField(null);
  };

  const setContactLoading = (field, action, value) => {
    const key = `${action}${field.charAt(0).toUpperCase()}${field.slice(1)}`;
    setContactLoadingState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSectionEdit = (nextSection) => {
    setActiveSection(nextSection);
  };

  const startContactEdit = (field) => {
    resetContactEditor(
      profileData?.profile?.userId?.email || "",
      profileData?.profile?.userId?.phone || profileData?.profile?.phone || "",
    );
    setActiveContactField(field);
  };

  const handleSendContactOtp = async (field) => {
    const rawValue = contactDraft[field] || "";
    const normalizedValue =
      field === "phone" ? normalizePhone(rawValue) : rawValue.trim();

    if (field === "phone" && !isValidPhone(normalizedValue)) {
      toast.error("Please enter a valid 10 digit phone number");
      return;
    }

    if (field === "email" && !isValidEmail(normalizedValue)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const endpoint =
      field === "phone" ? "/auth/phone/send-otp" : "/auth/email/send-otp";
    const bodyKey = field === "phone" ? "phone" : "email";

    try {
      setContactLoading(field, "sending", true);
      await api.post(endpoint, { [bodyKey]: normalizedValue }, "private");
      setContactDraft((prev) => ({ ...prev, [field]: normalizedValue }));
      setContactOtp((prev) => ({ ...prev, [field]: "" }));
      setContactOtpSent((prev) => ({ ...prev, [field]: true }));
      setContactVerified((prev) => ({ ...prev, [field]: false }));
      toast.success(`OTP sent to your ${field}`);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to send OTP");
    } finally {
      setContactLoading(field, "sending", false);
    }
  };

  const handleVerifyContactOtp = async (field) => {
    const rawValue = contactDraft[field] || "";
    const normalizedValue =
      field === "phone" ? normalizePhone(rawValue) : rawValue.trim();
    const otpValue = (contactOtp[field] || "").trim();

    if (field === "phone" && !isValidPhone(normalizedValue)) {
      toast.error("Please enter a valid 10 digit phone number");
      return;
    }

    if (field === "email" && !isValidEmail(normalizedValue)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6 digit OTP");
      return;
    }

    const endpoint =
      field === "phone" ? "/auth/phone/verify-otp" : "/auth/email/verify-otp";
    const bodyKey = field === "phone" ? "phone" : "email";

    try {
      setContactLoading(field, "verifying", true);
      await api.post(
        endpoint,
        { [bodyKey]: normalizedValue, otp: otpValue },
        "private",
      );
      setContactVerified((prev) => ({ ...prev, [field]: true }));
      const latestData = await loadProfile();
      const latestProfile = latestData?.profile || profileData?.profile || {};
      resetContactEditor(
        latestProfile?.userId?.email || "",
        latestProfile?.userId?.phone || latestProfile?.phone || "",
      );
      toast.success(
        `${field === "phone" ? "Phone number" : "Email address"} updated successfully`,
      );
    } catch (error) {
      setContactVerified((prev) => ({ ...prev, [field]: false }));
      toast.error(
        error?.data?.message || error?.message || "Failed to verify OTP",
      );
    } finally {
      setContactLoading(field, "verifying", false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const requiresChildrenDetails = [
        "Divorced",
        "Widowed",
        "Awaiting Divorce",
        "Annulled",
      ].includes(formData.maritalStatus);

      if (requiresChildrenDetails) {
        if (
          formData.numberOfChildren === "" ||
          formData.childrenLivingTogether === ""
        ) {
          toast.error(
            "Please select Number of Children and Children Living Together for your marital status.",
          );
          setActiveSection("basicDetails");
          return;
        }
      }

      setSaving(true);
      const payload = toApiPayload(formData);
      const response = await api.put("/profile/update", payload, "private");
      if (response?.success) {
        const latestProfile = response?.data?.profile || {
          ...(profileData?.profile || {}),
          ...payload,
        };
        setProfileData((prev) => ({
          ...(prev || {}),
          ...(response?.data || {}),
          profile: latestProfile,
        }));
        setFormData(mapProfileToForm(latestProfile));
        setActiveSection(null);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const uploadProfilePhotoFile = async (file) => {
    const uploadData = new FormData();
    uploadData.append("images", file);
    uploadData.append("isMain", "true");

    try {
      return await api.postFile(
        "/profile/upload-photos",
        uploadData,
        "private",
      );
    } catch {
      try {
        return await api.postFile(
          "/photos/upload-photos",
          uploadData,
          "private",
        );
      } catch {
        return await api.postFile("/upload-photos", uploadData, "private");
      }
    }
  };

  const resetProfilePhotoCropState = () => {
    setProfilePhotoZoom(1);
    setProfilePhotoOffsetX(0);
    setProfilePhotoOffsetY(0);
    setProfilePhotoImageDimensions({ width: 0, height: 0 });
  };

  const closeProfilePhotoCropModal = () => {
    if (profilePhotoCropSource?.startsWith("blob:")) {
      URL.revokeObjectURL(profilePhotoCropSource);
    }
    setProfilePhotoCropSource(null);
    setIsProfilePhotoCropOpen(false);
    resetProfilePhotoCropState();
    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.value = "";
    }
  };

  const getProfilePhotoCropMetrics = (outputSize = CROP_BOX_SIZE) => {
    if (
      !profilePhotoImageDimensions.width ||
      !profilePhotoImageDimensions.height
    ) {
      return null;
    }

    const fitScale = Math.min(
      outputSize / profilePhotoImageDimensions.width,
      outputSize / profilePhotoImageDimensions.height,
    );
    const renderedWidth = profilePhotoImageDimensions.width * fitScale * profilePhotoZoom;
    const renderedHeight = profilePhotoImageDimensions.height * fitScale * profilePhotoZoom;
    const maxOffsetX = Math.max(0, (renderedWidth - outputSize) / 2);
    const maxOffsetY = Math.max(0, (renderedHeight - outputSize) / 2);
    const scaledOffsetX = clampValue(
      (profilePhotoOffsetX / CROP_BOX_SIZE) * outputSize,
      -maxOffsetX,
      maxOffsetX,
    );
    const scaledOffsetY = clampValue(
      (profilePhotoOffsetY / CROP_BOX_SIZE) * outputSize,
      -maxOffsetY,
      maxOffsetY,
    );

    return {
      width: renderedWidth,
      height: renderedHeight,
      x: (outputSize - renderedWidth) / 2 + scaledOffsetX,
      y: (outputSize - renderedHeight) / 2 + scaledOffsetY,
      maxOffsetX: (maxOffsetX / outputSize) * CROP_BOX_SIZE,
      maxOffsetY: (maxOffsetY / outputSize) * CROP_BOX_SIZE,
    };
  };

  useEffect(() => {
    const metrics = getProfilePhotoCropMetrics();
    if (!metrics) return;

    const nextOffsetX = clampValue(
      profilePhotoOffsetX,
      -metrics.maxOffsetX,
      metrics.maxOffsetX,
    );
    const nextOffsetY = clampValue(
      profilePhotoOffsetY,
      -metrics.maxOffsetY,
      metrics.maxOffsetY,
    );

    if (nextOffsetX !== profilePhotoOffsetX) {
      setProfilePhotoOffsetX(nextOffsetX);
    }
    if (nextOffsetY !== profilePhotoOffsetY) {
      setProfilePhotoOffsetY(nextOffsetY);
    }
  }, [
    profilePhotoZoom,
    profilePhotoImageDimensions,
    profilePhotoOffsetX,
    profilePhotoOffsetY,
  ]);

  const handleProfilePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || isProfilePhotoUploading) return;

    const nextCropSource = URL.createObjectURL(file);
    setProfilePhotoCropSource(nextCropSource);
    setIsProfilePhotoCropOpen(true);
    resetProfilePhotoCropState();
  };

  const handleProfilePhotoCropSave = async () => {
    const image = profilePhotoCropImageRef.current;
    const metrics = getProfilePhotoCropMetrics(CROPPED_IMAGE_SIZE);

    if (!image || !metrics) {
      toast.error("Image is still loading.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = CROPPED_IMAGE_SIZE;
    canvas.height = CROPPED_IMAGE_SIZE;

    const context = canvas.getContext("2d");
    if (!context) {
      toast.error("Unable to crop image.");
      return;
    }

    context.clearRect(0, 0, CROPPED_IMAGE_SIZE, CROPPED_IMAGE_SIZE);
    context.drawImage(
      image,
      metrics.x,
      metrics.y,
      metrics.width,
      metrics.height,
    );

    try {
      setIsProfilePhotoUploading(true);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!blob) {
        toast.error("Unable to crop image.");
        return;
      }

      const croppedFile = new File(
        [blob],
        profilePhotoInputRef.current?.files?.[0]?.name || "cropped-image.jpg",
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        },
      );

      await uploadProfilePhotoFile(croppedFile);
      const latestResponse = await api.get("/profile/me", "private");
      const latestProfile =
        latestResponse?.data?.profile || profileData?.profile || {};

      setProfileData((prev) => ({
        ...(prev || {}),
        ...(latestResponse?.data || {}),
        profile: latestProfile,
      }));
      closeProfilePhotoCropModal();
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      toast.error(error?.message || "Failed to upload profile photo");
    } finally {
      setIsProfilePhotoUploading(false);
      if (profilePhotoInputRef.current) {
        profilePhotoInputRef.current.value = "";
      }
    }
  };

  const profilePhotoCropMetrics = getProfilePhotoCropMetrics();

  const handleBack = () => {
    if (isEditingGallery) {
      setIsEditingGallery(false);
      return;
    }
    if (activeSection) {
      setActiveSection(null);
      setFormData(mapProfileToForm(profileData?.profile || {}));
      return;
    }
    window.history.back();
  };

  const profile = profileData?.profile || {};
  const userAccount = profile.userId || {};
  const currentEmail = userAccount.email || "";
  const currentPhone = userAccount.phone || profile.phone || "";
  const isRejected =
    typeof profile.adminStatus === "string" &&
    profile.adminStatus.toLowerCase() === "rejected";
  const adminRemarks = profile.adminRemarks || "Please review and update your profile details.";
  const mainPhoto =
    profile.profilePhotos?.find((photo) => photo?.isMain)?.url ||
    profile.profilePhotos?.[0]?.url ||
    "/home/user.png";
  const age = calculateAge(formData.dob);

  const displayCountry = formData.country ? Country.getCountryByCode(formData.country)?.name || formData.country : "";
  const displayState = formData.state && formData.country ? State.getStateByCodeAndCountry(formData.state, formData.country)?.name || formData.state : "";
  const displayCitizenship = formData.citizenship ? Country.getCountryByCode(formData.citizenship)?.name || formData.citizenship : "";

  const locationValue =
    [formData.city, displayState, displayCountry]
      .filter(Boolean)
      .join(", ") || "-";

  const sectionValues = useMemo(
    () => ({
      basicDetails: [
        ["Full Name", formData.fullName],
        ["Height", formatHeight(formData.height)],
        ["Location", locationValue],
        ["Religion", formData.religion || "-"],
        [
          "Caste",
          [formData.community, formData.subCommunity]
            .filter(Boolean)
            .join(" - ") || "-",
        ],
        ["Mother Tongue", formData.motherTongue || "-"],
        ["Status", formData.maritalStatus || "-"],
        ["Physical Status", formData.physicalStatus || "-"],
        ["Number of Children", formData.numberOfChildren || "-"],
        ["Children Living Together", formData.childrenLivingTogether || "-"],
        ["DOB", formData.dob || "-"],
      ],
      about: [
        ["Profile Created For", formData.profileCreatedFor || "-"],
        ["Describe Me", formData.describeMe || "-"],
        ["Bio", formData.bio || "-"],
      ],
      lifestyle: [
        ["Diet", formData.diet || "-"],
        ["Drinking", formData.drinkingHabits || "-"],
        ["Smoking", formData.smokingHabits || "-"],
        ["Open to Pets", formatYesNo(formData.openToPets)],
        ["Own House", formatYesNo(formData.ownHouse)],
        ["Own Car", formatYesNo(formData.ownCar)],
        [
          "Hobbies",
          Array.isArray(formData.hobbies) && formData.hobbies.length
            ? formData.hobbies.join(", ")
            : "-",
        ],
        [
          "Interests",
          Array.isArray(formData.interests) && formData.interests.length
            ? formData.interests.join(", ")
            : "-",
        ],
      ],
      education: [
        ["Highest Education", formData.highestEducation || "-"],
        ["Degree", formData.degree || "-"],
      ],
      career: [
        ["Profession", formData.profession || "-"],
        ["Company", formData.company || "-"],
        ["Income", formData.incomeRange || "-"],
        ["About Career", formData.aboutCareer || "-"],
      ],
      family: [
        ["About Family", formData.aboutFamily || "-"],
        ["Father's Occupation", formData.fathersOccupation || "-"],
        ["Mother's Occupation", formData.mothersOccupation || "-"],
        ["Brothers", formData.brothers || "-"],
        ["Sisters", formData.sisters || "-"],
        ["Married Siblings", formData.marriedSiblings || "-"],
        ["Family Status", formData.familyStatus || "-"],
        ["Family Income", formData.familyIncomeRange || "-"],
        ["Family Type", formData.familyType || "-"],
      ],
      horoscope: [
        ["Rashi", formData.rashi || "-"],
        ["Manglik", formData.manglik || "-"],
        ["Nakshatra", formData.nakshatra || "-"],
        ["Gothram", formData.gothram || "-"],
        ["Birth Time", formData.birthTime || "-"],
        ["Birth Place", formData.birthPlace || "-"],
      ],
      contact: [
        ["Email ID", currentEmail || "-"],
        ["Phone", currentPhone || "-"],
        ["User Status", userAccount.accountStatus || "-"],
      ],
    }),
    [
      currentEmail,
      currentPhone,
      formData,
      userAccount.accountStatus,
    ],
  );

  if (loading) {
    return (
      <div className="w-full h-72 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600" size={36} />
      </div>
    );
  }

  return (
    <div className="w-full font-inter mb-40 sm:mb-0">
      <MobileHeaderText>
        <div className="flex items-center gap-2 font-inter">
          {profile?._id?.slice(-8).toUpperCase() || "-"}
        </div>
      </MobileHeaderText>
      {isRejected && (
        <div className="mx-4 sm:mx-0 mb-4 px-4 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-900 text-sm font-medium">
          {adminRemarks}
        </div>
      )}
      <div className=" w-full min-h-[80px] md:h-28 px-4 md:px-6 sm:bg-[#F3DED3] rounded-[20px] flex flex-row justify-between sm:items-center pt-2  sm:pt-0  gap-4 transition-all">
        <button
          onClick={handleBack}
          className="h-10 px-4 py-2 rounded-full cursor-pointer hover:shadow hidden sm:flex items-center gap-2 hover:bg-stone-50 active:scale-95 transition-all group"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4 text-stone-500 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-stone-500 text-sm font-normal font-inter">
            Back
          </span>
        </button>
        <div className="bloack sm:hidden"></div>
        <div className="flex items-center   gap-3 md:gap-5">
          <input
            ref={profilePhotoInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => profilePhotoInputRef.current?.click()}
            disabled={isProfilePhotoUploading}
            className="relative w-32 h-32 md:w-20 md:h-20 shrink-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Upload profile photo"
          >
            <Image
              src={mainPhoto}
              alt="Profile"
              width={200}
              height={200}
              className="w-full h-full rounded-full border-2 border-amber-300 object-cover"
            />
            <div className="absolute bottom-0 right-0 w-7 h-7 md:w-9 md:h-9 bg-white rounded-full shadow-md border border-red-900 flex items-center justify-center">
              {isProfilePhotoUploading ? (
                <Loader2 className="w-4 h-4 text-red-900 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-red-900" />
              )}
            </div>
          </button>
          <div className="hidden sm:flex flex-col">
            <h2 className="text-stone-800 text-lg md:text-2xl font-bold font-playfair truncate">
              {formData.fullName || "User"} {age ? `, ${age}` : ""}
            </h2>
            <p className="text-stone-500 text-[10px] md:text-xs">
              ID: {profile?._id?.slice(-8).toUpperCase() || "-"}
            </p>
          </div>
        </div>

        <button
          onClick={
            activeContactField
              ? () =>
                  toast("Use the OTP buttons in Contact Details to update email or phone.")
              : handleSaveChanges
          }
          disabled={saving}
          aria-label="Save"
          className="cursor-pointer h-10 px-3 md:px-9 flex items-center justify-center gap-2 bg-green-600 rounded-full shadow-md text-white text-sm md:text-base font-medium hover:bg-green-700 active:scale-95 transition-all shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              {/* Mobile loader icon */}
              <LoaderCircle className="w-5 h-5 animate-spin md:hidden" />

              {/* Desktop text */}
              <span className="hidden md:inline">Saving...</span>
            </>
          ) : (
            <>
              {/* Mobile save icon */}
              <Save className="w-5 h-5 md:hidden" />

              {/* Desktop text (old style) */}
              <span className="hidden md:inline">Save Changes</span>
            </>
          )}
        </button>
      </div>

      {isEditingGallery ? (
        <EditPhotoGallery images={profile.profilePhotos} />
      ) : (
        <div className=" mx-4 sm:mx-0">
          <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-6">
            <div className="p-6 md:p-8 bg-white rounded-3xl shadow-lg flex flex-col gap-6 border border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-stone-800 text-xl font-semibold font-playfair">
                  Photos
                </h3>
                <div className="flex items-center gap-1.5 text-stone-500 text-sm font-medium">
                  <span>{profile.profilePhotos?.length || 0} Photos</span>
                </div>
              </div>
              {/* <div className="relative w-full h-32 md:h-40 rounded-[20px] overflow-hidden border border-gray-100 flex items-end p-4">
                <Image
                  src={mainPhoto}
                  alt="Profile Featured Image"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/10"></div>
          
              </div> */}

              <ProfileImageSlider photos={profile?.profilePhotos || []} />

              <button
                onClick={() => setIsEditingGallery(true)}
                className="cursor-pointer w-full py-3 border border-red-900 text-red-900 rounded-full text-base font-medium hover:bg-red-50 transition-colors"
              >
                Edit Photo Gallery
              </button>
            </div>
            {profile.adminStatus !== "approved" && (
              <VerifyPhotoCard isIcon={true} url={profile.idProofUrl} />
            )}{" "}
          </div>

          <div className="flex mt-4 flex-col gap-4">
            <SectionWrapper
              title="Basic Details"
              sectionKey="basicDetails"
              activeSection={activeSection}
              onEdit={handleSectionEdit}
            >
              {activeSection === "basicDetails" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(v) => handleFieldChange("fullName", v)}
                  />
                  <ChipSelectField
                    label="Gender"
                    value={formData.gender}
                    options={GENDER_OPTIONS}
                    onChange={(v) => handleFieldChange("gender", v)}
                  />
                  <DatePickerField
                    label="Date of Birth"
                    value={formData.dob}
                    onChange={(v) => handleFieldChange("dob", v)}
                  />
                  <InputField
                    label="Height (cm)"
                    type="number"
                    value={formData.height}
                    onChange={(v) => handleFieldChange("height", v)}
                  />
                  <ChipSelectField
                    label="Marital Status"
                    value={formData.maritalStatus}
                    options={MARITAL_STATUS_OPTIONS}
                    onChange={(v) => handleFieldChange("maritalStatus", v)}
                    fullWidth
                  />
                  <SelectField
                    label="Physical Status"
                    value={formData.physicalStatus}
                    options={PHYSICAL_STATUS_OPTIONS}
                    onChange={(v) => handleFieldChange("physicalStatus", v)}
                  />
                  {["Divorced", "Widowed", "Awaiting Divorce", "Annulled"].includes(
                    formData.maritalStatus,
                  ) && (
                      <>
                        <SelectField
                          label="Number of Children"
                          value={String(formData.numberOfChildren)}
                          options={["0", "1", "2", "3", "4", "5"]}
                          onChange={(v) => handleFieldChange("numberOfChildren", v)}
                        />
                        <SelectField
                          label="Children Living Together"
                          value={formData.childrenLivingTogether}
                          options={["Yes", "No"]}
                          onChange={(v) =>
                            handleFieldChange("childrenLivingTogether", v)
                          }
                        />
                      </>
                    )}
                </div>
              ) : (
                <SectionValues rows={sectionValues.basicDetails} />
              )}
            </SectionWrapper>

            <SectionWrapper
              title="About Me"
              sectionKey="about"
              activeSection={activeSection}
              onEdit={handleSectionEdit}
            >
              {activeSection === "about" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Profile Created For"
                    value={formData.profileCreatedFor}
                    options={profileCreatedForOptions.map((opt) => opt.value)}
                    onChange={(v) => handleFieldChange("profileCreatedFor", v)}
                  />
                  <InputField
                    label="Describe Yourself in 5 Words"
                    value={formData.describeMe}
                    onChange={(v) => handleFieldChange("describeMe", v)}
                    placeholder="e.g., Kind, Ambitious, Family-oriented"
                  />
                  <TextareaField
                    label="Bio"
                    value={formData.bio}
                    onChange={(v) => handleFieldChange("bio", v)}
                    placeholder="Write a short bio"
                  />
                </div>
              ) : (
                <SectionValues rows={sectionValues.about} />
              )}
            </SectionWrapper>

            <SectionWrapper
              title="Lifestyle"
              sectionKey="lifestyle"
              activeSection={activeSection}
              onEdit={handleSectionEdit}
            >
              {activeSection === "lifestyle" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Diet"
                    value={formData.diet}
                    options={DIET_OPTIONS}
                    onChange={(v) => handleFieldChange("diet", v)}
                  />
                  <SelectField
                    label="Drinking Habits"
                    value={formData.drinkingHabits}
                    options={HABIT_OPTIONS}
                    onChange={(v) => handleFieldChange("drinkingHabits", v)}
                  />
                  <SelectField
                    label="Smoking Habits"
                    value={formData.smokingHabits}
                    options={HABIT_OPTIONS}
                    onChange={(v) => handleFieldChange("smokingHabits", v)}
                  />
                  <BooleanSelectField
                    label="Open to Pets"
                    value={formData.openToPets}
                    onChange={(v) => handleFieldChange("openToPets", v)}
                  />
                  <BooleanSelectField
                    label="Own House"
                    value={formData.ownHouse}
                    onChange={(v) => handleFieldChange("ownHouse", v)}
                  />
                  <BooleanSelectField
                    label="Own Car"
                    value={formData.ownCar}
                    onChange={(v) => handleFieldChange("ownCar", v)}
                  />
                  <MultiSelectField
                    label="Hobbies"
                    value={formData.hobbies}
                    options={HOBBY_OPTIONS}
                    onChange={(v) => handleFieldChange("hobbies", v)}
                    allowOther
                  />
                  <MultiSelectField
                    label="Interests"
                    value={formData.interests}
                    options={INTEREST_OPTIONS}
                    onChange={(v) => handleFieldChange("interests", v)}
                    allowOther
                  />
                </div>
              ) : (
                <SectionValues rows={sectionValues.lifestyle} />
              )}
            </SectionWrapper>

            <SectionWrapper
              title="Community & Language"
              sectionKey="community"
              activeSection={activeSection}
              onEdit={handleSectionEdit}
            >
              {activeSection === "community" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Religion"
                    value={formData.religion}
                    options={RELIGION_OPTIONS}
                    onChange={(v) => handleFieldChange("religion", v)}
                    fullWidth
                    allowOther
                  />
                  <SelectField
                    label="Mother Tongue"
                    value={formData.motherTongue}
                    options={allTongues}
                    onChange={(v) => handleFieldChange("motherTongue", v)}
                    fullWidth
                    allowOther
                  />
                  <SelectField
                    label="Caste"
                    value={formData.community}
                    options={allCommunities}
                    onChange={(v) => handleFieldChange("community", v)}
                    fullWidth
                    allowOther
                  />
                  <InputField
                    label="Sub-Caste"
                    value={formData.subCommunity}
                    onChange={(v) => handleFieldChange("subCommunity", v)}
                  />
                </div>
              ) : (
                <SectionValues rows={sectionValues.basicDetails.slice(2, 5)} />
              )}
            </SectionWrapper>

            <SectionWrapper
              title="Location"
              sectionKey="location"
              activeSection={activeSection}
              onEdit={handleSectionEdit}
            >
              {activeSection === "location" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-red-900 text-sm font-semibold font-inter">Country</label>
                    <Select
                      value={formData.country ? countryOptions.find(o => o.value === formData.country) || { label: formData.country, value: formData.country } : null}
                      options={countryOptions}
                      onChange={(selected) => handleCountryChange(selected?.value || "")}
                      placeholder="Select Country"
                      isSearchable
                      styles={selectStyles}
                      menuShouldScrollIntoView={false}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-red-900 text-sm font-semibold font-inter">State</label>
                    <Select
                      value={formData.state ? stateOptions.find(o => o.value === formData.state) || { label: formData.state, value: formData.state } : null}
                      options={stateOptions}
                      onChange={(selected) => handleStateChange(selected?.value || "")}
                      placeholder="Select State"
                      isDisabled={!formData.country}
                      isSearchable
                      styles={selectStyles}
                      menuShouldScrollIntoView={false}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-red-900 text-sm font-semibold font-inter">City</label>
                    <Select
                      value={formData.city ? cityOptions.find(o => o.value === formData.city) || { label: formData.city, value: formData.city } : null}
                      options={cityOptions}
                      onChange={(selected) => handleFieldChange("city", selected?.value || "")}
                      placeholder="Select City"
                      isDisabled={!formData.state}
                      isSearchable
                      styles={selectStyles}
                      menuShouldScrollIntoView={false}
                    />
                  </div>
                  {formData.country && formData.country !== "India" && formData.country !== "IN" && (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-red-900 text-sm font-semibold font-inter">Citizenship</label>
                        <Select
                          value={formData.citizenship ? countryOptions.find(o => o.value === formData.citizenship) || { label: formData.citizenship, value: formData.citizenship } : null}
                          options={countryOptions}
                          onChange={(selected) => handleFieldChange("citizenship", selected?.value || "")}
                          placeholder="Select Citizenship"
                          isSearchable
                          styles={selectStyles}
                          menuShouldScrollIntoView={false}
                        />
                      </div>
                      <SelectField
                        label="Resident Status"
                        value={formData.residentStatus}
                        options={[
                          "Citizen",
                          "Permanent Resident",
                          "Work Permit",
                          "Student Visa",
                          "Temporary Visa",
                        ]}
                        onChange={(v) => handleFieldChange("residentStatus", v)}
                      />
                    </>
                  )}
                </div>
              ) : (
                <SectionValues rows={[
                  ["Location", locationValue],
                  ...(formData.country && formData.country !== "India" && formData.country !== "IN" ? [
                    ["Citizenship", displayCitizenship || "-"],
                    ["Resident Status", formData.residentStatus || "-"],
                  ] : [])
                ]} />
              )}
            </SectionWrapper>

            <SectionWrapper
              title="Education"
              sectionKey="education"
              activeSection={activeSection}
              onEdit={handleSectionEdit}
            >
              {activeSection === "education" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Highest Education"
                    value={formData.highestEducation}
                    options={EDUCATION_OPTIONS}
                    onChange={(v) => handleFieldChange("highestEducation", v)}
                    fullWidth
                    allowOther
                  />
                  <SelectField
                    label="Degree"
                    value={formData.degree}
                    options={DEGREE_OPTIONS}
                    onChange={(v) => handleFieldChange("degree", v)}
                  />
                </div>
              ) : (
                <SectionValues rows={sectionValues.education} />
              )}
            </SectionWrapper>

            <SectionWrapper
              title="Career"
              sectionKey="career"
              activeSection={activeSection}
              onEdit={handleSectionEdit}
            >
              {activeSection === "career" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Profession"
                    value={formData.profession}
                    onChange={(v) => handleFieldChange("profession", v)}
                  />
                  <SelectField
                    label="Annual Income"
                    value={formData.incomeRange}
                    options={INCOME_SLABS}
                    onChange={(v) => handleFieldChange("incomeRange", v)}
                  />
                  <InputField
                    label="Company"
                    value={formData.company}
                    onChange={(v) => handleFieldChange("company", v)}
                  />
                  <TextareaField
                    label="About Career"
                    value={formData.aboutCareer}
                    onChange={(v) => handleFieldChange("aboutCareer", v)}
                    placeholder="Share a few lines about your career"
                  />
                </div>
              ) : (
                <SectionValues rows={sectionValues.career} />
              )}
            </SectionWrapper>

            <SectionWrapper
              title="Family"
              sectionKey="family"
              activeSection={activeSection}
              onEdit={handleSectionEdit}
            >
              {activeSection === "family" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="About Family"
                    value={formData.aboutFamily}
                    onChange={(v) => handleFieldChange("aboutFamily", v)}
                    placeholder="Share a few lines about your family"
                  />
                  <InputField
                    label="Father's Occupation"
                    value={formData.fathersOccupation}
                    onChange={(v) => handleFieldChange("fathersOccupation", v)}
                  />
                  <InputField
                    label="Mother's Occupation"
                    value={formData.mothersOccupation}
                    onChange={(v) => handleFieldChange("mothersOccupation", v)}
                  />
                  <InputField
                    label="Brothers"
                    type="number"
                    value={formData.brothers}
                    onChange={(v) => handleFieldChange("brothers", v)}
                  />
                  <InputField
                    label="Sisters"
                    type="number"
                    value={formData.sisters}
                    onChange={(v) => handleFieldChange("sisters", v)}
                  />
                  <InputField
                    label="Married Siblings"
                    type="number"
                    value={formData.marriedSiblings}
                    onChange={(v) => handleFieldChange("marriedSiblings", v)}
                  />
                  <SelectField
                    label="Family Status"
                    value={formData.familyStatus}
                    options={FAMILY_STATUS_OPTIONS}
                    onChange={(v) => handleFieldChange("familyStatus", v)}
                  />
                  <SelectField
                    label="Family Income Range"
                    value={formData.familyIncomeRange}
                    options={INCOME_SLABS}
                    onChange={(v) =>
                      handleFieldChange("familyIncomeRange", v)
                    }
                  />
                  <SelectField
                    label="Family Type"
                    value={formData.familyType}
                    options={FAMILY_TYPE_OPTIONS}
                    onChange={(v) => handleFieldChange("familyType", v)}
                  />
                </div>
              ) : (
                <SectionValues rows={sectionValues.family} />
              )}
            </SectionWrapper>

            <SectionWrapper
              title="Horoscope"
              sectionKey="horoscope"
              activeSection={activeSection}
              onEdit={handleSectionEdit}
            >
              {activeSection === "horoscope" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Rashi"
                    value={formData.rashi}
                    options={RASHI_OPTIONS}
                    onChange={(v) => handleFieldChange("rashi", v)}
                    fullWidth
                    allowOther
                  />
                  <SelectField
                    label="Manglik"
                    value={formData.manglik}
                    options={MANGILIK_OPTIONS}
                    onChange={(v) => handleFieldChange("manglik", v)}
                    fullWidth
                    allowOther
                  />
                  <SelectField
                    label="Nakshatra"
                    value={formData.nakshatra}
                    options={NAKSHATRA_OPTIONS}
                    onChange={(v) => handleFieldChange("nakshatra", v)}
                    fullWidth
                    allowOther
                  />
                  <InputField
                    label="Gothram"
                    value={formData.gothram}
                    onChange={(v) => handleFieldChange("gothram", v)}
                  />
                  <InputField
                    label="Birth Time"
                    value={formData.birthTime}
                    onChange={(v) => handleFieldChange("birthTime", v)}
                    placeholder="10:30 AM"
                  />
                  <InputField
                    label="Birth Place"
                    value={formData.birthPlace}
                    onChange={(v) => handleFieldChange("birthPlace", v)}
                  />
                </div>
              ) : (
                <SectionValues rows={sectionValues.horoscope} />
              )}
            </SectionWrapper>

            <SectionWrapper title="Contact Details" hideEdit={true}>
              <div className="space-y-4">
             
                <ContactDetailRow
                  label="Email ID"
                  value={currentEmail || "-"}
                  isEditing={activeContactField === "email"}
                  onEdit={() => startContactEdit("email")}
                />
                {activeContactField === "email" && (
                  <ContactOtpField
                    label="Email ID"
                    type="email"
                    value={contactDraft.email}
                    currentValue={currentEmail}
                    otp={contactOtp.email}
                    otpSent={contactOtpSent.email}
                    verified={contactVerified.email}
                    isSending={contactLoadingState.sendingEmail}
                    isVerifying={contactLoadingState.verifyingEmail}
                    onValueChange={(value) =>
                      handleContactFieldChange("email", value)
                    }
                    onOtpChange={(value) =>
                      setContactOtp((prev) => ({
                        ...prev,
                        email: value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    onSendOtp={() => handleSendContactOtp("email")}
                    onVerifyOtp={() => handleVerifyContactOtp("email")}
                    onCancel={() => resetContactEditor(currentEmail, currentPhone)}
                    placeholder="Enter new email address"
                  />
                )}
                <ContactDetailRow
                  label="Phone"
                  value={currentPhone || "-"}
                  isEditing={activeContactField === "phone"}
                  onEdit={() => startContactEdit("phone")}
                />
                {activeContactField === "phone" && (
                  <ContactOtpField
                    label="Phone"
                    type="tel"
                    value={contactDraft.phone}
                    currentValue={currentPhone}
                    otp={contactOtp.phone}
                    otpSent={contactOtpSent.phone}
                    verified={contactVerified.phone}
                    isSending={contactLoadingState.sendingPhone}
                    isVerifying={contactLoadingState.verifyingPhone}
                    onValueChange={(value) =>
                      handleContactFieldChange("phone", value)
                    }
                    onOtpChange={(value) =>
                      setContactOtp((prev) => ({
                        ...prev,
                        phone: value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    onSendOtp={() => handleSendContactOtp("phone")}
                    onVerifyOtp={() => handleVerifyContactOtp("phone")}
                    onCancel={() => resetContactEditor(currentEmail, currentPhone)}
                    placeholder="Enter new phone number"
                  />
                )}
                <ContactDetailRow
                  label="User Status"
                  value={userAccount.accountStatus || "-"}
                  hideButton
                />
              </div>
            </SectionWrapper>
          </div>
        </div>
      )}

      {isProfilePhotoCropOpen && profilePhotoCropSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="flex h-[95%] w-full max-w-md flex-col rounded-[28px] bg-white">
            <div className="border-b px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-medium text-[#2D2424]">
                    Crop Photo
                  </h3>
                  <p className="text-sm text-[#6B5B57]">
                    Adjust the image inside the frame before saving.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeProfilePhotoCropModal}
                  className="cursor-pointer rounded-full bg-[#F7F0ED] p-2 text-[#5D2E26]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="flex justify-center">
                <div
                  className="relative overflow-hidden rounded-[24px] bg-[#EEE5E1]"
                  style={{ width: CROP_BOX_SIZE, height: CROP_BOX_SIZE }}
                >
                  <img
                    ref={profilePhotoCropImageRef}
                    src={profilePhotoCropSource}
                    alt="Crop preview"
                    className="pointer-events-none absolute max-w-none select-none"
                    onLoad={(event) => {
                      setProfilePhotoImageDimensions({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                      });
                    }}
                    style={
                      profilePhotoCropMetrics
                        ? {
                            width: `${profilePhotoCropMetrics.width}px`,
                            height: `${profilePhotoCropMetrics.height}px`,
                            left: `${profilePhotoCropMetrics.x}px`,
                            top: `${profilePhotoCropMetrics.y}px`,
                          }
                        : undefined
                    }
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-[24px] border-2 border-white/90 shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.2)]" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#5D2E26]">
                    Zoom
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={profilePhotoZoom}
                    onChange={(e) => setProfilePhotoZoom(Number(e.target.value))}
                    className="w-full accent-[#5D2E26]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#5D2E26]">
                    Move Left / Right
                  </span>
                  <input
                    type="range"
                    min={-(profilePhotoCropMetrics?.maxOffsetX ?? 0)}
                    max={profilePhotoCropMetrics?.maxOffsetX ?? 0}
                    step="1"
                    value={profilePhotoOffsetX}
                    onChange={(e) => setProfilePhotoOffsetX(Number(e.target.value))}
                    className="w-full accent-[#5D2E26]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#5D2E26]">
                    Move Up / Down
                  </span>
                  <input
                    type="range"
                    min={-(profilePhotoCropMetrics?.maxOffsetY ?? 0)}
                    max={profilePhotoCropMetrics?.maxOffsetY ?? 0}
                    step="1"
                    value={profilePhotoOffsetY}
                    onChange={(e) => setProfilePhotoOffsetY(Number(e.target.value))}
                    className="w-full accent-[#5D2E26]"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-3 border-t p-3">
              <button
                type="button"
                onClick={closeProfilePhotoCropModal}
                className="flex-1 rounded-full border border-[#D7C2BA] px-4 py-3 text-sm font-medium text-[#5D2E26]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProfilePhotoCropSave}
                disabled={isProfilePhotoUploading}
                className="flex-1 rounded-full bg-[#5D2E26] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {isProfilePhotoUploading ? "Uploading..." : "Apply Crop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactOtpField({
  label,
  type,
  value,
  currentValue,
  otp,
  otpSent,
  verified,
  isSending,
  isVerifying,
  onValueChange,
  onOtpChange,
  onSendOtp,
  onVerifyOtp,
  onCancel,
  placeholder,
}) {
  const hasChanged = value.trim() !== (currentValue || "").trim();

  return (
    <div className="rounded-[20px] border border-stone-200 p-4 md:p-5 space-y-4">
      <div className="space-y-1">
        <h4 className="text-stone-800 text-base font-semibold">{label}</h4>
        <p className="text-xs text-stone-500">
          Current: {currentValue || "-"}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-red-900 text-sm font-semibold font-inter">
          New {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          inputMode={type === "tel" ? "numeric" : undefined}
          maxLength={type === "tel" ? 10 : undefined}
          placeholder={placeholder}
          className="w-full h-12 px-4 bg-white rounded-3xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-900/15"
        />
      </div>

      <button
        type="button"
        onClick={onSendOtp}
        disabled={!hasChanged || isSending}
        className="h-11 px-5 rounded-full border border-red-900 text-red-900 text-sm font-semibold hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSending ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
      </button>

      {otpSent && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <label className="text-red-900 text-sm font-semibold font-inter">
              OTP
            </label>
            <input
              type="tel"
              value={otp}
              onChange={(e) => onOtpChange(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6 digit OTP"
              className="w-full h-12 px-4 bg-white rounded-3xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-900/15"
            />
          </div>
          <button
            type="button"
            onClick={onVerifyOtp}
            disabled={isVerifying || verified}
            className="h-11 px-5 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {verified ? "Verified" : isVerifying ? "Verifying..." : "Verify OTP"}
          </button>
          {verified && (
            <p className="text-sm text-green-600">
              {label} updated successfully.
            </p>
          )}
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-4 rounded-full border border-stone-300 text-stone-600 text-sm font-semibold hover:bg-stone-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ContactDetailRow({ label, value, isEditing = false, onEdit, hideButton = false }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[16px] border border-stone-200 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        <p className="text-sm text-stone-500 break-all">{value}</p>
      </div>
      {!hideButton && (
        <button
          type="button"
          onClick={onEdit}
          disabled={isEditing}
          className="shrink-0 h-10 px-4 rounded-full border border-green-600 text-green-600 text-sm font-semibold hover:bg-green-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isEditing ? "Editing" : "Edit"}
        </button>
      )}
    </div>
  );
}

function SectionWrapper({
  title,
  children,
  sectionKey,
  activeSection,
  onEdit,
  hideEdit = false,
}) {
  const isEditing = activeSection === sectionKey;
  return (
    <div className="bg-white p-6 md:p-8 rounded-[20px] shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-50 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
        <h3 className="text-green-600 text-xl font-semibold font-playfair">
          {title}
        </h3>
        {!hideEdit && (
          <button
            onClick={() => onEdit(isEditing ? null : sectionKey)}
            className="cursor-pointer group hover:border-green-600 rounded-full p-2 border border-gray-200 hover:bg-green-50 transition-colors"
          >
            <SquarePen
              size={20}
              className="text-green-600 group-hover:text-green-700"
            />
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SectionValues({ rows }) {
  return (
    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
      {rows.map(([label, value]) => (
        <DataField key={label} label={label} value={value || "-"} />
      ))}
    </div>
  );
}

function DataField({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-stone-800 text-sm font-normal">{label}</span>
      <span className="text-xs font-normal text-stone-500">{value}</span>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  const resolvedPlaceholder =
    placeholder || (label ? `Enter ${label}` : "");
  return (
    <div className="flex flex-col gap-2">
      <label className="text-red-900 text-sm font-semibold font-inter">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={resolvedPlaceholder}
        className="w-full h-12 px-4 bg-white rounded-3xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-900/15"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder }) {
  const resolvedPlaceholder =
    placeholder || (label ? `Write ${label}` : "");
  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <label className="text-red-900 text-sm font-semibold font-inter">
        {label}
      </label>
      <textarea
        rows={4}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={resolvedPlaceholder}
        className="w-full px-4 py-3 bg-white rounded-3xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-900/15"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  fullWidth = false,
  allowOther = false,
}) {
  const baseOptions = options.map((option) => ({
    value: option,
    label: option,
  }));
  const otherOption = { value: "__other__", label: "Other" };
  const selectOptions = allowOther ? [...baseOptions, otherOption] : baseOptions;
  const isCustomValue =
    allowOther && value && !options.includes(value) ? true : false;
  const [showOtherInput, setShowOtherInput] = useState(isCustomValue);
  const selectedOption = isCustomValue
    ? otherOption
    : value && options.includes(value)
      ? { value, label: value }
      : null;
  useEffect(() => {
    if (!allowOther) return;
    setShowOtherInput(isCustomValue);
  }, [allowOther, isCustomValue]);

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? "md:col-span-2" : ""}`}>
      <label className="text-red-900 text-sm font-semibold font-inter">
        {label}
      </label>
      <Select
        instanceId={`select-${label}`}
        value={selectedOption}
        options={selectOptions}
        onChange={(option) => {
          if (allowOther && option?.value === "__other__") {
            setShowOtherInput(true);
            onChange("");
            return;
          }
          setShowOtherInput(false);
          onChange(option?.value || "");
        }}
        placeholder={label ? `Select ${label}` : "Select"}
        isSearchable
        styles={selectStyles}
        menuShouldScrollIntoView={false}
      />
      {allowOther && showOtherInput && (
        <input
          type="text"
          value={isCustomValue ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write here"
          className="w-full h-12 px-4 bg-white rounded-3xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-900/15"
        />
      )}
    </div>
  );
}

function BooleanSelectField({ label, value, onChange }) {
  const selectOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];
  const selectedOption =
    value === true ? selectOptions[0] : value === false ? selectOptions[1] : null;
  return (
    <div className="flex flex-col gap-2">
      <label className="text-red-900 text-sm font-semibold font-inter">
        {label}
      </label>
      <Select
        instanceId={`select-${label}`}
        value={selectedOption}
        options={selectOptions}
        onChange={(option) =>
          onChange(
            typeof option?.value === "boolean" ? option.value : "",
          )
        }
        placeholder={label ? `Select ${label}` : "Select"}
        isSearchable={false}
        styles={selectStyles}
        menuShouldScrollIntoView={false}
      />
    </div>
  );
}

const toggleArrayValue = (list, value) => {
  if (!Array.isArray(list)) return [value];
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
};

function MultiSelectWithOther({ label, value, options, onChange }) {
  const selectedValues = Array.isArray(value) ? value : [];
  const customValues = selectedValues.filter(
    (item) => !options.includes(item),
  );
  const [showOther, setShowOther] = useState(false);
  const [otherValue, setOtherValue] = useState("");

  const addOtherValue = () => {
    const trimmed = otherValue.trim();
    if (!trimmed) return;
    if (!selectedValues.includes(trimmed)) {
      onChange([...selectedValues, trimmed]);
    }
    setOtherValue("");
  };

  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <label className="text-red-900 text-sm font-semibold font-inter">
        {label}
      </label>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(toggleArrayValue(selectedValues, option))}
              className={`px-4 py-2 rounded-3xl text-sm font-medium transition-all border ${isSelected
                ? "bg-orange-50 border-stone-500 text-stone-800 shadow-sm"
                : "bg-white border-stone-300 text-stone-500"
                }`}
            >
              {option}
            </button>
          );
        })}
        {customValues.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              onChange(selectedValues.filter((valueItem) => valueItem !== item))
            }
            className="px-4 py-2 rounded-3xl text-sm font-medium transition-all border bg-orange-50 border-stone-500 text-stone-800 shadow-sm"
          >
            {item} ×
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowOther((prev) => !prev)}
          className={`px-4 py-2 rounded-3xl text-sm font-medium transition-all border ${showOther
            ? "bg-orange-50 border-stone-500 text-stone-800 shadow-sm"
            : "bg-white border-stone-300 text-stone-500"
            }`}
        >
          Other
        </button>
      </div>
      {showOther && (
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOtherValue();
              }
            }}
            placeholder="Type and press Enter"
            className="flex-1 min-w-[200px] h-12 px-4 bg-white rounded-3xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-900/15"
          />
          <button
            type="button"
            onClick={addOtherValue}
            className="h-12 px-5 rounded-3xl border border-stone-300 text-stone-600 text-sm font-semibold hover:bg-stone-50"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

function MultiSelectField({ label, value, options, onChange, allowOther }) {
  const baseOptions = options.map((option) => ({
    value: option,
    label: option,
  }));
  const otherOption = { value: "__other__", label: "Other" };
  const selectOptions = allowOther ? [...baseOptions, otherOption] : baseOptions;
  const selectedValues = Array.isArray(value) ? value : [];
  const customValues = allowOther
    ? selectedValues.filter((item) => !options.includes(item))
    : [];
  const initialOtherValue = customValues[0] || "";
  const [otherValue, setOtherValue] = useState(initialOtherValue);
  const [showOtherInput, setShowOtherInput] = useState(
    allowOther ? customValues.length > 0 : false,
  );
  const [selectedOptionsState, setSelectedOptionsState] = useState(() => {
    const baseSelected = selectedValues
      .filter((item) => options.includes(item))
      .map((item) => ({ value: item, label: item }));
    if (allowOther && customValues.length > 0) {
      return [...baseSelected, otherOption];
    }
    return baseSelected;
  });
  useEffect(() => {
    if (!allowOther) {
      setSelectedOptionsState(
        selectedValues
          .filter((item) => options.includes(item))
          .map((item) => ({ value: item, label: item })),
      );
      return;
    }
    const nextCustomValues = selectedValues.filter(
      (item) => !options.includes(item),
    );
    const baseSelected = selectedValues
      .filter((item) => options.includes(item))
      .map((item) => ({ value: item, label: item }));
    const hasOther = nextCustomValues.length > 0;
    setOtherValue(nextCustomValues[0] || "");
    setShowOtherInput(hasOther);
    setSelectedOptionsState(
      hasOther ? [...baseSelected, otherOption] : baseSelected,
    );
  }, [allowOther, options, selectedValues]);

  const commitChange = (nextOptions, nextOtherValue = otherValue) => {
    const baseSelected = nextOptions
      .filter((option) => option.value !== "__other__")
      .map((option) => option.value);
    if (allowOther && nextOtherValue.trim()) {
      onChange([...baseSelected, nextOtherValue.trim()]);
      return;
    }
    onChange(baseSelected);
  };

  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <label className="text-red-900 text-sm font-semibold font-inter">
        {label}
      </label>
      <Select
        instanceId={`select-${label}`}
        value={selectedOptionsState}
        options={selectOptions}
        onChange={(optionsList) => {
          const nextOptions = Array.isArray(optionsList) ? optionsList : [];
          const hasOther = nextOptions.some(
            (option) => option.value === "__other__",
          );
          setSelectedOptionsState(nextOptions);
          setShowOtherInput(allowOther && hasOther);
          if (!hasOther) {
            setOtherValue("");
            onChange(
              nextOptions
                .filter((option) => option.value !== "__other__")
                .map((option) => option.value),
            );
            return;
          }
          commitChange(nextOptions);
        }}
        placeholder={label ? `Select ${label}` : "Select"}
        isMulti
        closeMenuOnSelect={false}
        styles={selectStyles}
        menuShouldScrollIntoView={false}
      />
      {allowOther && showOtherInput && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => {
            const nextValue = e.target.value;
            setOtherValue(nextValue);
            commitChange(selectedOptionsState, nextValue);
          }}
          placeholder="Type other value"
          className="w-full h-12 px-4 bg-white rounded-3xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-900/15"
        />
      )}
    </div>
  );
}

function ChipSelectField({
  label,
  value,
  options,
  onChange,
  fullWidth = false,
}) {
  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? "md:col-span-2" : ""}`}>
      <label className="text-red-900 text-sm font-semibold font-inter">
        {label}
      </label>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-4 py-2 rounded-3xl text-sm font-medium transition-all border ${value === option
              ? "bg-orange-50 border-stone-500 text-stone-800 shadow-sm"
              : "bg-white border-stone-300 text-stone-500"
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function DatePickerField({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selectedDate = value ? new Date(value) : undefined;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue =
    selectedDate && !Number.isNaN(selectedDate.getTime())
      ? selectedDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "";

  return (
    <div className="flex flex-col gap-2" ref={wrapperRef}>
      <label className="text-red-900 text-sm font-semibold font-inter">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-12 px-4 rounded-3xl border border-stone-300 bg-white text-left text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-red-900/15"
      >
        {displayValue || "Select date"}
      </button>
      {isOpen && (
        <div className="relative">
          <div className="absolute z-50 mt-2 rounded-3xl border border-stone-200 bg-white p-4 shadow-xl">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (!date) {
                  onChange("");
                  return;
                }
                const isoValue = new Date(
                  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
                )
                  .toISOString()
                  .slice(0, 10);
                onChange(isoValue);
                setIsOpen(false);
              }}
              captionLayout="dropdown"
            />
          </div>
        </div>
      )}
    </div>
  );
}
