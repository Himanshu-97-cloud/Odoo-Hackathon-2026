import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Moon,
  Route,
  ShieldCheck,
  Sun,
  Truck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

const roles = [
  {
    value: "Fleet Manager",
    label: "Fleet Manager",
    description: "Fleet, maintenance and operational oversight",
    icon: Truck,
  },
  {
    value: "Dispatcher",
    label: "Dispatcher",
    description: "Trip creation and daily dispatch operations",
    icon: Route,
  },
  {
    value: "Safety Officer",
    label: "Safety Officer",
    description: "Drivers, licenses, safety and compliance",
    icon: ShieldCheck,
  },
  {
    value: "Financial Analyst",
    label: "Financial Analyst",
    description: "Fuel, expenses and operational analytics",
    icon: BarChart3,
  },
];

function Register() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("transitops-theme") === "dark";
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  function selectRole(role) {
    setForm((current) => ({
      ...current,
      role,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      setError(
        "Name can only contain letters, spaces, apostrophes and hyphens."
      );
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(form.password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(form.password)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.role) {
      setError("Please select your role.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          password: form.password,
          role: form.role,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (data?.detail) {
          if (Array.isArray(data.detail)) {
            const validationMessage = data.detail
              .map((item) => item.msg)
              .join(", ");

            throw new Error(validationMessage);
          }

          throw new Error(data.detail);
        }

        throw new Error(
          `Registration failed with status ${response.status}.`
        );
      }

      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          email,
          message: data?.message || "Account created successfully.",
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      if (error instanceof TypeError) {
        setError(
          "Cannot connect to the TransitOps server. Make sure the FastAPI backend is running on port 8000."
        );
      } else {
        setError(
          error.message ||
            "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 transition-colors dark:bg-[#09090b] dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">

        {/* LEFT SIDE */}

        <section className="relative hidden overflow-hidden border-r border-zinc-200 bg-zinc-50 p-10 dark:border-zinc-800 dark:bg-[#111113] lg:flex lg:flex-col xl:p-14">

          {/* BACKGROUND */}

          <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />

          {/* LOGO */}

          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight">
              Transit<span className="text-orange-600">Ops</span>
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Smart Transport Operations
            </p>
          </div>

          {/* CONTENT */}

          <div className="relative z-10 my-auto max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
              Join TransitOps
            </p>

            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              One connected workspace for your entire transport team.
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-500 dark:text-zinc-400">
              Create your account, select your operational role and access the
              tools designed for your responsibilities.
            </p>

            <div className="mt-9 space-y-3">
              {[
                "Manage transport operations from one workspace",
                "Keep vehicles, drivers and trips connected",
                "Track maintenance, fuel expenses and analytics",
                "Role-based access for four operational teams",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                    <Check size={14} strokeWidth={2.5} />
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-xl border border-orange-200 bg-orange-50/60 p-5 dark:border-orange-900 dark:bg-orange-950/20">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-orange-600"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Four specialized roles
                  </p>

                  <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    Fleet Manager, Dispatcher, Safety Officer and Financial
                    Analyst.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-zinc-400">
            TransitOps © 2026 · Smart Transport Operations Platform
          </p>
        </section>

        {/* RIGHT SIDE */}

        <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">

          {/* THEME */}

          <button
            type="button"
            onClick={() => setDarkMode((current) => !current)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="w-full max-w-lg">

            {/* BACK */}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mb-7 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-950 dark:hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </button>

            {/* MOBILE LOGO */}

            <div className="mb-7 lg:hidden">
              <h1 className="text-xl font-bold">
                Transit<span className="text-orange-600">Ops</span>
              </h1>
            </div>

            {/* HEADING */}

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              Create your account
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Join your operations workspace
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Enter your details and choose your operational role.
            </p>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">

              {/* NAME */}

              <InputField
                id="register-name"
                label="Full name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                icon={UserRound}
              />

              {/* EMAIL */}

              <InputField
                id="register-email"
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                autoComplete="email"
                icon={Mail}
              />

              {/* PASSWORDS */}

              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField
                  id="register-password"
                  label="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  show={showPassword}
                  onToggle={() =>
                    setShowPassword((current) => !current)
                  }
                />

                <PasswordField
                  id="register-confirm-password"
                  label="Confirm password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  show={showConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                />
              </div>

              {/* ROLE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Select your role
                </label>

                <div className="grid gap-2 sm:grid-cols-2">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const selected = form.role === role.value;

                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => selectRole(role.value)}
                        className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                          selected
                            ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500 dark:bg-orange-950/30"
                            : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            selected
                              ? "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          <Icon size={16} />
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            {role.label}
                          </p>

                          <p className="mt-1 text-xs leading-4 text-zinc-500 dark:text-zinc-400">
                            {role.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                >
                  {error}
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}

                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            {/* LOGIN */}

            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-medium text-orange-600 transition hover:text-orange-700"
              >
                Sign in
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function InputField({
  id,
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon: Icon,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-12 w-full rounded-lg border border-zinc-200 bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
        />
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <input
          id={id}
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          className="h-12 w-full rounded-lg border border-zinc-200 bg-white pl-11 pr-12 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default Register;    