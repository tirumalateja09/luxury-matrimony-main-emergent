// config/constants.js

const INCOME_SLABS = [
    '0-3 LPA',
    '3-5 LPA',
    '5-10 LPA',
    '10-20 LPA',
    '20-30 LPA',
    '30+ LPA'
];


const PLANS = {
 GOLD: {
        amount: 1100,
        planName: 'Gold',
        billingCycle: 'QUARTERLY', 
        months: 3
    },
    PREMIUM: {
        amount: 5000,
        planName: 'Premium',
        billingCycle: 'HALF_YEARLY', 
        months: 6,
 
    },

    BOOST_1: {
        amount: 100,
        planName: '24 Hours', // Match model enum
        hours: 24
    },
    BOOST_3: {
        amount: 250,
        planName: '3 Days',   // Match model enum
        hours: 72
    },
    BOOST_7: {
        amount: 500,
        planName: '7 Days',   // Match model enum
        hours: 168
    }
};

module.exports = { INCOME_SLABS, PLANS }; 