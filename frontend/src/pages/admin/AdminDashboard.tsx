import { useEffect, useState } from "react"
import type { Complaint, Page } from "../../types"
import api from "../../api/axios"
import StatCard from "../../components/StatCard"
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationIcon,
  BuildingOfficeIcon,
} from "../../components/Icons"

interface AdminDashboardProps {
  navigate: (
    page: Page,
    params?: {
      complaintId?: string
    }
  ) => void
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

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}

function statusClass(status: string) {
  switch (status) {
    case "REPORTED":
      return "bg-gray-100 text-gray-700"

    case "VERIFIED":
      return "bg-blue-100 text-blue-700"

    case "ASSIGNED":
      return "bg-violet-100 text-violet-700"

    case "IN_PROGRESS":
      return "bg-orange-100 text-orange-700"

    case "RESOLVED":
      return "bg-green-100 text-green-700"

    case "ESCALATED":
      return "bg-red-100 text-red-700"

    case "CLOSED":
      return "bg-gray-100 text-gray-600"

    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function AdminDashboard({
  navigate,
}: AdminDashboardProps) {
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null)

  const [complaints, setComplaints] =
    useState<Complaint[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError("")

        const [
          analyticsResponse,
          complaintsResponse,
        ] = await Promise.all([
          api.get<Analytics>(
            "/api/analytics/dashboard"
          ),

          api.get<Complaint[]>(
            "/api/complaints"
          ),
        ])

        setAnalytics(
          analyticsResponse.data
        )

        setComplaints(
          complaintsResponse.data
        )
      } catch (err) {
        console.error(
          "Failed to load admin dashboard:",
          err
        )

        setError(
          "Unable to load dashboard data."
        )
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  const escalated =
    complaints.filter(
      (complaint) =>
        complaint.status === "ESCALATED"
    ).length

  const recentComplaints =
    [...complaints]
      .sort(
        (a, b) => b.id - a.id
      )
      .slice(0, 6)

  const categoryCounts =
    complaints.reduce<
      Record<string, number>
    >((acc, complaint) => {
      acc[complaint.category] =
        (acc[complaint.category] || 0) + 1

      return acc
    }, {})

  const categoryEntries =
    Object.entries(categoryCounts)

  const stats = analytics
    ? [
        {
          label: "Total Complaints",
          value: analytics.totalComplaints,
          icon: (
            <DocumentTextIcon className="w-5 h-5" />
          ),
          color: "blue" as const,
        },
        {
          label: "Reported",
          value: analytics.reportedComplaints,
          icon: (
            <ClockIcon className="w-5 h-5" />
          ),
          color: "orange" as const,
        },
        {
          label: "In Progress",
          value:
            analytics.inProgressComplaints,
          icon: (
            <DocumentTextIcon className="w-5 h-5" />
          ),
          color: "purple" as const,
        },
        {
          label: "Resolved",
          value: analytics.resolvedComplaints,
          icon: (
            <CheckCircleIcon className="w-5 h-5" />
          ),
          color: "green" as const,
        },
        {
          label: "Escalated",
          value: escalated,
          icon: (
            <ExclamationIcon className="w-5 h-5" />
          ),
          color: "red" as const,
        },
        {
          label: "Active Officers",
          value: analytics.totalOfficers,
          icon: (
            <BuildingOfficeIcon className="w-5 h-5" />
          ),
          color: "cyan" as const,
        },
      ]
    : []

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-navy-200/60 p-8 sm:p-12 text-center">
          <div className="w-8 h-8 border-4 border-navy-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />

          <p className="text-sm text-navy-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-xl font-bold text-navy-900"
          style={{
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Dashboard Overview
        </h1>

        <p className="text-sm text-navy-500 mt-0.5">
          Overview of CivicConnect complaint activity.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Statistic cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            {...stat}
          />
        ))}
      </div>

      {/* Status + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Complaint status */}
        <div className="bg-white rounded-2xl border border-navy-200/60 p-5 shadow-sm">
          <h2
            className="text-base font-bold text-navy-900 mb-1"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Complaint Status
          </h2>

          <p className="text-xs text-navy-500 mb-5">
            Current complaint distribution
          </p>

          {[
            [
              "Reported",
              analytics?.reportedComplaints ?? 0,
              "bg-gray-400",
            ],
            [
              "Verified",
              analytics?.verifiedComplaints ?? 0,
              "bg-blue-500",
            ],
            [
              "Assigned",
              analytics?.assignedComplaints ?? 0,
              "bg-violet-500",
            ],
            [
              "In Progress",
              analytics?.inProgressComplaints ?? 0,
              "bg-orange-500",
            ],
            [
              "Resolved",
              analytics?.resolvedComplaints ?? 0,
              "bg-green-500",
            ],
            [
              "Escalated",
              escalated,
              "bg-red-500",
            ],
          ].map(
            ([label, value, bar]) => {
              const total =
                analytics?.totalComplaints || 1

              const width = Math.min(
                100,
                (Number(value) / total) * 100
              )

              return (
                <div
                  key={String(label)}
                  className="mb-4 last:mb-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-navy-600">
                      {label}
                    </span>

                    <span className="text-xs font-semibold text-navy-800">
                      {value}
                    </span>
                  </div>

                  <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${bar}`}
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              )
            }
          )}
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl border border-navy-200/60 p-5 shadow-sm">
          <h2
            className="text-base font-bold text-navy-900 mb-1"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Complaints by Category
          </h2>

          <p className="text-xs text-navy-500 mb-5">
            Live distribution from the complaints table
          </p>

          <div className="space-y-3">
            {categoryEntries.length === 0 ? (
              <p className="text-sm text-navy-400">
                No complaints available.
              </p>
            ) : (
              categoryEntries.map(
                ([category, count]) => {
                  const width =
                    analytics?.totalComplaints
                      ? Math.min(
                          100,
                          (count /
                            analytics.totalComplaints) *
                            100
                        )
                      : 0

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-navy-600">
                          {formatStatus(
                            category
                          )}
                        </span>

                        <span className="text-xs font-semibold text-navy-800">
                          {count}
                        </span>
                      </div>

                      <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full"
                          style={{
                            width: `${width}%`,
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

      {/* Recent complaints */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2
            className="text-lg font-bold text-navy-900"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Recent Complaints
          </h2>

          <button
            onClick={() =>
              navigate("admin-complaints")
            }
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all →
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-navy-50 border-b border-navy-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                  ID
                </th>

                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Title
                </th>

                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Category
                </th>

                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Department
                </th>

                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Status
                </th>

                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Upvotes
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-navy-50">
              {recentComplaints.map(
                (complaint) => (
                  <tr
                    key={complaint.id}
                    className="hover:bg-navy-50/50"
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-navy-400">
                      #{complaint.id}
                    </td>

                    <td className="px-4 py-3 font-medium text-navy-900 max-w-xs">
                      {complaint.title}
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs bg-navy-100 text-navy-600 px-2 py-1 rounded-full">
                        {formatStatus(
                          complaint.category
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-navy-500">
                      {complaint.department ||
                        "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(
                          complaint.status
                        )}`}
                      >
                        {formatStatus(
                          complaint.status
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-navy-500">
                      {complaint.upvoteCount ??
                        0}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}