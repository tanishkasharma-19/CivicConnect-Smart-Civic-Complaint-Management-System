import { useEffect, useState } from 'react'
import type { Complaint, Page } from '../../types'
import api from '../../api/axios'
import {
  ExclamationIcon,
  MapPinIcon,
} from '../../components/Icons'

interface AdminEscalationsProps {
  navigate: (
    page: Page,
    params?: { complaintId?: string }
  ) => void
}

interface Officer {
  id: number
  name: string
  email: string
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

export default function AdminEscalations({
  navigate,
}: AdminEscalationsProps) {
  const [complaints, setComplaints] =
    useState<Complaint[]>([])

  const [officers, setOfficers] =
    useState<Officer[]>([])

  const [selected, setSelected] =
    useState<Complaint | null>(null)

  const [officerId, setOfficerId] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        complaintResponse,
        officerResponse,
      ] = await Promise.all([
        api.get<Complaint[]>(
          '/api/complaints/status/ESCALATED'
        ),

        api.get<Officer[]>(
          '/api/users/officers'
        ),
      ])

      setComplaints(
        complaintResponse.data
      )

      setOfficers(
        officerResponse.data
      )
    } catch (err) {
      console.error(err)

      setError(
        'Unable to load escalated complaints.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const reassign = async () => {
    if (
      !selected ||
      !officerId
    ) {
      return
    }

    try {
      setSaving(true)
      setError('')

      await api.put(
        `/api/admin/complaints/${selected.id}/assign`,
        {
          officerId:
            Number(officerId),
        }
      )

      setSelected(null)
      setOfficerId('')

      await loadData()
    } catch (err) {
      console.error(err)

      setError(
        'Unable to reassign complaint.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Reassign modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto">

            <div className="p-4 sm:p-5 border-b border-navy-100 flex items-center justify-between gap-3">

              <div>
                <h2 className="text-lg font-bold text-navy-900">
                  Reassign Complaint
                </h2>

                <p className="text-xs text-navy-500 mt-1">
                  #{selected.id} ·{' '}
                  {selected.title}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelected(null)
                  setOfficerId('')
                }}
                className="text-lg text-navy-500"
              >
                ×
              </button>

            </div>

            <div className="p-4 sm:p-5">

              <label className="block text-sm font-medium text-navy-700 mb-2">
                Select Officer
              </label>

              <select
                value={officerId}
                onChange={(e) =>
                  setOfficerId(
                    e.target.value
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm bg-white"
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
                        key={officer.id}
                        value={officer.id}
                      >
                        {officer.name}
                      </option>
                    )
                  )}
              </select>

              <button
                onClick={reassign}
                disabled={
                  saving ||
                  !officerId
                }
                className="w-full mt-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-xl text-sm font-semibold"
              >
                {saving
                  ? 'Reassigning...'
                  : 'Reassign Complaint'}
              </button>

            </div>

          </div>
        </div>
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
          Escalations
        </h1>

        <p className="text-sm text-navy-500 mt-0.5">
          Complaints currently marked as escalated.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Escalation summary */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">

        <ExclamationIcon className="w-5 h-5 text-red-600 flex-shrink-0" />

        <div>

          <p className="text-sm font-semibold text-red-700">
            {complaints.length}{' '}
            escalated complaint
            {complaints.length !== 1
              ? 's'
              : ''}
          </p>

          <p className="text-xs text-red-600 mt-1">
            Review these complaints and reassign them when necessary.
          </p>

        </div>

      </div>

      {/* Data */}
      {loading ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-sm text-navy-500">
          Loading escalations...
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">

          <p className="text-sm text-navy-400">
            No escalated complaints.
          </p>

        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm overflow-x-auto">

          <table className="w-full min-w-[680px] text-sm">

            <thead>
              <tr className="bg-red-50/50 border-b border-red-100">

                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Complaint
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

                <th className="px-4 py-3" />

              </tr>
            </thead>

            <tbody className="divide-y divide-navy-50">

              {complaints.map(
                (complaint) => (
                  <tr
                    key={complaint.id}
                    className="hover:bg-red-50/30"
                  >

                    <td className="px-5 py-4">

                      <p className="font-semibold text-navy-900">
                        {complaint.title}
                      </p>

                      <p className="text-xs text-navy-400 mt-1 flex gap-1">
                        <MapPinIcon className="w-3 h-3" />

                        {complaint.address ||
                          'Location not provided'}
                      </p>

                    </td>

                    <td className="px-4 py-4 text-xs text-navy-500">
                      {complaint.department ||
                        '—'}
                    </td>

                    <td className="px-4 py-4">

                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {formatStatus(
                          complaint.status
                        )}
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
                        Reassign
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
  )
}