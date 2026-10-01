import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LocationPickerProps {
  latitude: number
  longitude: number
  onChange: (latitude: number, longitude: number) => void
}

// Drawn with inline SVG so no marker image files are needed
const pinIcon = L.divIcon({
  className: '',
  html: `<svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" fill="#2563eb" stroke="#ffffff" stroke-width="1.2"/>
    <circle cx="12" cy="9" r="2.6" fill="#ffffff"/>
  </svg>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

/*
 * Small OpenStreetMap map with a draggable pin.
 * The citizen can drag the pin, or tap/click the map,
 * to correct the exact complaint location.
 */
export default function LocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onChangeRef = useRef(onChange)

  // Always call the latest onChange from map events
  useEffect(() => {
    onChangeRef.current = onChange
  })

  // Create the map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile, // keep page scrolling easy on phones
    }).setView([latitude, longitude], 16)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const marker = L.marker([latitude, longitude], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map)

    marker.on('dragend', () => {
      const position = marker.getLatLng()
      onChangeRef.current(position.lat, position.lng)
    })

    map.on('click', (event: L.LeafletMouseEvent) => {
      marker.setLatLng(event.latlng)
      onChangeRef.current(event.latlng.lat, event.latlng.lng)
    })

    mapRef.current = map
    markerRef.current = marker

    window.setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Move the pin when the location changes from outside
  // (Find Location / Use My Current Location)
  useEffect(() => {
    const map = mapRef.current
    const marker = markerRef.current

    if (!map || !marker) {
      return
    }

    const current = marker.getLatLng()

    if (
      Math.abs(current.lat - latitude) > 1e-7 ||
      Math.abs(current.lng - longitude) > 1e-7
    ) {
      marker.setLatLng([latitude, longitude])
      map.setView([latitude, longitude], map.getZoom())
    }
  }, [latitude, longitude])

  return (
    <div>
      <div
        ref={containerRef}
        className="h-64 w-full rounded-xl overflow-hidden border border-navy-200 z-0"
      />

      <p className="text-[11px] text-navy-400 mt-2">
        Drag the pin, or tap the map, to mark the exact spot of the issue.
      </p>
    </div>
  )
}
