const Profile = require('../models/Profile');

exports.canAccessFeature = (featureName) => {
    return async (req, res, next) => {
        const profile = await Profile.findOne({ userId: req.user.id });
        const plan = profile.membershipType;

        const featureAccess = {
            'chat': ['Gold', 'Premium'],
            'contactDetails': ['Gold', 'Premium'],
            'horoscope': ['Premium'],
            'voiceCalls': ['Premium']
        };

        if (featureAccess[featureName] && !featureAccess[featureName].includes(plan)) {
            return res.status(403).json({ 
                success: false, 
                message: `This feature is not available in ${plan} plan. Please Upgrade.`,
                upgradeRequired: true
            });
        }
        next();
    };
};