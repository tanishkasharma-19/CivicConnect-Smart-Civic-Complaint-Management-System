import { useEffect, useState } from 'react'
import type { Page } from '../../types'
import api from '../../api/axios'
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
} from '../../components/Icons'

interface OfficerProfileProps {
  navigate: (page: Page) => void
}

interface OfficerProfileData {
  id: number
  name: string
  email: string
  role: string
  designation?: string
  ward?: string
  department?: {
    id?: number
    name?: string
  } | null
  isActive?: boolean
  createdAt?: string
}

function formatRole(role: string) {
  return role
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, letter =>
      letter.toUpperCase()
    )
}

function formatDate(date?: string) {
  if (!date) {
    return 'Not available'
  }

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return 'Not available'
  }

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function OfficerProfile({
  navigate,
}: OfficerProfileProps) {
  const [profile, setProfile] =
    useState<OfficerProfileData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await api.get<OfficerProfileData>(
            '/api/users/me'
          )

        setProfile(response.data)
      } catch (err) {
        console.error(
          'Failed to load officer profile:',
          err
        )

        setError(
          'Unable to load your profile.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm p-12 text-center">
          <div className="w-8 h-8 border-4 border-navy-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />

          <p className="text-sm text-navy-500">
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-4 sm:p-6">
        <button
          onClick={() =>
            navigate('officer-dashboard')
          }
          className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error ||
            'Profile could not be loaded.'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">

      {/* Back */}
      <button
        onClick={() =>
          navigate('officer-dashboard')
        }
        className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Heading */}
      <div>
        <h1
          className="text-xl sm:text-2xl font-bold text-navy-900"
          style={{
            fontFamily:
              "'Outfit', sans-serif",
          }}
        >
          My Profile
        </h1>

        <p className="text-sm text-navy-500 mt-1">
          View your officer account information.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm p-5 sm:p-6">

          <div className="flex flex-col items-center text-center">

            <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold">
              {profile.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2
              className="text-xl font-bold text-navy-900 mt-4"
              style={{
                fontFamily:
                  "'Outfit', sans-serif",
              }}
            >
              {profile.name}
            </h2>

            <p className="text-sm text-navy-500 mt-1">
              {profile.designation ||
                'Field Officer'}
            </p>

            <span className="mt-3 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
              {formatRole(profile.role)}
            </span>

            <div className="mt-5 pt-5 border-t border-navy-100 w-full">

              <div className="flex items-center justify-center gap-2 text-sm">

                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    profile.isActive === false
                      ? 'bg-red-500'
                      : 'bg-green-500'
                  }`}
                />

                <span className="font-medium text-navy-700">
                  {profile.isActive === false
                    ? 'Inactive'
                    : 'Active'}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-navy-200/60 shadow-sm">

          <div className="p-5 sm:p-6 border-b border-navy-100">

            <h2
              className="text-base sm:text-lg font-bold text-navy-900"
              style={{
                fontFamily:
                  "'Outfit', sans-serif",
              }}
            >
              Account Information
            </h2>

            <p className="text-xs text-navy-500 mt-1">
              Information associated with your officer account.
            </p>

          </div>

          <div className="p-5 sm:p-6 space-y-5">

            {/* Name */}
            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-navy-400">
                  Full Name
                </p>

                <p className="text-sm font-semibold text-navy-800 mt-1 break-words">
                  {profile.name}
                </p>
              </div>

            </div>

            {/* Email */}
            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9Z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4 7 8 6 8-6"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="text-xs text-navy-400">
                  Email Address
                </p>

                <p className="text-sm font-semibold text-navy-800 mt-1 break-all">
                  {profile.email}
                </p>
              </div>

            </div>

            {/* Role */}
            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <CheckCircleIcon className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs text-navy-400">
                  Role
                </p>

                <p className="text-sm font-semibold text-navy-800 mt-1">
                  {formatRole(profile.role)}
                </p>
              </div>

            </div>

            {/* Department */}
            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <BuildingOfficeIcon className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs text-navy-400">
                  Department
                </p>

                <p className="text-sm font-semibold text-navy-800 mt-1">
                  {profile.department?.name ||
                    'Not assigned'}
                </p>
              </div>

            </div>

            {/* Designation */}
            {profile.designation && (
              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-xs text-navy-400">
                    Designation
                  </p>

                  <p className="text-sm font-semibold text-navy-800 mt-1">
                    {profile.designation}
                  </p>
                </div>

              </div>
            )}

            {/* Ward */}
            {profile.ward && (
              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 21h18M5 21V6l7-3 7 3v15M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs text-navy-400">
                    Ward / Area
                  </p>

                  <p className="text-sm font-semibold text-navy-800 mt-1">
                    {profile.ward}
                  </p>
                </div>

              </div>
            )}

            {/* Member since */}
            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <rect
                    x="3.5"
                    y="5"
                    width="17"
                    height="15.5"
                    rx="2"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs text-navy-400">
                  Member Since
                </p>

                <p className="text-sm font-semibold text-navy-800 mt-1">
                  {formatDate(
                    profile.createdAt
                  )}
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="bg-navy-50 rounded-2xl border border-navy-200/60 p-5">

        <h2
          className="text-sm font-bold text-navy-900"
          style={{
            fontFamily:
              "'Outfit', sans-serif",
          }}
        >
          Account Security
        </h2>

        <p className="text-xs text-navy-500 mt-1.5 leading-5">
          For your account security, please do not share your login credentials with anyone. If you suspect any unauthorized access to your account, please contact the support team immediately.
        </p>

      </div>

    </div>
  )
}