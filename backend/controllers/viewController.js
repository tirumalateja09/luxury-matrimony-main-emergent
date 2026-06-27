const ViewLog = require('../models/ViewLog');
const Profile = require('../models/Profile');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Interest = require('../models/Interest');
const Shortlist = require('../models/Shortlist');

exports.getProfileViewsAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch Basic Profile Info
        const myProfile = await Profile.findOne({ userId })
            .select('gender membershipType adminStatus isBoosted boostExpiresAt createdAt');

        if (!myProfile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        // 2. Trend Logic: Current Week vs Last Week (For % Increase calculation)
        const getViewsForRange = async (daysAgoStart, daysAgoEnd) => {
            const start = new Date();
            start.setDate(start.getDate() - daysAgoStart);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date();
            end.setDate(end.getDate() - daysAgoEnd);
            end.setHours(23, 59, 59, 999);

            return await ViewLog.countDocuments({
                viewedId: userId,
                viewedAt: { $gte: start, $lte: end }
            });
        };

        const currentWeekViewsCount = await getViewsForRange(6, 0); 
        const previousWeekViewsCount = await getViewsForRange(13, 7); 

        let percentageChange = 0;
        if (previousWeekViewsCount > 0) {
            percentageChange = Math.round(((currentWeekViewsCount - previousWeekViewsCount) / previousWeekViewsCount) * 100);
        }

        // 3. Counters (Interests, Messages, Shortlists length fix)
        const [unreadMessages, pendingInterests, shortlistDoc] = await Promise.all([
            Message.countDocuments({ receiverId: userId, isRead: false }),
            Interest.countDocuments({ receiverId: userId, status: 'pending' }),
            Shortlist.findOne({ userId: userId }) // Fetching doc to get targetIds array length
        ]);

        const totalShortlists = shortlistDoc ? shortlistDoc.targetIds.length : 0;

        // 4. Last 7 Days Chart Data Logic
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const count = await ViewLog.countDocuments({
                viewedId: userId,
                viewedAt: { $gte: date, $lt: nextDay }
            });

            last7Days.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                views: count
            });
        }

        // 5. Weekend Performance Insight (Last 30 days avg)
        const last30DaysLogs = await ViewLog.find({
            viewedId: userId,
            viewedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        let weekendViews = 0, weekdayViews = 0;
        last30DaysLogs.forEach(log => {
            const day = new Date(log.viewedAt).getDay();
            if (day === 0 || day === 6) weekendViews++; 
            else weekdayViews++;
        });

        const weekendAvg = weekendViews / 8; 
        const weekdayAvg = weekdayViews / 22;
        const weekendBoost = weekendAvg > weekdayAvg ? Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100) : 0;

        // 6. Recent Viewers Logic
        const recentViewLogs = await ViewLog.find({ viewedId: userId })
            .sort({ viewedAt: -1 })
            .limit(4)
            .select('viewerId viewedAt');

        const viewerUserIds = recentViewLogs.map(log => log.viewerId).filter(Boolean);
        const viewerProfiles = await Profile.find({ userId: { $in: viewerUserIds } })
            .select('userId fullName city profilePhotos adminStatus');

        const profileByUserId = new Map(
            viewerProfiles.map(profile => [profile.userId.toString(), profile])
        );

        // 7. Response Rate Calculation
        const totalInterestsReceived = await Interest.countDocuments({ receiverId: userId });
        const respondedInterests = await Interest.countDocuments({
            receiverId: userId,
            status: { $in: ['accepted', 'rejected'] }
        });
        const responseRate = totalInterestsReceived > 0 ? Math.round((respondedInterests / totalInterestsReceived) * 100) : 100;

        // 8. Final Response Structure
        const isBoostedActive = Boolean(
            myProfile.isBoosted &&
            myProfile.boostExpiresAt &&
            new Date(myProfile.boostExpiresAt) > new Date()
        );

        res.status(200).json({
            success: true,
            data: {
                isBoosted: isBoostedActive,
                membershipType: myProfile.membershipType,
                adminStatus: myProfile.adminStatus,
                stats: {
                    interests: pendingInterests,
                    messages: unreadMessages,
                    shortlists: totalShortlists, 
                    responseRate: `${responseRate}%`
                },
                viewsTrend: {
                    totalThisWeek: currentWeekViewsCount,
                    percentageChange: percentageChange,
                    averageDaily: Math.round(currentWeekViewsCount / 7),
                    chartData: last7Days
                },
                insights: {
                    weekendBoost: weekendBoost
                },
                recentViewers: recentViewLogs.map(log => {
                    const viewerId = log.viewerId ? log.viewerId.toString() : null;
                    const viewerProfile = viewerId ? profileByUserId.get(viewerId) : null;
                    return {
                        _id: viewerId,
                        fullName: viewerProfile?.fullName || null,
                        city: viewerProfile?.city || null,
                        photo: viewerProfile?.profilePhotos?.[0]?.url || null,
                        isVerified: viewerProfile?.adminStatus === 'approved',
                        viewedAt: log.viewedAt
                    };
                })
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
