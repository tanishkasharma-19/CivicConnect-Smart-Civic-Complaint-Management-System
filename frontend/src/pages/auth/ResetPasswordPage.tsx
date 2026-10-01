import { useState } from 'react'
import type { Page } from '../../types'
import Logo from '../../components/Logo'
import { ArrowLeftIcon } from '../../components/Icons'
import { isAxiosError } from 'axios'
import api from '../../api/axios'

interface ResetPasswordPageProps {
  navigate: (page: Page) => void
  token?: string
}

export default function ResetPasswordPage({
  navigate,
  token,
}: ResetPasswordPageProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    setError('')

    if (!token) {
      setError(
        'Invalid or missing password reset link.'
      )
      return
    }

    if (!password.trim()) {
      setError('Please enter a new password.')
      return
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters long.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      await api.post(
        '/api/auth/reset-password',
        {
          token,
          newPassword: password,
        }
      )

      setSuccess(true)
    } catch (err) {
      console.error(
        'Failed to reset password:',
        err
      )

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

  if (success) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-navy-50 px-4 sm:px-6 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-navy-200/60 p-5 sm:p-8 shadow-sm">
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
              style={{
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Password reset successful
            </h1>

            <p className="text-navy-500 text-sm text-center mb-6">
              Your password has been changed successfully.
              You can now sign in with your new password.
            </p>

            <button
              onClick={() => navigate('login')}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all text-sm"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    )
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
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>

          <h1
            className="text-xl font-bold text-navy-900 mb-1 text-center"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Reset your password
          </h1>

          <p className="text-navy-500 text-sm text-center mb-6">
            Enter your new password below.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">
                New password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">
                Confirm password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                placeholder="Confirm new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div>
                <p className="text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => navigate('forgot-password')}
                  className="mt-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Request a new reset link
                </button>
              </div>
            )}

            <button
              onClick={handleReset}
              disabled={
                loading ||
                !password.trim() ||
                !confirmPassword.trim()
              }
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}

              {loading
                ? 'Resetting...'
                : 'Reset Password'}
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