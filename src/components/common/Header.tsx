'use client';

import { useState } from 'react';

interface HeaderProps {
  breadcrumbs: string[];
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Header({
                                 breadcrumbs,
                                 tabs,
                                 activeTab = tabs?.[0] || '',
                                 onTabChange,
                               }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="fixed top-0 left-56 right-0 bg-white border-b border-[#e5e7eb] z-40">
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-2 text-sm text-[#64748b]">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-[#cbd5e0]">/</span>}
              <span className={index === breadcrumbs.length - 1 ? 'text-[#1e293b] font-medium' : ''}>
                {crumb}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-[#f1f5f9] rounded-full transition">
            <span className="text-xl">🔔</span>
          </button>

          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-2 hover:bg-[#f1f5f9] rounded-lg transition relative"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#f97316] flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-[#1e293b]">Alex Wando</span>
              <span className="text-xs text-[#64748b]">Admin</span>
            </div>
            <span className="text-[#64748b]">▼</span>
          </button>

          {showProfileMenu && (
            <div className="absolute top-full right-8 mt-2 bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-2 w-40">
              <button className="w-full text-left px-4 py-2 hover:bg-[#f1f5f9] rounded transition text-sm text-[#1e293b]">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#f1f5f9] rounded transition text-sm text-[#1e293b]">
                Settings
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#f1f5f9] rounded transition text-sm text-[#1e293b]">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {tabs && tabs.length > 0 && (
        <div className="flex gap-0 px-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange?.(tab)}
              className={`px-4 py-3 font-medium text-sm transition border-b-2 ${
                activeTab === tab
                  ? 'text-[#4f46e5] border-[#4f46e5]'
                  : 'text-[#64748b] border-transparent hover:text-[#1e293b]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
