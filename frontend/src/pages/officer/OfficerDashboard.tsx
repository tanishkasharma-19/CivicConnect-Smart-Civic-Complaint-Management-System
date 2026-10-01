import { useEffect, useState } from 'react'
import type { Complaint, Page } from '../../types'
import api from '../../api/axios'
import { validateImageFile } from '../../utils/validation'
import StatCard from '../../components/StatCard'
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationIcon,
  MapPinIcon,
} from '../../components/Icons'

interface OfficerDashboardProps {
  navigate: (
    page: Page,
    params?: { complaintId?: string }
  ) => void
}

/*
 * Officer workflow from the backend:
 *
 * ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED
 *
 * Officers receive already-assigned complaints, so they
 * should not be changing REPORTED -> VERIFIED here.
 */
const NEXT_STATUS: Record<string, string | null> = {
  ASSIGNED: 'IN_PROGRESS',
  IN_PROGRESS: 'RESOLVED',
  RESOLVED: null,
  REPORTED: null,
  VERIFIED: null,
  ESCALATED: null,
  CLOSED: null,
  REJECTED: null,
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getStatusClass(status: string) {
  switch (status) {
    case 'REPORTED':
      return 'bg-gray-100 text-gray-700'

    case 'VERIFIED':
      return 'bg-blue-100 text-blue-700'

    case 'ASSIGNED':
      return 'bg-violet-100 text-violet-700'

    case 'IN_PROGRESS':
      return 'bg-orange-100 text-orange-700'

    case 'RESOLVED':
      return 'bg-green-100 text-green-700'

    case 'ESCALATED':
      return 'bg-red-100 text-red-700'

    case 'CLOSED':
      return 'bg-gray-100 text-gray-600'

    case 'REJECTED':
      return 'bg-red-100 text-red-700'

    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function ComplaintModal({
  complaint,
  onClose,
  onUpdated,
}: {
  complaint: Complaint
  onClose: () => void
  onUpdated: () => void
}) {
  const nextStatus =
    NEXT_STATUS[complaint.status] ?? null

  const [selectedStatus, setSelectedStatus] =
    useState(nextStatus ?? complaint.status)

  const [resolutionNotes, setResolutionNotes] =
    useState('')

  const [afterPhoto, setAfterPhoto] =
    useState<File | null>(null)

  const [afterPhotoPreview, setAfterPhotoPreview] =
    useState<string | null>(null)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  /*
   * Create a temporary browser preview whenever
   * the officer selects a resolution photo.
   */
  useEffect(() => {
    if (!afterPhoto) {
      setAfterPhotoPreview(null)
      return
    }

    const previewUrl =
      URL.createObjectURL(afterPhoto)

    setAfterPhotoPreview(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [afterPhoto])

  const updateStatus = async () => {
    if (
      !nextStatus ||
      selectedStatus === complaint.status
    ) {
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      await api.put(
        `/api/complaints/${complaint.id}/status`,
        {
          status: selectedStatus,
        }
      )

      setSuccess(
        'Complaint status updated successfully.'
      )

      setTimeout(() => {
        onUpdated()
      }, 500)
    } catch (err) {
      console.error(
        'Failed to update status:',
        err
      )

      setError(
        'Unable to update the complaint status.'
      )
    } finally {
      setSaving(false)
    }
  }

  const saveResolution = async () => {
    if (!resolutionNotes.trim()) {
      setError(
        'Please enter resolution notes before resolving the complaint.'
      )
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const formData = new FormData()

      formData.append(
        'status',
        'RESOLVED'
      )

      formData.append(
        'resolutionNotes',
        resolutionNotes.trim()
      )

      if (afterPhoto) {
        formData.append(
          'afterPhoto',
          afterPhoto
        )
      }

      await api.put(
        `/api/complaints/${complaint.id}`,
        formData
      )

      setSuccess(
        'Complaint resolved and resolution details saved successfully.'
      )

      setTimeout(() => {
        onUpdated()
      }, 500)
    } catch (err) {
      console.error(
        'Failed to resolve complaint:',
        err
      )

      setError(
        'Unable to resolve the complaint and save resolution details.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-navy-100 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-navy-400 mb-1">
              Complaint #{complaint.id}
            </p>

            <h2
              className="text-lg font-bold text-navy-900"
              style={{
                fontFamily:
                  "'Outfit', sans-serif",
              }}
            >
              {complaint.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-navy-50 text-navy-500 text-lg"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-5">

          {/* Before image */}
          {complaint.beforePhotoUrl && (
            <div>
              <p className="text-xs font-semibold text-navy-500 mb-2">
                Reported Photo
              </p>

              <img
                src={complaint.beforePhotoUrl}
                alt={complaint.title}
                className="w-full h-52 object-cover rounded-xl"
              />
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                complaint.status
              )}`}
            >
              {formatStatus(
                complaint.status
              )}
            </span>

            <span className="text-xs text-navy-400">
              #{complaint.id}
            </span>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs text-navy-400 mb-1">
              Category
            </p>

            <p className="text-sm font-semibold text-navy-800">
              {formatStatus(
                complaint.category
              )}
            </p>
          </div>

          {/* Department */}
          <div>
            <p className="text-xs text-navy-400 mb-1">
              Department
            </p>

            <p className="text-sm text-navy-700">
              {complaint.department ||
                'Not assigned'}
            </p>
          </div>

          {/* Location */}
          <div>
            <p className="text-xs text-navy-400 mb-1">
              Location
            </p>

            <p className="text-sm text-navy-700 flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />

              {complaint.address ||
                'Location not provided'}
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-navy-400 mb-1">
              Description
            </p>

            <p className="text-sm text-navy-700 leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {/* Backend-supported values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-navy-50 rounded-xl p-3">
              <p className="text-xs text-navy-400">
                Upvotes
              </p>

              <p className="text-lg font-bold text-navy-900 mt-1">
                {complaint.upvoteCount ?? 0}
              </p>
            </div>

            <div className="bg-navy-50 rounded-xl p-3">
              <p className="text-xs text-navy-400">
                Status
              </p>

              <p className="text-sm font-bold text-navy-900 mt-1">
                {formatStatus(
                  complaint.status
                )}
              </p>
            </div>
          </div>

          {/* Status update */}
          {complaint.status === 'ASSIGNED' && (
            <div className="border-t border-navy-100 pt-5">

              <div className="flex items-center justify-between gap-3 w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold whitespace-nowrap">
                  IN PROGRESS
                </span>

                <button
                  type="button"
                  onClick={updateStatus}
                  disabled={saving}
                  className="flex-shrink-0 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-lg text-xs font-semibold transition whitespace-nowrap"
                >
                  {saving
                    ? 'Updating...'
                    : 'Start Work'}
                </button>
              </div>

            </div>
          )}

          {/* Resolution details */}
          {complaint.status ===
            'IN_PROGRESS' && (
            <div className="border-t border-navy-100 pt-5">

              <h3 className="text-sm font-bold text-navy-800 mb-3">
                Resolution Details
              </h3>

              {/* Resolution notes */}
              <textarea
                value={resolutionNotes}
                onChange={(e) =>
                  setResolutionNotes(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Add resolution notes..."
                className="w-full px-3 py-2.5 rounded-xl border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />

              {/* Custom file upload */}
              <div className="mt-3">
                <input
                  id="after-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0] ??
                      null

                    if (file) {
                      const imageError =
                        validateImageFile(file)

                      if (imageError) {
                        setError(imageError)
                        setSuccess('')
                        e.target.value = ''
                        return
                      }
                    }

                    setAfterPhoto(file)

                    setError('')
                    setSuccess('')
                  }}
                />

                <label
                  htmlFor="after-photo"
                  className="block cursor-pointer rounded-xl border border-dashed border-navy-300 bg-navy-50/40 p-4 hover:border-brand-500 hover:bg-brand-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold">
                      IMG
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-navy-800">
                        Upload resolution photo
                      </p>

                      <p className="text-xs text-navy-400 mt-0.5">
                        Click here to choose an image
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Selected image preview */}
              {afterPhoto && (
                <div className="mt-3 border border-navy-200 rounded-xl p-3 bg-white">

                  {afterPhotoPreview && (
                    <img
                      src={afterPhotoPreview}
                      alt="Selected resolution"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}

                  <div className="flex items-center justify-between gap-3 mt-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-800 truncate">
                        {afterPhoto.name}
                      </p>

                      <p className="text-xs text-navy-400 mt-0.5">
                        Photo selected successfully
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAfterPhoto(null)
                        setError('')

                        const input =
                          document.getElementById(
                            'after-photo'
                          ) as HTMLInputElement | null

                        if (input) {
                          input.value = ''
                        }
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={saveResolution}
                disabled={saving}
                className="w-full mt-3 py-2.5 border border-brand-600 text-brand-600 hover:bg-brand-50 disabled:opacity-50 rounded-xl text-sm font-semibold transition"
              >
                {saving
                  ? 'Saving...'
                  : 'Resolve Complaint & Save Details'}
              </button>
            </div>
          )}

          {/* Errors */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">
              {success}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function OfficerDashboard({
  navigate,
}: OfficerDashboardProps) {
  const [complaints, setComplaints] =
    useState<Complaint[]>([])

  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null)

  const [statusFilter, setStatusFilter] =
    useState('All')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      setError('')

      const response =
        await api.get<Complaint[]>(
          '/api/complaints/assigned'
        )

      setComplaints(response.data)
      return response.data
    } catch (err) {
      console.error(
        'Failed to load assigned complaints:',
        err
      )

      setError(
        'Unable to load assigned complaints.'
      )

      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadOfficerNotification = async () => {
      const loadedComplaints =
        await fetchComplaints()

      const pendingComplaintId =
        sessionStorage.getItem(
          'civicconnect.officer.notificationComplaintId'
        )

      if (!pendingComplaintId) {
        return
      }

      sessionStorage.removeItem(
        'civicconnect.officer.notificationComplaintId'
      )

      const complaintId = Number(
        pendingComplaintId
      )

      if (!Number.isFinite(complaintId)) {
        return
      }

      const complaint =
        loadedComplaints.find(
          (item) => item.id === complaintId
        )

      if (complaint) {
        setSelectedComplaint(complaint)
      }
    }

    loadOfficerNotification()
  }, [])

  const filteredComplaints =
    complaints.filter((complaint) =>
      statusFilter === 'All'
        ? true
        : complaint.status ===
          statusFilter
    )

  const assignedCount =
    complaints.length

  const inProgressCount =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        'IN_PROGRESS'
    ).length

  const resolvedCount =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        'RESOLVED'
    ).length

  const overdueCount =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        'ESCALATED'
    ).length

  const stats = [
    {
      label: 'Assigned',
      value: assignedCount,
      icon: (
        <DocumentTextIcon className="w-5 h-5" />
      ),
      color: 'blue' as const,
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      icon: (
        <ClockIcon className="w-5 h-5" />
      ),
      color: 'orange' as const,
    },
    {
      label: 'Resolved',
      value: resolvedCount,
      icon: (
        <CheckCircleIcon className="w-5 h-5" />
      ),
      color: 'green' as const,
    },
    {
      label: 'Overdue / Escalated',
      value: overdueCount,
      icon: (
        <ExclamationIcon className="w-5 h-5" />
      ),
      color: 'red' as const,
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Complaint modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() =>
            setSelectedComplaint(null)
          }
          onUpdated={() => {
            setSelectedComplaint(null)
            fetchComplaints()
          }}
        />
      )}

      {/* Header */}
      <div>
        <h1
          className="text-xl font-bold text-navy-900"
          style={{
            fontFamily:
              "'Outfit', sans-serif",
          }}
        >
          Officer Dashboard
        </h1>

        <p className="text-sm text-navy-500 mt-0.5">
          Manage complaints assigned to you.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            {...stat}
          />
        ))}
      </div>

      {/* Assigned complaints */}
      <div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

          <h2
            className="text-lg font-bold text-navy-900"
            style={{
              fontFamily:
                "'Outfit', sans-serif",
            }}
          >
            Assigned Complaints
          </h2>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs text-navy-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">
              All Status
            </option>

            <option value="ASSIGNED">
              Assigned
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

            <option value="CLOSED">
              Closed
            </option>

            <option value="ESCALATED">
              Escalated
            </option>
          </select>

        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-navy-200/60 p-12 text-center">

            <div className="w-8 h-8 border-4 border-navy-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />

            <p className="text-sm text-navy-500">
              Loading assigned complaints...
            </p>

          </div>
        ) : filteredComplaints.length ===
          0 ? (
          <div className="bg-white rounded-2xl border border-navy-200/60 p-12 text-center">

            <p className="text-sm text-navy-400">
              No complaints match this filter.
            </p>

          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm overflow-x-auto">

            <table className="w-full text-sm min-w-[760px]">

              <thead>
                <tr className="bg-navy-50 border-b border-navy-100">

                  <th className="text-left px-5 py-3 text-xs font-semibold text-navy-500 uppercase">
                    Complaint
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                    Category
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                    Upvotes
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                    Status
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                    Department
                  </th>

                  <th className="px-4 py-3" />

                </tr>
              </thead>

              <tbody className="divide-y divide-navy-50">

                {filteredComplaints.map(
                  (complaint) => (
                    <tr
                      key={complaint.id}
                      className="hover:bg-navy-50/50"
                    >

                      <td className="px-5 py-4">

                        <p className="font-semibold text-navy-900">
                          {complaint.title}
                        </p>

                        <p className="text-xs text-navy-400 mt-1 flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />

                          {complaint.address ||
                            'Location not provided'}
                        </p>

                      </td>

                      <td className="px-4 py-4">

                        <span className="text-xs bg-navy-100 text-navy-600 px-2 py-1 rounded-full">
                          {formatStatus(
                            complaint.category
                          )}
                        </span>

                      </td>

                      <td className="px-4 py-4 font-semibold text-navy-700">
                        {complaint.upvoteCount ??
                          0}
                      </td>

                      <td className="px-4 py-4">

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusClass(
                            complaint.status
                          )}`}
                        >
                          {formatStatus(
                            complaint.status
                          )}
                        </span>

                      </td>

                      <td className="px-4 py-4 text-xs text-navy-500">
                        {complaint.department ||
                          '—'}
                      </td>

                      <td className="px-4 py-4">

                        <button
                          onClick={() =>
                            setSelectedComplaint(
                              complaint
                            )
                          }
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition"
                        >
                          View / Update
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>

          </div>
        )}

      </div>
    </div>
  )
}