const mongoose = require("mongoose");
const { INCOME_SLABS } = require("../config/constants");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Step 1: Basic Details
    fullName: String,
    dob: Date,
    height: Number, // In CM
    gender: { type: String, enum: ["Male", "Female"] },
    physicalStatus: { type: String, enum: ["Normal", "Physically Challenged"] },
    maritalStatus: {
      type: String,
      enum: [
        "Never Married",
        "Awaiting Divorce",
        "Divorced",
        "Widowed",
        "Annulled",
      ],
    },
    numberOfChildren: {
      type: Number,
      min: 0,
      default: null,
    },

    childrenLivingTogether: {
      type: String,
      enum: ["Yes", "No", null],
      default: null,
    },
    diet: { type: String, enum: ["Veg", "Non-Veg", "Jain", "Vegan"] },
    profileCreatedFor: {
      type: String,
      enum: [
        "Myself",
        "Daughter",
        "Son",
        "Sister",
        "Brother",
        "Relative",
        "Friend",
      ],
      default: "Myself",
    },
    language: {
      type: String,
      // enum: ["Tamil", "Telugu", "Kannada", "Malayalam", "English"],
      default: "English",
    },
    // Step 2: Socio-Cultural
    motherTongue: String,
    religion: { type: String, default: "Hindu" },
    community: String,
    subCommunity: String,
    // Step 2b: About & Family
    bio: String,
    aboutFamily: String, // Describe what you want others to know
    fathersOccupation: String,
    mothersOccupation: String,
    brothers: Number,
    sisters: Number,
    marriedSiblings: Number, // Of which married
    familyIncomeRange: String, // can be enum later
    familyStatus: {
      type: String,
      enum: ["Middle class", "Upper middle class", "Rich/Affluent(Elite)"],
    },
    familyType: { type: String, enum: ["Nuclear", "Joint"] },
    drinkingHabits: { type: String, enum: ["yes", "no", "occasionally"] },
    smokingHabits: { type: String, enum: ["yes", "no", "occasionally"] },
    openToPets: Boolean,
    ownHouse: Boolean,
    ownCar: Boolean,
    hobbies: [String],
    interests: [String],
    // Step 3: Location Details
    country: String,
    state: String,
    city: String,
    lat: {
      type: Number,
      default: null,
    },
    long: {
      type: Number,
      default: null,
    },
    citizenship: {
      type: String,
      default: null,
    },

    residentStatus: {
      type: String,
      enum: [
        "Citizen",
        "Permanent Resident",
        "Work Permit",
        "Student Visa",
        "Temporary Visa",
        null,
      ],
      default: null,
    },
    // Step 4: Education & Career
    highestEducation: {
      type: String,
      enum: [
        "Doctorate",
        "Civil Services / Elite",
        "Professional / Finance",
        "Post graduate/Master's",
        "Graduate/Bachelor's",
        "Diploma/Certifications",
        "Class XII",
        "Class X or below",
      ],
    },
    degree: String,
    profession: String,
    aboutCareer: String,
    annualIncome: {
      type: String,
      // enum: INCOME_SLABS,
    },
    companyName: String,
    describeMe: String,
    // Step 5: Horoscope
    rashi: String,
    nakshatra: String,
    gothram: String,
    birthTime: String,
    birthPlace: String,
    manglik: { type: String, enum: ["Yes", "No", "Anshik"] },
    // Step 6: Photos & Admin Control
    profilePhotos: [{ url: String, isMain: { type: Boolean, default: false } }],
    idProofUrl: String,
    verificationSelfieUrl: String,
    referralCode: { type: String, default: '', uppercase: true, trim: true },
    adminStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },
    adminRemarks: String,
    // Premium Features
    isFeatured: { type: Boolean, default: false },
    isBoosted: { type: Boolean, default: false },
    boostExpiresAt: Date,
    membershipType: {
      type: String,
      enum: ["Free", "Gold", "Premium"],
      default: "Free",
    },
    planExpiresAt: {
      type: Date,
      default: null, // null for Free users
    },
  },
  { timestamps: true },
);

// 1. Search Performance: Gender + Status + Plan
profileSchema.index({ gender: 1, adminStatus: 1, membershipType: 1 });

// 2. Filters: Religion + Community
profileSchema.index({ religion: 1, community: 1 });

// 3. Location: State + City
profileSchema.index({ state: 1, city: 1 });

// 4. Sorting: Latest aur Premium Profiles fast
profileSchema.index({ isBoosted: -1, isFeatured: -1, createdAt: -1 });

// 5. Automation: Cron jobs expiry track
profileSchema.index({ planExpiresAt: 1 });

module.exports = mongoose.model("Profile", profileSchema);
