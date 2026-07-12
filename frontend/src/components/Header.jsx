import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  Moon,
  Sun,
  ChevronDown,
  UserRound,
  Settings,
  LogOut,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Header({ onOpenSidebar }) {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("transitops-theme") === "dark";
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("transitops-user");

      return savedUser
        ? JSON.parse(savedUser)
        : {
            name: "Fleet Manager",
            email: "",
            role: "Fleet Manager",
            roleKey: "fleet_manager",
            initials: "FM",
          };
    } catch {
      return {
        name: "Fleet Manager",
        email: "",
        role: "Fleet Manager",
        roleKey: "fleet_manager",
        initials: "FM",
      };
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("transitops-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("transitops-theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleOpenProfile() {
    setProfileOpen(false);
    setProfileModalOpen(true);
  }

  function handleSettings() {
    setProfileOpen(false);
    navigate("/settings");
  }

  function handleLogout() {
    setProfileOpen(false);

    localStorage.removeItem("transitops-user");
    localStorage.removeItem("transitops-token");

    navigate("/login", { replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 transition-colors dark:border-zinc-800 dark:bg-[#18181b] sm:px-6 lg:px-8">

        {/* LEFT SIDE */}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="rounded-md p-2 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="relative hidden sm:block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="search"
              placeholder="Search vehicles, trips or drivers"
              className="w-72 rounded-md border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-orange-700 dark:focus:ring-orange-950"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center gap-2 sm:gap-3">

          {/* THEME BUTTON */}

          <button
            type="button"
            onClick={() => setDarkMode((current) => !current)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />

          {/* PROFILE */}

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() =>
                setProfileOpen((current) => !current)
              }
              className="flex items-center gap-3 rounded-md px-2 py-1.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <div className="hidden text-right sm:block">
                <p className="max-w-40 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </p>

                <p className="max-w-40 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {user.role}
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                {user.initials}
              </div>

              <ChevronDown
                size={15}
                className={`hidden text-zinc-400 transition-transform sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* PROFILE DROPDOWN */}

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
              >

                {/* USER INFO */}

                <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {user.name}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {user.email || user.role}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleOpenProfile}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <UserRound size={16} />
                    My profile
                  </button>

                  <button
                    type="button"
                    onClick={handleSettings}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                </div>

                <div className="border-t border-zinc-100 py-1 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MY PROFILE MODAL */}

      {profileModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={() => setProfileModalOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
            onMouseDown={(event) => event.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                  My profile
                </h2>

                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Your TransitOps account information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label="Close profile"
              >
                <X size={18} />
              </button>
            </div>

            {/* PROFILE CONTENT */}

            <div className="p-5">

              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                  {user.initials}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-zinc-900 dark:text-white">
                    {user.name}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {user.role}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">

                {/* EMAIL */}

                <ProfileRow
                  icon={Mail}
                  label="Email address"
                  value={user.email || "Not available"}
                />

                {/* ROLE */}

                <ProfileRow
                  icon={ShieldCheck}
                  label="Assigned role"
                  value={user.role}
                />
              </div>

              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="mt-6 h-10 w-full rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {value}
        </p>
      </div>
    </div>
  );
}

export default Header;