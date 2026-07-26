'use client';

import { useState } from 'react';

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('test-creation');

  return (
    <div className="w-56 bg-white border-r border-[#e5e7eb] fixed h-screen left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-[#e5e7eb]">
        <h1 className="text-2xl font-bold">
          <span className="text-[#4f46e5]">Prep</span>
          <span className="text-[#1e293b]">Route</span>
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => setActiveItem('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            activeItem === 'dashboard'
              ? 'text-[#4f46e5]'
              : 'text-[#64748b] hover:text-[#1e293b]'
          }`}
        >
          <span className="text-lg">📊</span>
          <span className="font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveItem('test-creation')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition border-l-4 ${
            activeItem === 'test-creation'
              ? 'bg-[#f0f4ff] border-[#4f46e5] text-[#4f46e5]'
              : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
          }`}
        >
          <span className="text-lg">✏️</span>
          <span className="font-medium">Test Creation</span>
        </button>

        <button
          onClick={() => setActiveItem('test-tracking')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            activeItem === 'test-tracking'
              ? 'text-[#4f46e5]'
              : 'text-[#64748b] hover:text-[#1e293b]'
          }`}
        >
          <span className="text-lg">📈</span>
          <span className="font-medium">Test Tracking</span>
        </button>
      </nav>
    </div>
  );
}
