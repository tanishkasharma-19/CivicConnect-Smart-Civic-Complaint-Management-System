import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  Page,
  Complaint,
} from '../../types'

import api from '../../api/axios'
import ComplaintCard from '../../components/ComplaintCard'

import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
} from '../../components/Icons'

interface ExplorePageProps {
  navigate: (
    page: Page,
    params?: {
      complaintId?: string
    }
  ) => void
}

const CATEGORIES = [
  { value: 'All', label: 'All' },
  { value: 'ROADS', label: 'Roads' },
  { value: 'WATER', label: 'Water' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'GARBAGE', label: 'Garbage' },
  { value: 'DRAINAGE', label: 'Drainage' },
  { value: 'STREET_LIGHT', label: 'Street Lights' },
  { value: 'PUBLIC_SAFETY', label: 'Public Safety' },
  { value: 'OTHER', label: 'Other' },
]

const STATUSES = [
  { value: 'All', label: 'All Status' },
  { value: 'REPORTED', label: 'Reported' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ESCALATED', label: 'Escalated' },
  { value: 'CLOSED', label: 'Closed' },
]

const NEARBY_RADIUS_METERS = 5000

function categoryMatches(
  complaintCategory: string,
  selectedCategory: string
) {
  if (selectedCategory === 'All') {
    return true
  }

  if (
    selectedCategory === 'ROADS' &&
    complaintCategory === 'ROAD'
  ) {
    return true
  }

  if (
    selectedCategory === 'STREET_LIGHT' &&
    complaintCategory === 'STREET_LIGHTS'
  ) {
    return true
  }

  return complaintCategory === selectedCategory
}

function getDistanceMeters(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadius = 6371000

  const toRadians = (value: number) =>
    (value * Math.PI) / 180

  const deltaLatitude = toRadians(
    latitude2 - latitude1
  )

  const deltaLongitude = toRadians(
    longitude2 - longitude1
  )

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(deltaLongitude / 2) ** 2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return earthRadius * c
}

function formatDistance(
  distanceMeters: number
) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`
  }

  return `${(
    distanceMeters / 1000
  ).toFixed(1)} km`
}

export default function ExplorePage({
  navigate,
}: ExplorePageProps) {
  const [complaints, setComplaints] =
    useState<Complaint[]>([])

  const [search, setSearch] =
    useState('')

  const [category, setCategory] =
    useState('All')

  const [status, setStatus] =
    useState('All')

  const [sort, setSort] =
    useState<
      'latest' | 'upvotes' | 'oldest'
    >('latest')

  const [viewMode, setViewMode] =
    useState<'grid' | 'list'>('grid')

  const [locationMode, setLocationMode] =
    useState<'all' | 'nearby'>('all')

  const [userLocation, setUserLocation] =
    useState<{
      latitude: number
      longitude: number
    } | null>(null)

  const [locationLoading, setLocationLoading] =
    useState(false)

  const [locationError, setLocationError] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const fetchComplaints =
      async () => {
        try {
          setLoading(true)
          setError('')

          const response =
            await api.get<Complaint[]>(
              '/api/complaints'
            )

          setComplaints(
            response.data ?? []
          )
        } catch (err) {
          console.error(
            'Failed to load complaints:',
            err
          )

          setError(
            'Unable to load complaints. Please try again.'
          )
        } finally {
          setLoading(false)
        }
      }

    fetchComplaints()
  }, [])

  const requestLocation = () => {
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError(
        'Location services are not supported by your browser.'
      )
      return
    }

    setLocationLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude:
            position.coords.latitude,
          longitude:
            position.coords.longitude,
        })

        setLocationLoading(false)
        setLocationError('')
      },
      (geoError) => {
        console.error(
          'Failed to detect location:',
          geoError
        )

        setLocationLoading(false)

        if (
          geoError.code ===
          geoError.PERMISSION_DENIED
        ) {
          setLocationError(
            'Location permission was denied. Please allow location access and try again.'
          )
        } else if (
          geoError.code ===
          geoError.POSITION_UNAVAILABLE
        ) {
          setLocationError(
            'Your current location could not be determined.'
          )
        } else if (
          geoError.code ===
          geoError.TIMEOUT
        ) {
          setLocationError(
            'Location detection timed out. Please try again.'
          )
        } else {
          setLocationError(
            'Unable to detect your location.'
          )
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleLocationModeChange = (
    mode: 'all' | 'nearby'
  ) => {
    setLocationError('')
    setLocationMode(mode)

    if (
      mode === 'nearby' &&
      !userLocation
    ) {
      requestLocation()
    }
  }

  const filtered = useMemo(() => {
    const result = complaints.filter(
      (complaint) => {
        const searchText =
          search
            .trim()
            .toLowerCase()

        const matchesSearch =
          !searchText ||
          complaint.title
            ?.toLowerCase()
            .includes(searchText) ||
          complaint.description
            ?.toLowerCase()
            .includes(searchText) ||
          complaint.address
            ?.toLowerCase()
            .includes(searchText) ||
          complaint.category
            ?.toLowerCase()
            .replace(/_/g, ' ')
            .includes(searchText)

        const matchesCategory =
          categoryMatches(
            complaint.category,
            category
          )

        const matchesStatus =
          status === 'All' ||
          complaint.status === status

        let matchesLocation = true

        if (
          locationMode === 'nearby'
        ) {
          if (!userLocation) {
            matchesLocation = false
          } else if (
            complaint.latitude ===
              undefined ||
            complaint.longitude ===
              undefined
          ) {
            matchesLocation = false
          } else {
            const distance =
              getDistanceMeters(
                userLocation.latitude,
                userLocation.longitude,
                complaint.latitude,
                complaint.longitude
              )

            matchesLocation =
              distance <=
              NEARBY_RADIUS_METERS
          }
        }

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus &&
          matchesLocation
        )
      }
    )

    result.sort((a, b) => {
      if (sort === 'upvotes') {
        return (
          (b.upvoteCount ?? 0) -
          (a.upvoteCount ?? 0)
        )
      }

      if (sort === 'latest') {
        if (
          !a.createdAt ||
          !b.createdAt
        ) {
          return 0
        }

        return (
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
        )
      }

      if (sort === 'oldest') {
        if (
          !a.createdAt ||
          !b.createdAt
        ) {
          return 0
        }

        return (
          new Date(
            a.createdAt
          ).getTime() -
          new Date(
            b.createdAt
          ).getTime()
        )
      }

      return 0
    })

    return result
  }, [
    complaints,
    search,
    category,
    status,
    sort,
    locationMode,
    userLocation,
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">

      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-navy-900 mb-1"
          style={{
            fontFamily:
              "'Outfit', sans-serif",
          }}
        >
          Explore Complaints
        </h1>

        <p className="text-navy-500 text-sm">
          Browse civic complaints reported across your city or near your current location.
        </p>
      </div>

      {/* All / Near You */}
      <div className="bg-white rounded-2xl border border-navy-200/60 p-2.5 sm:p-3 mb-5 sm:mb-6 shadow-sm">

        <div className="grid grid-cols-2 gap-2">

          <button
            type="button"
            onClick={() =>
              handleLocationModeChange(
                'all'
              )
            }
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              locationMode === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-navy-600 hover:bg-navy-50'
            }`}
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            All Complaints
          </button>

          <button
            type="button"
            onClick={() =>
              handleLocationModeChange(
                'nearby'
              )
            }
            disabled={
              locationLoading
            }
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              locationMode === 'nearby'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-navy-600 hover:bg-navy-50'
            } disabled:opacity-60`}
          >
            <MapPinIcon className="w-4 h-4" />

            {locationLoading
              ? 'Finding You...'
              : 'Near You'}
          </button>

        </div>

      </div>

      {/* Near You information */}
      {locationMode ===
        'nearby' && (
        <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-4">

          <div className="flex items-start gap-3">

            <div className="w-10 h-10 rounded-xl bg-white text-brand-600 flex items-center justify-center shrink-0">
              <MapPinIcon className="w-5 h-5" />
            </div>

            <div className="flex-1">

              <p className="text-sm font-semibold text-brand-800">
                Complaints near you
              </p>

              {userLocation ? (
                <>
                  <p className="text-xs text-brand-700 mt-1">
                    Showing complaints within 5 km of your current location.
                  </p>

                  <button
                    type="button"
                    onClick={
                      requestLocation
                    }
                    disabled={
                      locationLoading
                    }
                    className="text-xs font-semibold text-brand-700 hover:text-brand-800 mt-2"
                  >
                    {locationLoading
                      ? 'Updating location...'
                      : 'Refresh my location'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-brand-700 mt-1">
                    Allow location access to see complaints around your current area.
                  </p>

                  {locationError && (
                    <p className="text-xs text-red-600 mt-2">
                      {locationError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={
                      requestLocation
                    }
                    disabled={
                      locationLoading
                    }
                    className="mt-3 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-lg text-xs font-semibold"
                  >
                    {locationLoading
                      ? 'Finding your location...'
                      : 'Use My Location'}
                  </button>
                </>
              )}

            </div>

          </div>

        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-navy-200/60 p-4 mb-6 shadow-sm space-y-4">

        {/* Search */}
        <div className="relative">

          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search by title, location, category..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />

        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">

          {CATEGORIES.map(
            (item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setCategory(
                    item.value
                  )
                }
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category ===
                  item.value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                }`}
              >
                {item.label}
              </button>
            )
          )}

        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">

          <div className="flex items-center gap-1.5">

            <FunnelIcon className="w-3.5 h-3.5 text-navy-400" />

            <span className="text-xs font-medium text-navy-500">
              Filter:
            </span>

          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
            className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs text-navy-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {STATUSES.map(
              (item) => (
                <option
                  key={
                    item.value
                  }
                  value={
                    item.value
                  }
                >
                  {item.label}
                </option>
              )
            )}
          </select>

          <select
            value={sort}
            onChange={(e) =>
              setSort(
                e.target.value as
                  | 'latest'
                  | 'upvotes'
                  | 'oldest'
              )
            }
            className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs text-navy-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="latest">
              Latest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="upvotes">
              Most Upvoted
            </option>
          </select>

          {/* View mode */}
          <div className="w-full sm:w-auto sm:ml-auto flex items-center border border-navy-200 rounded-lg overflow-hidden">

            <button
              type="button"
              onClick={() =>
                setViewMode(
                  'grid'
                )
              }
              className={`px-2.5 py-1.5 text-xs transition-all ${
                viewMode ===
                'grid'
                  ? 'bg-brand-600 text-white'
                  : 'text-navy-500 hover:bg-navy-50'
              }`}
            >
              Grid
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode(
                  'list'
                )
              }
              className={`px-2.5 py-1.5 text-xs transition-all ${
                viewMode ===
                'list'
                  ? 'bg-brand-600 text-white'
                  : 'text-navy-500 hover:bg-navy-50'
              }`}
            >
              List
            </button>

          </div>

        </div>

      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">

          <div className="w-10 h-10 border-4 border-navy-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-navy-500">
            Loading complaints...
          </p>

        </div>
      )}

      {/* Error */}
      {!loading &&
        error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-600">
            {error}
          </div>
        )}

      {/* Results */}
      {!loading &&
        !error && (
          <>
            <div className="flex items-center justify-between gap-3 mb-4">

              <p className="text-sm text-navy-500">
                Showing{' '}
                <span className="font-semibold text-navy-700">
                  {filtered.length}
                </span>{' '}
                {locationMode ===
                'nearby'
                  ? 'nearby complaints'
                  : 'complaints'}
              </p>

              {locationMode ===
                'nearby' &&
                userLocation && (
                  <span className="text-xs text-navy-400">
                    Within 5 km
                  </span>
                )}

            </div>

            {locationMode ===
              'nearby' &&
              !userLocation ? (
              <div className="text-center py-20">

                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="w-7 h-7 text-brand-600" />
                </div>

                <h3 className="text-lg font-semibold text-navy-700 mb-2">
                  Location needed
                </h3>

                <p className="text-navy-500 text-sm max-w-md mx-auto">
                  Allow location access to find civic complaints reported near you.
                </p>

                {locationError && (
                  <p className="text-xs text-red-600 mt-3">
                    {locationError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={
                    requestLocation
                  }
                  disabled={
                    locationLoading
                  }
                  className="mt-5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-xl text-sm font-semibold"
                >
                  {locationLoading
                    ? 'Finding your location...'
                    : 'Use My Location'}
                </button>

              </div>
            ) : filtered.length ===
              0 ? (
              <div className="text-center py-20">

                <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="w-7 h-7 text-navy-400" />
                </div>

                <h3 className="text-lg font-semibold text-navy-700 mb-2">
                  No complaints found
                </h3>

                <p className="text-navy-500 text-sm">
                  {locationMode ===
                  'nearby'
                    ? 'There are no complaints within 5 km of your current location.'
                    : 'Try adjusting your search or filter criteria.'}
                </p>

                {locationMode ===
                  'nearby' && (
                  <button
                    type="button"
                    onClick={() =>
                      handleLocationModeChange(
                        'all'
                      )
                    }
                    className="mt-4 px-5 py-2.5 border border-navy-200 hover:bg-navy-50 text-navy-700 rounded-xl text-sm font-semibold"
                  >
                    See All Complaints
                  </button>
                )}

              </div>
            ) : viewMode ===
              'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {filtered.map(
                  (complaint) => (
                    <ComplaintCard
                      key={
                        complaint.id
                      }
                      complaint={
                        complaint
                      }
                      navigate={
                        navigate
                      }
                    />
                  )
                )}

              </div>
            ) : (
              <div className="space-y-3">

                {filtered.map(
                  (complaint) => (
                    <ComplaintCard
                      key={
                        complaint.id
                      }
                      complaint={
                        complaint
                      }
                      navigate={
                        navigate
                      }
                      variant="list"
                    />
                  )
                )}

              </div>
            )}

          </>
        )}

    </div>
  )
}