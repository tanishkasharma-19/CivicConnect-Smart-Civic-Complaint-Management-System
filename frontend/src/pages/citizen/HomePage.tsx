import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  Complaint,
  Page,
} from '../../types'

import api from '../../api/axios'
import StatCard from '../../components/StatCard'

import {
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from '../../components/Icons'

interface HomePageProps {
  navigate: (
    page: Page,
    params?: {
      complaintId?: string
    }
  ) => void
}

function CityIllustration() {
  return (
    <svg
      viewBox="0 0 520 380"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground base */}
      <rect
        x="0"
        y="300"
        width="520"
        height="80"
        rx="3"
        fill="white"
        fillOpacity="0.06"
      />

      {/* Road horizontal */}
      <rect
        x="0"
        y="302"
        width="520"
        height="5"
        fill="white"
        fillOpacity="0.12"
      />

      {/* Road vertical left */}
      <rect
        x="110"
        y="255"
        width="6"
        height="50"
        fill="white"
        fillOpacity="0.10"
      />

      {/* Road vertical right */}
      <rect
        x="370"
        y="245"
        width="6"
        height="60"
        fill="white"
        fillOpacity="0.10"
      />

      {/* Road center */}
      <rect
        x="235"
        y="260"
        width="6"
        height="45"
        fill="white"
        fillOpacity="0.10"
      />

      {/* Background buildings */}
      <rect
        x="0"
        y="215"
        width="55"
        height="90"
        rx="3"
        fill="white"
        fillOpacity="0.08"
      />

      <rect
        x="65"
        y="185"
        width="40"
        height="120"
        rx="3"
        fill="white"
        fillOpacity="0.10"
      />

      <rect
        x="460"
        y="220"
        width="60"
        height="85"
        rx="3"
        fill="white"
        fillOpacity="0.07"
      />

      <rect
        x="415"
        y="195"
        width="42"
        height="110"
        rx="3"
        fill="white"
        fillOpacity="0.10"
      />

      {/* Main building 1 */}
      <rect
        x="115"
        y="170"
        width="50"
        height="135"
        rx="3"
        fill="white"
        fillOpacity="0.14"
      />

      {[0, 1, 2, 3, 4, 5, 6].map((row) =>
        [0, 1].map((col) => (
          <rect
            key={`b1-${row}-${col}`}
            x={122 + col * 19}
            y={178 + row * 17}
            width="12"
            height="11"
            rx="1.5"
            fill="white"
            fillOpacity={
              row % 2 === col % 2
                ? 0.7
                : 0.15
            }
          />
        ))
      )}

      {/* Main building 2 */}
      <rect
        x="175"
        y="130"
        width="80"
        height="175"
        rx="4"
        fill="white"
        fillOpacity="0.18"
      />

      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(
        (row) =>
          [0, 1, 2].map((col) => (
            <rect
              key={`b2-${row}-${col}`}
              x={182 + col * 23}
              y={140 + row * 17}
              width="15"
              height="11"
              rx="1.5"
              fill="white"
              fillOpacity={
                Math.sin(row + col) > 0
                  ? 0.7
                  : 0.15
              }
            />
          ))
      )}

      {/* B2 rooftop */}
      <rect
        x="205"
        y="118"
        width="20"
        height="16"
        rx="2"
        fill="white"
        fillOpacity="0.25"
      />

      <rect
        x="214"
        y="108"
        width="3"
        height="14"
        rx="1"
        fill="white"
        fillOpacity="0.4"
      />

      {/* Main building 3 */}
      <rect
        x="265"
        y="155"
        width="60"
        height="150"
        rx="3"
        fill="white"
        fillOpacity="0.14"
      />

      {[0, 1, 2, 3, 4, 5, 6].map((row) =>
        [0, 1].map((col) => (
          <rect
            key={`b3-${row}-${col}`}
            x={272 + col * 22}
            y={163 + row * 17}
            width="15"
            height="11"
            rx="1.5"
            fill="white"
            fillOpacity={
              row + col === 3
                ? 0.15
                : 0.65
            }
          />
        ))
      )}

      {/* Main building 4 */}
      <rect
        x="335"
        y="175"
        width="50"
        height="130"
        rx="3"
        fill="white"
        fillOpacity="0.12"
      />

      {[0, 1, 2, 3, 4, 5].map((row) =>
        [0, 1].map((col) => (
          <rect
            key={`b4-${row}-${col}`}
            x={342 + col * 20}
            y={183 + row * 17}
            width="13"
            height="11"
            rx="1.5"
            fill="white"
            fillOpacity={
              row === 2 && col === 1
                ? 0.15
                : 0.6
            }
          />
        ))
      )}

      {/* Trees */}
      <ellipse
        cx="57"
        cy="294"
        rx="13"
        ry="10"
        fill="white"
        fillOpacity="0.18"
      />

      <rect
        x="55"
        y="298"
        width="3"
        height="8"
        fill="white"
        fillOpacity="0.15"
      />

      <ellipse
        cx="155"
        cy="291"
        rx="10"
        ry="8"
        fill="white"
        fillOpacity="0.16"
      />

      <ellipse
        cx="395"
        cy="293"
        rx="12"
        ry="9"
        fill="white"
        fillOpacity="0.18"
      />

      {/* Street lights */}
      <rect
        x="108"
        y="258"
        width="2"
        height="22"
        rx="1"
        fill="white"
        fillOpacity="0.4"
      />

      <rect
        x="104"
        y="255"
        width="10"
        height="3"
        rx="1.5"
        fill="white"
        fillOpacity="0.4"
      />

      <ellipse
        cx="108"
        cy="254"
        rx="3"
        ry="2"
        fill="white"
        fillOpacity="0.7"
      />

      <rect
        x="368"
        y="248"
        width="2"
        height="22"
        rx="1"
        fill="white"
        fillOpacity="0.4"
      />

      <rect
        x="364"
        y="245"
        width="10"
        height="3"
        rx="1.5"
        fill="white"
        fillOpacity="0.4"
      />

      <ellipse
        cx="368"
        cy="244"
        rx="3"
        ry="2"
        fill="white"
        fillOpacity="0.7"
      />

      {/* People */}
      <circle
        cx="145"
        cy="295"
        r="5"
        fill="white"
        fillOpacity="0.45"
      />

      <rect
        x="141"
        y="300"
        width="9"
        height="11"
        rx="2"
        fill="white"
        fillOpacity="0.35"
      />

      <circle
        cx="310"
        cy="294"
        r="5"
        fill="white"
        fillOpacity="0.45"
      />

      <rect
        x="306"
        y="299"
        width="9"
        height="11"
        rx="2"
        fill="white"
        fillOpacity="0.35"
      />

      <circle
        cx="420"
        cy="295"
        r="5"
        fill="white"
        fillOpacity="0.45"
      />

      <rect
        x="416"
        y="300"
        width="9"
        height="11"
        rx="2"
        fill="white"
        fillOpacity="0.35"
      />

      {/* Location pins */}
      <g transform="translate(198, 88)">
        <filter id="pinShadow">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            floodColor="#000"
            floodOpacity="0.2"
          />
        </filter>

        <path
          d="M14 0C9.03 0 5 4.03 5 9C5 15.5 14 27 14 27C14 27 23 15.5 23 9C23 4.03 18.97 0 14 0Z"
          fill="white"
          fillOpacity="0.95"
          filter="url(#pinShadow)"
        />

        <circle
          cx="14"
          cy="9"
          r="4.5"
          fill="#2563EB"
        />
      </g>

      <g
        transform="translate(82, 140)"
        opacity="0.8"
      >
        <path
          d="M9 0C5.69 0 3 2.69 3 6C3 10.5 9 18 9 18C9 18 15 10.5 15 6C15 2.69 12.31 0 9 0Z"
          fill="white"
          fillOpacity="0.85"
        />

        <circle
          cx="9"
          cy="6"
          r="3"
          fill="#F59E0B"
        />
      </g>

      <g
        transform="translate(345, 128)"
        opacity="0.8"
      >
        <path
          d="M9 0C5.69 0 3 2.69 3 6C3 10.5 9 18 9 18C9 18 15 10.5 15 6C15 2.69 12.31 0 9 0Z"
          fill="white"
          fillOpacity="0.85"
        />

        <circle
          cx="9"
          cy="6"
          r="3"
          fill="#22C55E"
        />
      </g>

      <g
        transform="translate(285, 108)"
        opacity="0.7"
      >
        <path
          d="M8 0C5.24 0 3 2.24 3 5C3 8.75 8 15 8 15C8 15 13 8.75 13 5C13 2.24 10.76 0 8 0Z"
          fill="white"
          fillOpacity="0.8"
        />

        <circle
          cx="8"
          cy="5"
          r="2.5"
          fill="#EF4444"
        />
      </g>

      <path
        d="M212 116 L212 130"
        stroke="white"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        strokeOpacity="0.5"
      />

      <circle
        cx="226"
        cy="86"
        r="8"
        fill="#EF4444"
      />

      <text
        x="226"
        y="90"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="bold"
      >
        3
      </text>
    </svg>
  )
}

export default function HomePage({
  navigate,
}: HomePageProps) {
  const [allComplaints, setAllComplaints] =
    useState<Complaint[]>([])

  const [loading, setLoading] =
    useState(true)

  const [locationLoading, setLocationLoading] =
    useState(false)

  const [location, setLocation] =
    useState<{
      latitude: number
      longitude: number
    } | null>(null)

  const [error, setError] =
    useState("")

  const [locationMessage, setLocationMessage] =
    useState("")

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true)
        setError("")

        const response =
          await api.get<Complaint[]>(
            "/api/complaints"
          )

        setAllComplaints(
          response.data ?? []
        )
      } catch (err) {
        console.error(
          "Failed to load citizen home:",
          err
        )

        setError(
          "Unable to load CivicConnect data."
        )
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  /*
   * These statistics are based on the real
   * complaint dataset returned by the backend.
   */
  const reportedCount =
    allComplaints.length

  const resolvedCount =
    allComplaints.filter(
      complaint =>
        complaint.status ===
        "RESOLVED"
    ).length

  const inProgressCount =
    allComplaints.filter(
      complaint =>
        complaint.status ===
        "IN_PROGRESS"
    ).length

  const communityUpvotes =
    allComplaints.reduce(
      (total, complaint) =>
        total +
        (complaint.upvoteCount ?? 0),
      0
    )

  const getDistanceMeters = (
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number
  ) => {
    const earthRadius = 6371000

    const toRadians = (
      value: number
    ) =>
      (value * Math.PI) / 180

    const dLatitude =
      toRadians(
        latitude2 - latitude1
      )

    const dLongitude =
      toRadians(
        longitude2 - longitude1
      )

    const a =
      Math.sin(
        dLatitude / 2
      ) ** 2 +
      Math.cos(
        toRadians(latitude1)
      ) *
        Math.cos(
          toRadians(latitude2)
        ) *
        Math.sin(
          dLongitude / 2
        ) ** 2

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      )

    return earthRadius * c
  }

  const nearbyComplaints =
    useMemo(() => {
      if (!location) {
        return []
      }

      return allComplaints
        .map(complaint => {
          if (
            complaint.latitude ===
              undefined ||
            complaint.longitude ===
              undefined
          ) {
            return null
          }

          const distance =
            getDistanceMeters(
              location.latitude,
              location.longitude,
              complaint.latitude,
              complaint.longitude
            )

          return {
            complaint,
            distance,
          }
        })
        .filter(
          (
            item
          ): item is {
            complaint: Complaint
            distance: number
          } =>
            item !== null &&
            item.distance <= 5000
        )
        .sort(
          (a, b) =>
            a.distance -
            b.distance
        )
        .slice(0, 4)
    }, [
      allComplaints,
      location,
    ])

  const detectNearbyComplaints =
    () => {
      setLocationMessage("")

      if (
        !navigator.geolocation
      ) {
        setLocationMessage(
          "Location services are not supported by your browser."
        )
        return
      }

      setLocationLoading(true)

      navigator.geolocation.getCurrentPosition(
        position => {
          setLocation({
            latitude:
              position.coords.latitude,
            longitude:
              position.coords.longitude,
          })

          setLocationLoading(false)
        },
        geoError => {
          console.error(
            "Home location detection failed:",
            geoError
          )

          setLocationLoading(false)

          if (
            geoError.code ===
            geoError.PERMISSION_DENIED
          ) {
            setLocationMessage(
              "Location permission was denied. Allow location access to see complaints near you."
            )
          } else {
            setLocationMessage(
              "Unable to detect your location. Please try again."
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

  return (
    <div className="pb-20 md:pb-0">

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-navy-900 via-brand-900 to-brand-800 overflow-hidden">

        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize:
              "48px 48px",
          }}
        />

        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-brand-500/15 blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />

        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-brand-700/20 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div>

              <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Your Voice. Your City. Your Change.
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5"
                style={{
                  fontFamily:
                    "'Outfit', sans-serif",
                }}
              >
                Make Your City
                <span className="block text-brand-300 mt-1">
                  Better.
                </span>
              </h1>

              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
                Report civic issues, track progress, and help your community build a better neighbourhood — all in one place.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">

                <button
                  onClick={() =>
                    navigate(
                      "citizen-report"
                    )
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-white text-brand-800 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Report an Issue
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "citizen-explore"
                    )
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/25 hover:bg-white/20 transition-all text-sm backdrop-blur-sm"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Explore Complaints
                </button>

              </div>

              <div className="flex items-center gap-3 text-white/70 text-sm">

                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4 text-brand-300" />
                </div>

                <div>
                  <p className="text-white font-medium">
                    Your community, your voice
                  </p>

                  <p className="text-white/50 text-xs mt-0.5">
                    Report issues and help create meaningful change.
                  </p>
                </div>

              </div>

            </div>

            <div className="hidden lg:block relative">

              <div className="relative w-full h-72 xl:h-80">
                <CityIllustration />
              </div>

              <div className="absolute top-6 right-0 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white shadow-xl">

                <div className="flex items-center gap-2.5">

                  <div className="w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      Issues Made Visible
                    </p>

                    <p className="text-xs text-white/60">
                      Help your community identify problems
                    </p>
                  </div>

                </div>

              </div>

              <div className="absolute bottom-12 left-0 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white shadow-xl">

                <div className="flex items-center gap-2.5">

                  <div className="w-8 h-8 rounded-lg bg-brand-400/20 flex items-center justify-center">
                    <ArrowUpIcon className="w-4 h-4 text-brand-300" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      Community Powered
                    </p>

                    <p className="text-xs text-white/60">
                      Citizens working together for change
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* LIVE STATISTICS */}
      <section className="bg-white border-b border-navy-200/60">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

            <StatCard
              label="Complaints Reported"
              value={
                loading
                  ? "—"
                  : reportedCount
              }
              icon={
                <DocumentTextIcon className="w-5 h-5" />
              }
              color="blue"
            />

            <StatCard
              label="Resolved"
              value={
                loading
                  ? "—"
                  : resolvedCount
              }
              icon={
                <CheckCircleIcon className="w-5 h-5" />
              }
              color="green"
            />

            <StatCard
              label="In Progress"
              value={
                loading
                  ? "—"
                  : inProgressCount
              }
              icon={
                <MapPinIcon className="w-5 h-5" />
              }
              color="orange"
            />

            <StatCard
              label="Community Upvotes"
              value={
                loading
                  ? "—"
                  : communityUpvotes
              }
              icon={
                <ArrowUpIcon className="w-5 h-5" />
              }
              color="purple"
            />

          </div>

        </div>
      </section>

      {/* COMMUNITY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        <section>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">

            <div>
              <h2
                className="text-xl font-bold text-navy-900"
                style={{
                  fontFamily:
                    "'Outfit', sans-serif",
                }}
              >
                Community
              </h2>

              <p className="text-sm text-navy-500 mt-0.5">
                See what people around you are reporting.
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  "citizen-explore"
                )
              }
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Explore Community Complaints →
            </button>

          </div>

          {!location ? (
            <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm p-7">

              <div className="max-w-xl">

                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <MapPinIcon className="w-5 h-5" />
                </div>

                <h3
                  className="text-lg font-bold text-navy-900"
                  style={{
                    fontFamily:
                      "'Outfit', sans-serif",
                  }}
                >
                  Want to see complaints near you?
                </h3>

                <p className="text-sm text-navy-500 mt-2 leading-relaxed">
                  Allow location access to see civic complaints reported around your current area.
                </p>

                {locationMessage && (
                  <p className="text-xs text-red-600 mt-3">
                    {locationMessage}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-5">

                  <button
                    onClick={
                      detectNearbyComplaints
                    }
                    disabled={
                      locationLoading
                    }
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    {locationLoading
                      ? "Finding your area..."
                      : "See Complaints Near Me"}
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        "citizen-explore"
                      )
                    }
                    className="px-5 py-2.5 border border-navy-200 hover:bg-navy-50 text-navy-700 text-sm font-semibold rounded-xl transition-all"
                  >
                    Explore Complaints
                  </button>

                </div>

              </div>

            </div>
          ) : (
            <>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />

                  <p className="text-sm text-navy-600">
                    Showing complaints within 5 km of your current location
                  </p>

                </div>

                <button
                  onClick={
                    detectNearbyComplaints
                  }
                  disabled={
                    locationLoading
                  }
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 self-start sm:self-auto"
                >
                  {locationLoading
                    ? "Updating..."
                    : "Refresh Location"}
                </button>

              </div>

              {nearbyComplaints.length ===
              0 ? (
                <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm p-8 text-center">

                  <p className="text-sm font-semibold text-navy-800">
                    No nearby complaints found.
                  </p>

                  <p className="text-xs text-navy-400 mt-1">
                    You can explore complaints from other areas as well.
                  </p>

                  <button
                    onClick={() =>
                      navigate(
                        "citizen-explore"
                      )
                    }
                    className="mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl"
                  >
                    Explore Complaints
                  </button>

                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

                  {nearbyComplaints.map(
                    ({
                      complaint,
                      distance,
                    }) => (
                      <div
                        key={
                          complaint.id
                        }
                        className="bg-white rounded-2xl border border-navy-200/60 shadow-sm p-5 hover:shadow-md transition-shadow"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <div className="flex items-center gap-2 flex-wrap mb-2">

                              <span className="text-xs bg-navy-100 text-navy-600 px-2 py-1 rounded-full">
                                {complaint.category
                                  .replace(
                                    /_/g,
                                    " "
                                  )
                                  .toLowerCase()
                                  .replace(
                                    /\b\w/g,
                                    letter =>
                                      letter.toUpperCase()
                                  )}
                              </span>

                              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">
                                {Math.round(
                                  distance
                                )}{" "}
                                m away
                              </span>

                            </div>

                            <h3
                              className="text-base font-bold text-navy-900 leading-snug"
                              style={{
                                fontFamily:
                                  "'Outfit', sans-serif",
                              }}
                            >
                              {
                                complaint.title
                              }
                            </h3>

                            <p className="text-xs text-navy-500 mt-2 flex items-start gap-1.5">

                              <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />

                              <span>
                                {complaint.address ||
                                  "Location not provided"}
                              </span>

                            </p>

                          </div>

                          <div className="text-xs font-semibold text-navy-600 whitespace-nowrap">
                            ↑{" "}
                            {complaint.upvoteCount ??
                              0}
                          </div>

                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-5 pt-4 border-t border-navy-100">

                          <span className="text-xs text-navy-500">
                            {complaint.status
                              .replace(
                                /_/g,
                                " "
                              )
                              .toLowerCase()
                              .replace(
                                /\b\w/g,
                                letter =>
                                  letter.toUpperCase()
                              )}
                          </span>

                          <button
                            onClick={() =>
                              navigate(
                                "citizen-detail",
                                {
                                  complaintId:
                                    String(
                                      complaint.id
                                    ),
                                }
                              )
                            }
                            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                          >
                            View Complaint →
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

              <div className="mt-5">

                <button
                  onClick={() =>
                    navigate(
                      "citizen-explore"
                    )
                  }
                  className="w-full py-3 border border-navy-200 hover:bg-navy-50 text-navy-700 font-semibold rounded-xl text-sm transition-all"
                >
                  Want to see what other people have complained about? Explore All Complaints
                </button>

              </div>

            </>
          )}

        </section>

        {/* HOW CIVICCONNECT HELPS */}
        <section>

          <div className="mb-5">

            <h2
              className="text-xl font-bold text-navy-900"
              style={{
                fontFamily:
                  "'Outfit', sans-serif",
              }}
            >
              How CivicConnect Helps
            </h2>

            <p className="text-sm text-navy-500 mt-0.5">
              Turning everyday civic concerns into meaningful action.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="bg-white rounded-2xl border border-navy-200/60 p-6 shadow-sm hover:shadow-md transition-shadow">

              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
                <DocumentTextIcon className="w-5 h-5" />
              </div>

              <h3
                className="text-lg font-bold text-navy-900 mb-2"
                style={{
                  fontFamily:
                    "'Outfit', sans-serif",
                }}
              >
                Report Easily
              </h3>

              <p className="text-sm text-navy-500 leading-relaxed">
                Report roads, water, electricity, garbage, drainage and other civic issues with the details authorities need.
              </p>

            </div>

            <div className="bg-white rounded-2xl border border-navy-200/60 p-6 shadow-sm hover:shadow-md transition-shadow">

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
                <CheckCircleIcon className="w-5 h-5" />
              </div>

              <h3
                className="text-lg font-bold text-navy-900 mb-2"
                style={{
                  fontFamily:
                    "'Outfit', sans-serif",
                }}
              >
                Track Progress
              </h3>

              <p className="text-sm text-navy-500 leading-relaxed">
                Follow your complaint as it moves through verification, assignment, progress and resolution.
              </p>

            </div>

            <div className="bg-white rounded-2xl border border-navy-200/60 p-6 shadow-sm hover:shadow-md transition-shadow">

              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                <ArrowUpIcon className="w-5 h-5" />
              </div>

              <h3
                className="text-lg font-bold text-navy-900 mb-2"
                style={{
                  fontFamily:
                    "'Outfit', sans-serif",
                }}
              >
                Build Together
              </h3>

              <p className="text-sm text-navy-500 leading-relaxed">
                Citizens can make civic problems visible and support issues that matter to their community.
              </p>

            </div>

          </div>

        </section>

        {/* MISSION */}
        <section className="bg-navy-50 rounded-2xl border border-navy-200/60 p-8 sm:p-10">

          <div className="max-w-3xl">

            <p className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-3">
              Our Purpose
            </p>

            <h2
              className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4"
              style={{
                fontFamily:
                  "'Outfit', sans-serif",
              }}
            >
              Better neighbourhoods start with being heard.
            </h2>

            <p className="text-sm sm:text-base text-navy-600 leading-relaxed">
              CivicConnect gives citizens a simple way to report civic problems, stay informed about their complaints and contribute to a more responsive community.
            </p>

          </div>

        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 rounded-2xl p-8 sm:p-10">

          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

            <div>

              <h3
                className="text-xl sm:text-2xl font-bold text-white mb-2"
                style={{
                  fontFamily:
                    "'Outfit', sans-serif",
                }}
              >
                Noticed a problem in your area?
              </h3>

              <p className="text-white/70 text-sm max-w-md leading-relaxed">
                Every report counts. Help your municipality fix civic issues faster by reporting what you see.
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  "citizen-report"
                )
              }
              className="flex items-center gap-2 px-7 py-3 bg-white text-brand-800 font-bold rounded-xl hover:shadow-xl hover:bg-blue-50 transition-all text-sm whitespace-nowrap flex-shrink-0 shadow-lg"
            >
              <PlusIcon className="w-4 h-4" />
              Report an Issue
            </button>

          </div>

        </section>

      </div>

    </div>
  )
}