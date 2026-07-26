import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const pageCopy: Record<string, { breadcrumbs: string[]; tabs?: string[] }> = {
  '/': { breadcrumbs: ['Test Creation', 'Dashboard'] },
  '/create-test': {
    breadcrumbs: ['Test Creation', 'Create Test', 'Chapter Wise'],
    tabs: ['Chapterwise', 'PYQ', 'Mock Test'],
  },
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const copy =
    pageCopy[location.pathname] ||
    (location.pathname.includes('/questions')
      ? { breadcrumbs: ['Test Creation', 'Add Questions'] }
      : location.pathname.includes('/preview')
        ? { breadcrumbs: ['Test Creation', 'Preview & Publish'] }
        : { breadcrumbs: ['Test Creation'] });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#0f172a]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-[#e5e7eb] bg-white lg:flex lg:flex-col">
        <div className="flex h-[76px] items-center border-b border-[#e5e7eb] px-6">
          <img src="/preproute.svg" alt="Preproute" className="h-[34px] w-[135px]" />
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex h-11 items-center gap-3 rounded-[6px] px-4 text-sm font-medium transition ${
                isActive
                  ? 'bg-[#f0f5ff] text-[#1B5DEF]'
                  : 'text-[#667085] hover:bg-[#f8fafc] hover:text-[#111827]'
              }`
            }
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            Dashboard
          </NavLink>
          <NavLink
            to="/create-test"
            className={({ isActive }) =>
              `flex h-11 items-center gap-3 rounded-[6px] border-l-4 px-3 text-sm font-medium transition ${
                isActive
                  ? 'border-[#1B5DEF] bg-[#f0f5ff] text-[#1B5DEF]'
                  : 'border-transparent text-[#667085] hover:bg-[#f8fafc] hover:text-[#111827]'
              }`
            }
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            Test Creation
          </NavLink>
          <button className="flex h-11 w-full items-center gap-3 rounded-[6px] px-4 text-left text-sm font-medium text-[#667085] transition hover:bg-[#f8fafc] hover:text-[#111827]">
            <span className="h-2 w-2 rounded-full bg-current" />
            Test Tracking
          </button>
        </nav>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-20 border-b border-[#e5e7eb] bg-white lg:left-56">
        <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <img src="/preproute.svg" alt="Preproute" className="mb-3 h-7 w-auto lg:hidden" />
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#667085]">
              {copy.breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb}>
                  {index > 0 && <span className="text-[#cbd5e1]">/</span>}
                  <span
                    className={
                      index === copy.breadcrumbs.length - 1 ? 'font-semibold text-[#111827]' : ''
                    }
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] text-[#667085] transition hover:bg-[#f8fafc]"
              aria-label="Notifications"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#1B5DEF]" />
            </button>
            <div className="hidden items-center gap-3 rounded-[6px] px-2 py-1.5 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-sm font-semibold text-[#1B5DEF]">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-semibold text-[#111827]">{user?.name || 'Alex Wando'}</p>
                <p className="text-xs text-[#667085]">{user?.role || 'Admin'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-[6px] px-3 py-2 text-sm font-medium text-[#667085] transition hover:bg-[#f8fafc] hover:text-[#ef4444]"
            >
              Logout
            </button>
          </div>
        </div>

        {copy.tabs && (
          <div className="flex gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
            {copy.tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`h-12 shrink-0 border-b-2 px-4 text-sm font-semibold transition ${
                  index === 0
                    ? 'border-[#1B5DEF] text-[#1B5DEF]'
                    : 'border-transparent text-[#667085] hover:text-[#111827]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className={`px-4 pb-8 pt-24 sm:px-6 lg:ml-56 lg:px-8 ${copy.tabs ? 'lg:pt-36 pt-40' : 'lg:pt-28'}`}>
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
