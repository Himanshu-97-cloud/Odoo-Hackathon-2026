import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Building2,
  Check,
  ChevronDown,
  Coins,
  LogOut,
  Menu,
  Moon,
  Ruler,
  Save,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

const defaultSettings = {
  depotName: "",
  currency: "INR",
  distanceUnit: "kilometers",
};

const currencies = [
  { value: "INR", label: "INR (₹)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
];

const distanceUnits = [
  { value: "kilometers", label: "Kilometers (km)" },
  { value: "miles", label: "Miles (mi)" },
];

const permissions = [
  {
    role: "Fleet Manager",
    fleet: "full",
    drivers: "full",
    trips: "none",
    expenses: "none",
    analytics: "full",
  },
  {
    role: "Dispatcher",
    fleet: "view",
    drivers: "none",
    trips: "full",
    expenses: "none",
    analytics: "none",
  },
  {
    role: "Safety Officer",
    fleet: "none",
    drivers: "full",
    trips: "view",
    expenses: "none",
    analytics: "none",
  },
  {
    role: "Financial Analyst",
    fleet: "view",
    drivers: "none",
    trips: "none",
    expenses: "full",
    analytics: "full",
  },
];

function Settings() {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [settings, setSettings] = useState(defaultSettings);
  const [savedSettings, setSavedSettings] = useState(defaultSettings);

  const user = {
    name: "Fleet Manager",
    role: "Administrator",
    initials: "FM",
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(savedSettings);

  function handleChange(event) {
    const { name, value } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (settings.depotName.trim().length < 3) {
      setMessage("Enter a valid depot name.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      /*
        BACKEND CONNECTION LATER:

        const response = await fetch(
          "http://localhost:5000/api/settings",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(settings),
          }
        );

        if (!response.ok) {
          throw new Error("Could not save settings");
        }

        const data = await response.json();
      */

      setSavedSettings({ ...settings });
      setMessage("Settings saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while saving settings.");
    } finally {
      setSaving(false);
    }
  }

  function handleSignOut() {
    const confirmed = window.confirm(
      "Are you sure you want to sign out?"
    );

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setProfileOpen(false);
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900 transition-colors dark:bg-[#09090b] dark:text-zinc-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="lg:ml-60">
        {/* Header */}

        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-zinc-200 bg-white/95 px-4 backdrop-blur dark:border-zinc-800 dark:bg-[#18181b]/95 sm:px-6">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={22} />
              </button>

              <div className="relative hidden sm:block">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                  type="search"
                  placeholder="Search vehicles, trips or drivers"
                  className="h-10 w-72 rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-orange-500 dark:focus:bg-zinc-900 dark:focus:ring-orange-950"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDarkMode((current) => !current)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                aria-label={
                  darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="hidden h-7 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />

              {/* Working profile menu */}

              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen((current) => !current)
                  }
                  className="flex items-center gap-3 rounded-lg p-1 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                >
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {user.name}
                    </p>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {user.role}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
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
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                          {user.initials}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                            {user.name}
                          </p>

                          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {user.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={() => setProfileOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <User size={16} />
                        My profile
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/settings");
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <SettingsIcon size={16} />
                        Settings
                      </button>
                    </div>

                    <div className="border-t border-zinc-100 p-1.5 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">
              Insights & System
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Settings
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Configure your transport operations and review role access.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
            {/* General settings */}

            <section className="h-fit overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                    <Building2 size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                      General
                    </h2>

                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Basic settings for your transport operations.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-5">
                <Field
                  label="Depot name"
                  name="depotName"
                  value={settings.depotName}
                  onChange={handleChange}
                  placeholder="Enter depot name"
                  icon={Building2}
                  maxLength={80}
                />

                <SelectField
                  label="Currency"
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  icon={Coins}
                >
                  {currencies.map((currency) => (
                    <option
                      key={currency.value}
                      value={currency.value}
                    >
                      {currency.label}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Distance unit"
                  name="distanceUnit"
                  value={settings.distanceUnit}
                  onChange={handleChange}
                  icon={Ruler}
                >
                  {distanceUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </SelectField>

                {message && (
                  <div
                    className={`rounded-lg border px-3 py-2.5 text-sm ${
                      message.includes("successfully")
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!hasChanges || saving}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save changes
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Role access */}

            <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                      Role-Based Access Control
                    </h2>

                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Review permissions assigned to each operational role.
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-950/30">
                      <TableHeading>Role</TableHeading>
                      <TableHeading>Fleet</TableHeading>
                      <TableHeading>Drivers</TableHeading>
                      <TableHeading>Trips</TableHeading>
                      <TableHeading>Fuel / Exp.</TableHeading>
                      <TableHeading>Analytics</TableHeading>
                    </tr>
                  </thead>

                  <tbody>
                    {permissions.map((permission) => (
                      <tr
                        key={permission.role}
                        className="border-b border-zinc-100 last:border-0 transition hover:bg-zinc-50/70 dark:border-zinc-800 dark:hover:bg-zinc-800/30"
                      >
                        <TableCell>
                          <span className="font-medium text-zinc-950 dark:text-white">
                            {permission.role}
                          </span>
                        </TableCell>

                        <PermissionCell permission={permission.fleet} />
                        <PermissionCell permission={permission.drivers} />
                        <PermissionCell permission={permission.trips} />
                        <PermissionCell permission={permission.expenses} />
                        <PermissionCell permission={permission.analytics} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-zinc-100 md:hidden dark:divide-zinc-800">
                {permissions.map((permission) => (
                  <div key={permission.role} className="p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                        <ShieldCheck size={16} />
                      </div>

                      <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                        {permission.role}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <MobilePermission
                        label="Fleet"
                        permission={permission.fleet}
                      />

                      <MobilePermission
                        label="Drivers"
                        permission={permission.drivers}
                      />

                      <MobilePermission
                        label="Trips"
                        permission={permission.trips}
                      />

                      <MobilePermission
                        label="Fuel / Expenses"
                        permission={permission.expenses}
                      />

                      <MobilePermission
                        label="Analytics"
                        permission={permission.analytics}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    Full access
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-600">
                      View
                    </span>
                    Read only
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">—</span>
                    No access
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function PermissionCell({ permission }) {
  return (
    <td className="px-5 py-4">
      <PermissionValue permission={permission} />
    </td>
  );
}

function PermissionValue({ permission }) {
  if (permission === "full") {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
        <Check size={15} strokeWidth={2.5} />
      </div>
    );
  }

  if (permission === "view") {
    return (
      <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
        View
      </span>
    );
  }

  return (
    <span className="text-sm text-zinc-300 dark:text-zinc-600">
      —
    </span>
  );
}

function MobilePermission({ label, permission }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>

      <PermissionValue permission={permission} />
    </div>
  );
}

function TableHeading({ children }) {
  return (
    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return (
    <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
      {children}
    </td>
  );
}

function Field({ label, icon: Icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>

      <div className="relative">
        <Icon
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <input
          {...props}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-orange-950"
        />
      </div>
    </label>
  );
}

function SelectField({ label, icon: Icon, children, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>

      <div className="relative">
        <Icon
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <select
          {...props}
          className="w-full appearance-none rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-9 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-orange-950"
        >
          {children}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
      </div>
    </label>
  );
}

export default Settings;