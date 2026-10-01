import { useEffect, useState } from "react"
import type { Complaint, Page, Status } from "../../types"
import api from "../../api/axios"
import StatusBadge from "../../components/StatusBadge"
import {
  MapPinIcon,
  ArrowUpIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from "../../components/Icons"

interface ComplaintDetailPageProps {
  navigate: (
    page: Page,
    params?: {
      complaintId?: string
    }
  ) => void

  complaintId: string | null
}

const STATUS_ORDER: Status[] = [
  "REPORTED",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
]

const STATUS_MESSAGES: Record<string, string> = {
  REPORTED: "Complaint has been reported.",
  VERIFIED: "Complaint has been verified.",
  ASSIGNED: "Complaint has been assigned.",
  IN_PROGRESS: "Complaint is currently being handled.",
  RESOLVED: "Complaint has been resolved.",
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}

function formatCategory(category: string) {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}

function formatDate(date?: string) {
  if (!date) {
    return ""
  }

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return ""
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusIndex(status: string) {
  return STATUS_ORDER.indexOf(
    status as Status
  )
}

function Timeline({
  complaint,
}: {
  complaint: Complaint
}) {
  const currentIndex = getStatusIndex(
    complaint.status
  )

  const statuses =
    currentIndex >= 0
      ? STATUS_ORDER
      : [
          ...STATUS_ORDER,
          complaint.status as Status,
        ]

  return (
    <div className="space-y-0">
      {statuses.map((status, index) => {
        const statusIndex =
          STATUS_ORDER.indexOf(status)

        const isCompleted =
          currentIndex >= 0 &&
          statusIndex < currentIndex

        const isCurrent =
          status === complaint.status

        const isLast =
          index === statuses.length - 1

        let eventDate = ""

        if (status === "REPORTED") {
          eventDate =
            formatDate(complaint.createdAt)
        }

        if (
          status === "IN_PROGRESS" &&
          complaint.updatedAt
        ) {
          eventDate =
            formatDate(complaint.updatedAt)
        }

        if (
          status === "RESOLVED" &&
          complaint.resolvedAt
        ) {
          eventDate =
            formatDate(complaint.resolvedAt)
        }

        return (
          <div
            key={status}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-brand-600 text-white ring-4 ring-brand-100"
                    : "bg-navy-100 text-navy-400"
                }`}
              >
                {isCompleted ? (
                  "✓"
                ) : isCurrent ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>

              {!isLast && (
                <div
                  className={`w-0.5 h-8 my-1 ${
                    isCompleted
                      ? "bg-green-300"
                      : "bg-navy-100"
                  }`}
                />
              )}
            </div>

            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? "text-brand-700"
                      : isCompleted
                      ? "text-navy-700"
                      : "text-navy-400"
                  }`}
                >
                  {formatStatus(status)}
                </span>

                {isCurrent && (
                  <span className="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>

              {isCompleted || isCurrent ? (
                <>
                  <p className="text-xs text-navy-500 mb-0.5">
                    {STATUS_MESSAGES[status] ??
                      "Status updated."}
                  </p>

                  {eventDate && (
                    <p className="text-xs text-navy-400">
                      {eventDate}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-navy-400">
                  Awaiting
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ComplaintDetailPage({
  navigate,
  complaintId,
}: ComplaintDetailPageProps) {
  const [complaint, setComplaint] =
    useState<Complaint | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [upvoting, setUpvoting] =
    useState(false)

  const [upvoted, setUpvoted] =
    useState(false)

  const [showUpvoteModal, setShowUpvoteModal] =
    useState(false)

  const [toast, setToast] =
    useState("")

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!complaintId) {
        setError(
          "Complaint ID is missing."
        )
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")

        const response =
          await api.get<Complaint>(
            `/api/complaints/${complaintId}`
          )

        setComplaint(response.data)
      } catch (err) {
        console.error(
          "Failed to fetch complaint:",
          err
        )

        setError(
          "Unable to load complaint details."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchComplaint()
  }, [complaintId])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer = window.setTimeout(() => {
      setToast("")
    }, 3000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [toast])

  const confirmUpvote = async () => {
    if (!complaint) {
      return
    }

    try {
      setUpvoting(true)
      setError("")

      if (upvoted) {
        await api.delete(
          `/api/complaints/${complaint.id}/upvote`
        )

        setComplaint((current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            upvoteCount: Math.max(
              (current.upvoteCount ?? 0) - 1,
              0
            ),
          }
        })

        setUpvoted(false)
        setToast(
          "Your upvote has been removed."
        )
      } else {
        await api.post(
          `/api/complaints/${complaint.id}/upvote`
        )

        setComplaint((current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            upvoteCount:
              (current.upvoteCount ?? 0) + 1,
          }
        })

        setUpvoted(true)

        setToast(
          "Complaint upvoted successfully."
        )
      }

      setShowUpvoteModal(false)
    } catch (err) {
      console.error(
        "Failed to update upvote:",
        err
      )

      setError(
        upvoted
          ? "Unable to remove your upvote."
          : "Unable to update your upvote. You may have already upvoted this complaint."
      )
    } finally {
      setUpvoting(false)
    }
  }

  const image =
    complaint?.beforePhotoUrl ||
    complaint?.afterPhotoUrl

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-navy-200/60 p-10 text-center">
          <p className="text-sm text-navy-500">
            Loading complaint...
          </p>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() =>
            navigate(
              "citizen-explore"
            )
          }
          className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Complaints
        </button>

        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-600">
          {error ||
            "Complaint could not be loaded."}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">

      {toast && (
        <div className="fixed top-5 right-5 z-[70]">
          <div className="bg-white border border-green-200 shadow-xl rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4" />
            </div>

            <p className="text-sm font-medium text-navy-800">
              {toast}
            </p>
          </div>
        </div>
      )}

      {showUpvoteModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl p-5 sm:p-6">

            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <ArrowUpIcon className="w-6 h-6" />
            </div>

            <h2
              className="text-xl font-bold text-navy-900 text-center"
              style={{
                fontFamily:
                  "'Outfit', sans-serif",
              }}
            >
              {upvoted
                ? "Remove your upvote?"
                : "Upvote this complaint?"}
            </h2>

            <p className="text-sm text-navy-500 text-center mt-2 leading-6">
              {upvoted
                ? "Your upvote will no longer support this civic issue."
                : "Your upvote will show community support for this issue and help make the problem more visible."}
            </p>

            <div className="bg-navy-50 rounded-xl p-4 mt-5">
              <p className="text-sm font-semibold text-navy-900">
                {complaint.title}
              </p>

              <p className="text-xs text-navy-500 mt-1">
                Complaint #{complaint.id}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <button
                type="button"
                onClick={() =>
                  setShowUpvoteModal(false)
                }
                disabled={upvoting}
                className="py-2.5 border border-navy-200 text-navy-700 hover:bg-navy-50 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              >
                {upvoted
                  ? "No, Keep It"
                  : "No, Thanks"}
              </button>

              <button
                type="button"
                onClick={confirmUpvote}
                disabled={upvoting}
                className="py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-xl text-sm font-semibold transition-all"
              >
                {upvoting
                  ? "Updating..."
                  : upvoted
                  ? "Yes, Remove"
                  : "Yes, Upvote"}
              </button>
            </div>

          </div>
        </div>
      )}

      <button
        onClick={() =>
          navigate(
            "citizen-explore"
          )
        }
        className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Complaints
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-5">

          {/* Image */}
          <div className="bg-white rounded-2xl border border-navy-200/60 overflow-hidden shadow-sm">

            <div className="relative h-72 sm:h-96 bg-navy-100">
              {image ? (
                <img
                  src={image}
                  alt={complaint.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-5xl opacity-30">
                    No Image
                  </span>
                </div>
              )}
            </div>

            {complaint.afterPhotoUrl &&
              complaint.beforePhotoUrl && (
                <div className="grid grid-cols-2 gap-3 p-3">
                  <div>
                    <p className="text-xs text-navy-500 mb-1">
                      Before
                    </p>

                    <img
                      src={
                        complaint.beforePhotoUrl
                      }
                      alt="Before"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-navy-500 mb-1">
                      After
                    </p>

                    <img
                      src={
                        complaint.afterPhotoUrl
                      }
                      alt="After"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-navy-200/60 p-6 shadow-sm">

            <h2
              className="text-lg font-bold text-navy-900 mb-3"
              style={{
                fontFamily:
                  "'Outfit', sans-serif",
              }}
            >
              Issue Description
            </h2>

            <p className="text-navy-600 text-sm leading-relaxed">
              {complaint.description}
            </p>

          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-navy-200/60 overflow-hidden shadow-sm">

            <div className="p-5">

              <h2
                className="text-base font-bold text-navy-900"
                style={{
                  fontFamily:
                    "'Outfit', sans-serif",
                }}
              >
                Location
              </h2>

              <p className="text-xs text-navy-500 mt-2 flex items-start gap-1.5">
                <MapPinIcon className="w-4 h-4 flex-shrink-0" />

                <span>
                  {complaint.address ||
                    "Location not provided"}
                </span>
              </p>

              {complaint.latitude !==
                undefined &&
                complaint.longitude !==
                  undefined && (
                  <div className="mt-4 bg-navy-50 rounded-xl p-4">

                    <p className="text-xs text-navy-500 mb-1">
                      Coordinates
                    </p>

                    <p className="text-sm font-medium text-navy-800">
                      {complaint.latitude},{" "}
                      {complaint.longitude}
                    </p>

                  </div>
                )}

            </div>
          </div>

          {/* Resolution Details */}
          {(complaint.status === "RESOLVED" ||
            complaint.status === "CLOSED") &&
            (((complaint as Complaint & {
              resolutionNotes?: string
            }).resolutionNotes?.trim()) ||
              complaint.afterPhotoUrl) && (
              <div className="bg-white rounded-2xl border border-navy-200/60 p-6 shadow-sm">
                <h2
                  className="text-lg font-bold text-navy-900 mb-4"
                  style={{
                    fontFamily:
                      "'Outfit', sans-serif",
                  }}
                >
                  Resolution Details
                </h2>

                {(
                  complaint as Complaint & {
                    resolutionNotes?: string
                  }
                ).resolutionNotes?.trim() && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-navy-500 mb-1.5">
                      Resolution Notes
                    </p>

                    <p className="text-sm text-navy-700 leading-6 whitespace-pre-wrap">
                      {(
                        complaint as Complaint & {
                          resolutionNotes?: string
                        }
                      ).resolutionNotes}
                    </p>
                  </div>
                )}

                {complaint.afterPhotoUrl && (
                  <div>
                    <p className="text-xs font-semibold text-navy-500 mb-2">
                      Resolution Photo
                    </p>

                    <img
                      src={complaint.afterPhotoUrl}
                      alt="Resolution evidence"
                      className="w-full max-h-80 object-cover rounded-xl"
                    />
                  </div>
                )}
              </div>
            )}

          {/* Community */}
          <div className="bg-white rounded-2xl border border-navy-200/60 p-6 shadow-sm">

            <div className="flex items-center justify-between gap-4 mb-4">

              <div>
                <h2
                  className="text-lg font-bold text-navy-900"
                  style={{
                    fontFamily:
                      "'Outfit', sans-serif",
                  }}
                >
                  Community
                </h2>

                <p className="text-xs text-navy-500 mt-1">
                  Support this issue if you think it
                  needs attention.
                </p>
              </div>

              <div className="text-sm font-semibold text-navy-700">
                {complaint.upvoteCount ??
                  0}{" "}
                upvotes
              </div>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              <button
                onClick={() =>
                  setShowUpvoteModal(true)
                }
                disabled={upvoting}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                  upvoted
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-navy-200 text-navy-600 hover:border-brand-300 hover:bg-navy-50"
                } disabled:opacity-60`}
              >
                <ArrowUpIcon className="w-4 h-4" />

                {upvoted
                  ? "Upvoted"
                  : "Upvote"}

                {" · "}

                {complaint.upvoteCount ??
                  0}
              </button>

            </div>

          </div>

        </div>

        {/* SIDEBAR */}
        <div className="space-y-5">

          {/* Complaint information */}
          <div className="bg-white rounded-2xl border border-navy-200/60 p-5 shadow-sm">

            <div className="flex items-start gap-2 mb-3 flex-wrap">
              <StatusBadge
                status={complaint.status}
              />
            </div>

            <h1
              className="text-lg font-bold text-navy-900 mb-4 leading-snug"
              style={{
                fontFamily:
                  "'Outfit', sans-serif",
              }}
            >
              {complaint.title}
            </h1>

            <div className="space-y-2.5 text-sm">

              <div className="flex justify-between gap-4">
                <span className="text-navy-500">
                  Complaint ID
                </span>

                <span className="font-semibold text-navy-800">
                  #{complaint.id}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-navy-500">
                  Category
                </span>

                <span className="font-medium text-navy-700 text-right">
                  {formatCategory(
                    complaint.category
                  )}
                </span>
              </div>

              {complaint.createdAt && (
                <div className="flex justify-between gap-4">
                  <span className="text-navy-500">
                    Reported
                  </span>

                  <span className="text-navy-700 text-right">
                    {formatDate(
                      complaint.createdAt
                    )}
                  </span>
                </div>
              )}

              {complaint.department && (
                <div className="flex justify-between gap-4">
                  <span className="text-navy-500">
                    Department
                  </span>

                  <span className="text-navy-700 text-right text-xs">
                    {complaint.department}
                  </span>
                </div>
              )}

              {complaint.deadline && (
                <div className="flex justify-between gap-4">
                  <span className="text-navy-500">
                    Deadline
                  </span>

                  <span className="text-navy-700 text-right">
                    {formatDate(
                      complaint.deadline
                    )}
                  </span>
                </div>
              )}

            </div>

            <div className="mt-4 pt-4 border-t border-navy-100">

              <div className="flex items-start gap-1 text-sm text-navy-500">

                <MapPinIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />

                <span className="text-xs leading-relaxed">
                  {complaint.address ||
                    "Location not provided"}
                </span>

              </div>

            </div>

          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-navy-200/60 p-5 shadow-sm">

            <h2
              className="text-base font-bold text-navy-900 mb-5"
              style={{
                fontFamily:
                  "'Outfit', sans-serif",
              }}
            >
              Resolution Timeline
            </h2>

            <Timeline
              complaint={complaint}
            />

          </div>

        </div>

      </div>
    </div>
  )
}