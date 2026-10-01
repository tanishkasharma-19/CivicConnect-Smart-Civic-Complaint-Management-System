import { useState } from 'react'
import type { Page } from '../../types'
import Logo from '../../components/Logo'
import { EyeIcon, EyeSlashIcon } from '../../components/Icons'
import api from '../../api/axios'
import { isValidEmail, isValidPhone } from '../../utils/validation'

interface RegisterPageProps {
  navigate: (page: Page) => void
}

function getPasswordStrength(pwd: string): {
  score: number
  label: string
  color: string
} {
  if (pwd.length === 0) {
    return { score: 0, label: '', color: '' }
  }

  let score = 0

  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  const map = [
    { score: 1, label: 'Weak', color: 'bg-red-500' },
    { score: 2, label: 'Fair', color: 'bg-amber-500' },
    { score: 3, label: 'Good', color: 'bg-yellow-500' },
    { score: 4, label: 'Strong', color: 'bg-green-500' },
  ]

  return map[score - 1] ?? {
    score: 0,
    label: '',
    color: '',
  }
}

export default function RegisterPage({ navigate }: RegisterPageProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })

  const [showPwd, setShowPwd] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const strength = getPasswordStrength(form.password)

  const update =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({
        ...f,
        [key]: e.target.value,
      }))

      setError('')
    }

  // Phone: digits only, maximum 10
  const updatePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)

    setForm((f) => ({
      ...f,
      phone: digits,
    }))

    setError('')
  }

  const handleSubmit = async () => {
    setError('')

    if (!form.name.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!form.email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address, for example name@gmail.com.')
      return
    }

    if (!isValidPhone(form.phone)) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    if (!form.password) {
      setError('Please enter a password.')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy.')
      return
    }

    setLoading(true)

    try {
      await api.post('/api/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
      })

      // A 6-digit code was emailed. Next step: verify the email.
      sessionStorage.setItem(
        'civicconnect.verifyEmail',
        form.email.trim()
      )

      navigate('verify-email')
    } catch (err: any) {
      console.error('Registration failed:', err)

      if (err.response?.status === 409) {
        setError('An account with this email already exists.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-navy-50 px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>

          <h1
            className="text-2xl font-bold text-navy-900 mb-1"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Create your account
          </h1>

          <p className="text-navy-500 text-sm">
            Join CivicConnect and make your city better
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-navy-200/60 p-5 sm:p-8 shadow-sm">
          <div className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">
                Full Name
              </label>

              <input
                type="text"
                value={form.name}
                onChange={update('name')}
                placeholder="Priya Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">
                Email address
              </label>

              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">
                Phone Number
              </label>

              <div className="flex gap-2 min-w-0">
                <div className="w-16 sm:w-20 px-2 sm:px-3 py-2.5 rounded-xl border border-navy-200 text-navy-600 text-sm bg-navy-50 flex items-center justify-center font-medium shrink-0">
                  +91
                </div>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={updatePhone}
                  placeholder="9820145678"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Create a strong password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
                >
                  {showPwd ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= strength.score
                            ? strength.color
                            : 'bg-navy-200'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-navy-500">
                    Password strength:{' '}
                    <span className="font-semibold">
                      {strength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">
                Confirm Password
              </label>

              <input
                type="password"
                value={form.confirm}
                onChange={update('confirm')}
                placeholder="Re-enter your password"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-navy-900 placeholder-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                  form.confirm && form.confirm !== form.password
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-navy-200'
                }`}
              />

              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500"
              />

              <span className="text-sm text-navy-600">
  I agree to the{' '}
  <button
    type="button"
    onClick={() => navigate('terms')}
    className="text-brand-600 font-medium hover:underline"
  >
    Terms of Service
  </button>{' '}
  and{' '}
  <button
    type="button"
    onClick={() => navigate('privacy')}
    className="text-brand-600 font-medium hover:underline"
  >
    Privacy Policy
  </button>
</span>
            </label>

            {/* API Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !agreed}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}

              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-navy-500 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('login')}
            className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}