import { useState } from "react"
import type { Page } from "./types"
import { useAuth } from "./context/AuthContext"

// Auth
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import VerifyEmailPage from "./pages/auth/VerifyEmailPage"
import TermsPage from "./pages/auth/TermsPage"
import PrivacyPage from "./pages/auth/PrivacyPage"

// Citizen
import CitizenLayout from "./layouts/CitizenLayout"
import HomePage from "./pages/citizen/HomePage"
import ExplorePage from "./pages/citizen/ExplorePage"
import ReportPage from "./pages/citizen/ReportPage"
import ComplaintDetailPage from "./pages/citizen/ComplaintDetailPage"
import MyComplaintsPage from "./pages/citizen/MyComplaintsPage"
import NotificationsPage from "./pages/citizen/NotificationsPage"
import ProfilePage from "./pages/citizen/ProfilePage"

// Officer
import OfficerLayout from "./layouts/OfficerLayout"
import OfficerDashboard from "./pages/officer/OfficerDashboard"
import OfficerProfile from "./pages/officer/OfficerProfile"

// Admin
import AdminLayout from "./layouts/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminDepartments from "./pages/admin/AdminDepartments"
import AdminEscalations from "./pages/admin/AdminEscalations"
import AdminAnalytics from "./pages/admin/AdminAnalytics"
import AdminComplaints from "./pages/admin/AdminComplaints"

interface AppState {
  page: Page
  selectedComplaintId: string | null
}

export default function App() {
  const {
    role,
    login: authLogin,
    logout: authLogout,
  } = useAuth()

  // Token from the emailed link: /reset-password?token=...
  const [resetToken] = useState<string | undefined>(() => {
    if (window.location.pathname !== "/reset-password") return undefined
    return (
      new URLSearchParams(window.location.search).get("token") ??
      undefined
    )
  })

  const [appState, setAppState] = useState<AppState>(() => {
    if (window.location.pathname === "/reset-password") {
      return {
        page: "reset-password",
        selectedComplaintId: null,
      }
    }

    const storedToken = localStorage.getItem("token")
    const storedRole = localStorage.getItem("role")

    if (!storedToken || !storedRole) {
      return {
        page: "login",
        selectedComplaintId: null,
      }
    }

    switch (storedRole.toUpperCase()) {
      case "CITIZEN":
        return {
          page: "citizen-home",
          selectedComplaintId: null,
        }

      case "OFFICER":
        return {
          page: "officer-dashboard",
          selectedComplaintId: null,
        }

      case "ADMIN":
        return {
          page: "admin-dashboard",
          selectedComplaintId: null,
        }

      default:
        return {
          page: "login",
          selectedComplaintId: null,
        }
    }
  })

  const navigate = (
    page: Page,
    params?: {
      complaintId?: string
    }
  ) => {
    setAppState({
      page,
      selectedComplaintId:
        params?.complaintId ?? null,
    })

    // Leaving the reset page: remove /reset-password?token=... from the address bar
    if (
      page !== "reset-password" &&
      window.location.pathname === "/reset-password"
    ) {
      window.history.replaceState({}, "", "/")
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const login = (
    token: string,
    backendRole: string,
    email: string
  ) => {
    const normalizedRole =
      backendRole.toUpperCase()

    authLogin(
      token,
      normalizedRole,
      email
    )

    if (normalizedRole === "CITIZEN") {
      setAppState({
        page: "citizen-home",
        selectedComplaintId: null,
      })
    } else if (normalizedRole === "OFFICER") {
      setAppState({
        page: "officer-dashboard",
        selectedComplaintId: null,
      })
    } else if (normalizedRole === "ADMIN") {
      setAppState({
        page: "admin-dashboard",
        selectedComplaintId: null,
      })
    } else {
      authLogout()

      setAppState({
        page: "login",
        selectedComplaintId: null,
      })
    }

    window.scrollTo({
      top: 0,
    })
  }

  const logout = () => {
    authLogout()

    setAppState({
      page: "login",
      selectedComplaintId: null,
    })

    window.scrollTo({
      top: 0,
    })
  }

  const {
    page,
    selectedComplaintId,
  } = appState

  // ─────────────────────────────────────────────
  // AUTH PAGES
  // ─────────────────────────────────────────────

  if (page === "login") {
    return (
      <LoginPage
        navigate={navigate}
        login={login}
      />
    )
  }

  if (page === "register") {
    return (
      <RegisterPage
        navigate={navigate}
      />
    )
  }

  if (page === "forgot-password") {
    return (
      <ForgotPasswordPage
        navigate={navigate}
      />
    )
  }

  if (page === "verify-email") {
    return (
      <VerifyEmailPage
        navigate={navigate}
        login={login}
      />
    )
  }

  if (page === "reset-password") {
    return (
      <ResetPasswordPage
        navigate={navigate}
        token={resetToken}
      />
    )
  }

  if (page === "terms") {
    return (
      <TermsPage
        navigate={navigate}
      />
    )
  }

  if (page === "privacy") {
    return (
      <PrivacyPage
        navigate={navigate}
      />
    )
  }

  // ─────────────────────────────────────────────
  // CITIZEN
  // ─────────────────────────────────────────────

  if (role?.toUpperCase() === "CITIZEN") {
    const layoutProps = {
      navigate,
      currentPage: page,
      logout,
    }

    if (page === "citizen-home") {
      return (
        <CitizenLayout {...layoutProps}>
          <HomePage
            navigate={navigate}
          />
        </CitizenLayout>
      )
    }

    if (page === "citizen-explore") {
      return (
        <CitizenLayout {...layoutProps}>
          <ExplorePage
            navigate={navigate}
          />
        </CitizenLayout>
      )
    }

    if (page === "citizen-report") {
      return (
        <CitizenLayout {...layoutProps}>
          <ReportPage
            navigate={navigate}
          />
        </CitizenLayout>
      )
    }

    if (page === "citizen-detail") {
      return (
        <CitizenLayout {...layoutProps}>
          <ComplaintDetailPage
            navigate={navigate}
            complaintId={selectedComplaintId}
          />
        </CitizenLayout>
      )
    }

    if (page === "citizen-my-complaints") {
      return (
        <CitizenLayout {...layoutProps}>
          <MyComplaintsPage
            navigate={navigate}
          />
        </CitizenLayout>
      )
    }

    if (page === "citizen-notifications") {
  return (
    <CitizenLayout {...layoutProps}>
      <NotificationsPage
        navigate={navigate}
      />
    </CitizenLayout>
  )
}

    if (page === "citizen-profile") {
      return (
        <CitizenLayout {...layoutProps}>
          <ProfilePage
            navigate={navigate}
            logout={logout}
          />
        </CitizenLayout>
      )
    }
  }

  // ─────────────────────────────────────────────
  // OFFICER
  // ─────────────────────────────────────────────

  if (role?.toUpperCase() === "OFFICER") {
    const layoutProps = {
  navigate,
  currentPage:
    page === "officer-profile"
      ? "profile"
      : page === "officer-notifications"
        ? "notifications"
        : "dashboard",
  logout,
}

    if (page === "officer-dashboard") {
      return (
        <OfficerLayout {...layoutProps}>
          <OfficerDashboard
            navigate={navigate}
          />
        </OfficerLayout>
      )
    }

    if (page === "officer-profile") {
      return (
        <OfficerLayout
          {...layoutProps}
          currentPage="profile"
        >
          <OfficerProfile
            navigate={navigate}
          />
        </OfficerLayout>
      )
    }
    if (page === "officer-notifications") {
  return (
    <OfficerLayout
      {...layoutProps}
      currentPage="notifications"
    >
      <NotificationsPage
        navigate={navigate}
      />
    </OfficerLayout>
  )
}

    
  }
  

  // ─────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────

  if (role?.toUpperCase() === "ADMIN") {
    const layoutProps = {
      navigate,
      currentPage:
        page === "admin-dashboard"
          ? "dashboard"
          : page === "admin-complaints"
            ? "complaints"
            : page === "admin-users"
              ? "users"
              : page === "admin-departments"
                ? "departments"
                : page === "admin-escalations"
                  ? "escalations"
                  : page === "admin-analytics"
                    ? "analytics"
                    : page === "admin-notifications"
                      ? "notifications"
                      : "dashboard",
      logout,
    }

    if (page === "admin-dashboard") {
      return (
        <AdminLayout {...layoutProps}>
          <AdminDashboard
            navigate={navigate}
          />
        </AdminLayout>
      )
    }

    if (page === "admin-complaints") {
      return (
        <AdminLayout {...layoutProps}>
          <AdminComplaints
            navigate={navigate}
          />
        </AdminLayout>
      )
    }

    if (page === "admin-users") {
      return (
        <AdminLayout {...layoutProps}>
          <AdminUsers
            navigate={navigate}
          />
        </AdminLayout>
      )
    }

    if (page === "admin-departments") {
      return (
        <AdminLayout {...layoutProps}>
          <AdminDepartments
            navigate={navigate}
          />
        </AdminLayout>
      )
    }

    if (page === "admin-escalations") {
      return (
        <AdminLayout {...layoutProps}>
          <AdminEscalations
            navigate={navigate}
          />
        </AdminLayout>
      )
    }

    if (page === "admin-analytics") {
      return (
        <AdminLayout {...layoutProps}>
          <AdminAnalytics
            navigate={navigate}
          />
        </AdminLayout>
      )
    }

    if (page === "admin-notifications") {
  return (
    <AdminLayout {...layoutProps}>
      <NotificationsPage
        navigate={navigate}
      />
    </AdminLayout>
  )
}
  }

  // ─────────────────────────────────────────────
  // FALLBACK
  // ─────────────────────────────────────────────

  return (
    <LoginPage
      navigate={navigate}
      login={login}
    />
  )
}