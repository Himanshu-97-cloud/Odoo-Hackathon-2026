import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChart3,
  ChevronDown,
  Gauge,
  IndianRupee,
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  Sun,
  TrendingUp,
  Truck,
  User,
  Wallet,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

function Analytics() {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [analytics, setAnalytics] = useState({
    fuelEfficiency: 0,
    fleetUtilization: 0,
    operationalCost: 0,
    vehicleROI: 0,
    monthlyRevenue: [],
    costliestVehicles: [],
  });

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

  const highestRevenue = useMemo(() => {
    if (!analytics.monthlyRevenue.length) return 0;

    return Math.max(
      ...analytics.monthlyRevenue.map(
        (item) => Number(item.revenue) || 0
      )
    );
  }, [analytics.monthlyRevenue]);

  const highestVehicleCost = useMemo(() => {
    if (!analytics.costliestVehicles.length) return 0;

    return Math.max(
      ...analytics.costliestVehicles.map(
        (item) => Number(item.cost) || 0
      )
    );
  }, [analytics.costliestVehicles]);

  async function refreshAnalytics() {
    setLoading(true);

    try {
      /*
        BACKEND CONNECTION LATER:

        const response = await fetch(
          "http://localhost:5000/api/analytics"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const data = await response.json();
        setAnalytics(data);
      */
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
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
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">
                Insights & System
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Analytics
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Track fleet performance, costs and operational efficiency.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshAnalytics}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />

              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* KPI cards */}

          <div className="grid overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm sm:grid-cols-2 xl:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900">
            <MetricCard
              title="Fuel efficiency"
              value={`${formatDecimal(analytics.fuelEfficiency)} km/l`}
              description="Average across fleet"
              icon={Gauge}
              accent="blue"
            />

            <MetricCard
              title="Fleet utilization"
              value={`${formatDecimal(analytics.fleetUtilization)}%`}
              description="Vehicles actively utilized"
              icon={Truck}
              accent="emerald"
            />

            <MetricCard
              title="Operational cost"
              value={formatCurrency(analytics.operationalCost)}
              description="Maintenance and fuel"
              icon={Wallet}
              accent="orange"
            />

            <MetricCard
              title="Vehicle ROI"
              value={`${formatDecimal(analytics.vehicleROI)}%`}
              description="Average fleet return"
              icon={TrendingUp}
              accent="emerald"
              last
            />
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
            <TrendingUp size={13} />

            <span>
              ROI = (Revenue − Maintenance − Fuel) ÷ Acquisition Cost × 100
            </span>
          </div>

          {/* Charts */}

          <div className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <BarChart3 size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                      Monthly revenue
                    </h2>

                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Revenue generated from completed trips
                    </p>
                  </div>
                </div>
              </div>

              {analytics.monthlyRevenue.length === 0 ? (
                <EmptyChart
                  icon={BarChart3}
                  title="No revenue data yet"
                  description="Monthly revenue will appear after trips are completed and revenue is recorded."
                />
              ) : (
                <div className="p-5">
                  <div className="flex h-[300px] items-end gap-2 sm:gap-4">
                    {analytics.monthlyRevenue.map((item) => {
                      const height = highestRevenue
                        ? Math.max(
                            (Number(item.revenue) / highestRevenue) * 100,
                            4
                          )
                        : 0;

                      return (
                        <div
                          key={item.month}
                          className="group flex h-full min-w-0 flex-1 flex-col justify-end"
                        >
                          <div className="relative flex flex-1 items-end">
                            <div
                              className="w-full rounded-t-md bg-blue-500/80 transition-all duration-300 hover:bg-blue-600 dark:bg-blue-500/70 dark:hover:bg-blue-500"
                              style={{ height: `${height}%` }}
                            />

                            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-950 px-2 py-1 text-[10px] text-white shadow-lg group-hover:block dark:bg-white dark:text-zinc-950">
                              {formatCurrency(item.revenue)}
                            </div>
                          </div>

                          <p className="mt-3 truncate text-center text-[10px] text-zinc-400 sm:text-xs">
                            {item.month}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                    <IndianRupee size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                      Top costliest vehicles
                    </h2>

                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Vehicles with the highest operating costs
                    </p>
                  </div>
                </div>
              </div>

              {analytics.costliestVehicles.length === 0 ? (
                <EmptyChart
                  icon={Truck}
                  title="No vehicle cost data"
                  description="Vehicle operating costs will appear after maintenance and fuel expenses are recorded."
                />
              ) : (
                <div className="space-y-6 p-5">
                  {analytics.costliestVehicles.map((vehicle, index) => {
                    const width = highestVehicleCost
                      ? Math.max(
                          (Number(vehicle.cost) / highestVehicleCost) * 100,
                          3
                        )
                      : 0;

                    return (
                      <div key={vehicle.id || vehicle.name}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                              {vehicle.name}
                            </p>

                            {vehicle.registrationNumber && (
                              <p className="mt-0.5 truncate text-xs text-zinc-400">
                                {vehicle.registrationNumber}
                              </p>
                            )}
                          </div>

                          <p className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-white">
                            {formatCurrency(vehicle.cost)}
                          </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className={`h-full rounded-full ${
                              index === 0
                                ? "bg-red-400"
                                : index === 1
                                ? "bg-orange-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  last,
}) {
  const accents = {
    blue: {
      icon: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
      border: "border-t-blue-500",
    },

    emerald: {
      icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      border: "border-t-emerald-500",
    },

    orange: {
      icon: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
      border: "border-t-orange-500",
    },
  };

  const style = accents[accent] || accents.orange;

  return (
    <div
      className={`border-t-2 p-5 ${style.border} ${
        last
          ? ""
          : "border-b border-zinc-200 sm:border-r xl:border-b-0 dark:border-zinc-800"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.icon}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
        <Icon size={21} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-zinc-950 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDecimal(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 1,
  });
}

export default Analytics;