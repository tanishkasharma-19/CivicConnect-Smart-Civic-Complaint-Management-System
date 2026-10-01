import { useEffect, useMemo, useState } from 'react'
import type { Complaint, Page } from '../../types'
import api from '../../api/axios'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
} from '../../components/Icons'

interface AdminComplaintsProps {
  navigate: (
    page: Page,
    params?: { complaintId?: string }
  ) => void
}

interface Officer {
  id: number
  name: string
  email: string
  role: string
  isActive?: boolean
}

function formatStatus(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}

function statusClass(status: string) {
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

    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function priorityLevel(score: number) {
  if (score >= 10) {
    return { label: 'High', className: 'bg-red-100 text-red-700' }
  }

  if (score >= 5) {
    return { label: 'Medium', className: 'bg-orange-100 text-orange-700' }
  }

  return { label: 'Low', className: 'bg-gray-100 text-gray-600' }
}

export default function AdminComplaints({
  navigate,
}: AdminComplaintsProps) {
  const [complaints, setComplaints] =
    useState<Complaint[]>([])

  const [officers, setOfficers] =
    useState<Officer[]>([])

  const [search, setSearch] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState('All')

  const [categoryFilter, setCategoryFilter] =
    useState('All')

  const [selected, setSelected] =
    useState<Complaint | null>(null)

  const [selectedOfficer, setSelectedOfficer] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [actionLoading, setActionLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  /*
   * Load complaints only.
   *
   * IMPORTANT:
   * This is intentionally separate from loading officers.
   * A failed officer refresh must NEVER make a successful
   * verify/assign operation appear to have failed.
   */
  const loadComplaints = async (
    showError = true
  ) => {
    try {
      const response =
        await api.get<Complaint[]>(
          '/api/complaints'
        )

      setComplaints(response.data)

      if (showError) {
        setError('')
      }

      return response.data
    } catch (err) {
      console.error(
        'Failed to load complaints:',
        err
      )

      if (showError) {
        setError(
          'Unable to load complaints.'
        )
      }

      return []
    }
  }

  /*
   * Load active officers separately.
   */
  const loadOfficers = async () => {
    try {
      const response =
        await api.get<Officer[]>(
          '/api/users/officers'
        )

      setOfficers(response.data)
    } catch (err) {
      console.error(
        'Failed to load officers:',
        err
      )

      /*
       * We do NOT show this as an action error.
       * The complaint actions themselves are independent.
       */
    }
  }

  /*
   * Initial page load.
   */
  const loadInitialData = async () => {
    setLoading(true)
    setError('')

    const [loadedComplaints] =
      await Promise.all([
        loadComplaints(true),
        loadOfficers(),
      ])

    const pendingComplaintId =
      sessionStorage.getItem(
        'civicconnect.admin.notificationComplaintId'
      )

    if (pendingComplaintId) {
      sessionStorage.removeItem(
        'civicconnect.admin.notificationComplaintId'
      )

      const complaintId = Number(
        pendingComplaintId
      )

      if (Number.isFinite(complaintId)) {
        const complaint =
          loadedComplaints.find(
            (item) => item.id === complaintId
          )

        if (complaint) {
          setSelected(complaint)
        }
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  /*
   * Clear success message automatically.
   */
  useEffect(() => {
    if (!success) {
      return
    }

    const timer = window.setTimeout(() => {
      setSuccess('')
    }, 4000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [success])

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          complaints.map(
            (complaint) =>
              complaint.category
          )
        )
      ),
    [complaints]
  )

  const filtered = useMemo(() => {
    const text =
      search.toLowerCase()

    const result = complaints.filter(
      (complaint) => {
        const matchesSearch =
          !text ||
          complaint.title
            .toLowerCase()
            .includes(text) ||
          complaint.description
            .toLowerCase()
            .includes(text) ||
          complaint.address
            ?.toLowerCase()
            .includes(text)

        const matchesStatus =
          statusFilter === 'All' ||
          complaint.status ===
            statusFilter

        const matchesCategory =
          categoryFilter === 'All' ||
          complaint.category ===
            categoryFilter

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCategory
        )
      }
    )

    // Active complaints first, highest priority on top.
    // Resolved / Closed complaints go to the bottom.
    const isDone = (status: string) =>
      status === 'RESOLVED' || status === 'CLOSED'

    return result.sort((a, b) => {
      const aDone = isDone(a.status)
      const bDone = isDone(b.status)

      if (aDone !== bDone) {
        return aDone ? 1 : -1
      }

      return (
        (b.priorityScore ?? 0) - (a.priorityScore ?? 0) ||
        b.id - a.id
      )
    })
  }, [
    complaints,
    search,
    statusFilter,
    categoryFilter,
  ])

  /*
   * VERIFY COMPLAINT
   *
   * The PUT request determines success.
   * We do NOT put the reload request in the
   * same try/catch as the mutation.
   */
  const verifyComplaint = async () => {
    if (!selected) {
      return
    }

    const complaintId = selected.id

    try {
      setActionLoading(true)
      setError('')
      setSuccess('')

      /*
       * Actual backend mutation.
       */
      await api.put(
        `/api/admin/complaints/${complaintId}/verify`
      )

      /*
       * Immediately update UI.
       */
      setComplaints((current) =>
        current.map((complaint) =>
          complaint.id === complaintId
            ? {
                ...complaint,
                status: 'VERIFIED',
              }
            : complaint
        )
      )

      /*
       * Close modal.
       */
      setSelected(null)
      setSelectedOfficer('')

      /*
       * SUCCESS belongs to the mutation.
       */
      setSuccess(
        `Complaint #${complaintId} successfully verified.`
      )

      /*
       * Optional background refresh.
       *
       * IMPORTANT:
       * This is outside the mutation try/catch,
       * and errors are silent.
       */
      void loadComplaints(false)
    } catch (err) {
      console.error(
        'Verify complaint failed:',
        err
      )

      setError(
        'Unable to verify complaint.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  /*
   * ASSIGN OFFICER
   */
  const assignOfficer = async () => {
    if (
      !selected ||
      !selectedOfficer
    ) {
      return
    }

    const complaintId = selected.id
    const officerId =
      Number(selectedOfficer)

    const assignedOfficer =
      officers.find(
        (officer) =>
          officer.id === officerId
      )

    try {
      setActionLoading(true)
      setError('')
      setSuccess('')

      /*
       * Actual backend mutation.
       */
      await api.put(
        `/api/admin/complaints/${complaintId}/assign`,
        {
          officerId,
        }
      )

      /*
       * Immediately update UI.
       */
      setComplaints((current) =>
        current.map((complaint) =>
          complaint.id === complaintId
            ? {
                ...complaint,
                status: 'ASSIGNED',
              }
            : complaint
        )
      )

      /*
       * Close modal and clear selection.
       */
      setSelected(null)
      setSelectedOfficer('')

      /*
       * SUCCESS belongs to the mutation.
       */
      setSuccess(
        assignedOfficer
          ? `Complaint #${complaintId} successfully assigned to ${assignedOfficer.name}.`
          : `Complaint #${complaintId} successfully assigned.`
      )

      /*
       * Silent background refresh.
       */
      void loadComplaints(false)
    } catch (err) {
      console.error(
        'Assign officer failed:',
        err
      )

      setError(
        'Unable to assign officer.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  /*
   * CLOSE RESOLVED COMPLAINT
   */
  const closeComplaint = async () => {
    if (!selected || selected.status !== 'RESOLVED') {
      return
    }

    try {
      setActionLoading(true)
      setError('')

      await api.put(
        `/api/admin/complaints/${selected.id}/close`
      )

      setSelected(null)
      setSelectedOfficer('')

      await loadComplaints(false)
    } catch (err) {
      console.error(
        'Unable to close complaint:',
        err
      )

      setError(
        'Unable to close complaint.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm font-medium flex items-center justify-between gap-4">
          <span>{success}</span>

          <button
            onClick={() =>
              setSuccess('')
            }
            className="text-green-600 hover:text-green-800 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm flex items-center justify-between gap-4">
          <span>{error}</span>

          <button
            onClick={() =>
              setError('')
            }
            className="text-red-600 hover:text-red-800 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* COMPLAINT MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto">

            <div className="p-4 sm:p-5 border-b border-navy-100 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-navy-400">
                  Complaint #{selected.id}
                </p>

                <h2 className="text-lg font-bold text-navy-900 mt-1">
                  {selected.title}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelected(null)
                  setSelectedOfficer('')
                }}
                className="w-8 h-8 rounded-lg hover:bg-navy-50 text-navy-500 text-lg"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-5">

              {selected.beforePhotoUrl && (
                <img
                  src={
                    selected.beforePhotoUrl
                  }
                  alt={selected.title}
                  className="w-full h-52 object-cover rounded-xl"
                />
              )}

              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass(
                    selected.status
                  )}`}
                >
                  {formatStatus(
                    selected.status
                  )}
                </span>
              </div>

              <div>
                <p className="text-xs text-navy-400">
                  Category
                </p>

                <p className="text-sm font-semibold text-navy-800 mt-1">
                  {formatStatus(
                    selected.category
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-navy-400">
                  Description
                </p>

                <p className="text-sm text-navy-700 mt-1 leading-relaxed">
                  {selected.description}
                </p>
              </div>

              <div>
                <p className="text-xs text-navy-400">
                  Location
                </p>

                <p className="text-sm text-navy-700 mt-1 flex gap-1">
                  <MapPinIcon className="w-4 h-4" />

                  {selected.address ||
                    'Location not provided'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div className="bg-navy-50 p-3 rounded-xl">
                  <p className="text-xs text-navy-400">
                    Upvotes
                  </p>

                  <p className="font-bold text-navy-900 mt-1">
                    {selected.upvoteCount ??
                      0}
                  </p>
                </div>

                <div className="bg-navy-50 p-3 rounded-xl">
                  <p className="text-xs text-navy-400">
                    Priority Score
                  </p>

                  <p className="font-bold text-navy-900 mt-1 flex items-center gap-2">
                    {selected.priorityScore ??
                      0}

                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        priorityLevel(
                          selected.priorityScore ?? 0
                        ).className
                      }`}
                    >
                      {
                        priorityLevel(
                          selected.priorityScore ?? 0
                        ).label
                      }
                    </span>
                  </p>
                </div>

                <div className="bg-navy-50 p-3 rounded-xl">
                  <p className="text-xs text-navy-400">
                    Department
                  </p>

                  <p className="font-semibold text-navy-900 mt-1 text-xs">
                    {selected.department ||
                      '—'}
                  </p>
                </div>

              </div>

              {/* RESOLUTION DETAILS */}
              {(((selected as Complaint & {
                resolutionNotes?: string
              }).resolutionNotes?.trim()) ||
                selected.afterPhotoUrl) && (
                <div className="border-t border-navy-100 pt-5">

                  <h3 className="text-sm font-bold text-navy-800 mb-3">
                    Resolution Details
                  </h3>

                  {(
                    selected as Complaint & {
                      resolutionNotes?: string
                    }
                  ).resolutionNotes?.trim() && (
                    <div className="bg-navy-50 rounded-xl p-4 mb-3">
                      <p className="text-xs font-semibold text-navy-500 mb-2">
                        Resolution Notes
                      </p>

                      <p className="text-sm text-navy-700 leading-6 whitespace-pre-wrap">
                        {(
                          selected as Complaint & {
                            resolutionNotes?: string
                          }
                        ).resolutionNotes}
                      </p>
                    </div>
                  )}

                  {selected.afterPhotoUrl && (
                    <div>
                      <p className="text-xs font-semibold text-navy-500 mb-2">
                        Resolution Photo
                      </p>

                      <img
                        src={selected.afterPhotoUrl}
                        alt="Resolution evidence"
                        className="w-full max-h-72 object-cover rounded-xl border border-navy-200"
                      />
                    </div>
                  )}

                </div>
              )}

              {/* CLOSE BUTTON */}
              {selected.status === 'RESOLVED' && (
                <button
                  onClick={closeComplaint}
                  disabled={actionLoading}
                  className="w-full mb-3 py-2.5 bg-navy-800 hover:bg-navy-900 disabled:bg-navy-400 text-white rounded-xl text-sm font-semibold"
                >
                  {actionLoading
                    ? 'Closing...'
                    : 'Close Complaint'}
                </button>
              )}

              {/* VERIFY BUTTON */}
              {selected.status ===
                'REPORTED' && (
                <button
                  onClick={
                    verifyComplaint
                  }
                  disabled={
                    actionLoading
                  }
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-xl text-sm font-semibold"
                >
                  {actionLoading
                    ? 'Processing...'
                    : 'Verify Complaint'}
                </button>
              )}

              {/* ASSIGN OFFICER */}
              {selected.status === 'VERIFIED' && (
                <div className="border-t border-navy-100 pt-5">

                  <h3 className="text-sm font-bold text-navy-800 mb-3">
                    Assign Officer
                  </h3>

                  <select
                    value={
                      selectedOfficer
                    }
                    onChange={(e) =>
                      setSelectedOfficer(
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-navy-200 text-sm bg-white"
                  >
                    <option value="">
                      Select officer
                    </option>

                    {officers
                      .filter(
                        (officer) =>
                          officer.isActive !==
                          false
                      )
                      .map(
                        (officer) => (
                          <option
                            key={
                              officer.id
                            }
                            value={
                              officer.id
                            }
                          >
                            {officer.name} —{' '}
                            {officer.email}
                          </option>
                        )
                      )}
                  </select>

                  <button
                    onClick={
                      assignOfficer
                    }
                    disabled={
                      actionLoading ||
                      !selectedOfficer
                    }
                    className="w-full mt-3 py-2.5 border border-brand-600 text-brand-600 hover:bg-brand-50 disabled:opacity-50 rounded-xl text-sm font-semibold"
                  >
                    {actionLoading
                      ? 'Processing...'
                      : 'Assign Officer'}
                  </button>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div>
        <h1
          className="text-xl font-bold text-navy-900"
          style={{
            fontFamily:
              "'Outfit', sans-serif",
          }}
        >
          All Complaints
        </h1>

        <p className="text-sm text-navy-500 mt-0.5">
          {filtered.length} of{' '}
          {complaints.length}{' '}
          complaints
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl border border-navy-200/60 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">

        <div className="w-full sm:flex-1 sm:min-w-0 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search complaints..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-navy-200 text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-navy-200 text-sm bg-white"
        >
          <option value="All">
            All Status
          </option>

          <option value="REPORTED">
            Reported
          </option>

          <option value="VERIFIED">
            Verified
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

          <option value="ESCALATED">
            Escalated
          </option>

          <option value="CLOSED">
            Closed
          </option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
              e.target.value
            )
          }
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-navy-200 text-sm bg-white"
        >
          <option value="All">
            All Categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={category}
                value={category}
              >
                {formatStatus(
                  category
                )}
              </option>
            )
          )}
        </select>

      </div>

      {/* TABLE */}
      {loading ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <p className="text-sm text-navy-500">
            Loading complaints...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm overflow-x-auto">

          <table className="w-full min-w-[950px] text-sm">

            <thead>
              <tr className="bg-navy-50 border-b border-navy-100">

                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                  ID
                </th>

                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Complaint
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
                  Priority
                </th>

                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Upvotes
                </th>

                <th className="px-4 py-3" />

              </tr>
            </thead>

            <tbody className="divide-y divide-navy-50">

              {filtered.map(
                (complaint) => (
                  <tr
                    key={
                      complaint.id
                    }
                    className="hover:bg-navy-50/50"
                  >

                    <td className="px-4 py-4 text-xs font-semibold text-navy-400">
                      #{complaint.id}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-navy-900 max-w-xs">
                        {complaint.title}
                      </p>

                      <p className="text-xs text-navy-400 mt-1">
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

                    <td className="px-4 py-4 text-xs text-navy-500">
                      {complaint.department ||
                        '—'}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusClass(
                          complaint.status
                        )}`}
                      >
                        {formatStatus(
                          complaint.status
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          priorityLevel(
                            complaint.priorityScore ?? 0
                          ).className
                        }`}
                      >
                        {
                          priorityLevel(
                            complaint.priorityScore ?? 0
                          ).label
                        }{' '}
                        · {complaint.priorityScore ?? 0}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs text-navy-500">
                      {complaint.upvoteCount ??
                        0}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() =>
                          setSelected(
                            complaint
                          )
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50"
                      >
                        View
                      </button>
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-navy-400 text-sm">
              No complaints match the filters.
            </div>
          )}

        </div>
      )}

    </div>
  )
}