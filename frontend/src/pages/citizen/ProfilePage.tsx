import { useEffect, useState } from 'react'
import type { Page, User } from '../../types'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeftIcon } from '../../components/Icons'

interface ProfilePageProps {
  navigate: (
    page: Page,
    params?: { complaintId?: string }
  ) => void

  logout: () => void
}

function formatRole(role?: string) {
  if (!role) {
    return 'Citizen'
  }

  return role
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}

export default function ProfilePage({
  navigate,
  logout,
}: ProfilePageProps) {
  const {
    email,
    role,
  } = useAuth()

  const [profile, setProfile] =
    useState<User | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await api.get<User>(
            '/api/users/me'
          )

        setProfile(response.data)
      } catch (err) {
        console.error(
          'Failed to load profile:',
          err
        )

        setError(
          'Unable to load your profile.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('login')
  }

  const displayName =
    profile?.name || 'Citizen'

  const displayEmail =
    profile?.email || email || ''

  const displayRole =
    profile?.role || role || 'CITIZEN'

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
        <div className="bg-white rounded-2xl border border-navy-200/60 p-12 text-center">
          <div className="w-9 h-9 border-4 border-navy-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-navy-500">
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">

      {/* Header */}
      <div className="mb-7">

        <h1
          className="text-2xl font-bold text-navy-900"
          style={{
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          My Profile
        </h1>

        <p className="text-sm text-navy-500 mt-1">
          View your account information.
        </p>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm overflow-hidden">

        {/* Top */}
        <div className="p-5 sm:p-8 bg-gradient-to-br from-brand-50 to-white border-b border-navy-100">

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">

            {/* Avatar */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">

              <span
                className="text-3xl font-bold text-brand-700"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {displayName
                  .charAt(0)
                  .toUpperCase()}
              </span>

            </div>

            <div>

              <h2
                className="text-xl sm:text-2xl font-bold text-navy-900"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {displayName}
              </h2>

              <p className="text-sm text-navy-500 mt-1">
                {displayEmail}
              </p>

              <span className="inline-flex mt-3 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold">
                {formatRole(displayRole)}
              </span>

            </div>

          </div>

        </div>

        {/* Information */}
        <div className="p-5 sm:p-8">

          <h3
            className="text-lg font-bold text-navy-900 mb-5"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Account Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Name */}
            <div className="rounded-xl bg-navy-50 p-4">
              <p className="text-xs text-navy-400 mb-1">
                Full Name
              </p>

              <p className="text-sm font-semibold text-navy-800">
                {displayName}
              </p>
            </div>

            {/* Email */}
            <div className="rounded-xl bg-navy-50 p-4">
              <p className="text-xs text-navy-400 mb-1">
                Email
              </p>

              <p className="text-sm font-semibold text-navy-800 break-all">
                {displayEmail}
              </p>
            </div>

            {/* Role */}
            <div className="rounded-xl bg-navy-50 p-4">
              <p className="text-xs text-navy-400 mb-1">
                Role
              </p>

              <p className="text-sm font-semibold text-navy-800">
                {formatRole(displayRole)}
              </p>
            </div>

            {/* Status */}
            <div className="rounded-xl bg-navy-50 p-4">
              <p className="text-xs text-navy-400 mb-1">
                Account Status
              </p>

              <p
                className={`text-sm font-semibold ${
                  profile?.isActive === false
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {profile?.isActive === false
                  ? 'Inactive'
                  : 'Active'}
              </p>
            </div>

            {/* Designation */}
            {profile?.designation && (
              <div className="rounded-xl bg-navy-50 p-4">
                <p className="text-xs text-navy-400 mb-1">
                  Designation
                </p>

                <p className="text-sm font-semibold text-navy-800">
                  {profile.designation}
                </p>
              </div>
            )}

            {/* Ward */}
            {profile?.ward && (
              <div className="rounded-xl bg-navy-50 p-4">
                <p className="text-xs text-navy-400 mb-1">
                  Ward
                </p>

                <p className="text-sm font-semibold text-navy-800">
                  {profile.ward}
                </p>
              </div>
            )}

            {/* Department */}
            {profile?.department && (
              <div className="rounded-xl bg-navy-50 p-4">
                <p className="text-xs text-navy-400 mb-1">
                  Department
                </p>

                <p className="text-sm font-semibold text-navy-800">
                  {profile.department}
                </p>
              </div>
            )}

          </div>

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-navy-100">

            <button
              onClick={() =>
                navigate('citizen-home')
              }
              className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-800 font-medium transition-colors mb-5"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Home
            </button>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Sign Out
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}