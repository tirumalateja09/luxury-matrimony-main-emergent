const cron = require('node-cron');
const Profile = require('../models/Profile');
const User = require('../models/User');
const transporter = require('./emailConfig');

const SITE_URL = (process.env.FRONTEND_URLS || 'http://localhost:3001').split(',')[0].trim();
const FROM = `"RVR Luxury Matrimony" <${process.env.EMAIL_USER}>`;

// ─────────────────────────────────────────────
// Email template: renewal reminder
// ─────────────────────────────────────────────
const buildRenewalEmail = (name, plan, daysLeft, expiryDate) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FBF6ED;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
  <tr><td style="background:linear-gradient(135deg,#6E2F2F,#2D2424);padding:28px 32px;text-align:center">
    <p style="margin:0;color:#E3B450;font-size:11px;letter-spacing:3px;text-transform:uppercase">RVR Luxury Matrimony</p>
    <h1 style="margin:8px 0 0;color:#fff;font-size:22px">Plan Expiring Soon</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="color:#555;margin:0 0 16px">Dear <strong>${name || 'Member'}</strong>,</p>
    <p style="color:#555;margin:0 0 24px">Your <strong>${plan}</strong> membership will expire in 
      <strong style="color:#C0392B">${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong> on <strong>${expiryDate}</strong>.</p>
    <div style="background:#FBF6ED;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
      <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Time Remaining</p>
      <p style="margin:0;font-size:28px;font-weight:bold;color:#2D2424">${daysLeft} Day${daysLeft > 1 ? 's' : ''}</p>
    </div>
    <p style="color:#555;margin:0 0 24px">Renew now to continue accessing premium features — profile views, contact details, and priority matches.</p>
    <div style="text-align:center">
      <a href="${SITE_URL}/profile/membership" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E3B450,#CAA043);color:#2D2424;font-weight:bold;text-decoration:none;border-radius:8px;font-size:15px">Renew My Plan</a>
    </div>
  </td></tr>
  <tr><td style="background:#FBF6ED;padding:20px;text-align:center;border-top:1px solid #F2E9DE">
    <p style="margin:0;color:#aaa;font-size:11px">RVR Luxury Matrimony · Premium Matchmaking</p>
  </td></tr>
</table></td></tr></table></body></html>`;

// ─────────────────────────────────────────────
// Email template: plan expired
// ─────────────────────────────────────────────
const buildExpiredEmail = (name, plan) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FBF6ED;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
  <tr><td style="background:linear-gradient(135deg,#6E2F2F,#2D2424);padding:28px 32px;text-align:center">
    <p style="margin:0;color:#E3B450;font-size:11px;letter-spacing:3px;text-transform:uppercase">RVR Luxury Matrimony</p>
    <h1 style="margin:8px 0 0;color:#fff;font-size:22px">Your Plan Has Expired</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="color:#555;margin:0 0 16px">Dear <strong>${name || 'Member'}</strong>,</p>
    <p style="color:#555;margin:0 0 24px">Your <strong>${plan}</strong> membership has expired. Your account has been moved to the Free plan.</p>
    <p style="color:#555;margin:0 0 24px">Upgrade again to regain access to premium features and reconnect with your matches.</p>
    <div style="text-align:center">
      <a href="${SITE_URL}/profile/membership" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E3B450,#CAA043);color:#2D2424;font-weight:bold;text-decoration:none;border-radius:8px;font-size:15px">Upgrade Now</a>
    </div>
  </td></tr>
  <tr><td style="background:#FBF6ED;padding:20px;text-align:center;border-top:1px solid #F2E9DE">
    <p style="margin:0;color:#aaa;font-size:11px">RVR Luxury Matrimony · Premium Matchmaking</p>
  </td></tr>
</table></td></tr></table></body></html>`;

// ─────────────────────────────────────────────
// Job 1: Cleanup expired plans (existing logic)
// ─────────────────────────────────────────────
const cleanupExpiredProfileStates = async () => {
    const today = new Date();

    // Find expiring profiles BEFORE downgrading (to send expired email)
    const justExpired = await Profile.find({
        membershipType: { $in: ['Gold', 'Premium'] },
        planExpiresAt: { $lt: today }
    }).select('userId fullName membershipType');

    // Send expired emails
    for (const profile of justExpired) {
        try {
            const user = await User.findById(profile.userId).select('email');
            if (user?.email) {
                await transporter.sendMail({
                    from: FROM,
                    to: user.email,
                    subject: `Your ${profile.membershipType} plan has expired — Renew to stay connected`,
                    html: buildExpiredEmail(profile.fullName, profile.membershipType),
                });
            }
        } catch (e) {
            console.error('Expired email error:', e.message);
        }
    }

    // Downgrade expired plans
    await Profile.updateMany(
        { membershipType: { $in: ['Gold', 'Premium'] }, planExpiresAt: { $lt: today } },
        { $set: { membershipType: 'Free' } }
    );

    // Deactivate expired boosts
    await Profile.updateMany(
        { isBoosted: true, boostExpiresAt: { $lt: today } },
        { $set: { isBoosted: false }, $unset: { boostExpiresAt: '' } }
    );

    console.log('Expired plans and boosts cleaned up.');
};

// ─────────────────────────────────────────────
// Job 2: Renewal reminders (7d, 3d, 1d before expiry)
// ─────────────────────────────────────────────
const sendRenewalReminders = async () => {
    const reminderDays = [7, 3, 1];

    for (const days of reminderDays) {
        const now = new Date();
        const targetStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
        const targetEnd = new Date(targetStart.getTime() + 24 * 60 * 60 * 1000);

        const expiringProfiles = await Profile.find({
            membershipType: { $in: ['Gold', 'Premium'] },
            planExpiresAt: { $gte: targetStart, $lt: targetEnd },
        }).select('userId fullName membershipType planExpiresAt');

        for (const profile of expiringProfiles) {
            try {
                const user = await User.findById(profile.userId).select('email');
                if (!user?.email) continue;

                const expiryDate = new Date(profile.planExpiresAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'long', year: 'numeric',
                });

                await transporter.sendMail({
                    from: FROM,
                    to: user.email,
                    subject: `Reminder: Your ${profile.membershipType} plan expires in ${days} day${days > 1 ? 's' : ''}`,
                    html: buildRenewalEmail(profile.fullName, profile.membershipType, days, expiryDate),
                });

                console.log(`Renewal reminder (${days}d) sent → ${user.email}`);
            } catch (e) {
                console.error(`Renewal reminder error (${days}d):`, e.message);
            }
        }
    }
};

// ─────────────────────────────────────────────
// Run cleanup on startup
// ─────────────────────────────────────────────
cleanupExpiredProfileStates().catch((e) =>
    console.error('Startup cleanup error:', e.message)
);

// Cleanup + expired emails — midnight daily
cron.schedule('0 0 * * *', async () => {
    await cleanupExpiredProfileStates();
});

// Renewal reminders — 8 AM daily
cron.schedule('0 8 * * *', async () => {
    await sendRenewalReminders();
});

// ─────────────────────────────────────────────
// Job 3: Price-drop alert emails
// Called manually by admin API (not on a cron)
// ─────────────────────────────────────────────
const buildPriceDropEmail = (name, plan, oldPrice, newPrice, savings) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FBF6ED;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
  <tr><td style="background:linear-gradient(135deg,#27ae60,#1a5c2a);padding:28px 32px;text-align:center">
    <p style="margin:0;color:#fff;font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:.8">RVR Luxury Matrimony</p>
    <h1 style="margin:8px 0 0;color:#fff;font-size:22px">Price Drop Alert!</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="color:#555;margin:0 0 16px">Dear <strong>${name || 'Member'}</strong>,</p>
    <p style="color:#555;margin:0 0 24px">Great news! The <strong>${plan}</strong> plan has a new discounted price — and you qualify to upgrade now.</p>
    <div style="display:flex;gap:16px;margin-bottom:24px;text-align:center">
      <div style="flex:1;background:#FFF5F5;border-radius:12px;padding:16px">
        <p style="margin:0 0 4px;color:#888;font-size:11px">Was</p>
        <p style="margin:0;font-size:22px;font-weight:bold;color:#C0392B;text-decoration:line-through">₹${oldPrice}</p>
      </div>
      <div style="flex:1;background:#F0FFF4;border-radius:12px;padding:16px">
        <p style="margin:0 0 4px;color:#888;font-size:11px">Now</p>
        <p style="margin:0;font-size:22px;font-weight:bold;color:#27ae60">₹${newPrice}</p>
      </div>
    </div>
    <p style="color:#27ae60;font-weight:bold;text-align:center;margin-bottom:24px">You save ₹${savings}!</p>
    <div style="text-align:center">
      <a href="${SITE_URL}/profile/membership" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E3B450,#CAA043);color:#2D2424;font-weight:bold;text-decoration:none;border-radius:8px;font-size:15px">Upgrade at New Price</a>
    </div>
  </td></tr>
</table></td></tr></table></body></html>`;

exports.sendPriceDropAlerts = async ({ plan, oldPrice, newPrice }) => {
    if (process.env.PRICE_DROP_ALERTS_ENABLED !== 'true') {
        console.log('Price-drop alerts are disabled (PRICE_DROP_ALERTS_ENABLED != true)');
        return;
    }
    const savings = oldPrice - newPrice;
    const freeProfiles = await Profile.find({
        membershipType: 'Free',
        adminStatus: 'approved',
    }).select('userId fullName').limit(1000);

    let sent = 0;
    for (const profile of freeProfiles) {
        try {
            const user = await User.findById(profile.userId).select('email');
            if (!user?.email) continue;
            await transporter.sendMail({
                from: FROM,
                to: user.email,
                subject: `Price Drop! ${plan} plan is now ₹${newPrice} on RVR Matrimony`,
                html: buildPriceDropEmail(profile.fullName, plan, oldPrice, newPrice, savings),
            });
            sent++;
        } catch (e) {
            console.error('Price drop email error:', e.message);
        }
    }
    console.log(`Price-drop alerts sent: ${sent}`);
    return sent;
};
