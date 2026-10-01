import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import type { Page } from '../../types'
import Logo from '../../components/Logo'
import { ArrowLeftIcon } from '../../components/Icons'
import api from '../../api/axios'

interface VerifyEmailPageProps {
  navigate: (page: Page) => void
  login: (token: string, role: string, email: string) => void
}

const VERIFY_EMAIL_KEY = 'civicconnect.verifyEmail'
const RESEND_SECONDS = 60

export default function VerifyEmailPage({
  navigate,
  login,
}: VerifyEmailPageProps) {
  // Set by RegisterPage / LoginPage before opening this page
  const email = sessionStorage.getItem(VERIFY_EMAIL_KEY) ?? ''

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)

  // Opened without an email (for example after a refresh): go back to register
  useEffect(() => {
    if (!email) {
      navigate('register')
    }
  }, [email, navigate])

  // Resend countdown
  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = window.setTimeout(
      () => setSecondsLeft((s) => s - 1),
      1000
    )

    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  const getMessage = (err: unknown, fallback: string) => {
    if (isAxiosError(err)) {
      const message = (
        err.response?.data as { message?: string } | undefined
      )?.message

      return message || fallback
    }

    return fallback
  }

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Please enter the 6-digit code from your email.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setInfo('')

      const response = await api.post('/api/auth/verify-email', {
        email,
        code,
      })

      const data = response.data

      if (!data?.token || !data?.role || !data?.email) {
        setError('Invalid response from server.')
        return
      }

      sessionStorage.removeItem(VERIFY_EMAIL_KEY)

      // Email verified: sign the user in
      login(data.token, data.role, data.email)
    } catch (err) {
      console.error('Email verification failed:', err)

      setError(
        getMessage(err, 'Unable to reach the server. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      setResending(true)
      setError('')
      setInfo('')

      await api.post('/api/auth/resend-verification', { email })

      setCode('')
      setInfo('A new code has been sent. Please check your inbox.')
      setSecondsLeft(RESEND_SECONDS)
    } catch (err) {
      console.error('Resend failed:', err)

      setError(
        getMessage(err, 'Unable to send a new code. Please try again.')
      )
    } finally {
      setResending(false)
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
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>

          <h1
            className="text-xl font-bold text-navy-900 mb-1 text-center"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Verify your email
          </h1>

          <p className="text-navy-500 text-sm text-center mb-6">
            We sent a 6-digit code to{' '}
            <span className="font-semibold text-navy-700">{email}</span>.
            It expires in 10 minutes. Please also check your spam folder.
          </p>

          <div className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                setError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleVerify()
              }}
              placeholder="000000"
              className="w-full px-3.5 py-3 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-300 text-xl text-center tracking-[0.5em] font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            {info && <p className="text-sm text-green-600">{info}</p>}

            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}

              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              onClick={handleResend}
              disabled={resending || secondsLeft > 0}
              className="w-full py-2.5 border border-navy-200 hover:bg-navy-50 disabled:opacity-60 disabled:hover:bg-transparent text-navy-700 font-semibold rounded-xl transition-all text-sm"
            >
              {resending
                ? 'Sending...'
                : secondsLeft > 0
                  ? `Resend code in ${secondsLeft}s`
                  : 'Resend code'}
            </button>
          </div>
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
