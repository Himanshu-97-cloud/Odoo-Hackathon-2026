import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Truck,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  Wrench,
  Archive,
  LoaderCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const API_BASE_URL = "http://127.0.0.1:8000";

const VEHICLE_TYPES = [
  "Truck",
  "Van",
  "Bus",
  "Mini Truck",
  "Pickup",
  "Tanker",
  "Trailer",
];

const initialForm = {
  registrationNumber: "",
  nameModel: "",
  vehicleType: "",
  capacity: "",
  odometer: "",
  acquisitionCost: "",
  status: "available",
};

function getStoredUser() {
  try {
    const savedUser = localStorage.getItem("transitops-user");

    if (!savedUser) {
      return {
        name: "Fleet Manager",
        role: "Fleet Manager",
        initials: "FM",
      };
    }

    const parsedUser = JSON.parse(savedUser);

    const initials = (parsedUser.name || "Fleet Manager")
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return {
      ...parsedUser,
      initials: initials || "FM",
    };
  } catch {
    return {
      name: "Fleet Manager",
      role: "Fleet Manager",
      initials: "FM",
    };
  }
}

function getToken() {
  return localStorage.getItem("transitops-token");
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...options.headers,
      },
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("transitops-token");
      localStorage.removeItem("transitops-user");

      window.location.href = "/login";

      throw new Error("Your session has expired.");
    }

    let message = "Something went wrong.";

    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((item) => item.msg)
        .join(", ");
    }

    throw new Error(message);
  }

  return data;
}

function Vehicles() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [vehicles, setVehicles] = useState([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [vehicleModalOpen, setVehicleModalOpen] =
    useState(false);

  const [editingVehicle, setEditingVehicle] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [pageError, setPageError] = useState("");

  const user = getStoredUser();

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    setLoading(true);
    setPageError("");

    try {
      const data = await apiRequest("/api/vehicles");

      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load vehicles error:", error);

      setPageError(
        error.message || "Unable to load vehicles."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const query = search.trim().toLowerCase();

      const registrationNumber =
        vehicle.registrationNumber || "";

      const nameModel = vehicle.nameModel || "";

      const vehicleType = vehicle.vehicleType || "";

      const matchesSearch =
        !query ||
        registrationNumber
          .toLowerCase()
          .includes(query) ||
        nameModel.toLowerCase().includes(query) ||
        vehicleType.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "all" ||
        vehicle.vehicleType === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        vehicle.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    vehicles,
    search,
    typeFilter,
    statusFilter,
  ]);

  function handleFormChange(event) {
    const { name, value } = event.target;

    let newValue = value;

    if (name === "registrationNumber") {
      newValue = value.toUpperCase();
    }

    setForm((current) => ({
      ...current,
      [name]: newValue,
    }));

    setFormError("");
  }

  function openAddVehicle() {
    setEditingVehicle(null);
    setForm(initialForm);
    setFormError("");
    setVehicleModalOpen(true);
  }

  function openEditVehicle(vehicle) {
    setEditingVehicle(vehicle);

    setForm({
      registrationNumber:
        vehicle.registrationNumber || "",

      nameModel:
        vehicle.nameModel || "",

      vehicleType:
        vehicle.vehicleType || "",

      capacity:
        vehicle.capacity ?? "",

      odometer:
        vehicle.odometer ?? "",

      acquisitionCost:
        vehicle.acquisitionCost ?? "",

      status:
        vehicle.status || "available",
    });

    setFormError("");
    setVehicleModalOpen(true);
  }

  function closeVehicleModal() {
    if (saving) return;

    setVehicleModalOpen(false);
    setEditingVehicle(null);
    setForm(initialForm);
    setFormError("");
  }

  async function handleSaveVehicle(event) {
    event.preventDefault();

    const registrationNumber =
      form.registrationNumber
        .trim()
        .toUpperCase()
        .replace(/[\s-]/g, "");

    const registrationPattern =
      /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;

    const nameModelPattern = /[A-Za-z]/;

    if (!registrationNumber) {
      setFormError(
        "Registration number is required."
      );
      return;
    }

    if (!registrationPattern.test(registrationNumber)) {
      setFormError(
        "Enter a valid Indian registration number, for example GJ05AB1234."
      );
      return;
    }

    if (!form.nameModel.trim()) {
      setFormError(
        "Vehicle name or model is required."
      );
      return;
    }

    if (
      !nameModelPattern.test(form.nameModel.trim())
    ) {
      setFormError(
        "Vehicle name or model must contain at least one letter."
      );
      return;
    }

    if (!form.vehicleType) {
      setFormError(
        "Please select a vehicle type."
      );
      return;
    }

    const capacity = Number(form.capacity);
    const odometer = Number(form.odometer);

    const acquisitionCost = Number(
      form.acquisitionCost
    );

    if (
      !form.capacity ||
      !Number.isFinite(capacity) ||
      capacity <= 0
    ) {
      setFormError(
        "Capacity must be greater than 0."
      );
      return;
    }

    if (
      form.odometer === "" ||
      !Number.isFinite(odometer) ||
      odometer < 0
    ) {
      setFormError(
        "Odometer cannot be negative."
      );
      return;
    }

    if (
      !form.acquisitionCost ||
      !Number.isFinite(acquisitionCost) ||
      acquisitionCost <= 0
    ) {
      setFormError(
        "Acquisition cost must be greater than 0."
      );
      return;
    }

    const vehicleData = {
      registrationNumber,
      nameModel: form.nameModel.trim(),
      vehicleType: form.vehicleType,
      capacity,
      odometer,
      acquisitionCost,
      status: form.status,
    };

    setSaving(true);
    setFormError("");

    try {
      if (editingVehicle) {
        const updatedVehicle = await apiRequest(
          `/api/vehicles/${editingVehicle.id}`,
          {
            method: "PUT",
            body: JSON.stringify(vehicleData),
          }
        );

        setVehicles((current) =>
          current.map((vehicle) =>
            vehicle.id === editingVehicle.id
              ? updatedVehicle
              : vehicle
          )
        );
      } else {
        const savedVehicle = await apiRequest(
          "/api/vehicles",
          {
            method: "POST",
            body: JSON.stringify(vehicleData),
          }
        );

        setVehicles((current) => [
          savedVehicle,
          ...current,
        ]);
      }

      setVehicleModalOpen(false);
      setEditingVehicle(null);
      setForm(initialForm);
      setFormError("");
    } catch (error) {
      console.error("Save vehicle error:", error);

      setFormError(
        error.message || "Unable to save vehicle."
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeVehicleStatus(
    vehicleId,
    newStatus
  ) {
    setPageError("");

    try {
      const updatedVehicle = await apiRequest(
        `/api/vehicles/${vehicleId}/status`,
        {
          method: "PATCH",

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === vehicleId
            ? updatedVehicle
            : vehicle
        )
      );
    } catch (error) {
      console.error(
        "Change vehicle status error:",
        error
      );

      setPageError(
        error.message ||
          "Unable to change vehicle status."
      );
    }
  }

  async function confirmDeleteVehicle() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    setPageError("");

    try {
      await apiRequest(
        `/api/vehicles/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      setVehicles((current) =>
        current.filter(
          (vehicle) =>
            vehicle.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error(
        "Delete vehicle error:",
        error
      );

      setPageError(
        error.message || "Unable to delete vehicle."
      );

      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-900 transition-colors dark:bg-[#09090b] dark:text-zinc-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="lg:ml-60">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-500">
                Operations
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Fleet
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage your vehicles and monitor their
                availability.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddVehicle}
              className="flex w-fit items-center gap-2 rounded-md bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
            >
              <Plus size={16} />
              Add vehicle
            </button>
          </div>

          {pageError && (
            <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              <span>{pageError}</span>

              <button
                type="button"
                onClick={loadVehicles}
                className="shrink-0 font-medium underline"
              >
                Retry
              </button>
            </div>
          )}

          <section className="mb-5 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center">
            <div className="relative md:w-80">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search registration, model or type"
                className="w-full rounded-md border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-orange-950"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="all">
                All vehicle types
              </option>

              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="all">
                All statuses
              </option>

              <option value="available">
                Available
              </option>

              <option value="on-trip">
                On trip
              </option>

              <option value="in-shop">
                In shop
              </option>

              <option value="retired">
                Retired
              </option>
            </select>
          </section>

          <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                Vehicle registry
              </h2>

              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {vehicles.length === 0
                  ? "No registered vehicles"
                  : `${vehicles.length} registered ${
                      vehicles.length === 1
                        ? "vehicle"
                        : "vehicles"
                    }`}
              </p>
            </div>

            {loading ? (
              <LoadingFleet />
            ) : vehicles.length === 0 ? (
              <EmptyFleet onAdd={openAddVehicle} />
            ) : filteredVehicles.length === 0 ? (
              <NoSearchResults />
            ) : (
              <VehicleTable
                vehicles={filteredVehicles}
                onEdit={openEditVehicle}
                onDelete={setDeleteTarget}
                onStatusChange={changeVehicleStatus}
              />
            )}
          </section>
        </main>
      </div>

      {vehicleModalOpen && (
        <VehicleModal
          isEditing={Boolean(editingVehicle)}
          form={form}
          error={formError}
          saving={saving}
          onChange={handleFormChange}
          onSubmit={handleSaveVehicle}
          onClose={closeVehicleModal}
        />
      )}

      {deleteTarget && (
        <DeleteVehicleModal
          vehicle={deleteTarget}
          deleting={deleting}
          onCancel={() => {
            if (!deleting) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={confirmDeleteVehicle}
        />
      )}
    </div>
  );
}

function LoadingFleet() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <LoaderCircle
        size={28}
        className="animate-spin text-orange-600"
      />

      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        Loading vehicles...
      </p>
    </div>
  );
}

function EmptyFleet({ onAdd }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Truck
          size={20}
          className="text-zinc-500 dark:text-zinc-400"
        />
      </div>

      <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
        No vehicles added
      </h3>

      <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        Add your first vehicle to start managing your
        fleet and dispatching trips.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 flex items-center gap-2 rounded-md bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
      >
        <Plus size={16} />
        Add your first vehicle
      </button>
    </div>
  );
}

function NoSearchResults() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
      <Search
        size={20}
        className="mb-3 text-zinc-400"
      />

      <p className="text-sm font-medium text-zinc-900 dark:text-white">
        No matching vehicles
      </p>

      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Try changing your search or filters.
      </p>
    </div>
  );
}

function VehicleTable({
  vehicles,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
            <th className="px-5 py-3 font-medium">
              Registration
            </th>

            <th className="px-5 py-3 font-medium">
              Name / Model
            </th>

            <th className="px-5 py-3 font-medium">
              Type
            </th>

            <th className="px-5 py-3 font-medium">
              Capacity
            </th>

            <th className="px-5 py-3 font-medium">
              Odometer
            </th>

            <th className="px-5 py-3 font-medium">
              Acquisition cost
            </th>

            <th className="px-5 py-3 font-medium">
              Status
            </th>

            <th className="w-14 px-4 py-3" />
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {vehicles.map((vehicle) => (
            <tr
              key={vehicle.id}
              className="text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="whitespace-nowrap px-5 py-4 font-medium text-zinc-950 dark:text-white">
                {vehicle.registrationNumber}
              </td>

              <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                {vehicle.nameModel}
              </td>

              <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                {vehicle.vehicleType}
              </td>

              <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                {Number(
                  vehicle.capacity
                ).toLocaleString()}
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-zinc-600 dark:text-zinc-300">
                {Number(
                  vehicle.odometer
                ).toLocaleString()}{" "}
                km
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-zinc-600 dark:text-zinc-300">
                ₹
                {Number(
                  vehicle.acquisitionCost
                ).toLocaleString("en-IN")}
              </td>

              <td className="px-5 py-4">
                <VehicleStatus
                  status={vehicle.status}
                />
              </td>

              <td className="px-4 py-4 text-right">
                <VehicleMenu
                  vehicle={vehicle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VehicleStatus({ status }) {
  const statusConfig = {
    available: {
      label: "Available",
      classes:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    },

    "on-trip": {
      label: "On trip",
      classes:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    },

    "in-shop": {
      label: "In shop",
      classes:
        "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
    },

    retired: {
      label: "Retired",
      classes:
        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    },
  };

  const current =
    statusConfig[status] ||
    statusConfig.available;

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${current.classes}`}
    >
      {current.label}
    </span>
  );
}

function VehicleMenu({
  vehicle,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const [open, setOpen] = useState(false);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef(null);

  function calculatePosition() {
    if (!buttonRef.current) return;

    const rect =
      buttonRef.current.getBoundingClientRect();

    const menuWidth = 210;
    const menuHeight = 240;
    const gap = 6;
    const padding = 8;

    let left = rect.right - menuWidth;
    let top = rect.bottom + gap;

    if (left < padding) {
      left = padding;
    }

    if (
      top + menuHeight >
      window.innerHeight - padding
    ) {
      top = rect.top - menuHeight - gap;
    }

    if (top < padding) {
      top = padding;
    }

    setPosition({
      top,
      left,
    });
  }

  function toggleMenu() {
    if (!open) {
      calculatePosition();
    }

    setOpen((current) => !current);
  }

  function closeMenu() {
    setOpen(false);
  }

  function runAction(action) {
    closeMenu();
    action();
  }

  useEffect(() => {
    if (!open) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    function handleViewportChange() {
      calculatePosition();
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    window.addEventListener(
      "scroll",
      handleViewportChange,
      true
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );

      window.removeEventListener(
        "resize",
        handleViewportChange
      );

      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true
      );
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:hover:bg-zinc-700 dark:hover:text-white"
        aria-label={`Options for ${vehicle.registrationNumber}`}
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close vehicle actions"
              onClick={closeMenu}
              className="fixed inset-0 z-[9998] cursor-default bg-transparent"
            />

            <div
              role="menu"
              className="fixed z-[9999] w-52 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
              }}
            >
              <VehicleMenuButton
                icon={Pencil}
                label="Edit vehicle"
                onClick={() =>
                  runAction(() =>
                    onEdit(vehicle)
                  )
                }
              />

              {vehicle.status !== "available" && (
                <VehicleMenuButton
                  icon={CheckCircle}
                  label="Mark available"
                  onClick={() =>
                    runAction(() =>
                      onStatusChange(
                        vehicle.id,
                        "available"
                      )
                    )
                  }
                />
              )}

              {vehicle.status !== "in-shop" && (
                <VehicleMenuButton
                  icon={Wrench}
                  label="Send to shop"
                  onClick={() =>
                    runAction(() =>
                      onStatusChange(
                        vehicle.id,
                        "in-shop"
                      )
                    )
                  }
                />
              )}

              {vehicle.status !== "retired" && (
                <VehicleMenuButton
                  icon={Archive}
                  label="Retire vehicle"
                  onClick={() =>
                    runAction(() =>
                      onStatusChange(
                        vehicle.id,
                        "retired"
                      )
                    )
                  }
                />
              )}

              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

              <VehicleMenuButton
                icon={Trash2}
                label="Delete vehicle"
                danger
                onClick={() =>
                  runAction(() =>
                    onDelete(vehicle)
                  )
                }
              />
            </div>
          </>,
          document.body
        )}
    </>
  );
}

function VehicleMenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}

function VehicleModal({
  isEditing,
  form,
  error,
  saving,
  onChange,
  onSubmit,
  onClose,
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
              {isEditing
                ? "Edit vehicle"
                : "Add vehicle"}
            </h2>

            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {isEditing
                ? "Update the vehicle details below."
                : "Enter the vehicle details below."}
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Registration number"
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={onChange}
              placeholder="GJ05AB1234"
              maxLength={15}
              autoComplete="off"
              required
            />

            <FormField
              label="Name / Model"
              name="nameModel"
              value={form.nameModel}
              onChange={onChange}
              placeholder="Tata Ace Gold"
              maxLength={80}
              required
            />

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Vehicle type
              </span>

              <select
                name="vehicleType"
                value={form.vehicleType}
                onChange={onChange}
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-orange-950"
              >
                <option value="">
                  Select vehicle type
                </option>

                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <FormField
              label="Capacity"
              name="capacity"
              type="number"
              min="1"
              step="1"
              value={form.capacity}
              onChange={onChange}
              placeholder="5000"
              required
            />

            <FormField
              label="Odometer (km)"
              name="odometer"
              type="number"
              min="0"
              step="1"
              value={form.odometer}
              onChange={onChange}
              placeholder="25000"
              required
            />

            <FormField
              label="Acquisition cost (₹)"
              name="acquisitionCost"
              type="number"
              min="1"
              step="0.01"
              value={form.acquisitionCost}
              onChange={onChange}
              placeholder="1500000"
              required
            />

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Status
              </span>

              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-orange-950"
              >
                <option value="available">
                  Available
                </option>

                <option value="on-trip">
                  On trip
                </option>

                <option value="in-shop">
                  In shop
                </option>

                <option value="retired">
                  Retired
                </option>
              </select>
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex min-w-28 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Add vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function DeleteVehicleModal({
  vehicle,
  deleting,
  onCancel,
  onConfirm,
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !deleting
        ) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <Trash2 size={18} />
        </div>

        <h2 className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">
          Delete vehicle?
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Are you sure you want to delete{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-200">
            {vehicle.registrationNumber}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="flex min-w-32 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting && (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            )}

            {deleting
              ? "Deleting..."
              : "Delete vehicle"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  ...props
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-orange-950"
      />
    </label>
  );
}

export default Vehicles;