import { useEffect, useState } from 'react'
import type { Complaint, Page } from '../../types'
import api from '../../api/axios'
import ComplaintCard from '../../components/ComplaintCard'
import { PlusIcon } from '../../components/Icons'

interface MyComplaintsPageProps {
  navigate: (
    page: Page,
    params?: { complaintId?: string }
  ) => void
}

export default function MyComplaintsPage({
  navigate,
}: MyComplaintsPageProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get<Complaint[]>(
          '/api/complaints/my'
        )

        setComplaints(response.data)
      } catch (err) {
        console.error(
          'Failed to load my complaints:',
          err
        )

        setError(
          'Unable to load your complaints. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMyComplaints()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-7">

        <div>
          <h1
            className="text-2xl font-bold text-navy-900"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            My Complaints
          </h1>

          <p className="text-sm text-navy-500 mt-1">
            Track the civic issues you have reported.
          </p>
        </div>

        <button
          onClick={() =>
            navigate('citizen-report')
          }
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          Report an Issue
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-navy-200/60 p-12 text-center">
          <div className="w-9 h-9 border-4 border-navy-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-navy-500">
            Loading your complaints...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        complaints.length === 0 && (
          <div className="bg-white rounded-2xl border border-navy-200/60 p-12 text-center">

            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
              <PlusIcon className="w-7 h-7 text-brand-600" />
            </div>

            <h2 className="text-lg font-bold text-navy-900">
              No complaints yet
            </h2>

            <p className="text-sm text-navy-500 mt-2 mb-6">
              You haven't reported any civic issues yet.
            </p>

            <button
              onClick={() =>
                navigate('citizen-report')
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Report Your First Issue
            </button>

          </div>
        )}

      {/* Complaints */}
      {!loading &&
        !error &&
        complaints.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-navy-500">
                <span className="font-semibold text-navy-700">
                  {complaints.length}
                </span>{' '}
                complaint
                {complaints.length !== 1
                  ? 's'
                  : ''}
              </p>
            </div>

            <div className="space-y-4">
              {complaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  navigate={navigate}
                  variant="list"
                />
              ))}
            </div>
          </>
        )}

    </div>
  )
}