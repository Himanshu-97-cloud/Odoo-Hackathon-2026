import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Moon,
  Route,
  ShieldCheck,
  Sun,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

const roles = [
  {
    name: "Fleet Manager",
    description: "Fleet, maintenance and operations",
    icon: Truck,
  },
  {
    name: "Dispatcher",
    description: "Trips, dispatch and daily operations",
    icon: Route,
  },
  {
    name: "Safety Officer",
    description: "Drivers, licenses and compliance",
    icon: ShieldCheck,
  },
  {
    name: "Financial Analyst",
    description: "Fuel, expenses and analytics",
    icon: BarChart3,
  },
];

function Login() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("transitops-theme") === "dark";
  });

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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

  async function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Incorrect email or password.");
        }

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
          `Login failed with status ${response.status}.`
        );
      }

      if (!data?.access_token) {
        throw new Error(
          "Login succeeded, but no access token was returned."
        );
      }

      localStorage.setItem(
        "transitops-token",
        data.access_token
      );

      if (data.user) {
        localStorage.setItem(
          "transitops-user",
          JSON.stringify(data.user)
        );
      }

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof TypeError) {
        setError(
          "Cannot connect to the TransitOps server. Make sure the FastAPI backend is running on port 8000."
        );
      } else {
        setError(
          error.message ||
            "Unable to sign in. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 transition-colors dark:bg-[#09090b] dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">

        {/* LEFT SIDE */}

        <section className="relative hidden overflow-hidden border-r border-zinc-200 bg-zinc-50 p-10 dark:border-zinc-800 dark:bg-[#111113] lg:flex lg:flex-col xl:p-14">

          {/* BACKGROUND DECORATION */}

          <div className="pointer-events-none absolute -left-32 top-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.05]">
            <div className="absolute left-[15%] top-0 h-full w-px bg-zinc-900 dark:bg-white" />
            <div className="absolute left-[45%] top-0 h-full w-px bg-zinc-900 dark:bg-white" />
            <div className="absolute left-[75%] top-0 h-full w-px bg-zinc-900 dark:bg-white" />
            <div className="absolute left-0 top-[25%] h-px w-full bg-zinc-900 dark:bg-white" />
            <div className="absolute left-0 top-[55%] h-px w-full bg-zinc-900 dark:bg-white" />
            <div className="absolute left-0 top-[85%] h-px w-full bg-zinc-900 dark:bg-white" />
          </div>

          {/* LOGO */}

          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight">
              Transit<span className="text-orange-600">Ops</span>
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Smart Transport Operations
            </p>
          </div>

          {/* MAIN LEFT CONTENT */}

          <div className="relative z-10 my-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
              Smart fleet operations
            </p>

            <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">
              Everything your transport team needs in one place.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-500 dark:text-zinc-400">
              Manage vehicles, drivers, trips, maintenance, fuel expenses and
              analytics through one connected operations platform.
            </p>

            {/* ROLE CARDS */}

            <div className="mt-9 grid grid-cols-2 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;

                return (
                  <div
                    key={role.name}
                    className="group rounded-xl border border-zinc-200 bg-white/80 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-orange-900"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                      <Icon size={18} />
                    </div>

                    <p className="mt-3 text-sm font-semibold">
                      {role.name}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      {role.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER */}

          <p className="relative z-10 text-xs text-zinc-400">
            TransitOps © 2026 · Smart Transport Operations Platform
          </p>
        </section>

        {/* RIGHT SIDE */}

        <section className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">

          {/* THEME BUTTON */}

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

          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}

            <div className="mb-10 lg:hidden">
              <h1 className="text-xl font-bold tracking-tight">
                Transit<span className="text-orange-600">Ops</span>
              </h1>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Smart Transport Operations
              </p>
            </div>

            {/* HEADING */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                Welcome back
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Enter your registered credentials to access your TransitOps
                workspace.
              </p>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-lg border border-zinc-200 bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-orange-600 transition hover:text-orange-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-lg border border-zinc-200 bg-white pl-11 pr-12 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-orange-600 dark:focus:ring-orange-950"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
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
                {loading ? "Signing in..." : "Sign in"}

                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            {/* REGISTER */}

            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-orange-600 transition hover:text-orange-700"
              >
                Create account
              </button>
            </p>

            {/* SECURITY */}

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <ShieldCheck size={14} />
              Secure access based on your assigned role
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;