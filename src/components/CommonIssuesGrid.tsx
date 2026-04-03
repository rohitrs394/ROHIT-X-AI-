import React from "react";
import { Battery, Smartphone, Wifi, VolumeX, Camera, MessageCircle } from "lucide-react";

const commonIssues = [
  { id: "battery", label: "Battery drain fast", icon: <Battery className="text-red-500" /> },
  { id: "slow", label: "Phone slow", icon: <Smartphone className="text-blue-500" /> },
  { id: "wifi", label: "WiFi not working", icon: <Wifi className="text-green-500" /> },
  { id: "sound", label: "No sound", icon: <VolumeX className="text-purple-500" /> },
  { id: "camera", label: "Camera not working", icon: <Camera className="text-orange-500" /> },
  { id: "social", label: "WhatsApp/Instagram issue", icon: <MessageCircle className="text-pink-500" /> }
];

interface CommonIssuesGridProps {
  onSelect: (issue: string) => void;
}

export default function CommonIssuesGrid({ onSelect }: CommonIssuesGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {commonIssues.map((issue) => (
        <button
          key={issue.id}
          onClick={() => onSelect(issue.label)}
          className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 border border-neutral-100 dark:border-neutral-800 rounded-2xl transition-all group text-left"
        >
          <div className="p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
            {issue.icon}
          </div>
          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">{issue.label}</span>
        </button>
      ))}
    </div>
  );
}
