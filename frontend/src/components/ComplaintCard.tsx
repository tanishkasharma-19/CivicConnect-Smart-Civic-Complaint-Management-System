import type { Complaint, Page } from "../types"
import StatusBadge from "./StatusBadge"
import {
  MapPinIcon,
  ArrowUpIcon,
} from "./Icons"

const CATEGORY_COLORS: Record<string, string> = {
  ROAD: "bg-blue-50 text-blue-700",
  WATER: "bg-cyan-50 text-cyan-700",
  ELECTRICITY: "bg-yellow-50 text-yellow-700",
  GARBAGE: "bg-green-50 text-green-700",
  DRAINAGE: "bg-violet-50 text-violet-700",
  OTHER: "bg-slate-50 text-slate-700",
}

interface ComplaintCardProps {
  complaint: Complaint
  navigate: (
    page: Page,
    params?: {
      complaintId?: string
    }
  ) => void
  variant?: "grid" | "list"
}

function formatCategory(category: string) {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function timeAgo(date?: string) {
  if (!date) {
    return ""
  }

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return ""
  }

  const diff = Date.now() - parsed.getTime()
  const days = Math.floor(diff / 86400000)

  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 30) return `${days} days ago`

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })
}

function getCategoryEmoji(category: string) {
  switch (category?.toUpperCase()) {
    case "ROAD":
      return "🛣️"

    case "WATER":
      return "💧"

    case "ELECTRICITY":
      return "⚡"

    case "GARBAGE":
      return "🗑️"

    case "DRAINAGE":
      return "🌊"

    default:
      return "📋"
  }
}

export default function ComplaintCard({
  complaint,
  navigate,
  variant = "grid",
}: ComplaintCardProps) {
  const categoryColor =
    CATEGORY_COLORS[complaint.category?.toUpperCase()] ??
    "bg-slate-50 text-slate-700"

  const image =
    complaint.beforePhotoUrl ||
    complaint.afterPhotoUrl

  const handleClick = () => {
    navigate("citizen-detail", {
      complaintId: String(complaint.id),
    })
  }

  if (variant === "list") {
    return (
      <div
        onClick={handleClick}
        className="
          bg-white
          rounded-xl
          border border-navy-200/60
          p-3 sm:p-4
          hover:shadow-md
          transition-all
          cursor-pointer
          hover:border-brand-200
          flex flex-col sm:flex-row
          gap-3 sm:gap-4
          min-w-0
        "
      >
        <div
          className="
            w-full sm:w-20
            h-36 sm:h-20
            rounded-lg
            overflow-hidden
            flex-shrink-0
            bg-navy-100
          "
        >
          {image ? (
            <img
              src={image}
              alt={complaint.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {getCategoryEmoji(complaint.category)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <h3
              className="
                font-semibold
                text-navy-900
                text-sm
                leading-snug
                line-clamp-2
                min-w-0
                flex-1
              "
            >
              {complaint.title}
            </h3>

            <div className="flex-shrink-0">
              <StatusBadge
                status={complaint.status}
                size="sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 mt-1 min-w-0">
            <MapPinIcon className="w-3.5 h-3.5 text-navy-400 flex-shrink-0" />

            <span className="text-xs text-navy-500 line-clamp-1 min-w-0">
              {complaint.address || "Location not provided"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
            <span
              className={`
                text-xs font-medium
                px-2 py-0.5
                rounded-full
                ${categoryColor}
              `}
            >
              {formatCategory(complaint.category)}
            </span>

            <span className="text-xs text-navy-400">
              #{complaint.id}
            </span>

            {complaint.createdAt && (
              <span className="text-xs text-navy-400">
                {timeAgo(complaint.createdAt)}
              </span>
            )}

            <span className="flex items-center gap-1 text-xs text-navy-500">
              <ArrowUpIcon className="w-3.5 h-3.5" />
              {complaint.upvoteCount ?? 0}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className="
        bg-white
        rounded-2xl
        border border-navy-200/60
        overflow-hidden
        hover:shadow-lg
        transition-all
        duration-200
        cursor-pointer
        group
        hover:border-brand-300
        min-w-0
      "
    >
      <div className="relative h-40 sm:h-44 bg-navy-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={complaint.title}
            className="
              w-full h-full
              object-cover
              group-hover:scale-105
              transition-transform
              duration-300
            "
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-30">
              {getCategoryEmoji(complaint.category)}
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)]">
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="p-3 sm:p-4 min-w-0">
        <div className="flex items-start gap-2 mb-2 min-w-0">
          <span
            className={`
              text-xs font-medium
              px-2 py-0.5
              rounded-full
              flex-shrink-0
              ${categoryColor}
            `}
          >
            {formatCategory(complaint.category)}
          </span>

          <span className="text-xs text-navy-400 truncate">
            #{complaint.id}
          </span>
        </div>

        <h3
          className="
            font-semibold
            text-navy-900
            text-sm
            leading-snug
            line-clamp-2
            mb-2
          "
        >
          {complaint.title}
        </h3>

        <div className="flex items-center gap-1 mb-3 min-w-0">
          <MapPinIcon className="w-3.5 h-3.5 text-navy-400 flex-shrink-0" />

          <span className="text-xs text-navy-500 line-clamp-1 min-w-0">
            {complaint.address || "Location not provided"}
          </span>
        </div>

        <p className="text-xs text-navy-500 line-clamp-2 mb-3">
          {complaint.description}
        </p>

        <div
          className="
            flex flex-col
            xs:flex-row
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-2
            pt-3
            border-t border-navy-100
          "
        >
          <span className="text-xs text-navy-400">
            {timeAgo(complaint.createdAt)}
          </span>

          <div className="flex items-center gap-1 text-xs text-navy-500">
            <ArrowUpIcon className="w-3.5 h-3.5" />

            <span>
              {complaint.upvoteCount ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}