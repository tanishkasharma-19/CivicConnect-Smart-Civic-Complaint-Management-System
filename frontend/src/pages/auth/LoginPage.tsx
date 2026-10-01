import { useState } from "react"
import type { Page } from "../../types"
import Logo from "../../components/Logo"
import {
  EyeIcon,
  EyeSlashIcon,
} from "../../components/Icons"
import api from "../../api/axios"

interface LoginPageProps {
  navigate: (page: Page) => void
  login: (
    token: string,
    role: string,
    email: string
  ) => void
}

export default function LoginPage({
  navigate,
  login,
}: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(() => {
    // Message left by the axios interceptor (for example: account deactivated)
    const notice = sessionStorage.getItem("civicconnect.loginNotice")

    if (notice) {
      sessionStorage.removeItem("civicconnect.loginNotice")
    }

    return notice ?? ""
  })

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.post(
        "/api/auth/login",
        {
          email: email.trim(),
          password,
        }
      )

      const data = response.data

      if (
        !data?.token ||
        !data?.role ||
        !data?.email
      ) {
        setError(
          "Invalid login response from server."
        )
        return
      }

      login(
        data.token,
        data.role,
        data.email
      )
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const axiosError = err as {
          response?: {
            data?: {
              message?: string
            }
          }
        }

        // Correct password, but the email was never verified:
        // send a fresh code and open the verification page
        if (
          axiosError.response?.data?.message ===
          "EMAIL_NOT_VERIFIED"
        ) {
          sessionStorage.setItem(
            "civicconnect.verifyEmail",
            email.trim()
          )

          try {
            await api.post(
              "/api/auth/resend-verification",
              { email: email.trim() }
            )
          } catch {
            // The verify page has its own Resend button
          }

          navigate("verify-email")
          return
        }

        setError(
          axiosError.response?.data?.message ||
            "Invalid email or password."
        )
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left panel — civic illustration */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Floating circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between p-8 xl:p-12 w-full">
          <Logo light size="md" />

          {/* City SVG illustration */}
          <div className="flex-1 flex items-center justify-center py-8">
            <svg
              viewBox="0 0 480 360"
              className="w-full max-w-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="sky"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#ffffff"
                    stopOpacity="0.05"
                  />
                  <stop
                    offset="100%"
                    stopColor="#1D4ED8"
                    stopOpacity="0.2"
                  />
                </linearGradient>
              </defs>

              {/* Ground */}
              <rect
                x="0"
                y="290"
                width="480"
                height="70"
                fill="white"
                fillOpacity="0.08"
                rx="4"
              />

              {/* Roads */}
              <rect
                x="0"
                y="295"
                width="480"
                height="4"
                fill="white"
                fillOpacity="0.15"
              />

              <rect
                x="110"
                y="250"
                width="6"
                height="46"
                fill="white"
                fillOpacity="0.12"
              />

              <rect
                x="360"
                y="240"
                width="6"
                height="56"
                fill="white"
                fillOpacity="0.12"
              />

              {/* Buildings — back row */}
              <rect
                x="20"
                y="200"
                width="50"
                height="95"
                rx="3"
                fill="white"
                fillOpacity="0.12"
              />

              <rect
                x="80"
                y="170"
                width="40"
                height="125"
                rx="3"
                fill="white"
                fillOpacity="0.15"
              />

              <rect
                x="130"
                y="190"
                width="55"
                height="105"
                rx="3"
                fill="white"
                fillOpacity="0.12"
              />

              <rect
                x="200"
                y="140"
                width="65"
                height="155"
                rx="3"
                fill="white"
                fillOpacity="0.18"
              />

              <rect
                x="280"
                y="160"
                width="50"
                height="135"
                rx="3"
                fill="white"
                fillOpacity="0.15"
              />

              <rect
                x="345"
                y="185"
                width="60"
                height="110"
                rx="3"
                fill="white"
                fillOpacity="0.12"
              />

              <rect
                x="415"
                y="210"
                width="50"
                height="85"
                rx="3"
                fill="white"
                fillOpacity="0.10"
              />

              {/* Windows */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map(
                (row) =>
                  [0, 1, 2].map((col) => (
                    <rect
                      key={`w-${row}-${col}`}
                      x={210 + col * 18}
                      y={152 + row * 17}
                      width="10"
                      height="10"
                      rx="1.5"
                      fill="white"
                      fillOpacity={
                        (row + col) % 3 === 0
                          ? 0.15
                          : 0.7
                      }
                    />
                  ))
              )}

              {/* Tree dots */}
              <circle
                cx="60"
                cy="283"
                r="10"
                fill="white"
                fillOpacity="0.2"
              />

              <circle
                cx="168"
                cy="278"
                r="8"
                fill="white"
                fillOpacity="0.18"
              />

              <circle
                cx="400"
                cy="281"
                r="11"
                fill="white"
                fillOpacity="0.2"
              />

              {/* Location pins */}
              <g transform="translate(230, 100)">
                <path
                  d="M12 0C7.58 0 4 3.58 4 8C4 13.5 12 22 12 22C12 22 20 13.5 20 8C20 3.58 16.42 0 12 0Z"
                  fill="white"
                  fillOpacity="0.95"
                />

                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                  fill="#2563EB"
                />
              </g>

              <g
                transform="translate(100, 140)"
                opacity="0.7"
              >
                <path
                  d="M8 0C4.69 0 2 2.69 2 6C2 10.5 8 17 8 17C8 17 14 10.5 14 6C14 2.69 11.31 0 8 0Z"
                  fill="white"
                  fillOpacity="0.8"
                />

                <circle
                  cx="8"
                  cy="6"
                  r="2.5"
                  fill="#60A5FA"
                />
              </g>

              <g
                transform="translate(330, 120)"
                opacity="0.7"
              >
                <path
                  d="M8 0C4.69 0 2 2.69 2 6C2 10.5 8 17 8 17C8 17 14 10.5 14 6C14 2.69 11.31 0 8 0Z"
                  fill="white"
                  fillOpacity="0.8"
                />

                <circle
                  cx="8"
                  cy="6"
                  r="2.5"
                  fill="#34D399"
                />
              </g>

              {/* People silhouettes */}
              <circle
                cx="148"
                cy="282"
                r="5"
                fill="white"
                fillOpacity="0.5"
              />

              <rect
                x="144"
                y="287"
                width="8"
                height="10"
                rx="2"
                fill="white"
                fillOpacity="0.4"
              />

              <circle
                cx="320"
                cy="282"
                r="5"
                fill="white"
                fillOpacity="0.5"
              />

              <rect
                x="316"
                y="287"
                width="8"
                height="10"
                rx="2"
                fill="white"
                fillOpacity="0.4"
              />
            </svg>
          </div>

          <div>
            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Empowering Citizens.
              <br />
              Building Better Cities.
            </h2>

            <p className="text-white/70 text-sm leading-relaxed">
              Join thousands of citizens reporting
              and resolving civic issues in their
              communities.
            </p>

            <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-6">
              {[
                ["457", "Complaints Filed"],
                ["312", "Issues Resolved"],
                ["1.2K", "Citizens Active"],
              ].map(([num, label]) => (
                <div key={label}>
                  <div
                    className="text-2xl font-bold text-white"
                    style={{
                      fontFamily:
                        "'Outfit', sans-serif",
                    }}
                  >
                    {num}
                  </div>

                  <div className="text-xs text-white/60 mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-white">
        <div className="w-full max-w-sm px-1">
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>

          <h1
            className="text-xl sm:text-2xl font-bold text-navy-900 mb-1"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Welcome back
          </h1>

          <p className="text-navy-500 text-sm mb-8">
            Sign in to your NagarVaani account
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPwd
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleLogin()
                    }
                  }}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPwd((value) => !value)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
                  disabled={loading}
                >
                  {showPwd ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(e.target.checked)
                  }
                  className="w-4 h-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500"
                />

                <span className="text-sm text-navy-600">
                  Remember me
                </span>
              </label>

              <button
                onClick={() =>
                  navigate("forgot-password")
                }
                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              onClick={() => void handleLogin()}
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : null}

              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </div>

          <p className="text-center text-sm text-navy-500 mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("register")}
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Register now
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}