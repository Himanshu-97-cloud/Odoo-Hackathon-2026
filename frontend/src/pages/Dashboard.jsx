import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Truck,
  Route,
  Wrench,
  Users,
  RefreshCw,
  Menu,
  Search,
  Plus,
  UserPlus,
  ArrowRight,
  CircleCheck,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  UserRound,
  Settings,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

const emptyDashboard = {
  totalVehicles: 0,
  availableVehicles: 0,
  activeTrips: 0,
  maintenanceVehicles: 0,
  driversOnDuty: 0,
  fleetUtilization: 0,

  recentTrips: [],

  vehicleStatus: {
    available: 0,
    onTrip: 0,
    inShop: 0,
    retired: 0,
  },

  filterOptions: {
    vehicleTypes: [],
    regions: [],
  },
};

function Dashboard() {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("transitops-theme") === "dark";
  });

  const [dashboard, setDashboard] = useState(emptyDashboard);

  const [filters, setFilters] = useState({
    vehicleType: "all",
    status: "all",
    region: "all",
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
    loadDashboard();
  }, [filters]);

  useEffect(() => {
    function closeProfile(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", closeProfile);

    return () => {
      document.removeEventListener("mousedown", closeProfile);
    };
  }, []);

  async function loadDashboard() {
    setLoading(true);

    try {
      /*
        Connect your backend here later.

        const params = new URLSearchParams(filters);

        const response = await fetch(
          `/api/dashboard?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        const data = await response.json();
        setDashboard(data);
      */
    } catch (error) {
      console.error("Could not load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function toggleDarkMode() {
    setDarkMode((current) => !current);
  }

  function handleLogout() {
    // Add actual logout logic after authentication is connected
    setProfileOpen(false);
  }

  const stats = [
    {
      label: "Total vehicles",
      description: "All registered vehicles",
      value: dashboard.totalVehicles,
      icon: Truck,
    },
    {
      label: "Available",
      description: "Ready for dispatch",
      value: dashboard.availableVehicles,
      icon: CircleCheck,
    },
    {
      label: "Active trips",
      description: "Currently in progress",
      value: dashboard.activeTrips,
      icon: Route,
    },
    {
      label: "In maintenance",
      description: "Currently in shop",
      value: dashboard.maintenanceVehicles,
      icon: Wrench,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-900 transition-colors dark:bg-[#09090b] dark:text-zinc-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="lg:ml-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 transition-colors dark:border-zinc-800 dark:bg-[#18181b] sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
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
                className="w-72 rounded-md border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-orange-700 dark:focus:bg-zinc-800 dark:focus:ring-orange-950"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
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
                  <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800 sm:hidden">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {user.name}
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {user.role}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
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
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
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

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-500">
                Operations
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Monitor your fleet, trips and daily operations.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <section className="mb-5 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center">
            <span className="mr-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Filters
            </span>

            <FilterSelect
              name="vehicleType"
              value={filters.vehicleType}
              onChange={handleFilterChange}
            >
              <option value="all">All vehicle types</option>

              {dashboard.filterOptions.vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="on-trip">On trip</option>
              <option value="in-shop">In shop</option>
              <option value="retired">Retired</option>
            </FilterSelect>

            <FilterSelect
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
            >
              <option value="all">All regions</option>

              {dashboard.filterOptions.regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </FilterSelect>
          </section>

          <section className="mb-6 grid grid-cols-1 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`
                    p-5
                    ${
                      index !== stats.length - 1
                        ? "border-b border-zinc-200 dark:border-zinc-800 xl:border-b-0 xl:border-r"
                        : ""
                    }
                    ${
                      index === 1
                        ? "sm:border-b xl:border-b-0 xl:border-r"
                        : ""
                    }
                  `}
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        {stat.label}
                      </p>

                      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                        {stat.description}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-500">
                      <Icon size={17} strokeWidth={1.8} />
                    </div>
                  </div>

                  <p className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                    {loading ? "—" : stat.value}
                  </p>
                </div>
              );
            })}
          </section>

          {!loading &&
            dashboard.totalVehicles === 0 &&
            dashboard.recentTrips.length === 0 && (
              <section className="mb-6 rounded-lg border border-orange-200 bg-orange-50/60 px-5 py-4 dark:border-orange-900/70 dark:bg-orange-950/20">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Set up your transport operations
                    </h2>

                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      Add your first vehicle and driver to start dispatching
                      trips.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/vehicles")}
                      className="flex items-center gap-2 rounded-md bg-orange-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
                    >
                      <Plus size={15} />
                      Add vehicle
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/drivers")}
                      className="flex items-center gap-2 rounded-md border border-orange-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:border-orange-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <UserPlus size={15} />
                      Add driver
                    </button>
                  </div>
                </div>
              </section>
            )}

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                    Recent trips
                  </h2>

                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Latest trip activity across your fleet
                  </p>
                </div>

                {dashboard.recentTrips.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate("/trips")}
                    className="flex items-center gap-1 text-sm font-medium text-orange-600 transition hover:text-orange-700 dark:text-orange-400"
                  >
                    View all
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {loading ? (
                <LoadingState />
              ) : dashboard.recentTrips.length === 0 ? (
                <EmptyTrips onCreate={() => navigate("/trips")} />
              ) : (
                <TripsTable trips={dashboard.recentTrips} />
              )}
            </div>

            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Fleet status
                </h2>

                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Current vehicle availability
                </p>
              </div>

              {loading ? (
                <LoadingState />
              ) : dashboard.totalVehicles === 0 ? (
                <EmptyFleet onAdd={() => navigate("/vehicles")} />
              ) : (
                <div className="space-y-6 p-5">
                  <FleetRow
                    label="Available"
                    value={dashboard.vehicleStatus.available}
                    total={dashboard.totalVehicles}
                    color="bg-emerald-500"
                  />

                  <FleetRow
                    label="On trip"
                    value={dashboard.vehicleStatus.onTrip}
                    total={dashboard.totalVehicles}
                    color="bg-orange-500"
                  />

                  <FleetRow
                    label="In shop"
                    value={dashboard.vehicleStatus.inShop}
                    total={dashboard.totalVehicles}
                    color="bg-red-500"
                  />

                  <FleetRow
                    label="Retired"
                    value={dashboard.vehicleStatus.retired}
                    total={dashboard.totalVehicles}
                    color="bg-zinc-400"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Drivers on duty"
              value={loading ? "—" : dashboard.driversOnDuty}
              icon={Users}
            />

            <MetricCard
              label="Fleet utilization"
              value={loading ? "—" : `${dashboard.fleetUtilization}%`}
              icon={Route}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

function FilterSelect({ children, ...props }) {
  return (
    <select
      {...props}
      className="min-w-40 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-orange-700 dark:focus:ring-orange-950"
    >
      {children}
    </select>
  );
}

function MetricCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {label}
        </p>

        <p className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
          {value}
        </p>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <Icon size={17} />
      </div>
    </div>
  );
}

function FleetRow({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">
          {label}
        </span>

        <span className="font-medium text-zinc-950 dark:text-white">
          {value}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-72 items-center justify-center">
      <RefreshCw
        size={18}
        className="animate-spin text-zinc-400"
      />
    </div>
  );
}

function EmptyTrips({ onCreate }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Route
          size={18}
          className="text-zinc-500 dark:text-zinc-400"
        />
      </div>

      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        No trips yet
      </p>

      <p className="mt-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        Trips will appear here once they are created and dispatched.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-4 text-sm font-medium text-orange-600 transition hover:text-orange-700 dark:text-orange-400"
      >
        Go to trips →
      </button>
    </div>
  );
}

function EmptyFleet({ onAdd }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Truck
          size={18}
          className="text-zinc-500 dark:text-zinc-400"
        />
      </div>

      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        No vehicles added
      </p>

      <p className="mt-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        Add your first vehicle to start managing your fleet.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-4 text-sm font-medium text-orange-600 transition hover:text-orange-700 dark:text-orange-400"
      >
        Add vehicle →
      </button>
    </div>
  );
}

function TripsTable({ trips }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
            <th className="px-5 py-3 font-medium">Trip</th>
            <th className="px-5 py-3 font-medium">Vehicle</th>
            <th className="px-5 py-3 font-medium">Driver</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Destination</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {trips.map((trip) => (
            <tr
              key={trip.id}
              className="text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                {trip.tripNumber}
              </td>

              <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                {trip.vehicle}
              </td>

              <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                {trip.driver}
              </td>

              <td className="px-5 py-4">
                <TripStatus status={trip.status} />
              </td>

              <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                {trip.destination}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TripStatus({ status }) {
  const styles = {
    Draft:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",

    Dispatched:
      "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",

    "On Trip":
      "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",

    Completed:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",

    Cancelled:
      "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
        styles[status] || styles.Draft
      }`}
    >
      {status}
    </span>
  );
}

export default Dashboard;