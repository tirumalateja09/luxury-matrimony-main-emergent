import { Shield, Users, Crown, Lock } from "lucide-react";

const stats = [
  {
    icon: <Shield size={26} className="text-[#6e2f2f]" />,
    value: "50K+",
    title: "100% Verified",
    subtitle: "Profiles",
  },
  {
    icon: <Users size={26} className="text-[#6e2f2f]" />,
    value: "35K+",
    title: "Family",
    subtitle: "Verified",
  },
  {
    icon: <Crown size={26} className="text-[#6e2f2f]" />,
    value: "20K+",
    title: "Premium",
    subtitle: "Members",
  },
  {
    icon: <Lock size={26} className="text-[#6e2f2f]" />,
    value: "100%",
    title: "Confidential &",
    subtitle: "Secure",
  },
];

export default function StatsBar() {
  return (
    <div className="w-full py-6 lg:border lg:border-t lg:border-b lg:border-[#E3B450] lg:bg-[#FBF6EF] rounded-2xl lg:my-4 lg:px-12">
      <div className="grid grid-cols-4 gap-2 text-center">
        {stats.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            
            {/* Icon Circle */}
            <div className="w-14 h-14 rounded-full bg-[linear-gradient(135deg,#E7B84F_0%,#F6DE86_52%,#C79A3A_100%)]
              flex items-center justify-center shadow-md">
              {item.icon}
            </div>

            {/* Value */}
            <p className="text-[#2f7d4e] font-bold text-base">
              {item.value}
            </p>

            {/* Text */}
            <p className="text-xs text-gray-700 leading-tight">
              {item.title}<br />
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
