interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
  color?:
    | "blue"
    | "green"
    | "orange"
    | "red"
    | "purple"
    | "cyan"
  subtitle?: string
}

const COLOR_MAP = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
  },
  green: {
    icon: "bg-green-50 text-green-600",
    border: "border-green-100",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
    border: "border-orange-100",
  },
  red: {
    icon: "bg-red-50 text-red-600",
    border: "border-red-100",
  },
  purple: {
    icon: "bg-violet-50 text-violet-600",
    border: "border-violet-100",
  },
  cyan: {
    icon: "bg-cyan-50 text-cyan-600",
    border: "border-cyan-100",
  },
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  color = "blue",
  subtitle,
}: StatCardProps) {
  const colors = COLOR_MAP[color]

  return (
    <div className="bg-white rounded-2xl border border-navy-200/60 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-navy-500 mb-1">
            {label}
          </p>

          <p
            className="text-xl font-bold text-navy-900"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {value}
          </p>

          {subtitle && (
            <p className="text-xs text-navy-400 mt-0.5">
              {subtitle}
            </p>
          )}

          {trend && (
            <p
              className={`text-xs font-medium mt-1.5 ${
                trendUp
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>

        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.icon} [&>svg]:w-4 [&>svg]:h-4`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}