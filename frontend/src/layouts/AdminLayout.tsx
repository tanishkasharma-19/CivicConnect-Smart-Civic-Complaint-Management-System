import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import type { Page } from "../types"
import Logo from "../components/Logo"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  LogoutIcon,
  Bars3Icon,
  ExclamationIcon,
  BellIcon,
} from "../components/Icons"

interface AdminLayoutProps {
  children: ReactNode
  navigate: (page: Page) => void
  currentPage: string
  logout: () => void
}

const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    page: "admin-dashboard" as Page,
    label: "Dashboard",
    icon: HomeIcon,
  },
  {
    id: "complaints",
    page: "admin-complaints" as Page,
    label: "Complaints",
    icon: DocumentTextIcon,
  },
  {
    id: "users",
    page: "admin-users" as Page,
    label: "Users",
    icon: UsersIcon,
  },
  {
    id: "departments",
    page: "admin-departments" as Page,
    label: "Departments",
    icon: BuildingOfficeIcon,
  },
  {
    id: "escalations",
    page: "admin-escalations" as Page,
    label: "Escalations",
    icon: ExclamationIcon,
  },
  {
    id: "notifications",
    page: "admin-notifications" as Page,
    label: "Notifications",
    icon: BellIcon,
  },
  {
    id: "analytics",
    page: "admin-analytics" as Page,
    label: "Analytics",
    icon: ChartBarIcon,
  },
]

export default function AdminLayout({
  children,
  navigate,
  currentPage,
  logout,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] =
    useState(false)

  const [mobileOpen, setMobileOpen] =
    useState(false)

  const { email } = useAuth()

  const [
    hasUnreadNotifications,
    setHasUnreadNotifications,
  ] = useState(false)

  useEffect(() => {
    if (!email) {
      setHasUnreadNotifications(false)
      return
    }

    const checkUnreadNotifications =
      async () => {
        try {
          const response =
            await api.get<
              { isRead: boolean }[]
            >(
              "/api/notifications",
              {
                params: {
                  email,
                },
              }
            )

          const unread =
            response.data.some(
              (notification) =>
                !notification.isRead
            )

          setHasUnreadNotifications(
            unread
          )
        } catch (err) {
          console.error(
            "Failed to check notifications:",
            err
          )
        }
      }

    checkUnreadNotifications()

    const interval =
      window.setInterval(
        checkUnreadNotifications,
        10000
      )

    return () => {
      window.clearInterval(
        interval
      )
    }
  }, [email])

  const SidebarContent = () => (
    <div className="flex flex-col h-full min-h-0">

      {/* Logo / collapse */}
      <div
        className={`p-3 sm:p-4 border-b border-white/10 flex items-center ${
          collapsed
            ? "justify-center"
            : "justify-between"
        }`}
      >
        {!collapsed && (
          <Logo
            light
            size="sm"
          />
        )}

        <button
          onClick={() =>
            setCollapsed(
              (value) => !value
            )
          }
          className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="w-4 h-4" />
        </button>
      </div>

      {/* Admin profile */}
      {!collapsed && (
        <div className="px-3 py-4 border-b border-white/10">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              A
            </div>

            <div className="min-w-0">

              <p className="text-sm font-semibold text-white truncate">
                Administrator
              </p>

              <p className="text-xs text-white/50 truncate">
                Admin
              </p>

            </div>

          </div>

        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 min-h-0 p-2 sm:p-3 space-y-0.5 overflow-y-auto overscroll-contain">

        {SIDEBAR_ITEMS.map(
          ({
            id,
            page,
            label,
            icon: Icon,
          }) => (
            <button
              key={id}
              onClick={() => {
                navigate(page)
                setMobileOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentPage === id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              } ${
                collapsed
                  ? "justify-center"
                  : ""
              }`}
              title={
                collapsed
                  ? label
                  : undefined
              }
            >

              {/* Icon + collapsed red dot */}
              <div className="relative flex-shrink-0">

                <Icon className="w-4 h-4" />

                {id ===
                  "notifications" &&
                  hasUnreadNotifications && (
                    <span
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-navy-900"
                      aria-label="Unread notifications"
                    />
                  )}

              </div>

              {/* Label */}
              {!collapsed && (
                <span className="truncate">
                  {label}
                </span>
              )}

              {/* Expanded red dot */}
              {!collapsed &&
                id ===
                  "notifications" &&
                hasUnreadNotifications && (
                  <span
                    className="ml-auto w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"
                    aria-label="Unread notifications"
                  />
                )}

            </button>
          )
        )}

      </nav>

      {/* Logout */}
      <div className="p-2 sm:p-3 border-t border-white/10 flex-shrink-0">

        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all ${
            collapsed
              ? "justify-center"
              : ""
          }`}
        >

          <LogoutIcon className="w-4 h-4 flex-shrink-0" />

          {!collapsed && (
            <span>Logout</span>
          )}

        </button>

      </div>

    </div>
  )

  return (
    <div className="flex h-[100dvh] min-h-0 bg-navy-50 overflow-hidden">

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-navy-900 transition-all duration-300 flex-shrink-0 min-h-0 ${
          collapsed
            ? "w-16"
            : "w-60"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">

          <div
            className="fixed inset-0 bg-black/50"
            onClick={() =>
              setMobileOpen(false)
            }
          />

          <aside className="relative w-[min(16rem,85vw)] bg-navy-900 h-[100dvh] shadow-2xl">
            <SidebarContent />
          </aside>

        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        <header className="bg-white border-b border-navy-200/60 px-3 sm:px-6 h-14 flex items-center justify-between flex-shrink-0 shadow-sm">

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">

            <button
              onClick={() =>
                setMobileOpen(true)
              }
              className="lg:hidden w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-navy-600 hover:bg-navy-50 transition-all"
              aria-label="Open navigation"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            <div className="min-w-0">

              <h1
                className="text-sm font-bold text-navy-900 truncate"
                style={{
                  fontFamily:
                    "'Outfit', sans-serif",
                }}
              >
                Admin Dashboard
              </h1>

              <p className="text-xs text-navy-400 truncate">
                CivicConnect Administration
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

            <span className="hidden sm:block text-xs text-navy-500">
              {new Date().toLocaleDateString(
                "en-IN",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }
              )}
            </span>

            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>

          </div>

        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {children}
        </main>

      </div>

    </div>
  )
}