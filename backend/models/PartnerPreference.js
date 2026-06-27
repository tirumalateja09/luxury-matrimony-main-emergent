const mongoose = require('mongoose');

const partnerPreferenceSchema = new mongoose.Schema({
  profileId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Profile', 
    required: true 
  },
  prefAgeRange: { min: Number, max: Number },
  prefHeightRange: { min: Number, max: Number },
  prefMaritalStatus: [String],
  prefCommunities: [String],
  prefLanguages: [String],
  prefLocation: { 
    type: String, 
    enum: ['Same City', 'Abroad', 'Anywhere'] 
  },
  willingToRelocate: Boolean,
  minEducation: { 
    type: String 
  },
  preferredProfession: { 
    type: String 
  },
  annualIncomeRange: { 
    type: String 
  },
  horoscopeMatch: Boolean,
  gothramMatch: Boolean
}, { timestamps: true });

module.exports = mongoose.model('PartnerPreference', partnerPreferenceSchema);