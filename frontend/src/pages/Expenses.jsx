import { useMemo, useState } from "react";
import {
  Menu,
  Plus,
  Fuel,
  ReceiptText,
  X,
  Truck,
  CalendarDays,
  IndianRupee,
  Gauge,
  Route,
  CircleDollarSign,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

function Expenses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // Replace these arrays with API data when backend is connected.
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // These will eventually come from your Fleet and Trips APIs.
  const vehicles = [];
  const trips = [];

  const [fuelForm, setFuelForm] = useState({
    vehicleId: "",
    date: "",
    liters: "",
    cost: "",
    odometer: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    tripId: "",
    vehicleId: "",
    toll: "",
    other: "",
    description: "",
    date: "",
  });

  const [fuelErrors, setFuelErrors] = useState({});
  const [expenseErrors, setExpenseErrors] = useState({});

  const user = {
    name: "Fleet Manager",
    role: "Administrator",
    initials: "FM",
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const totalFuelCost = useMemo(
    () => fuelLogs.reduce((sum, log) => sum + Number(log.cost || 0), 0),
    [fuelLogs]
  );

  const totalOtherExpenses = useMemo(
    () =>
      expenses.reduce(
        (sum, expense) =>
          sum +
          Number(expense.toll || 0) +
          Number(expense.other || 0) +
          Number(expense.maintenanceCost || 0),
        0
      ),
    [expenses]
  );

  const operationalCost = totalFuelCost + totalOtherExpenses;

  function updateFuelForm(event) {
    const { name, value } = event.target;

    setFuelForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (fuelErrors[name]) {
      setFuelErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  }

  function updateExpenseForm(event) {
    const { name, value } = event.target;

    setExpenseForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (expenseErrors[name]) {
      setExpenseErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  }

  function validateFuelForm() {
    const errors = {};

    if (!fuelForm.vehicleId) {
      errors.vehicleId = "Select a vehicle.";
    }

    if (!fuelForm.date) {
      errors.date = "Select the fuel date.";
    }

    if (!fuelForm.liters || Number(fuelForm.liters) <= 0) {
      errors.liters = "Enter a valid fuel quantity.";
    }

    if (!fuelForm.cost || Number(fuelForm.cost) <= 0) {
      errors.cost = "Enter a valid fuel cost.";
    }

    if (fuelForm.odometer && Number(fuelForm.odometer) < 0) {
      errors.odometer = "Odometer reading cannot be negative.";
    }

    setFuelErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function validateExpenseForm() {
    const errors = {};

    if (!expenseForm.vehicleId) {
      errors.vehicleId = "Select a vehicle.";
    }

    if (!expenseForm.date) {
      errors.date = "Select the expense date.";
    }

    const toll = Number(expenseForm.toll || 0);
    const other = Number(expenseForm.other || 0);

    if (toll < 0) {
      errors.toll = "Toll cannot be negative.";
    }

    if (other < 0) {
      errors.other = "Other expense cannot be negative.";
    }

    if (toll === 0 && other === 0) {
      errors.other = "Enter at least one expense amount.";
    }

    setExpenseErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function handleFuelSubmit(event) {
    event.preventDefault();

    if (!validateFuelForm()) return;

    const vehicle = vehicles.find(
      (item) => String(item.id) === String(fuelForm.vehicleId)
    );

    const newFuelLog = {
      id: crypto.randomUUID(),
      vehicleId: fuelForm.vehicleId,
      vehicleName: vehicle?.registrationNumber || "Unknown vehicle",
      date: fuelForm.date,
      liters: Number(fuelForm.liters),
      cost: Number(fuelForm.cost),
      odometer: fuelForm.odometer
        ? Number(fuelForm.odometer)
        : null,
    };

    setFuelLogs((current) => [newFuelLog, ...current]);

    setFuelForm({
      vehicleId: "",
      date: "",
      liters: "",
      cost: "",
      odometer: "",
    });

    setFuelErrors({});
    setFuelModalOpen(false);
  }

  function handleExpenseSubmit(event) {
    event.preventDefault();

    if (!validateExpenseForm()) return;

    const vehicle = vehicles.find(
      (item) => String(item.id) === String(expenseForm.vehicleId)
    );

    const trip = trips.find(
      (item) => String(item.id) === String(expenseForm.tripId)
    );

    const newExpense = {
      id: crypto.randomUUID(),
      tripId: expenseForm.tripId || null,
      tripName: trip?.tripId || "Not linked",
      vehicleId: expenseForm.vehicleId,
      vehicleName: vehicle?.registrationNumber || "Unknown vehicle",
      toll: Number(expenseForm.toll || 0),
      other: Number(expenseForm.other || 0),
      maintenanceCost: 0,
      description: expenseForm.description.trim(),
      date: expenseForm.date,
    };

    setExpenses((current) => [newExpense, ...current]);

    setExpenseForm({
      tripId: "",
      vehicleId: "",
      toll: "",
      other: "",
      description: "",
      date: "",
    });

    setExpenseErrors({});
    setExpenseModalOpen(false);
  }

  function closeFuelModal() {
    setFuelModalOpen(false);
    setFuelErrors({});
  }

  function closeExpenseModal() {
    setExpenseModalOpen(false);
    setExpenseErrors({});
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#09090b] dark:text-zinc-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="min-h-screen lg:pl-60">
        {/* MOBILE HEADER */}

        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-[#18181b] lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
            {user.initials}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* PAGE HEADER */}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                Operations
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Fuel & Expenses
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Track fuel consumption and operational expenses across your fleet.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setFuelModalOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700"
              >
                <Fuel size={17} />
                Log fuel
              </button>

              <button
                type="button"
                onClick={() => setExpenseModalOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Plus size={17} />
                Add expense
              </button>
            </div>
          </div>

          {/* SUMMARY */}

          <div className="mt-7 grid overflow-hidden rounded-xl border border-zinc-200 bg-white sm:grid-cols-3 dark:border-zinc-800 dark:bg-[#18181b]">
            <SummaryCard
              title="Fuel cost"
              value={formatCurrency(totalFuelCost)}
              description={`${fuelLogs.length} fuel ${
                fuelLogs.length === 1 ? "record" : "records"
              }`}
              icon={Fuel}
            />

            <SummaryCard
              title="Other expenses"
              value={formatCurrency(totalOtherExpenses)}
              description={`${expenses.length} expense ${
                expenses.length === 1 ? "record" : "records"
              }`}
              icon={ReceiptText}
            />

            <SummaryCard
              title="Operational cost"
              value={formatCurrency(operationalCost)}
              description="Fuel + expenses + linked maintenance"
              icon={IndianRupee}
              last
            />
          </div>

          {/* FUEL LOGS */}

          <section className="mt-7 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#18181b]">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <div>
                <h2 className="font-semibold">Fuel logs</h2>

                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Vehicle refuelling history and fuel costs.
                </p>
              </div>

              <span className="text-xs text-zinc-400">
                {fuelLogs.length} records
              </span>
            </div>

            {fuelLogs.length === 0 ? (
              <EmptyState
                icon={Fuel}
                title="No fuel logs yet"
                description="Fuel records will appear here after you log your first refuelling."
                buttonText="Log fuel"
                onClick={() => setFuelModalOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">Vehicle</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Liters</th>
                      <th className="px-5 py-3 font-medium">Odometer</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Fuel cost
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {fuelLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="transition hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
                      >
                        <td className="px-5 py-4 text-sm font-medium">
                          {log.vehicleName}
                        </td>

                        <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                          {formatDate(log.date)}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {log.liters} L
                        </td>

                        <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                          {log.odometer
                            ? `${log.odometer.toLocaleString("en-IN")} km`
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-medium">
                          {formatCurrency(log.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* OTHER EXPENSES */}

          <section className="mt-7 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#18181b]">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <div>
                <h2 className="font-semibold">Other expenses</h2>

                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Toll charges, miscellaneous costs and linked maintenance.
                </p>
              </div>

              <span className="text-xs text-zinc-400">
                {expenses.length} records
              </span>
            </div>

            {expenses.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="No expenses recorded"
                description="Tolls and other operational expenses will appear here."
                buttonText="Add expense"
                onClick={() => setExpenseModalOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">Trip</th>
                      <th className="px-5 py-3 font-medium">Vehicle</th>
                      <th className="px-5 py-3 font-medium">Toll</th>
                      <th className="px-5 py-3 font-medium">Other</th>
                      <th className="px-5 py-3 font-medium">
                        Maintenance linked
                      </th>
                      <th className="px-5 py-3 text-right font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {expenses.map((expense) => {
                      const total =
                        Number(expense.toll || 0) +
                        Number(expense.other || 0) +
                        Number(expense.maintenanceCost || 0);

                      return (
                        <tr
                          key={expense.id}
                          className="transition hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
                        >
                          <td className="px-5 py-4 text-sm font-medium">
                            {expense.tripName}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {expense.vehicleName}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {formatCurrency(expense.toll)}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {formatCurrency(expense.other)}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {formatCurrency(expense.maintenanceCost)}
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-semibold">
                            {formatCurrency(total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* LOG FUEL MODAL */}

      {fuelModalOpen && (
        <Modal
          title="Log fuel"
          description="Add a new refuelling record for a vehicle."
          icon={Fuel}
          onClose={closeFuelModal}
        >
          <form onSubmit={handleFuelSubmit} className="space-y-4">
            <Field
              label="Vehicle"
              error={fuelErrors.vehicleId}
            >
              <select
                name="vehicleId"
                value={fuelForm.vehicleId}
                onChange={updateFuelForm}
                className={inputClass}
              >
                <option value="">Select vehicle</option>

                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registrationNumber}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Date" error={fuelErrors.date}>
              <input
                type="date"
                name="date"
                value={fuelForm.date}
                onChange={updateFuelForm}
                max={new Date().toISOString().split("T")[0]}
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fuel quantity (liters)" error={fuelErrors.liters}>
                <input
                  type="number"
                  name="liters"
                  value={fuelForm.liters}
                  onChange={updateFuelForm}
                  min="0.01"
                  step="0.01"
                  placeholder="42"
                  className={inputClass}
                />
              </Field>

              <Field label="Fuel cost (₹)" error={fuelErrors.cost}>
                <input
                  type="number"
                  name="cost"
                  value={fuelForm.cost}
                  onChange={updateFuelForm}
                  min="1"
                  step="0.01"
                  placeholder="3150"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Odometer reading (km)" error={fuelErrors.odometer}>
              <input
                type="number"
                name="odometer"
                value={fuelForm.odometer}
                onChange={updateFuelForm}
                min="0"
                placeholder="Optional"
                className={inputClass}
              />
            </Field>

            <ModalActions
              onCancel={closeFuelModal}
              submitText="Save fuel log"
            />
          </form>
        </Modal>
      )}

      {/* ADD EXPENSE MODAL */}

      {expenseModalOpen && (
        <Modal
          title="Add expense"
          description="Record a toll or miscellaneous operational expense."
          icon={ReceiptText}
          onClose={closeExpenseModal}
        >
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <Field label="Trip">
              <select
                name="tripId"
                value={expenseForm.tripId}
                onChange={updateExpenseForm}
                className={inputClass}
              >
                <option value="">Not linked to a trip</option>

                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.tripId}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Vehicle" error={expenseErrors.vehicleId}>
              <select
                name="vehicleId"
                value={expenseForm.vehicleId}
                onChange={updateExpenseForm}
                className={inputClass}
              >
                <option value="">Select vehicle</option>

                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registrationNumber}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Date" error={expenseErrors.date}>
              <input
                type="date"
                name="date"
                value={expenseForm.date}
                onChange={updateExpenseForm}
                max={new Date().toISOString().split("T")[0]}
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Toll amount (₹)" error={expenseErrors.toll}>
                <input
                  type="number"
                  name="toll"
                  value={expenseForm.toll}
                  onChange={updateExpenseForm}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className={inputClass}
                />
              </Field>

              <Field label="Other amount (₹)" error={expenseErrors.other}>
                <input
                  type="number"
                  name="other"
                  value={expenseForm.other}
                  onChange={updateExpenseForm}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                name="description"
                value={expenseForm.description}
                onChange={updateExpenseForm}
                rows={3}
                maxLength={200}
                placeholder="Optional note about this expense"
                className={`${inputClass} resize-none py-3`}
              />
            </Field>

            <ModalActions
              onCancel={closeExpenseModal}
              submitText="Save expense"
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-orange-950";

function SummaryCard({ title, value, description, icon: Icon, last }) {
  return (
    <div
      className={`p-5 ${
        !last
          ? "border-b border-zinc-200 dark:border-zinc-800 sm:border-b-0 sm:border-r"
          : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>

      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, buttonText, onClick }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <Icon size={20} />
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      <p className="mt-1 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-orange-600 transition hover:text-orange-700 dark:text-orange-400"
      >
        <Plus size={16} />
        {buttonText}
      </button>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function Modal({ title, description, icon: Icon, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              <Icon size={19} />
            </div>

            <div>
              <h2 className="font-semibold">{title}</h2>

              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, submitText }) {
  return (
    <div className="flex gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="flex-1 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
      >
        {submitText}
      </button>
    </div>
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

export default Expenses;