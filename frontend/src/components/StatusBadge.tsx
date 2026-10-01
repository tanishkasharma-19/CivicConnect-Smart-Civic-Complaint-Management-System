interface StatusBadgeProps {
  status: string
  size?: "sm" | "md"
}

const STATUS_STYLES: Record<string, string> = {
  REPORTED: "bg-gray-100 text-gray-700",
  VERIFIED: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-purple-100 text-purple-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  ESCALATED: "bg-red-100 text-red-700",
  CLOSED: "bg-slate-100 text-slate-700",
  REJECTED: "bg-red-100 text-red-700",
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default function StatusBadge({
  status,
  size = "md",
}: StatusBadgeProps) {
  const style =
    STATUS_STYLES[status?.toUpperCase()] ??
    "bg-gray-100 text-gray-700"

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${style} ${
        size === "sm"
          ? "px-2 py-0.5 text-[11px]"
          : "px-2.5 py-1 text-xs"
      }`}
    >
      {formatStatus(status)}
    </span>
  )
}