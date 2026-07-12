import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Circle,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Package,
  Route,
  Search,
  Send,
  Settings as SettingsIcon,
  Sun,
  Truck,
  User,
  UserRound,
  XCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

const initialForm = {
  source: "",
  destination: "",
  vehicleId: "",
  driverId: "",
  cargoWeight: "",
  plannedDistance: "",
};

const statusStyles = {
  draft:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",

  dispatched:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",

  completed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",

  cancelled:
    "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

function Trips() {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  // Replace these with backend API data later.
  const [trips, setTrips] = useState([]);
  const [vehicles] = useState([]);
  const [drivers] = useState([]);

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

  const availableVehicles = useMemo(() => {
    return vehicles.filter(
      (vehicle) => vehicle.status === "available"
    );
  }, [vehicles]);

  const availableDrivers = useMemo(() => {
    return drivers.filter(
      (driver) =>
        driver.status === "available" &&
        driver.safety !== "suspended" &&
        !driver.licenseExpired
    );
  }, [drivers]);

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return trips;

    return trips.filter((trip) => {
      const searchableValues = [
        trip.tripNumber,
        trip.source,
        trip.destination,
        trip.vehicleName,
        trip.driverName,
        trip.status,
      ];

      return searchableValues.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [trips, search]);

  const selectedVehicle = availableVehicles.find(
    (vehicle) =>
      String(vehicle.id) === String(form.vehicleId)
  );

  const cargoWeight = Number(form.cargoWeight);

  const capacityExceeded =
    selectedVehicle &&
    cargoWeight > 0 &&
    cargoWeight > Number(selectedVehicle.capacity);

  const dispatchedTrips = trips.filter(
    (trip) => trip.status === "dispatched"
  ).length;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  function resetForm() {
    setForm(initialForm);
    setError("");
  }

  function validateForm() {
    const source = form.source.trim();
    const destination = form.destination.trim();
    const weight = Number(form.cargoWeight);
    const distance = Number(form.plannedDistance);

    if (source.length < 3) {
      return "Enter a valid source location.";
    }

    if (destination.length < 3) {
      return "Enter a valid destination.";
    }

    if (source.toLowerCase() === destination.toLowerCase()) {
      return "Source and destination cannot be the same.";
    }

    if (!form.vehicleId) {
      return "Select an available vehicle.";
    }

    if (!form.driverId) {
      return "Select an available driver.";
    }

    if (!weight || weight <= 0) {
      return "Enter a valid cargo weight.";
    }

    if (capacityExceeded) {
      return `Vehicle capacity exceeded by ${
        weight - Number(selectedVehicle.capacity)
      } kg.`;
    }

    if (!distance || distance <= 0) {
      return "Enter a valid planned distance.";
    }

    return "";
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const vehicle = availableVehicles.find(
      (item) =>
        String(item.id) === String(form.vehicleId)
    );

    const driver = availableDrivers.find(
      (item) =>
        String(item.id) === String(form.driverId)
    );

    if (!vehicle || !driver) {
      setError(
        "Selected vehicle or driver is no longer available."
      );
      return;
    }

    const newTrip = {
      id: crypto.randomUUID(),

      tripNumber: `TR${String(
        trips.length + 1
      ).padStart(3, "0")}`,

      source: form.source.trim(),
      destination: form.destination.trim(),

      vehicleId: vehicle.id,

      vehicleName:
        vehicle.registrationNumber ||
        vehicle.name ||
        "Unknown vehicle",

      driverId: driver.id,
      driverName: driver.name || "Unknown driver",

      cargoWeight: Number(form.cargoWeight),
      plannedDistance: Number(form.plannedDistance),

      status: "dispatched",
      createdAt: new Date().toISOString(),
    };

    setTrips((current) => [newTrip, ...current]);
    resetForm();
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

            {/* Header left */}

            <div className="flex min-w-0 items-center gap-3">

              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden"
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
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search trips, vehicles or drivers"
                  className="h-10 w-72 rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-orange-500 dark:focus:bg-zinc-900 dark:focus:ring-orange-950"
                />

              </div>

            </div>

            {/* Header right */}

            <div className="flex shrink-0 items-center gap-3">

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

              {/* Profile */}

              <div
                ref={profileRef}
                className="relative"
              >

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

                {/* Profile dropdown */}

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
                        onClick={() => {
                          setProfileOpen(false);
                        }}
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

          {/* Page heading */}

          <div className="mb-7">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">
              Operations
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Trip Dispatcher
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Create trips, assign resources and track dispatch progress.
            </p>

          </div>

          <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">

            {/* Create trip card */}

            <section className="h-fit rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

              <div className="border-b border-zinc-100 p-5 dark:border-zinc-800">
                <TripLifecycle />
              </div>

              <div className="p-5">

                <div className="mb-5">

                  <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
                    Create trip
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Assign an available vehicle and eligible driver.
                  </p>

                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >

                  <Field
                    label="Source"
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    placeholder="Enter pickup location"
                    icon={MapPin}
                    maxLength={100}
                  />

                  <Field
                    label="Destination"
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    placeholder="Enter destination"
                    icon={Route}
                    maxLength={100}
                  />

                  <SelectField
                    label="Vehicle (available only)"
                    name="vehicleId"
                    value={form.vehicleId}
                    onChange={handleChange}
                    icon={Truck}
                  >

                    <option value="">
                      Select available vehicle
                    </option>

                    {availableVehicles.map((vehicle) => (
                      <option
                        key={vehicle.id}
                        value={vehicle.id}
                      >
                        {vehicle.registrationNumber ||
                          vehicle.name}

                        {vehicle.capacity
                          ? ` · ${vehicle.capacity} kg capacity`
                          : ""}
                      </option>
                    ))}

                  </SelectField>

                  <SelectField
                    label="Driver (available only)"
                    name="driverId"
                    value={form.driverId}
                    onChange={handleChange}
                    icon={UserRound}
                  >

                    <option value="">
                      Select available driver
                    </option>

                    {availableDrivers.map((driver) => (
                      <option
                        key={driver.id}
                        value={driver.id}
                      >
                        {driver.name}
                      </option>
                    ))}

                  </SelectField>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <Field
                      label="Cargo weight (kg)"
                      name="cargoWeight"
                      type="number"
                      min="1"
                      step="1"
                      value={form.cargoWeight}
                      onChange={handleChange}
                      placeholder="e.g. 700"
                      icon={Package}
                    />

                    <Field
                      label="Distance (km)"
                      name="plannedDistance"
                      type="number"
                      min="1"
                      step="0.1"
                      value={form.plannedDistance}
                      onChange={handleChange}
                      placeholder="e.g. 38"
                      icon={Route}
                    />

                  </div>

                  {selectedVehicle && capacityExceeded && (
                    <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">

                      <XCircle
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      <div>

                        <p className="font-medium">
                          Vehicle capacity exceeded
                        </p>

                        <p className="mt-1 text-xs leading-5">
                          Capacity: {selectedVehicle.capacity} kg
                          {" · "}
                          Cargo: {cargoWeight} kg
                          {" · "}
                          Exceeded by{" "}
                          {cargoWeight -
                            Number(selectedVehicle.capacity)}{" "}
                          kg
                        </p>

                      </div>

                    </div>
                  )}

                  {error && !capacityExceeded && (
                    <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">

                      <AlertCircle
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      <span>{error}</span>

                    </div>
                  )}

                  {availableVehicles.length === 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                      No available vehicles. Add a vehicle in the Fleet section or make an existing vehicle available.
                    </div>
                  )}

                  {availableDrivers.length === 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                      No eligible drivers are available for dispatch.
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">

                    <button
                      type="submit"
                      disabled={
                        capacityExceeded ||
                        availableVehicles.length === 0 ||
                        availableDrivers.length === 0
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
                    >
                      <Send size={15} />
                      Dispatch trip
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Clear
                    </button>

                  </div>

                </form>

              </div>

            </section>

            {/* Live board */}

            <section className="min-w-0">

              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

                <div>

                  <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
                    Live board
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Current trip activity and assignments.
                  </p>

                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">

                  <span>
                    <strong className="text-zinc-900 dark:text-white">
                      {trips.length}
                    </strong>{" "}
                    total
                  </span>

                  <span>
                    <strong className="text-orange-600">
                      {dispatchedTrips}
                    </strong>{" "}
                    dispatched
                  </span>

                </div>

              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                {filteredTrips.length === 0 ? (
                  <EmptyBoard hasSearch={Boolean(search.trim())} />
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">

                    {filteredTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                      />
                    ))}

                  </div>
                )}

              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-zinc-100/70 px-4 py-3 text-xs leading-5 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">

                <CheckCircle2
                  size={14}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />

                <span>
                  When a trip is completed, the vehicle and driver become available for future dispatch after the required operational records are updated.
                </span>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}

function TripLifecycle() {
  const steps = [
    {
      label: "Draft",
      color: "text-emerald-500",
    },
    {
      label: "Dispatched",
      color: "text-blue-500",
    },
    {
      label: "Completed",
      color: "text-zinc-400",
    },
    {
      label: "Cancelled",
      color: "text-zinc-400",
    },
  ];

  return (
    <div>

      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
        Trip lifecycle
      </p>

      <div className="relative flex justify-between">

        <div className="absolute left-5 right-5 top-[7px] h-px bg-zinc-200 dark:bg-zinc-700" />

        {steps.map((step) => (
          <div
            key={step.label}
            className="relative z-10 flex flex-col items-center bg-white px-1 dark:bg-zinc-900"
          >
            <Circle
              size={15}
              fill="currentColor"
              strokeWidth={0}
              className={step.color}
            />

            <span className={`mt-2 text-[10px] ${step.color}`}>
              {step.label}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}

function TripCard({ trip }) {
  const status = trip.status || "draft";

  return (
    <article className="p-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40">

      <div className="flex flex-col justify-between gap-4 sm:flex-row">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <p className="text-sm font-semibold text-zinc-950 dark:text-white">
              {trip.tripNumber}
            </p>

            <StatusBadge status={status} />

          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">

            <MapPin
              size={14}
              className="shrink-0 text-zinc-400"
            />

            <span>{trip.source}</span>

            <span className="text-zinc-400">
              →
            </span>

            <span>{trip.destination}</span>

          </div>

        </div>

        <div className="shrink-0 text-left sm:text-right">

          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {trip.vehicleName} / {trip.driverName}
          </p>

          <p className="mt-2 text-xs text-zinc-400">
            {trip.cargoWeight} kg · {trip.plannedDistance} km
          </p>

        </div>

      </div>

    </article>
  );
}

function StatusBadge({ status }) {
  const labels = {
    draft: "Draft",
    dispatched: "Dispatched",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`rounded-md px-2 py-1 text-[11px] font-medium ${
        statusStyles[status] || statusStyles.draft
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function EmptyBoard({ hasSearch }) {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
        {hasSearch ? <Search size={21} /> : <Route size={21} />}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-zinc-950 dark:text-white">
        {hasSearch ? "No matching trips" : "No trips in progress"}
      </h3>

      <p className="mt-1 max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {hasSearch
          ? "Try changing your search to find another trip, vehicle or driver."
          : "Create a trip and assign an available vehicle and driver. It will appear here once dispatched."}
      </p>

      {!hasSearch && (
        <div className="mt-5 flex items-center gap-2 text-xs text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Waiting for your first dispatch
        </div>
      )}

    </div>
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

function SelectField({
  label,
  icon: Icon,
  children,
  ...props
}) {
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
          className="w-full appearance-none rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-8 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-orange-950"
        >
          {children}
        </select>

      </div>

    </label>
  );
}

export default Trips;