import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Page } from '../../types'
import Logo from '../../components/Logo'
import LocationPicker from '../../components/LocationPicker'
import { validateImageFile } from '../../utils/validation'
import api from '../../api/axios'

interface ReportPageProps {
  navigate: (page: Page) => void
}

type Category =
  | 'ROAD'
  | 'GARBAGE'
  | 'WATER'
  | 'ELECTRICITY'
  | 'DRAINAGE'
  | 'OTHER'

interface DuplicateComplaint {
  complaintId: number
  title: string
  description: string
  category: Category
  status: string
  latitude: number
  longitude: number
  address: string
  upvoteCount: number
  distanceMeters: number
}

interface LocationResult {
  latitude: number
  longitude: number
  displayName: string
  importance?: number
}

const categories: {
  value: Category
  label: string
  icon: string
}[] = [
  { value: 'ROAD', label: 'Roads', icon: '🚧' },
  { value: 'WATER', label: 'Water', icon: '💧' },
  { value: 'ELECTRICITY', label: 'Electricity', icon: '⚡' },
  { value: 'GARBAGE', label: 'Garbage', icon: '🗑️' },
  { value: 'DRAINAGE', label: 'Drainage', icon: '🌊' },
  { value: 'OTHER', label: 'Other', icon: '📍' },
]

const steps = [
  { number: 1, label: 'Issue Details' },
  { number: 2, label: 'Location' },
  { number: 3, label: 'Evidence' },
  { number: 4, label: 'Review' },
]

export default function ReportPage({ navigate }: ReportPageProps) {
  const [currentStep, setCurrentStep] = useState(1)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [description, setDescription] = useState('')

  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  // 'gps' = "Use My Current Location", 'search' = "Find Location",
  // 'pin' = citizen moved the pin on the map
  const [locationSource, setLocationSource] = useState<
    'gps' | 'search' | 'pin' | null
  >(null)
  // Address text the map service matched (so the user can verify it)
  const [matchedAddress, setMatchedAddress] = useState('')
  const [addressLookupLoading, setAddressLookupLoading] = useState(false)

  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [duplicates, setDuplicates] = useState<DuplicateComplaint[]>([])
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdComplaintId, setCreatedComplaintId] = useState<number | null>(
    null
  )

  const [locationLoading, setLocationLoading] = useState(false)
  const [manualLocationLoading, setManualLocationLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedCategory = useMemo(
    () => categories.find(item => item.value === category),
    [category]
  )

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      setPhoto(null)
      setPhotoPreview(null)
      return
    }

    const imageError = validateImageFile(file)

    if (imageError) {
      setError(imageError)
      // Clear the chosen file so the same file can be checked again
      event.target.value = ''
      return
    }

    setError('')
    setPhoto(file)

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }

    setPhotoPreview(URL.createObjectURL(file))
  }

  const detectLocation = () => {
    setError('')
    setAddress('')
    setMatchedAddress('')
    setLatitude(null)
    setLongitude(null)
    setLocationSource(null)

    if (!navigator.geolocation) {
      setError('Location services are not supported by your browser.')
      return
    }

    setLocationLoading(true)

    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude

        setLatitude(lat)
        setLongitude(lon)
        setLocationSource('gps')
        setLocationLoading(false)

        // Look up the street address of the detected point so the
        // citizen can check it and correct it if needed.
        setAddressLookupLoading(true)

        try {
          const detected = await reverseGeocode(lat, lon)

          if (detected) {
            setMatchedAddress(detected)
            // Editable: whatever is in the box is saved with the complaint
            setAddress(detected.slice(0, 300))
          }
        } finally {
          setAddressLookupLoading(false)
        }
      },
      () => {
        setLocationLoading(false)
        setError(
          'Unable to detect your location. Please allow location access and try again.'
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // Coordinates -> readable address (Nominatim first, Photon as backup)
  const reverseGeocode = async (
    lat: number,
    lon: number
  ): Promise<string> => {
    try {
      const params = new URLSearchParams({
        format: 'jsonv2',
        lat: String(lat),
        lon: String(lon),
        zoom: '18',
        addressdetails: '1',
        'accept-language': 'en',
      })

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        { headers: { Accept: 'application/json' } }
      )

      if (response.ok) {
        const data = await response.json()

        if (typeof data?.display_name === 'string') {
          return data.display_name
        }
      }
    } catch (err) {
      console.error('Nominatim reverse lookup failed:', err)
    }

    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        lang: 'en',
      })

      const response = await fetch(
        `https://photon.komoot.io/reverse?${params.toString()}`,
        { headers: { Accept: 'application/json' } }
      )

      if (response.ok) {
        const data = await response.json()
        const properties = data?.features?.[0]?.properties

        if (properties) {
          return [
            properties.name,
            properties.housenumber,
            properties.street,
            properties.suburb,
            properties.district,
            properties.city,
            properties.state,
            properties.postcode,
          ]
            .filter(Boolean)
            .join(', ')
        }
      }
    } catch (err) {
      console.error('Photon reverse lookup failed:', err)
    }

    return ''
  }

  // Citizen dragged the pin / tapped the map
  const handlePinMoved = async (lat: number, lon: number) => {
    setLatitude(lat)
    setLongitude(lon)
    setLocationSource('pin')
    setError('')
    setAddressLookupLoading(true)

    try {
      const found = await reverseGeocode(lat, lon)

      if (found) {
        // Replace the address text only if the citizen has not
        // typed their own (empty, or still the auto-filled text)
        setAddress(current =>
          current.trim() === '' ||
          current === matchedAddress.slice(0, 300)
            ? found.slice(0, 300)
            : current
        )
        setMatchedAddress(found)
      }
    } finally {
      setAddressLookupLoading(false)
    }
  }

  const normalizeLocationText = (value: string) => {
    return value
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(
        /\b(plot|plot no|plot number)\s*[:#.]?\s*/gi,
        ''
      )
      .replace(
        /\b(flat|flat no|flat number|house|house no|house number)\s*[:#.]?\s*/gi,
        ''
      )
      .replace(/\bopp\.?\b/gi, 'opposite')
      .replace(/\bnearby\b/gi, 'near')
      .trim()
  }

  /*
   * Long, very specific addresses (landmark + "near ..." + colony ...)
   * usually match nothing on OpenStreetMap. So we build a list of queries
   * from most specific to least specific and use the first that works.
   */
  const buildLocationQueries = (value: string) => {
    const cleaned = normalizeLocationText(value)

    const pin = cleaned.match(/\b[1-9]\d{5}\b/)?.[0]

    const parts = cleaned
      .replace(/\b[1-9]\d{5}\b/g, ' ')
      .replace(/[()\/|]/g, ' ')
      .replace(
        /\b(near|opposite|beside|behind|next to|in front of|close to)\b/gi,
        ' '
      )
      .split(',')
      .map(part =>
        part
          .replace(/\b(in|at|the)\b/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      )
      .filter(Boolean)

    const tail = parts.slice(-3).join(', ')

    const queries: string[] = [cleaned]

    // Each landmark together with the area at the end of the address
    parts.slice(0, Math.max(parts.length - 3, 0)).forEach(part => {
      queries.push(`${part}, ${tail}`)
    })

    // Drop the most specific part one by one
    for (let i = 1; i < parts.length; i++) {
      queries.push(parts.slice(i).join(', '))
    }

    // Area + PIN code
    if (pin) {
      queries.push(`${tail}, ${pin}`)
      queries.push(`${pin}, Maharashtra, India`)
    }

    queries.push(`${cleaned}, Maharashtra, India`)

    return Array.from(
      new Set(
        queries.map(query => query.trim()).filter(Boolean)
      )
    ).slice(0, 12)
  }

  const findLocationWithPhoton = async (
    query: string
  ): Promise<LocationResult[]> => {
    const params = new URLSearchParams({
      q: query,
      limit: '5',
      lang: 'en',
      // Prefer results near Pimpri-Chinchwad / Pune
      lat: '18.6298',
      lon: '73.7997',
    })

    const response = await fetch(
      `https://photon.komoot.io/api/?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()

    const features = Array.isArray(data?.features)
      ? data.features
      : []

    const results: LocationResult[] = []

    for (const feature of features) {
      const coordinates = feature?.geometry?.coordinates

      if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2
      ) {
        continue
      }

      const parsedLongitude = Number(coordinates[0])
      const parsedLatitude = Number(coordinates[1])

      if (
        Number.isNaN(parsedLatitude) ||
        Number.isNaN(parsedLongitude)
      ) {
        continue
      }

      const properties = feature?.properties ?? {}

      const countryCode = String(
        properties.countrycode ?? ''
      ).toLowerCase()

      if (countryCode && countryCode !== 'in') {
        continue
      }

      const parts = [
        properties.name,
        properties.housenumber,
        properties.street,
        properties.suburb,
        properties.district,
        properties.city,
        properties.state,
        properties.postcode,
        properties.country,
      ].filter(Boolean)

      const displayName =
        parts.length > 0 ? parts.join(', ') : query

      results.push({
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        displayName,
      })
    }

    return results
  }

  const findLocationWithNominatim = async (
    query: string
  ): Promise<LocationResult[]> => {
    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      limit: '5',
      countrycodes: 'in',
      addressdetails: '1',
      'accept-language': 'en',
    })

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      return []
    }

    const results: LocationResult[] = []

    for (const item of data) {
      const parsedLatitude = Number(item?.lat)
      const parsedLongitude = Number(item?.lon)

      if (
        Number.isNaN(parsedLatitude) ||
        Number.isNaN(parsedLongitude)
      ) {
        continue
      }

      results.push({
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        displayName:
          item?.display_name || query,
        importance:
          typeof item?.importance === 'number'
            ? item.importance
            : undefined,
      })
    }

    return results
  }

  const pickBestLocation = (
    results: LocationResult[],
    originalQuery: string
  ) => {
    if (results.length === 0) {
      return null
    }

    const normalizedOriginal = originalQuery.toLowerCase()

    const scored = results.map(result => {
      const normalizedDisplay =
        result.displayName.toLowerCase()

      let score = 0

      if (
        normalizedDisplay.includes(normalizedOriginal)
      ) {
        score += 10
      }

      const importantWords = normalizedOriginal
        .split(/[\s,.-]+/)
        .map(word => word.trim())
        .filter(word => word.length >= 4)

      for (const word of importantWords) {
        if (normalizedDisplay.includes(word)) {
          score += 1
        }
      }

      if (result.importance) {
        score += result.importance
      }

      return {
        result,
        score,
      }
    })

    scored.sort((a, b) => b.score - a.score)

    return scored[0]?.result ?? null
  }

  const findLocationFromAddress = async () => {
    const originalQuery = address.trim()

    if (!originalQuery) {
      setError('Please enter the complaint location first.')
      return
    }

    setError('')
    setLatitude(null)
    setLongitude(null)
    setMatchedAddress('')
    setLocationSource(null)
    setManualLocationLoading(true)

    try {
      const queries = buildLocationQueries(originalQuery)

      let photonResults: LocationResult[] = []
      let photonQueryUsed = originalQuery

      /*
       * Try the user's original/cleaned address using Photon.
       * Photon supports free-text and typo-tolerant searching.
       */
      for (const query of queries) {
        try {
          photonResults = await findLocationWithPhoton(query)

          if (photonResults.length > 0) {
            photonQueryUsed = query
            break
          }
        } catch (err) {
          console.error(
            'Photon location search failed:',
            err
          )
        }
      }

      /*
       * Photon result found.
       */
      if (photonResults.length > 0) {
        const bestLocation = pickBestLocation(
          photonResults,
          photonQueryUsed
        )

        if (bestLocation) {
          setLatitude(bestLocation.latitude)
          setLongitude(bestLocation.longitude)
          setLocationSource('search')
          setMatchedAddress(bestLocation.displayName)

          /*
           * Keep the user's original wording.
           * This is better for the complaint record.
           */
          setAddress(originalQuery)

          return
        }
      }

      /*
       * Small pause before using the public Nominatim service.
       */
      await new Promise(resolve =>
        window.setTimeout(resolve, 1100)
      )

      /*
       * Fallback to Nominatim using one cleaned query first,
       * followed by the original address.
       */
      // Coarser queries are the most likely to succeed on Nominatim
      const nominatimQueries = Array.from(
        new Set([
          ...queries.slice(-3),
          originalQuery,
        ])
      ).slice(0, 4)

      let nominatimResults: LocationResult[] = []

      for (const query of nominatimQueries) {
        try {
          nominatimResults =
            await findLocationWithNominatim(query)

          if (nominatimResults.length > 0) {
            break
          }

          /*
           * Public Nominatim service should not be called
           * repeatedly in rapid succession.
           */
          if (query !== nominatimQueries[nominatimQueries.length - 1]) {
            await new Promise(resolve =>
              window.setTimeout(resolve, 1100)
            )
          }
        } catch (err) {
          console.error(
            'Nominatim location search failed:',
            err
          )

          if (query !== nominatimQueries[nominatimQueries.length - 1]) {
            await new Promise(resolve =>
              window.setTimeout(resolve, 1100)
            )
          }
        }
      }

      if (nominatimResults.length > 0) {
        const bestLocation = pickBestLocation(
          nominatimResults,
          originalQuery
        )

        if (bestLocation) {
          setLatitude(bestLocation.latitude)
          setLongitude(bestLocation.longitude)
          setLocationSource('search')
          setMatchedAddress(bestLocation.displayName)

          setAddress(originalQuery)

          return
        }
      }

      /*
       * Nothing found.
       */
      setError(
        'We could not identify this location. Try adding a nearby landmark, area, city or PIN code.'
      )
    } catch (err) {
      console.error(
        'Smart location search failed:',
        err
      )

      setLatitude(null)
      setLongitude(null)

      setError(
        'Unable to identify this location right now. Please try again.'
      )
    } finally {
      setManualLocationLoading(false)
    }
  }

  const checkDuplicates = async () => {
    if (!category || latitude === null || longitude === null) {
      setDuplicates([])
      return
    }

    setCheckingDuplicates(true)

    try {
      const response = await api.get(
        '/api/complaints/duplicates',
        {
          params: {
            latitude,
            longitude,
            category,
            radius: 500,
          },
        }
      )

      setDuplicates(response.data ?? [])
    } catch (err) {
      console.error(
        'Duplicate check failed:',
        err
      )

      /*
       * Duplicate detection should never prevent
       * the citizen from continuing.
       */
      setDuplicates([])
    } finally {
      setCheckingDuplicates(false)
    }
  }

  useEffect(() => {
    if (currentStep === 4) {
      checkDuplicates()
    }
  }, [currentStep])

  const validateStep = () => {
    setError('')

    if (currentStep === 1) {
      if (!title.trim()) {
        setError(
          'Please enter a complaint title.'
        )
        return false
      }

      if (!category) {
        setError(
          'Please select a category.'
        )
        return false
      }

      if (!description.trim()) {
        setError(
          'Please describe the issue.'
        )
        return false
      }

      return true
    }

    if (currentStep === 2) {
      if (
        latitude === null ||
        longitude === null
      ) {
        setError(
          'Please use your current location or find the complaint location by address.'
        )
        return false
      }

      return true
    }

    return true
  }

  const handleContinue = () => {
    if (!validateStep()) {
      return
    }

    setCurrentStep(step =>
      Math.min(step + 1, 4)
    )
  }

  const handleBack = () => {
    setError('')

    setCurrentStep(step =>
      Math.max(step - 1, 1)
    )
  }

  const handleSubmit = async () => {
    if (
      !title.trim() ||
      !category ||
      !description.trim()
    ) {
      setError(
        'Please complete the issue details.'
      )
      setCurrentStep(1)
      return
    }

    if (
      latitude === null ||
      longitude === null
    ) {
      setError(
        'Please use your current location or find the complaint location by address.'
      )
      setCurrentStep(2)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const formData = new FormData()

      formData.append(
        'title',
        title.trim()
      )

      formData.append(
        'description',
        description.trim()
      )

      formData.append(
        'category',
        category
      )

      formData.append(
        'latitude',
        String(latitude)
      )

      formData.append(
        'longitude',
        String(longitude)
      )

      if (address.trim()) {
        formData.append(
          'address',
          address.trim()
        )
      }

      if (photo) {
        formData.append(
          'beforePhoto',
          photo
        )
      }

      const response = await api.post(
        '/api/complaints',
        formData
      )

      setCreatedComplaintId(
        response.data?.id ?? null
      )

      setSubmitted(true)
    } catch (err: any) {
      console.error(
        'Complaint submission failed:',
        err
      )

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Unable to submit complaint. Please try again.'

      setError(String(message))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-navy-200/60 shadow-sm p-8 text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>

          <h1
            className="text-2xl font-bold text-navy-900 mb-2"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Complaint Submitted
          </h1>

          <p className="text-navy-500 text-sm leading-6 mb-4">
            Your civic complaint has been
            successfully submitted.
          </p>

          {createdComplaintId !== null && (
            <div className="bg-navy-50 rounded-xl px-4 py-3 mb-6">
              <p className="text-xs text-navy-500 mb-1">
                Complaint ID
              </p>

              <p className="text-lg font-bold text-brand-600">
                #{createdComplaintId}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() =>
                navigate(
                  'citizen-my-complaints'
                )
              }
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all text-sm"
            >
              View My Complaints
            </button>

            <button
              onClick={() =>
                navigate('citizen-home')
              }
              className="w-full py-2.5 border border-navy-200 hover:bg-navy-50 text-navy-700 font-semibold rounded-xl transition-all text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() =>
              navigate('citizen-home')
            }
            className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 mb-5 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 18l-6-6 6-6"
              />
            </svg>

            Back to Home
          </button>

          <h1
            className="text-2xl sm:text-3xl font-bold text-navy-900"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Report a Civic Issue
          </h1>

          <p className="text-navy-500 mt-1 text-sm">
            Help make your city better by reporting
            an issue.
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      currentStep >= step.number
                        ? 'bg-brand-600 text-white'
                        : 'bg-navy-100 text-navy-400'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12l4 4L19 6"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>

                  <span
                    className={`mt-2 text-xs hidden sm:block whitespace-nowrap ${
                      currentStep >= step.number
                        ? 'text-brand-600 font-medium'
                        : 'text-navy-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index <
                  steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-all ${
                      currentStep > step.number
                        ? 'bg-brand-600'
                        : 'bg-navy-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm p-6 sm:p-8">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div>
              <div className="mb-7">
                <h2
                  className="text-xl font-bold text-navy-900"
                  style={{
                    fontFamily:
                      "'Outfit', sans-serif",
                  }}
                >
                  Issue Details
                </h2>

                <p className="text-sm text-navy-500 mt-1">
                  Tell us what problem you noticed.
                </p>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-navy-700">
                      Complaint Title
                    </label>

                    <span className="text-xs text-navy-400">
                      {title.length}/100
                    </span>
                  </div>

                  <input
                    type="text"
                    value={title}
                    maxLength={100}
                    onChange={e =>
                      setTitle(e.target.value)
                    }
                    placeholder="e.g. Large pothole near main road"
                    className="w-full px-3.5 py-3 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-3">
                    Category
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map(item => {
                      const selected =
                        category === item.value

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            setCategory(
                              item.value
                            )
                          }
                          className={`p-4 rounded-xl border text-left transition-all ${
                            selected
                              ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                              : 'border-navy-200 hover:border-brand-300 hover:bg-navy-50'
                          }`}
                        >
                          <div className="text-xl mb-2">
                            {item.icon}
                          </div>

                          <p
                            className={`text-sm font-semibold ${
                              selected
                                ? 'text-brand-700'
                                : 'text-navy-700'
                            }`}
                          >
                            {item.label}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-navy-700">
                      Description
                    </label>

                    <span className="text-xs text-navy-400">
                      {description.length}/500
                    </span>
                  </div>

                  <textarea
                    value={description}
                    maxLength={500}
                    rows={5}
                    onChange={e =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="Describe the issue in detail..."
                    className="w-full px-3.5 py-3 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div>
              <div className="mb-7">
                <h2
                  className="text-xl font-bold text-navy-900"
                  style={{
                    fontFamily:
                      "'Outfit', sans-serif",
                  }}
                >
                  Location
                </h2>

                <p className="text-sm text-navy-500 mt-1">
                  Tell us where the issue is located.
                </p>
              </div>

              <div className="space-y-5">
                {/* Current location */}
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={
                    locationLoading ||
                    manualLocationLoading
                  }
                  className="w-full flex items-center justify-center gap-2 py-3 border border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded-xl text-sm transition-all disabled:opacity-60"
                >
                  {locationLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-brand-300 border-t-brand-700 rounded-full animate-spin" />
                      Detecting location...
                    </>
                  ) : (
                    <>
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
                          d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
                        />
                        <circle
                          cx="12"
                          cy="9"
                          r="2.5"
                        />
                      </svg>

                      Use My Current Location
                    </>
                  )}
                </button>

                {/* OR divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-navy-200" />

                  <span className="text-xs font-medium text-navy-400">
                    OR
                  </span>

                  <div className="flex-1 h-px bg-navy-200" />
                </div>

                {/* Manual location */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">
                    Enter Complaint Location
                  </label>

                  <textarea
                    value={address}
                    onChange={e => {
                      setAddress(
                        e.target.value
                      )

                      // GPS location stays selected while the citizen
                      // corrects the address text. A searched address
                      // must be searched again.
                      if (locationSource !== 'gps' && locationSource !== 'pin') {
                        setLatitude(null)
                        setLongitude(null)
                        setMatchedAddress('')
                        setLocationSource(null)
                      }

                      setError('')
                    }}
                    maxLength={300}
                    rows={3}
                    placeholder="e.g. Near DY Patil College, Pimpri-Chinchwad"
                    className="w-full px-3.5 py-3 rounded-xl border border-navy-200 text-navy-900 placeholder-navy-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />

                  <button
                    type="button"
                    onClick={
                      findLocationFromAddress
                    }
                    disabled={
                      manualLocationLoading ||
                      locationLoading
                    }
                    className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-navy-800 hover:bg-navy-900 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60"
                  >
                    {manualLocationLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Identifying location...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <circle
                            cx="11"
                            cy="11"
                            r="6.5"
                          />
                          <path
                            strokeLinecap="round"
                            d="m16 16 4 4"
                          />
                        </svg>

                        Find Location
                      </>
                    )}
                  </button>

                  {(locationSource === 'gps' ||
                    locationSource === 'pin') && (
                    <p className="text-[11px] text-brand-600 mt-2">
                      This address was looked up from the pin on the map.
                      Please check it. You can edit the text above and
                      your changes will be saved with the complaint.
                    </p>
                  )}

                  <p className="text-[11px] text-navy-400 mt-2">
                    Enter the address, landmark, area,
                    building, road or PIN code where
                    the issue actually occurred.
                  </p>

                  <p className="text-[11px] text-navy-400 mt-1">
                    Address data © OpenStreetMap contributors
                  </p>
                </div>

                {/* Location found */}
                {latitude !== null &&
                  longitude !== null && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 12l4 4L19 6"
                            />
                          </svg>
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-green-800">
                            Complaint location selected
                          </p>

                          {addressLookupLoading && (
                            <p className="text-xs text-green-700 mt-1">
                              Finding the address for this location...
                            </p>
                          )}

                          {matchedAddress && (
                            <p className="text-xs text-green-700 mt-1 leading-5 break-words">
                              {locationSource === 'gps'
                                ? 'Detected address: '
                                : locationSource === 'pin'
                                  ? 'Address at pin: '
                                  : 'Matched location: '}
                              {matchedAddress}
                            </p>
                          )}

                          {address.trim() &&
                            address.trim() !== matchedAddress && (
                              <p className="text-xs text-green-700 mt-1 leading-5 break-words">
                                Address saved with complaint:{' '}
                                {address.trim()}
                              </p>
                            )}

                          {locationSource === 'search' && (
                            <p className="text-xs text-green-700 mt-1">
                              This is the closest match found and may be
                              approximate. Check it before continuing.
                            </p>
                          )}

                          <p className="text-xs text-green-700 mt-2">
                            Latitude:{' '}
                            {latitude.toFixed(6)}
                            <br />
                            Longitude:{' '}
                            {longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Map with draggable pin (or placeholder until a location is chosen) */}
                {latitude !== null && longitude !== null ? (
                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onChange={handlePinMoved}
                  />
                ) : (
                <div className="rounded-xl overflow-hidden border border-navy-200 bg-navy-50">
                  <div className="h-40 flex items-center justify-center">
                    <div className="text-center px-6">
                      <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-6 h-6 text-brand-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
                          />
                          <circle
                            cx="12"
                            cy="9"
                            r="2.5"
                          />
                        </svg>
                      </div>

                      <p className="text-sm font-medium text-navy-700">
                        Complaint Location
                      </p>

                      <p className="text-xs text-navy-400 mt-1">
                        Select your current location or
                        search for the actual complaint
                        location.
                      </p>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div>
              <div className="mb-7">
                <h2
                  className="text-xl font-bold text-navy-900"
                  style={{
                    fontFamily:
                      "'Outfit', sans-serif",
                  }}
                >
                  Evidence
                </h2>

                <p className="text-sm text-navy-500 mt-1">
                  Add a photo of the issue if available.
                </p>
              </div>

              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-navy-200">
                    <img
                      src={photoPreview}
                      alt="Selected complaint evidence"
                      className="w-full max-h-80 object-cover"
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3">
                      <p className="text-white text-sm font-medium truncate">
                        {photo?.name}
                      </p>

                      <p className="text-white/70 text-xs mt-0.5">
                        Click to choose another photo
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-navy-200 rounded-2xl p-10 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-all">
                    <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-7 h-7 text-brand-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.7}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16l4.5-4.5a2 2 0 0 1 2.8 0L16 16m-2-2 1.5-1.5a2 2 0 0 1 2.8 0L20 14M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                        />
                        <circle
                          cx="8.5"
                          cy="8.5"
                          r="1.5"
                        />
                      </svg>
                    </div>

                    <p className="text-sm font-semibold text-navy-700">
                      Upload a photo
                    </p>

                    <p className="text-xs text-navy-400 mt-1">
                      PNG, JPG or JPEG
                    </p>

                    <p className="text-xs text-brand-600 font-medium mt-3">
                      Click to browse
                    </p>
                  </div>
                )}
              </label>

              <p className="text-xs text-navy-400 mt-4">
                Photo evidence is optional, but it can
                help the concerned department understand
                the issue.
              </p>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div>
              <div className="mb-7">
                <h2
                  className="text-xl font-bold text-navy-900"
                  style={{
                    fontFamily:
                      "'Outfit', sans-serif",
                  }}
                >
                  Review & Submit
                </h2>

                <p className="text-sm text-navy-500 mt-1">
                  Check your complaint details before
                  submitting.
                </p>
              </div>

              {/* Duplicate warning */}
              {checkingDuplicates && (
                <div className="mb-5 rounded-xl border border-brand-200 bg-brand-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />

                    <p className="text-sm text-brand-700">
                      Checking for nearby similar
                      complaints...
                    </p>
                  </div>
                </div>
              )}

              {!checkingDuplicates &&
                duplicates.length > 0 && (
                  <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <svg
                          className="w-5 h-5 text-amber-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.5m0 3h.01M10.3 4.7 2.8 18a2 2 0 0 0 1.75 3h14.9a2 2 0 0 0 1.75-3L13.7 4.7a2 2 0 0 0-3.4 0Z"
                          />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-amber-800">
                          Similar complaint found nearby
                        </h3>

                        <p className="text-xs text-amber-700 mt-1 mb-3">
                          There may already be a complaint
                          for a similar issue near this
                          location.
                        </p>

                        <div className="space-y-2">
                          {duplicates
                            .slice(0, 3)
                            .map(item => (
                              <div
                                key={
                                  item.complaintId
                                }
                                className="bg-white/70 border border-amber-200 rounded-lg p-3"
                              >
                                <p className="text-sm font-semibold text-navy-800">
                                  {item.title}
                                </p>

                                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-navy-500">
                                  <span>
                                    Complaint #
                                    {
                                      item.complaintId
                                    }
                                  </span>

                                  <span>
                                    {Math.round(
                                      item.distanceMeters
                                    )}
                                    m away
                                  </span>

                                  <span>
                                    {
                                      item.upvoteCount
                                    }{' '}
                                    upvotes
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Complaint summary */}
              <div className="space-y-4">
                <div className="rounded-xl border border-navy-200 p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-xs text-navy-400 mb-1">
                        Title
                      </p>

                      <p className="text-sm font-semibold text-navy-900">
                        {title}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setCurrentStep(1)
                      }
                      className="text-xs text-brand-600 font-semibold hover:text-brand-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-navy-200 p-4">
                    <p className="text-xs text-navy-400 mb-2">
                      Category
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {selectedCategory?.icon}
                      </span>

                      <span className="text-sm font-semibold text-navy-800">
                        {selectedCategory?.label}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-navy-200 p-4">
                    <p className="text-xs text-navy-400 mb-2">
                      Location
                    </p>

                    {latitude !== null && longitude !== null ? (
                      <>
                        <p className="text-sm font-semibold text-navy-800">
                          Location pinned
                        </p>

                        <a
                          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                          View on map
                        </a>

                        <p className="text-[11px] text-navy-400 mt-1">
                          {latitude.toFixed(4)}, {longitude.toFixed(4)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-navy-800">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-navy-200 p-4">
                  <p className="text-xs text-navy-400 mb-2">
                    Description
                  </p>

                  <p className="text-sm text-navy-700 leading-6 whitespace-pre-wrap">
                    {description}
                  </p>
                </div>

                {address.trim() && (
                  <div className="rounded-xl border border-navy-200 p-4">
                    <p className="text-xs text-navy-400 mb-2">
                      Address
                    </p>

                    <p className="text-sm text-navy-700">
                      {address}
                    </p>
                  </div>
                )}

                {photoPreview && (
                  <div className="rounded-xl border border-navy-200 p-4">
                    <p className="text-xs text-navy-400 mb-3">
                      Evidence
                    </p>

                    <img
                      src={photoPreview}
                      alt="Complaint evidence"
                      className="w-full max-h-56 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-navy-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-5 py-2.5 border border-navy-200 hover:bg-navy-50 text-navy-700 font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate('citizen-home')
                }
                disabled={submitting}
                className="px-5 py-2.5 border border-navy-200 hover:bg-navy-50 text-navy-700 font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleContinue}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {submitting && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}

                {submitting
                  ? 'Submitting...'
                  : 'Submit Complaint'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}