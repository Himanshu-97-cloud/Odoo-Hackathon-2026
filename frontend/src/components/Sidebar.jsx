import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  ReceiptText,
  ChartNoAxesCombined,
  Settings,
  X,
} from "lucide-react";

const navigation = [
  {
    title: "Operations",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
        end: true,
      },
      {
        name: "Fleet",
        path: "/vehicles",
        icon: Truck,
      },
      {
        name: "Drivers",
        path: "/drivers",
        icon: Users,
      },
      {
        name: "Trips",
        path: "/trips",
        icon: Route,
      },
      {
        name: "Maintenance",
        path: "/maintenance",
        icon: Wrench,
      },
      {
        name: "Fuel & Expenses",
        path: "/expenses",
        icon: ReceiptText,
      },
    ],
  },
  {
    title: "Insights & System",
    items: [
      {
        name: "Analytics",
        path: "/analytics",
        icon: ChartNoAxesCombined,
      },
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
      },
    ],
  },
];

function Sidebar({ isOpen, onClose, user }) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-60 flex-col
          border-r border-zinc-200 bg-white
          transition-transform duration-200
          dark:border-zinc-800 dark:bg-[#18181b]
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
              Transit<span className="text-orange-600">Ops</span>
            </h1>

            <p className="mt-0.5 text-[10px] text-zinc-400">
              Smart Transport Operations
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((section, sectionIndex) => (
            <div
              key={section.title}
              className={sectionIndex > 0 ? "mt-7" : ""}
            >
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-orange-50 font-medium text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                        }`
                      }
                    >
                      <Icon size={17} strokeWidth={1.8} />

                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
              {user?.initials || "FM"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {user?.name || "Fleet Manager"}
              </p>

              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {user?.role || "Administrator"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;