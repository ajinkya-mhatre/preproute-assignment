import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const pageCopy: Record<string, { breadcrumbs: string[]; tabs?: string[] }> = {
  "/": { breadcrumbs: ["Test Creation", "Dashboard"] },
  "/create-test": {
    breadcrumbs: ["Test Creation", "Create Test", "Chapter Wise"],
    tabs: ["Chapterwise", "PYQ", "Mock Test"],
  },
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const copy =
    pageCopy[location.pathname] ||
    (location.pathname.startsWith("/edit-test/")
      ? {
          breadcrumbs: ["Test Creation", "Edit Test"],
          tabs: ["Chapterwise", "PYQ", "Mock Test"],
        }
      : location.pathname.includes("/questions")
        ? { breadcrumbs: ["Test Creation", "Add Questions"] }
        : location.pathname.includes("/preview")
          ? { breadcrumbs: ["Test Creation", "Preview & Publish"] }
          : { breadcrumbs: ["Test Creation"] });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("#user-menu")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen text-[#0f172a]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-[#e5e7eb] bg-white lg:flex lg:flex-col">
        <div className="flex h-[76px] items-center border-b border-[#e5e7eb] px-6">
          <img
            src="/preproute.svg"
            alt="Preproute"
            className="h-[34px] w-[135px]"
          />
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex h-11 items-center gap-3 rounded-[6px] px-4 text-sm font-medium transition ${
                isActive
                  ? "bg-[#f0f5ff] text-[#1B5DEF]"
                  : "text-[#667085] hover:bg-[#f8fafc] hover:text-[#111827]"
              }`
            }
          >
            <img
              src={"../../src/assets/dashboard.svg"}
              alt="Dashboard"
              className="h-4 w-4"
            />
            Dashboard
          </NavLink>
          <NavLink
            to="/create-test"
            className={({ isActive }) =>
              `flex h-11 items-center gap-3 rounded-[6px] border-l-4 px-3 text-sm font-medium transition ${
                isActive
                  ? "border-[#1B5DEF] bg-[#f0f5ff] text-[#1B5DEF]"
                  : "border-transparent text-[#667085] hover:bg-[#f8fafc] hover:text-[#111827]"
              }`
            }
          >
            <img
              src={"../../src/assets/book-creation.svg"}
              alt="Book Creation"
              className="h-4 w-4"
            />
            Test Creation
          </NavLink>
          <button className="flex h-11 w-full items-center gap-3 rounded-[6px] px-4 text-left text-sm font-medium text-[#667085] transition hover:bg-[#f8fafc] hover:text-[#111827]">
            <img
              src={"../../src/assets/test-tracking.svg"}
              alt="Test Tracking"
              className="h-4 w-4"
            />
            Test Tracking
          </button>
        </nav>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-20 border-b border-[#e5e7eb] bg-white lg:left-56">
        <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <img
              src="/preproute.svg"
              alt="Preproute"
              className="mb-3 h-7 w-auto lg:hidden"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] text-[#667085] transition hover:bg-[#f8fafc]"
              aria-label="Notifications"
            >
              <img
                src={"../../src/assets/notification.svg"}
                alt="Test Tracking"
                className="h-5 w-5"
              />
            </button>
            <div id="user-menu" className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-sm font-semibold text-[#1B5DEF]">
                  {user?.name?.charAt(0) || "A"}
                </div>

                <div className="text-left leading-tight">
                  <p className="text-sm font-semibold text-[#111827]">
                    {user?.name || "Alex Wando"}
                  </p>
                  <p className="text-xs text-[#667085]">
                    {user?.role || "Admin"}
                  </p>
                </div>

                <svg
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className={`pb-8 pt-24 h-screen bg-white lg:ml-56`}>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[#667085] px-4 mb-4">
          {copy.breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb}>
              {index > 0 && <span className="text-[#cbd5e1]">/</span>}
              <span
                className={
                  index === copy.breadcrumbs.length - 1
                    ? "font-semibold text-[#111827]"
                    : ""
                }
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
        {copy.tabs && (
          <div className="flex gap-1 overflow-x-auto px-2 border w-fit mx-4 rounded-2xl border-gray-300 mb-2">
            {copy.tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`h-12 shrink-0 border-b-2 px-4 text-sm m-1 font-semibold transition ${
                  index === 0
                    ? "text-[#1B5DEF] bg-blue-100 rounded-2xl border-none"
                    : "border-transparent text-[#667085] hover:text-[#111827]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;
