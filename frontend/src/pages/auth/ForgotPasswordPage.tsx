import { useEffect, useState } from 'react'
import type { Page } from '../../types'
import Logo from '../../components/Logo'
import { ArrowLeftIcon } from '../../components/Icons'
import { isAxiosError } from 'axios'
import api from '../../api/axios'
import { isValidEmail } from '../../utils/validation'

// A new reset email can be requested only after this many minutes
const RESEND_COOLDOWN_MINUTES = 5
const COOLDOWN_KEY = 'civicconnect.resetCooldown'

interface StoredCooldown {
  email: string
  until: number
}

function readCooldown(): StoredCooldown | null {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY)
    if (!raw) return null

    const data = JSON.parse(raw) as StoredCooldown

    return data.until > Date.now() ? data : null
  } catch {
    return null
  }
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

interface ForgotPasswordPageProps {
  navigate: (page: Page) => void
}

export default function ForgotPasswordPage({
  navigate,
}: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)

  // If the page is opened again while a cooldown is running, restore it
  useEffect(() => {
    const saved = readCooldown()

    if (saved) {
      setEmail(saved.email)
      setSent(true)
      setSecondsLeft(Math.ceil((saved.until - Date.now()) / 1000))
    }
  }, [])

  // Countdown, ticks every second
  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = window.setInterval(() => {
      const saved = readCooldown()

      setSecondsLeft(
        saved ? Math.ceil((saved.until - Date.now()) / 1000) : 0
      )
    }, 1000)

    return () => window.clearInterval(timer)
  }, [secondsLeft > 0])

  const handleSend = async () => {
    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address, for example name@gmail.com.')
      return
    }

    // Same email, cooldown still running: do not call the backend again
    const saved = readCooldown()

    if (saved && saved.email === cleanEmail.toLowerCase()) {
      setSent(true)
      setSecondsLeft(Math.ceil((saved.until - Date.now()) / 1000))
      return
    }

    try {
      setLoading(true)
      setError('')

      await api.post(
  "/api/auth/forgot-password",
  {
    email: email.trim(),
  }
)

      const until = Date.now() + RESEND_COOLDOWN_MINUTES * 60 * 1000

      localStorage.setItem(
        COOLDOWN_KEY,
        JSON.stringify({ email: cleanEmail.toLowerCase(), until })
      )

      setSecondsLeft(RESEND_COOLDOWN_MINUTES * 60)
      setSent(true)
    } catch (err) {
      console.error('Failed to send reset email:', err)

      const backendMessage = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined

      setError(
        backendMessage ||
          'Unable to reach the server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-navy-50 px-4 sm:px-6 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-navy-200/60 p-5 sm:p-8 shadow-sm">
          {!sent ? (
            <>
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-5 mx-auto">
                <svg
                  className="w-6 h-6 text-brand-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>

              <h1
                className="text-xl font-bold text-navy-900 mb-1 text-center"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Forgot your password?
              </h1>

              <p className="text-navy-500 text-sm text-center mb-6">
                No worries. Enter your email and we'll send you a reset link.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">
                    Email address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSend()
                    }}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSend}
                  disabled={loading || !email.trim()}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}

                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-5 mx-auto">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>

              <h1
                className="text-xl font-bold text-navy-900 mb-2 text-center"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Check your inbox
              </h1>

              <p className="text-navy-500 text-sm text-center mb-6">
                If an account exists for{' '}
                <span className="font-semibold text-navy-700">
                  {email}
                </span>
                , a password reset link has been sent. The link expires in
                15 minutes. Please also check your spam folder.
              </p>

              {error && (
                <p className="text-sm text-red-600 mb-3 text-center">
                  {error}
                </p>
              )}

              <button
                onClick={handleSend}
                disabled={loading || secondsLeft > 0}
                className="w-full py-2.5 border border-navy-200 hover:bg-navy-50 disabled:opacity-60 disabled:hover:bg-transparent text-navy-700 font-semibold rounded-xl transition-all text-sm"
              >
                {loading
                  ? 'Sending...'
                  : secondsLeft > 0
                    ? `Resend link in ${formatTime(secondsLeft)}`
                    : 'Resend link'}
              </button>

              <button
                onClick={() => {
                  setSent(false)
                  setError('')
                }}
                className="w-full mt-3 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                Use a different email
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => navigate('login')}
          className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 transition-colors mx-auto mt-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to sign in
        </button>
      </div>
    </div>
  )
}