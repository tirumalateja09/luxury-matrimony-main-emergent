const cron = require('node-cron');
const Profile = require('../models/Profile');

const cleanupExpiredProfileStates = async () => {
    const today = new Date();

    // Jo Gold/Premium hain aur expire ho chuke hain, unhe 'Free' kar do
    await Profile.updateMany(
        { 
            membershipType: { $in: ['Gold', 'Premium'] }, 
            planExpiresAt: { $lt: today } 
        },
        { $set: { membershipType: 'Free' } }
    );

    // Jo boosted profiles expire ho chuki hain, unhe normal state me la do
    await Profile.updateMany(
        {
            isBoosted: true,
            boostExpiresAt: { $lt: today }
        },
        {
            $set: { isBoosted: false },
            $unset: { boostExpiresAt: '' }
        }
    );

    console.log('Expired plans and boosts cleaned up.');
};

cleanupExpiredProfileStates().catch((error) => {
    console.error('Failed to clean up expired profile states on startup:', error);
});

// Har raat 12 baje chalega
cron.schedule('0 0 * * *', async () => {
    await cleanupExpiredProfileStates();
});
