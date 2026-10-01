interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "full" | "icon"
  light?: boolean
}

export default function Logo({
  size = "md",
  variant = "full",
  light = false,
}: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-3xl" }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        width={s}
        height={s}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="44" height="44" rx="11" fill="#2563EB" />

        <path
          d="M22 7C17.03 7 13 11.03 13 16C13 22.5 22 35 22 35C22 35 31 22.5 31 16C31 11.03 26.97 7 22 7Z"
          fill="white"
        />

        <circle
          cx="22"
          cy="16"
          r="4.5"
          fill="#2563EB"
        />

        <path
          d="M7.5 19.5C6.5 17.5 6.5 15.5 7.5 13.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <path
          d="M5 22C3 18.5 3 13.5 5 10"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />

        <path
          d="M36.5 19.5C37.5 17.5 37.5 15.5 36.5 13.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <path
          d="M39 22C41 18.5 41 13.5 39 10"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />

        <rect
          x="14"
          y="36"
          width="5"
          height="5"
          rx="1"
          fill="white"
          opacity="0.55"
        />

        <rect
          x="20.5"
          y="34"
          width="5"
          height="7"
          rx="1"
          fill="white"
          opacity="0.55"
        />

        <rect
          x="27"
          y="37"
          width="4"
          height="4"
          rx="1"
          fill="white"
          opacity="0.55"
        />
      </svg>

      {variant === "full" && (
        <div className="leading-none">
          <span
            className={`font-display font-800 tracking-tight ${
              textSizes[size]
            } ${
              light
                ? "text-white"
                : "text-navy-900"
            }`}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
            }}
          >
            Civic<span className="text-brand-600">
              Connect
            </span>
          </span>
        </div>
      )}
    </div>
  )
}