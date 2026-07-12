import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {Ban,MoreHorizontal, Pencil, Plus, Search, ShieldAlert, Trash2, UserRoundCheck, UserRoundX, Users, X} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const LICENSE_CATEGORIES = ["LMV", "HMV", "MCWG", "TRANS"];

const EMPTY_FORM = {
  fullName: "",
  licenseNumber: "",
  category: "",
  licenseExpiry: "",
  phone: "",
  safetyStatus: "available",
  status: "available",
};

function Drivers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Later, replace this state with data fetched from your backend.
  const [drivers, setDrivers] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const user = {
    name: "Fleet Manager",
    role: "Administrator",
    initials: "FM",
  };

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return drivers.filter((driver) => {
      const matchesSearch =
        !query ||
        driver.fullName.toLowerCase().includes(query) ||
        driver.licenseNumber.toLowerCase().includes(query) ||
        driver.phone.includes(query) ||
        driver.category.toLowerCase().includes(query);

      const effectiveStatus = getEffectiveStatus(driver);

      const matchesStatus =
        statusFilter === "all" || effectiveStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  function openAddDriver() {
    setEditingDriver(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setDriverModalOpen(true);
  }

  function openEditDriver(driver) {
    setEditingDriver(driver);

    setForm({
      fullName: driver.fullName,
      licenseNumber: driver.licenseNumber,
      category: driver.category,
      licenseExpiry: driver.licenseExpiry,
      phone: driver.phone,
      safetyStatus: driver.safetyStatus,
      status: driver.status,
    });

    setFormError("");
    setDriverModalOpen(true);
  }

  function closeDriverModal() {
    setDriverModalOpen(false);
    setEditingDriver(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    let cleanValue = value;

    if (name === "licenseNumber") {
      cleanValue = value.toUpperCase();
    }

    if (name === "phone") {
      cleanValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((current) => ({
      ...current,
      [name]: cleanValue,
    }));

    setFormError("");
  }

  function validateDriver() {
    const fullName = form.fullName.trim();

    const licenseNumber = form.licenseNumber
      .trim()
      .toUpperCase()
      .replace(/[\s-]/g, "");

    const phone = form.phone.trim();

    const namePattern = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    const phonePattern = /^[6-9][0-9]{9}$/;

    /*
      Indian driving licence format used here:
      2 letters + 13 digits

      Example:
      GJ0520240012345
    */
    const licensePattern = /^[A-Z]{2}[0-9]{13}$/;

    if (!fullName) {
      return "Driver name is required.";
    }

    if (fullName.length < 3 || !namePattern.test(fullName)) {
      return "Enter a valid name using letters and spaces only.";
    }

    if (!licenseNumber) {
      return "Driving licence number is required.";
    }

    if (!licensePattern.test(licenseNumber)) {
      return "Enter a valid licence number, for example GJ0520240012345.";
    }

    if (!form.category) {
      return "Select a licence category.";
    }

    if (!form.licenseExpiry) {
      return "Licence expiry date is required.";
    }

    if (!phonePattern.test(phone)) {
      return "Enter a valid 10-digit Indian mobile number.";
    }

    const duplicateLicense = drivers.some(
      (driver) =>
        driver.id !== editingDriver?.id &&
        driver.licenseNumber === licenseNumber
    );

    if (duplicateLicense) {
      return "A driver with this licence number already exists.";
    }

    const duplicatePhone = drivers.some(
      (driver) =>
        driver.id !== editingDriver?.id &&
        driver.phone === phone
    );

    if (duplicatePhone) {
      return "A driver with this phone number already exists.";
    }

    return null;
  }

  function handleSaveDriver(event) {
    event.preventDefault();

    const validationError = validateDriver();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const driverData = {
      fullName: form.fullName.trim(),

      licenseNumber: form.licenseNumber
        .trim()
        .toUpperCase()
        .replace(/[\s-]/g, ""),

      category: form.category,
      licenseExpiry: form.licenseExpiry,
      phone: form.phone.trim(),
      safetyStatus: form.safetyStatus,
      status:
        form.safetyStatus === "suspended"
          ? "suspended"
          : form.status,
    };

    if (editingDriver) {
      setDrivers((current) =>
        current.map((driver) =>
          driver.id === editingDriver.id
            ? {
                ...driver,
                ...driverData,
              }
            : driver
        )
      );
    } else {
      const newDriver = {
        id: crypto.randomUUID(),
        ...driverData,

        // These will later come from actual trip records.
        completedTrips: 0,
        totalTrips: 0,
      };

      setDrivers((current) => [...current, newDriver]);
    }

    closeDriverModal();
  }

  function changeDriverStatus(driverId, newStatus) {
    setDrivers((current) =>
      current.map((driver) => {
        if (driver.id !== driverId) {
          return driver;
        }

        /*
          A suspended driver or driver with an expired licence
          cannot manually become available.
        */
        if (
          newStatus === "available" &&
          (driver.safetyStatus === "suspended" ||
            isLicenseExpired(driver.licenseExpiry))
        ) {
          return driver;
        }

        return {
          ...driver,
          status: newStatus,
        };
      })
    );
  }

  function suspendDriver(driverId) {
    setDrivers((current) =>
      current.map((driver) =>
        driver.id === driverId
          ? {
              ...driver,
              safetyStatus: "suspended",
              status: "suspended",
            }
          : driver
      )
    );
  }

  function restoreDriver(driverId) {
    setDrivers((current) =>
      current.map((driver) => {
        if (driver.id !== driverId) {
          return driver;
        }

        if (isLicenseExpired(driver.licenseExpiry)) {
          return driver;
        }

        return {
          ...driver,
          safetyStatus: "available",
          status: "available",
        };
      })
    );
  }

  function confirmDeleteDriver() {
    if (!deleteTarget) {
      return;
    }

    setDrivers((current) =>
      current.filter((driver) => driver.id !== deleteTarget.id)
    );

    setDeleteTarget(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-900 transition-colors dark:bg-[#09090b] dark:text-zinc-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="min-w-0 lg:ml-60">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-500">
                Operations
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Drivers
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage drivers, licences, safety and availability.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddDriver}
              className="flex w-fit items-center gap-2 rounded-md bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
            >
              <Plus size={16} />

              Add driver
            </button>
          </div>

          <section className="mb-5 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-md">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search driver, licence, phone or category"
                className="w-full rounded-md border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-orange-950"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 md:w-auto"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="on-trip">On trip</option>
              <option value="off-duty">Off duty</option>
              <option value="suspended">Suspended</option>
            </select>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                Driver registry
              </h2>

              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {drivers.length === 0
                  ? "No registered drivers"
                  : `${drivers.length} registered ${
                      drivers.length === 1 ? "driver" : "drivers"
                    }`}
              </p>
            </div>

            {drivers.length === 0 ? (
              <EmptyDrivers onAdd={openAddDriver} />
            ) : filteredDrivers.length === 0 ? (
              <NoSearchResults />
            ) : (
              <DriverTable
                drivers={filteredDrivers}
                onEdit={openEditDriver}
                onDelete={setDeleteTarget}
                onStatusChange={changeDriverStatus}
                onSuspend={suspendDriver}
                onRestore={restoreDriver}
              />
            )}
          </section>

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-900/60 dark:bg-orange-950/20">
            <ShieldAlert
              size={18}
              className="mt-0.5 shrink-0 text-orange-600 dark:text-orange-500"
            />

            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Trip assignment rule
              </p>

              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                Drivers with an expired licence or suspended safety status
                cannot be assigned to a trip.
              </p>
            </div>
          </div>
        </main>
      </div>

      {driverModalOpen && (
        <DriverModal
          isEditing={Boolean(editingDriver)}
          form={form}
          error={formError}
          onChange={handleFormChange}
          onSubmit={handleSaveDriver}
          onClose={closeDriverModal}
        />
      )}

      {deleteTarget && (
        <DeleteDriverModal
          driver={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteDriver}
        />
      )}
    </div>
  );
}

function EmptyDrivers({ onAdd }) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Users
          size={20}
          className="text-zinc-500 dark:text-zinc-400"
        />
      </div>

      <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
        No drivers added
      </h3>

      <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        Add your first driver to start managing licences, safety and trip
        assignments.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 flex items-center gap-2 rounded-md bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
      >
        <Plus size={16} />

        Add your first driver
      </button>
    </div>
  );
}

function NoSearchResults() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
      <Search size={20} className="mb-3 text-zinc-400" />

      <p className="text-sm font-medium text-zinc-900 dark:text-white">
        No matching drivers
      </p>

      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Try changing your search or status filter.
      </p>
    </div>
  );
}

function DriverTable({
  drivers,
  onEdit,
  onDelete,
  onStatusChange,
  onSuspend,
  onRestore,
}) {
  return (
    /*
      Important:
      This wrapper only handles horizontal scrolling.

      The three-dot menu is rendered through a React portal,
      so it does not affect this container's scroll dimensions.
    */
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[1180px] table-auto text-left">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
            <th className="whitespace-nowrap px-5 py-3 font-medium">
              Driver
            </th>

            <th className="whitespace-nowrap px-5 py-3 font-medium">
              License no.
            </th>

            <th className="whitespace-nowrap px-5 py-3 font-medium">
              Category
            </th>

            <th className="whitespace-nowrap px-5 py-3 font-medium">
              Expiry
            </th>

            <th className="whitespace-nowrap px-5 py-3 font-medium">
              Contact
            </th>

            <th className="whitespace-nowrap px-5 py-3 font-medium">
              Trip compl.
            </th>

            <th className="whitespace-nowrap px-5 py-3 font-medium">
              Safety
            </th>

            <th className="whitespace-nowrap px-5 py-3 font-medium">
              Status
            </th>

            <th
              className="w-14 px-4 py-3"
              aria-label="Driver actions"
            />
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {drivers.map((driver) => {
            const expired = isLicenseExpired(driver.licenseExpiry);

            const effectiveStatus = getEffectiveStatus(driver);

            const tripCompletion = getTripCompletion(driver);

            return (
              <tr
                key={driver.id}
                className="text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="whitespace-nowrap px-5 py-4 font-medium text-zinc-950 dark:text-white">
                  {driver.fullName}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-zinc-600 dark:text-zinc-300">
                  {driver.licenseNumber}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-zinc-600 dark:text-zinc-300">
                  {driver.category}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={
                      expired
                        ? "font-medium text-red-600 dark:text-red-400"
                        : "text-zinc-600 dark:text-zinc-300"
                    }
                  >
                    {formatDate(driver.licenseExpiry)}

                    {expired && " · Expired"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-zinc-600 dark:text-zinc-300">
                  +91 {driver.phone}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-zinc-600 dark:text-zinc-300">
                  {tripCompletion === null ? "—" : `${tripCompletion}%`}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <SafetyBadge
                    status={
                      expired || driver.safetyStatus === "suspended"
                        ? "suspended"
                        : "available"
                    }
                  />
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <DriverStatus status={effectiveStatus} />
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <DriverMenu
                    driver={driver}
                    expired={expired}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onSuspend={onSuspend}
                    onRestore={onRestore}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DriverMenu({
  driver,
  expired,
  onEdit,
  onDelete,
  onStatusChange,
  onSuspend,
  onRestore,
}) {
  const [open, setOpen] = useState(false);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef(null);

  const suspended = driver.safetyStatus === "suspended";

  function calculatePosition() {
    if (!buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();

    const menuWidth = 208;
    const menuHeight = 230;
    const gap = 6;
    const screenPadding = 8;

    let left = rect.right - menuWidth;
    let top = rect.bottom + gap;

    /*
      Prevent menu from going outside left side of screen.
    */
    if (left < screenPadding) {
      left = screenPadding;
    }

    /*
      If there is not enough room below the button,
      open the menu above it.
    */
    if (top + menuHeight > window.innerHeight - screenPadding) {
      top = rect.top - menuHeight - gap;
    }

    /*
      Final safety check for the top edge.
    */
    if (top < screenPadding) {
      top = screenPadding;
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
    if (!open) {
      return;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    function handleViewportChange() {
      calculatePosition();
    }

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:hover:bg-zinc-700 dark:hover:text-white"
        aria-label={`Options for ${driver.fullName}`}
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close driver actions"
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
              <MenuButton
                icon={Pencil}
                label="Edit driver"
                onClick={() =>
                  runAction(() => onEdit(driver))
                }
              />

              {!expired &&
                !suspended &&
                driver.status !== "available" && (
                  <MenuButton
                    icon={UserRoundCheck}
                    label="Mark available"
                    onClick={() =>
                      runAction(() =>
                        onStatusChange(driver.id, "available")
                      )
                    }
                  />
                )}

              {!expired &&
                !suspended &&
                driver.status !== "off-duty" && (
                  <MenuButton
                    icon={UserRoundX}
                    label="Mark off duty"
                    onClick={() =>
                      runAction(() =>
                        onStatusChange(driver.id, "off-duty")
                      )
                    }
                  />
                )}

              {!suspended ? (
                <MenuButton
                  icon={Ban}
                  label="Suspend driver"
                  onClick={() =>
                    runAction(() => onSuspend(driver.id))
                  }
                />
              ) : (
                <MenuButton
                  icon={UserRoundCheck}
                  label="Restore driver"
                  disabled={expired}
                  onClick={() =>
                    runAction(() => onRestore(driver.id))
                  }
                />
              )}

              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

              <MenuButton
                icon={Trash2}
                label="Delete driver"
                danger
                onClick={() =>
                  runAction(() => onDelete(driver))
                }
              />
            </div>
          </>,
          document.body
        )}
    </>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <Icon size={15} />

      <span>{label}</span>
    </button>
  );
}

function SafetyBadge({ status }) {
  const classes =
    status === "suspended"
      ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400"
      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400";

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {status === "suspended" ? "Suspended" : "Available"}
    </span>
  );
}

function DriverStatus({ status }) {
  const config = {
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

    "off-duty": {
      label: "Off duty",
      classes:
        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    },

    suspended: {
      label: "Suspended",
      classes:
        "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
    },
  };

  const current = config[status] || config.available;

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${current.classes}`}
    >
      {current.label}
    </span>
  );
}

function DriverModal({
  isEditing,
  form,
  error,
  onChange,
  onSubmit,
  onClose,
}) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
              {isEditing ? "Edit driver" : "Add driver"}
            </h2>

            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {isEditing
                ? "Update the driver's information."
                : "Add driver and licence information."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              placeholder="Rahul Sharma"
              required
            />

            <FormField
              label="License number"
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={onChange}
              placeholder="GJ0520240012345"
              required
            />

            <SelectField
              label="License category"
              name="category"
              value={form.category}
              onChange={onChange}
            >
              <option value="">Select category</option>

              {LICENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </SelectField>

            <FormField
              label="License expiry"
              name="licenseExpiry"
              type="date"
              value={form.licenseExpiry}
              onChange={onChange}
              required
            />

            <FormField
              label="Contact number"
              name="phone"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={onChange}
              placeholder="9876543210"
              maxLength={10}
              required
            />

            <SelectField
              label="Safety status"
              name="safetyStatus"
              value={form.safetyStatus}
              onChange={onChange}
            >
              <option value="available">Available</option>
              <option value="suspended">Suspended</option>
            </SelectField>

            <SelectField
              label="Duty status"
              name="status"
              value={form.status}
              onChange={onChange}
            >
              <option value="available">Available</option>
              <option value="off-duty">Off duty</option>
              <option value="suspended">Suspended</option>
            </SelectField>
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
              onClick={onClose}
              className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
            >
              {isEditing ? "Save changes" : "Add driver"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function DeleteDriverModal({
  driver,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <Trash2 size={18} />
        </div>

        <h2 className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">
          Delete driver?
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Are you sure you want to delete{" "}

          <span className="font-medium text-zinc-900 dark:text-zinc-200">
            {driver.fullName}
          </span>

          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Delete driver
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
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-orange-950"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  children,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-orange-950"
      >
        {children}
      </select>
    </label>
  );
}

function getEffectiveStatus(driver) {
  if (
    isLicenseExpired(driver.licenseExpiry) ||
    driver.safetyStatus === "suspended"
  ) {
    return "suspended";
  }

  return driver.status;
}

function getTripCompletion(driver) {
  if (!driver.totalTrips || driver.totalTrips <= 0) {
    return null;
  }

  return Math.round(
    (driver.completedTrips / driver.totalTrips) * 100
  );
}

function isLicenseExpired(dateString) {
  if (!dateString) {
    return false;
  }

  const expiry = new Date(`${dateString}T23:59:59`);

  return expiry < new Date();
}

function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

export default Drivers;