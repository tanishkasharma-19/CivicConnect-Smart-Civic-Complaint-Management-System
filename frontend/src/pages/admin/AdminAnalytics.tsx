import { useEffect, useMemo, useState } from 'react'
import type {
  Complaint,
  Page,
} from '../../types'
import api from '../../api/axios'

interface AdminAnalyticsProps {
  navigate: (page: Page) => void
}

interface Analytics {
  totalComplaints: number
  reportedComplaints: number
  verifiedComplaints: number
  assignedComplaints: number
  inProgressComplaints: number
  resolvedComplaints: number
  closedComplaints: number
  totalUsers: number
  totalOfficers: number
}

function formatStatus(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}

export default function AdminAnalytics({
  navigate,
}: AdminAnalyticsProps) {
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null)

  const [complaints, setComplaints] =
    useState<Complaint[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const loadAnalytics =
      async () => {
        try {
          setLoading(true)
          setError('')

          const [
            analyticsResponse,
            complaintsResponse,
          ] = await Promise.all([
            api.get<Analytics>(
              '/api/analytics/dashboard'
            ),
            api.get<Complaint[]>(
              '/api/complaints'
            ),
          ])

          setAnalytics(
            analyticsResponse.data
          )

          setComplaints(
            complaintsResponse.data
          )
        } catch (err) {
          console.error(err)

          setError(
            'Unable to load analytics.'
          )
        } finally {
          setLoading(false)
        }
      }

    loadAnalytics()
  }, [])

  const categoryData = useMemo(
    () => {
      const counts: Record<
        string,
        number
      > = {}

      complaints.forEach(
        (complaint) => {
          counts[complaint.category] =
            (counts[
              complaint.category
            ] || 0) + 1
        }
      )

      return Object.entries(
        counts
      ).sort(
        (a, b) =>
          b[1] - a[1]
      )
    },
    [complaints]
  )

  const statusData = analytics
    ? [
        {
          name: 'Reported',
          value:
            analytics.reportedComplaints,
          className:
            'bg-gray-400',
        },
        {
          name: 'Verified',
          value:
            analytics.verifiedComplaints,
          className:
            'bg-blue-500',
        },
        {
          name: 'Assigned',
          value:
            analytics.assignedComplaints,
          className:
            'bg-violet-500',
        },
        {
          name: 'In Progress',
          value:
            analytics.inProgressComplaints,
          className:
            'bg-orange-500',
        },
        {
          name: 'Resolved',
          value:
            analytics.resolvedComplaints,
          className:
            'bg-green-500',
        },
        {
          name: 'Escalated',
          value:
            complaints.filter(
              (c) =>
                c.status ===
                'ESCALATED'
            ).length,
          className:
            'bg-red-500',
        },
      ]
    : []

  const resolutionRate =
    analytics &&
    analytics.totalComplaints > 0
      ? Math.round(
          (analytics.resolvedComplaints /
            analytics.totalComplaints) *
            100
        )
      : 0

  const escalationRate =
    analytics &&
    analytics.totalComplaints > 0
      ? Math.round(
          (complaints.filter(
            (c) =>
              c.status ===
              'ESCALATED'
          ).length /
            analytics.totalComplaints) *
            100
        )
      : 0

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-2xl border p-12 text-center">
          <div className="w-8 h-8 border-4 border-navy-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />

          <p className="text-sm text-navy-500">
            Loading analytics...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      <div>
        <h1
          className="text-xl font-bold text-navy-900"
          style={{
            fontFamily:
              "'Outfit', sans-serif",
          }}
        >
          Analytics & Reports
        </h1>

        <p className="text-sm text-navy-500 mt-0.5">
          Live analytics from CivicConnect data.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
          <p className="text-2xl font-bold text-green-600">
            {resolutionRate}%
          </p>

          <p className="text-sm font-semibold text-navy-800 mt-1">
            Resolution Rate
          </p>

          <p className="text-xs text-navy-500 mt-0.5">
            Based on resolved complaints
          </p>
        </div>

        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">
            {analytics?.resolvedComplaints ??
              0}
          </p>

          <p className="text-sm font-semibold text-navy-800 mt-1">
            Resolved
          </p>

          <p className="text-xs text-navy-500 mt-0.5">
            Current resolved complaints
          </p>
        </div>

        <div className="bg-violet-50 rounded-2xl p-5 border border-violet-200">
          <p className="text-2xl font-bold text-violet-600">
            {analytics?.totalOfficers ??
              0}
          </p>

          <p className="text-sm font-semibold text-navy-800 mt-1">
            Officers
          </p>

          <p className="text-xs text-navy-500 mt-0.5">
            Total registered officers
          </p>
        </div>

        <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200">
          <p className="text-2xl font-bold text-orange-600">
            {escalationRate}%
          </p>

          <p className="text-sm font-semibold text-navy-800 mt-1">
            Escalation Rate
          </p>

          <p className="text-xs text-navy-500 mt-0.5">
            Based on escalated complaints
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="bg-white rounded-2xl border border-navy-200/60 p-4 sm:p-5 shadow-sm">

          <h2
            className="text-base font-bold text-navy-900"
            style={{
              fontFamily:
                "'Outfit', sans-serif",
            }}
          >
            Status Distribution
          </h2>

          <p className="text-xs text-navy-500 mt-1 mb-5">
            Current complaint breakdown
          </p>

          <div className="space-y-4">

            {statusData.map(
              (item) => {
                const total =
                  analytics?.totalComplaints ||
                  1

                const percentage =
                  Math.round(
                    (item.value /
                      total) *
                      100
                  )

                return (
                  <div key={item.name}>

                    <div className="flex items-center justify-between mb-1">

                      <span className="text-sm text-navy-600">
                        {item.name}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-navy-800">
                          {item.value}
                        </span>

                        <span className="text-xs text-navy-400">
                          ({percentage}%)
                        </span>
                      </div>

                    </div>

                    <div className="h-2.5 bg-navy-100 rounded-full overflow-hidden">

                      <div
                        className={`h-full rounded-full ${item.className}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                )
              }
            )}

          </div>
        </div>

        <div className="bg-white rounded-2xl border border-navy-200/60 p-4 sm:p-5 shadow-sm">

          <h2
            className="text-base font-bold text-navy-900"
            style={{
              fontFamily:
                "'Outfit', sans-serif",
            }}
          >
            Complaints by Category
          </h2>

          <p className="text-xs text-navy-500 mt-1 mb-5">
            Live category distribution
          </p>

          <div className="space-y-4">

            {categoryData.length ===
            0 ? (
              <p className="text-sm text-navy-400">
                No complaint data available.
              </p>
            ) : (
              categoryData.map(
                ([category, count]) => {
                  const total =
                    analytics?.totalComplaints ||
                    1

                  const percentage =
                    Math.round(
                      (count /
                        total) *
                        100
                    )

                  return (
                    <div
                      key={category}
                    >

                      <div className="flex items-center justify-between mb-1">

                        <span className="text-sm text-navy-600">
                          {formatStatus(
                            category
                          )}
                        </span>

                        <span className="text-sm font-bold text-navy-800">
                          {count}
                        </span>

                      </div>

                      <div className="h-2.5 bg-navy-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-brand-600 rounded-full"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  )
                }
              )
            )}

          </div>

        </div>

      </div>

      {/* Exact backend analytics */}
      <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm overflow-hidden">

        <div className="p-5 border-b border-navy-100">

          <h2
            className="text-base font-bold text-navy-900"
            style={{
              fontFamily:
                "'Outfit', sans-serif",
            }}
          >
            Backend Analytics Summary
          </h2>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5">

          {[
            [
              'Verified',
              analytics?.verifiedComplaints ??
                0,
            ],
            [
              'Assigned',
              analytics?.assignedComplaints ??
                0,
            ],
            [
              'Closed',
              analytics?.closedComplaints ??
                0,
            ],
            [
              'Total Users',
              analytics?.totalUsers ??
                0,
            ],
          ].map(
            ([label, value]) => (
              <div
                key={String(label)}
                className="bg-navy-50 rounded-xl p-4"
              >
                <p className="text-xs text-navy-400">
                  {label}
                </p>

                <p className="text-2xl font-bold text-navy-900 mt-1">
                  {value}
                </p>
              </div>
            )
          )}

        </div>

      </div>

    </div>
  )
}