"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    value: 100,
    suffix: "%",
    label: "Verified Profiles",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    value: 50000,
    suffix: "+",
    label: "Registered Telugu Members",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
    value: 10,
    suffix: "+",
    label: "Years of Trusted Matchmaking",
  },
];

function formatNumber(value) {
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + "K";
  }
  return value.toString();
}

function AnimatedCounter({ target, suffix, inView }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 1800; // ms
    const stepTime = 16;
    const totalSteps = Math.ceil(duration / stepTime);
    const increment = target / totalSteps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setCount(current);
      if (step >= totalSteps) {
        setCount(target);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span className="font-bold">
      {target >= 1000 ? formatNumber(count) : count}
      {suffix}
    </span>
  );
}

const TrustStats = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section
      ref={ref}
      className="w-full bg-white border-b border-gray-100"
      id="trust-stats"
    >
      <div className="max-w-6xl mx-auto px-5 md:px-12 lg:px-24 py-5 md:py-6">
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex items-center gap-4"
            >
              {/* Icon with gold gradient accent */}
              <div
                className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(227,180,80,0.12) 0%, rgba(202,160,67,0.12) 100%)",
                  color: "#CAA043",
                }}
              >
                {stat.icon}
              </div>

              {/* Value and label */}
              <div className="flex flex-col">
                <span className="text-[#2A1D1D] text-2xl md:text-3xl font-playfair leading-tight">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    inView={inView}
                  />
                </span>
                <span className="text-[#7B6A64] text-xs md:text-sm font-inter font-medium">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStats;
