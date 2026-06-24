import React from "react";

const page = () => {
  return (
    <div className="px-5 md:px-12 lg:px-24 py-10 md:py-14 lg:py-16 bg-white text-[#6E2F2F]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold">Customer Support</h1>
        <p className="mt-4 text-base md:text-lg leading-7 text-[#6E2F2F]/90">
          Find clear answers to your account, payment, safety, and matchmaking
          questions.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6">
          <div className="border border-[#E6D6B4] rounded-2xl p-6 shadow-[0px_6px_18px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-wide">
              1. Account &amp; Technical Help 
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Profile &amp; Account Assistance
            </h2>
            <p className="mt-3 text-base md:text-lg leading-7 text-[#6E2F2F]/90">
              Learn how to complete your profile 100% and earn a
              &quot;Verified Badge&quot; to get better matches.
            </p>
            <p className="mt-3 text-base md:text-lg leading-7 text-[#6E2F2F]/90">
              <span className="font-semibold">Key Topics:</span> Profile editing,
              Photo upload issues, and the account verification process.
            </p>
          </div>

          <div className="border border-[#E6D6B4] rounded-2xl p-6 shadow-[0px_6px_18px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-wide">
              2. Membership &amp; Payments 
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Plans &amp; Billing Support
            </h2>
            <p className="mt-3 text-base md:text-lg leading-7 text-[#6E2F2F]/90">
              Get help with premium subscriptions, payment status, and invoices.
            </p>
            <p className="mt-3 text-base md:text-lg leading-7 text-[#6E2F2F]/90">
              <span className="font-semibold">Key Topics:</span> Upgrade to
              Diamond/Platinum plans, payment failure resolution, and
              subscription renewal info.
            </p>
          </div>

          <div className="border border-[#E6D6B4] rounded-2xl p-6 shadow-[0px_6px_18px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-wide">
              3. Privacy &amp; Safety 
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Safety &amp; Security Center
            </h2>
            <p className="mt-3 text-base md:text-lg leading-7 text-[#6E2F2F]/90">
              Your security is our priority. Learn how to block or report a
              profile and manage your privacy settings.
            </p>
            <p className="mt-3 text-base md:text-lg leading-7 text-[#6E2F2F]/90">
              <span className="font-semibold">Key Topics:</span> Blocking
              members, hiding your contact/photo, and reporting suspicious
              profiles.
            </p>
          </div>

          <div className="border border-[#E6D6B4] rounded-2xl p-6 shadow-[0px_6px_18px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-wide">
              4. Matching &amp; Communication 
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Matchmaking Guidance
            </h2>
            <p className="mt-3 text-base md:text-lg leading-7 text-[#6E2F2F]/90">
              If you are not getting the right matches, optimize your
              &quot;Partner Preferences&quot; with our guidance.
            </p>
            <p className="mt-3 text-base md:text-lg leading-7 text-[#6E2F2F]/90">
              <span className="font-semibold">Key Topics:</span> How to send
              interests, understanding mutual matches, and using the
              &quot;Secure Connect&quot; feature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
