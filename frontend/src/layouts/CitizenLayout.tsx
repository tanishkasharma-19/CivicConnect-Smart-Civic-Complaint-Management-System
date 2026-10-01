import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import type { Page, Notification } from "../types"
import Logo from "../components/Logo"
import {
  HomeIcon,
  DocumentTextIcon,
  BellIcon,
  UserIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  LogoutIcon,
  MagnifyingGlassIcon,
} from "../components/Icons"
import api from "../api/axios"

interface CitizenLayoutProps {
  children: ReactNode
  navigate: (
    page: Page,
    params?: {
      complaintId?: string
    }
  ) => void
  currentPage: Page
  logout: () => void
}

const NAV_ITEMS = [
  {
    page: "citizen-home" as Page,
    label: "Home",
    icon: HomeIcon,
  },
  {
    page: "citizen-explore" as Page,
    label: "Explore",
    icon: MagnifyingGlassIcon,
  },
  {
    page: "citizen-my-complaints" as Page,
    label: "My Complaints",
    icon: DocumentTextIcon,
  },
  {
    page: "citizen-notifications" as Page,
    label: "Notifications",
    icon: BellIcon,
  },
  {
    page: "citizen-profile" as Page,
    label: "Profile",
    icon: UserIcon,
  },
]

export default function CitizenLayout({
  children,
  navigate,
  currentPage,
  logout,
}: CitizenLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const email = localStorage.getItem("email")

    if (!email) {
      setUnreadCount(0)
      return
    }

    let mounted = true

    const loadNotifications = async () => {
      try {
        const response = await api.get(
          `/api/notifications?email=${encodeURIComponent(email)}`
        )

        const notifications: Notification[] = response.data

        if (mounted) {
          setUnreadCount(
            notifications.filter(
              (notification) => !notification.isRead
            ).length
          )
        }
      } catch {
        if (mounted) {
          setUnreadCount(0)
        }
      }
    }

    loadNotifications()

    return () => {
      mounted = false
    }
  }, [currentPage])

  return (
    <div className="min-h-[100dvh] bg-navy-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-navy-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 min-w-0">
            <button
              onClick={() => navigate("citizen-home")}
              className="flex-shrink-0 min-w-0"
            >
              <Logo size="sm" />
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1 min-w-0">
              {NAV_ITEMS.slice(0, 3).map(
                ({ page, label, icon: Icon }) => (
                  <button
                    key={page}
                    onClick={() => navigate(page)}
                    className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? "text-brand-600 bg-brand-50"
                        : "text-navy-600 hover:text-navy-900 hover:bg-navy-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                  </button>
                )
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate("citizen-report")}
                className="flex items-center gap-1.5 px-3 lg:px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Report Issue</span>
              </button>

              <button
                onClick={() =>
                  navigate("citizen-notifications")
                }
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  currentPage === "citizen-notifications"
                    ? "text-brand-600 bg-brand-50"
                    : "text-navy-600 hover:bg-navy-50"
                }`}
                aria-label="Notifications"
              >
                <BellIcon className="w-5 h-5" />

                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              <button
                onClick={() => navigate("citizen-profile")}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  currentPage === "citizen-profile"
                    ? "text-brand-600 bg-brand-50"
                    : "text-navy-600 hover:bg-navy-50"
                }`}
                aria-label="Profile"
              >
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-brand-600" />
                </div>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() =>
                setMobileOpen((value) => !value)
              }
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-navy-600 hover:bg-navy-50 transition-all flex-shrink-0"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-navy-100 bg-white px-3 sm:px-4 py-3 space-y-1">
            {NAV_ITEMS.map(
              ({ page, label, icon: Icon }) => (
                <button
                  key={page}
                  onClick={() => {
                    navigate(page)
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    currentPage === page
                      ? "text-brand-600 bg-brand-50"
                      : "text-navy-600 hover:bg-navy-50"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />

                  <span>{label}</span>

                  {page === "citizen-notifications" &&
                    unreadCount > 0 && (
                      <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                </button>
              )
            )}

            <button
              onClick={() => {
                navigate("citizen-report")
                setMobileOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white mt-2"
            >
              <PlusIcon className="w-4 h-4" />
              Report an Issue
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 mt-1"
            >
              <LogoutIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 min-w-0">
        {children}
      </main>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-navy-200/60 px-1 py-2 flex items-center justify-around safe-area-bottom">
        {NAV_ITEMS.map(
          ({ page, label, icon: Icon }) => (
            <button
              key={page}
              onClick={() => navigate(page)}
              className={`flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-3 py-1 rounded-xl transition-all min-w-0 ${
                currentPage === page
                  ? "text-brand-600"
                  : "text-navy-400"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />

                {page === "citizen-notifications" &&
                  unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
              </div>

              <span className="text-[10px] font-medium truncate max-w-[3.5rem]">
                {label.split(" ")[0]}
              </span>
            </button>
          )
        )}
      </div>
    </div>
  )
}