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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Header({ onOpenSidebar }) {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("transitops-theme") === "dark";
  });

  // Temporary until authentication is connected
  const user = {
    name: "Fleet Manager",
    role: "Administrator",
    initials: "FM",
  };

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

  function handleLogout() {
    setProfileOpen(false);

    // Add actual logout logic when authentication is connected
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 transition-colors dark:border-zinc-800 dark:bg-[#18181b] sm:px-6 lg:px-8">
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

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setDarkMode((current) => !current)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label={
            darkMode ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((current) => !current)}
            className="flex items-center gap-3 rounded-md px-2 py-1.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {user.name}
              </p>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {user.role}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
              {user.initials}
            </div>

            <ChevronDown
              size={15}
              className={`hidden text-zinc-400 transition-transform sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <UserRound size={16} />
                My profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Settings size={16} />
                Settings
              </button>

              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;