import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings as SettingsIcon,
  Sun,
  Trash2,
  Truck,
  User,
  Wrench,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const emptyForm = {
  vehicleId: "",
  serviceType: "",
  cost: "",
  date: "",
  status: "in_shop",
};

const statusStyles = {
  in_shop:
    "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  completed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

function Maintenance() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [form, setForm] = useState(emptyForm);

  // Replace these with backend API data later.
  const [records, setRecords] = useState([]);
  const [vehicles] = useState([]);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

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
    function closeMenus(event) {
      if (!event.target.closest("[data-profile-menu]")) {
        setProfileOpen(false);
      }

      if (!event.target.closest("[data-record-menu]")) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", closeMenus);

    return () => {
      document.removeEventListener("mousedown", closeMenus);
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) => {
      const searchableValues = [
        record.vehicleName,
        record.serviceType,
        record.status,
        record.cost,
      ];

      return searchableValues.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [records, search]);

  const inShopCount = records.filter(
    (record) => record.status === "in_shop"
  ).length;

  const completedCount = records.filter(
    (record) => record.status === "completed"
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
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function validateForm() {
    const serviceType = form.serviceType.trim();
    const cost = Number(form.cost);

    if (!form.vehicleId) return "Select a vehicle.";

    if (serviceType.length < 3) {
      return "Enter a valid service type.";
    }

    if (!cost || cost <= 0) {
      return "Enter a valid service cost greater than zero.";
    }

    if (!form.date) return "Select the service date.";

    if (!["in_shop", "completed"].includes(form.status)) {
      return "Select a valid maintenance status.";
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

    const selectedVehicle = vehicles.find(
      (vehicle) => String(vehicle.id) === String(form.vehicleId)
    );

    if (!selectedVehicle) {
      setError("The selected vehicle could not be found.");
      return;
    }

    const recordData = {
      vehicleId: selectedVehicle.id,
      vehicleName:
        selectedVehicle.registrationNumber ||
        selectedVehicle.name ||
        "Unknown vehicle",
      serviceType: form.serviceType.trim(),
      cost: Number(form.cost),
      date: form.date,
      status: form.status,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      setRecords((current) =>
        current.map((record) =>
          record.id === editingId
            ? { ...record, ...recordData }
            : record
        )
      );
    } else {
      const newRecord = {
        id: crypto.randomUUID(),
        ...recordData,
        createdAt: new Date().toISOString(),
      };

      setRecords((current) => [newRecord, ...current]);
    }

    resetForm();
  }

  function startEditing(record) {
    setForm({
      vehicleId: String(record.vehicleId),
      serviceType: record.serviceType,
      cost: String(record.cost),
      date: record.date,
      status: record.status,
    });

    setEditingId(record.id);
    setOpenMenuId(null);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function markCompleted(id) {
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              status: "completed",
              updatedAt: new Date().toISOString(),
            }
          : record
      )
    );

    setOpenMenuId(null);
  }

  function deleteRecord(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance record?"
    );

    if (!confirmed) return;

    setRecords((current) =>
      current.filter((record) => record.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }

    setOpenMenuId(null);
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
                  placeholder="Search vehicles, trips or drivers"
                  className="h-10 w-72 rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-orange-500 dark:focus:bg-zinc-900 dark:focus:ring-orange-950"
                />

              </div>

            </div>

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

              <div className="relative" data-profile-menu>

                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen((current) => !current)
                  }
                  className="flex items-center gap-3 rounded-lg p-1 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  aria-expanded={profileOpen}
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

          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">
                Operations
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Maintenance
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Log vehicle services and manage fleet availability.
              </p>

            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span>{inShopCount} in shop</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{completedCount} completed</span>
              </div>

            </div>

          </div>

          <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">

            {/* Service form */}

            <section className="h-fit overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

              <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                    <Wrench size={17} />
                  </div>

                  <div>

                    <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                      {editingId
                        ? "Edit service record"
                        : "Log service record"}
                    </h2>

                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Record vehicle maintenance and repair work.
                    </p>

                  </div>

                </div>

              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-5">

                <SelectField
                  label="Vehicle"
                  name="vehicleId"
                  value={form.vehicleId}
                  onChange={handleChange}
                  icon={Truck}
                >

                  <option value="">Select vehicle</option>

                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNumber || vehicle.name}
                    </option>
                  ))}

                </SelectField>

                <Field
                  label="Service type"
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  placeholder="e.g. Oil change"
                  icon={Wrench}
                  maxLength={60}
                />

                <Field
                  label="Cost"
                  name="cost"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.cost}
                  onChange={handleChange}
                  placeholder="Enter service cost"
                  icon={CircleDollarSign}
                />

                <Field
                  label="Service date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  icon={CalendarDays}
                />

                <SelectField
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  icon={CheckCircle2}
                >
                  <option value="in_shop">In shop</option>
                  <option value="completed">Completed</option>
                </SelectField>

                {error && (
                  <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">

                    <AlertCircle
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>

                  </div>
                )}

                {vehicles.length === 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                    No vehicles available. Add vehicles in the Fleet section first.
                  </div>
                )}

                <div className="flex gap-3 pt-1">

                  <button
                    type="submit"
                    disabled={vehicles.length === 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
                  >
                    {editingId ? <Check size={16} /> : <Plus size={16} />}

                    {editingId ? "Save changes" : "Save record"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex items-center justify-center rounded-lg border border-zinc-200 px-3 text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      aria-label="Cancel editing"
                    >
                      <X size={17} />
                    </button>
                  )}

                </div>

              </form>

              <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">

                <div className="flex items-start gap-3 rounded-lg bg-orange-50 px-3.5 py-3 dark:bg-orange-950/20">

                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-orange-600 dark:text-orange-400"
                  />

                  <div>

                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      Dispatch availability
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      Vehicles under active maintenance are automatically unavailable for trip dispatch.
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* Service log */}

            <section className="min-w-0">

              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

                <div>

                  <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
                    Service log
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Maintenance history across your fleet.
                  </p>

                </div>

                <div className="relative w-full sm:w-64">

                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search service records"
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-orange-950"
                  />

                </div>

              </div>

              <div className="overflow-visible rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                {filteredRecords.length === 0 ? (
                  <EmptyState hasSearch={Boolean(search.trim())} />
                ) : (
                  <div className="w-full overflow-x-auto">

                    <table className="w-full min-w-[720px] border-collapse text-left">

                      <thead>

                        <tr className="border-b border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-950/30">

                          <TableHeading>Vehicle</TableHeading>
                          <TableHeading>Service</TableHeading>
                          <TableHeading>Date</TableHeading>
                          <TableHeading>Cost</TableHeading>
                          <TableHeading>Status</TableHeading>

                          <TableHeading>
                            <span className="sr-only">Actions</span>
                          </TableHeading>

                        </tr>

                      </thead>

                      <tbody>

                        {filteredRecords.map((record) => (
                          <tr
                            key={record.id}
                            className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 dark:border-zinc-800 dark:hover:bg-zinc-800/30"
                          >

                            <TableCell>
                              <span className="font-medium text-zinc-950 dark:text-white">
                                {record.vehicleName}
                              </span>
                            </TableCell>

                            <TableCell>{record.serviceType}</TableCell>

                            <TableCell>{formatDate(record.date)}</TableCell>

                            <TableCell>{formatCurrency(record.cost)}</TableCell>

                            <TableCell>
                              <StatusBadge status={record.status} />
                            </TableCell>

                            <TableCell>

                              <div
                                className="relative flex justify-end"
                                data-record-menu
                              >

                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenMenuId((current) =>
                                      current === record.id
                                        ? null
                                        : record.id
                                    )
                                  }
                                  className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
                                  aria-label={`Actions for ${record.vehicleName}`}
                                >
                                  <MoreHorizontal size={18} />
                                </button>

                                {openMenuId === record.id && (
                                  <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">

                                    <MenuButton
                                      icon={Pencil}
                                      onClick={() => startEditing(record)}
                                    >
                                      Edit record
                                    </MenuButton>

                                    {record.status !== "completed" && (
                                      <MenuButton
                                        icon={CheckCircle2}
                                        onClick={() =>
                                          markCompleted(record.id)
                                        }
                                      >
                                        Mark completed
                                      </MenuButton>
                                    )}

                                    <MenuButton
                                      icon={Trash2}
                                      danger
                                      onClick={() =>
                                        deleteRecord(record.id)
                                      }
                                    >
                                      Delete record
                                    </MenuButton>

                                  </div>
                                )}

                              </div>

                            </TableCell>

                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}

function StatusBadge({ status }) {
  const label = status === "completed" ? "Completed" : "In shop";

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] || statusStyles.in_shop
      }`}
    >
      {label}
    </span>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
        <Wrench size={20} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-zinc-950 dark:text-white">
        {hasSearch
          ? "No matching records"
          : "No maintenance records yet"}
      </h3>

      <p className="mt-1 max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {hasSearch
          ? "Try changing your search to find another service record."
          : "Service and repair records will appear here after they are logged."}
      </p>

    </div>
  );
}

function MenuButton({
  icon: Icon,
  children,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      <Icon size={15} />
      {children}
    </button>
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

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export default Maintenance;