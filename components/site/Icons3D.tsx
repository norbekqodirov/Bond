import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
};

export function Trophy3D({ className }: IconProps) {
  return (
    <div className={cn("relative h-32 w-32", className)}>
      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-brand-primary/20 via-brand-primary/5 to-brand-accent/20 blur-2xl" />
      <svg viewBox="0 0 140 140" className="relative h-full w-full">
        <defs>
          <linearGradient id="cupBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#2596be" />
            <stop offset="1" stopColor="#8dd2ea" />
          </linearGradient>
          <linearGradient id="cupGold" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#0188dc" />
            <stop offset="1" stopColor="#7cc7e6" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1E293B" floodOpacity="0.25" />
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <path
            d="M42 36h56l-6 36c-3 17-16 28-28 28s-25-11-28-28l-6-36z"
            fill="url(#cupBody)"
          />
          <path
            d="M30 42c-8 2-13 10-12 20 2 18 18 26 30 27"
            fill="none"
            stroke="url(#cupGold)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M110 42c8 2 13 10 12 20-2 18-18 26-30 27"
            fill="none"
            stroke="url(#cupGold)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect x="56" y="100" width="28" height="16" rx="6" fill="url(#cupGold)" />
          <rect x="44" y="114" width="52" height="14" rx="7" fill="#F8FAFC" />
        </g>
        <circle cx="100" cy="30" r="6" fill="#0188dc" />
        <circle cx="40" cy="26" r="4" fill="#8dd2ea" />
      </svg>
    </div>
  );
}

export function Cube3D({ className }: IconProps) {
  return (
    <div className={cn("relative h-24 w-24", className)}>
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-brand-primary/20 via-white to-brand-accent/20 blur-xl" />
      <svg viewBox="0 0 120 120" className="relative h-full w-full">
        <defs>
          <linearGradient id="cubeFront" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#2596be" />
            <stop offset="1" stopColor="#72c4e3" />
          </linearGradient>
          <linearGradient id="cubeSide" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#1c5f85" />
            <stop offset="1" stopColor="#2596be" />
          </linearGradient>
          <linearGradient id="cubeTop" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#0188dc" />
            <stop offset="1" stopColor="#7cc7e6" />
          </linearGradient>
        </defs>
        <polygon points="60,16 20,36 60,56 100,36" fill="url(#cubeTop)" />
        <polygon points="20,36 20,84 60,104 60,56" fill="url(#cubeSide)" />
        <polygon points="60,56 60,104 100,84 100,36" fill="url(#cubeFront)" />
      </svg>
    </div>
  );
}

export function Medal3D({ className }: IconProps) {
  return (
    <div className={cn("relative h-24 w-24", className)}>
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-brand-accent/30 via-white to-brand-primary/20 blur-xl" />
      <svg viewBox="0 0 120 120" className="relative h-full w-full">
        <defs>
          <radialGradient id="medal" cx="0.35" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#7cc7e6" />
            <stop offset="1" stopColor="#0188dc" />
          </radialGradient>
        </defs>
        <path d="M34 14h20l6 18H40l-6-18z" fill="#2596be" />
        <path d="M66 14h20l-6 18H60l6-18z" fill="#1c5f85" />
        <circle cx="60" cy="70" r="28" fill="url(#medal)" />
        <circle cx="60" cy="70" r="16" fill="#E6F4FB" />
      </svg>
    </div>
  );
}

export function Book3D({ className }: IconProps) {
  return (
    <div className={cn("relative h-20 w-20", className)}>
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-brand-primary/20 via-white to-brand-accent/20 blur-xl" />
      <svg viewBox="0 0 120 120" className="relative h-full w-full">
        <defs>
          <linearGradient id="bookCover" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#2596be" />
            <stop offset="1" stopColor="#8dd2ea" />
          </linearGradient>
          <linearGradient id="bookPages" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E2E8F0" />
          </linearGradient>
        </defs>
        <rect x="20" y="26" width="36" height="68" rx="10" fill="url(#bookCover)" />
        <rect x="62" y="26" width="36" height="68" rx="10" fill="#1c5f85" />
        <rect x="30" y="34" width="18" height="50" rx="6" fill="url(#bookPages)" />
        <rect x="72" y="34" width="18" height="50" rx="6" fill="url(#bookPages)" />
      </svg>
    </div>
  );
}

export function Calculator3D({ className }: IconProps) {
  return (
    <div className={cn("relative h-20 w-20", className)}>
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-brand-primary/20 via-white to-brand-accent/20 blur-xl" />
      <svg viewBox="0 0 120 120" className="relative h-full w-full">
        <defs>
          <linearGradient id="calcBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#1c5f85" />
            <stop offset="1" stopColor="#2596be" />
          </linearGradient>
          <linearGradient id="calcScreen" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#E0F2FE" />
            <stop offset="1" stopColor="#F8FAFC" />
          </linearGradient>
        </defs>
        <rect x="28" y="18" width="64" height="84" rx="16" fill="url(#calcBody)" />
        <rect x="40" y="30" width="40" height="18" rx="6" fill="url(#calcScreen)" />
        <g fill="#F8FAFC">
          <rect x="40" y="56" width="14" height="12" rx="4" />
          <rect x="58" y="56" width="14" height="12" rx="4" />
          <rect x="76" y="56" width="14" height="12" rx="4" />
          <rect x="40" y="72" width="14" height="12" rx="4" />
          <rect x="58" y="72" width="14" height="12" rx="4" />
          <rect x="76" y="72" width="14" height="12" rx="4" />
        </g>
      </svg>
    </div>
  );
}

export function Code3D({ className }: IconProps) {
  return (
    <div className={cn("relative h-20 w-20", className)}>
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-brand-primary/20 via-white to-brand-accent/20 blur-xl" />
      <svg viewBox="0 0 120 120" className="relative h-full w-full">
        <defs>
          <linearGradient id="codePanel" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#0188dc" />
            <stop offset="1" stopColor="#7cc7e6" />
          </linearGradient>
        </defs>
        <rect x="22" y="30" width="76" height="56" rx="16" fill="url(#codePanel)" />
        <path
          d="M52 48l-12 12 12 12"
          stroke="#1c5f85"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M68 48l12 12-12 12"
          stroke="#1c5f85"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function Brain3D({ className }: IconProps) {
  return (
    <div className={cn("relative h-20 w-20", className)}>
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-brand-primary/20 via-white to-brand-accent/20 blur-xl" />
      <svg viewBox="0 0 120 120" className="relative h-full w-full">
        <defs>
          <linearGradient id="brainFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#0188dc" />
            <stop offset="1" stopColor="#7cc7e6" />
          </linearGradient>
        </defs>
        <path
          d="M40 72c-10 0-18-8-18-18s8-18 18-18c2 0 4 0 6 1 4-6 11-10 19-10 12 0 22 9 22 21 8 2 13 9 13 17 0 10-8 18-18 18H40z"
          fill="url(#brainFill)"
        />
        <path
          d="M46 46c4 0 7 3 7 7m12-7c4 0 7 3 7 7m-20 8c3 2 7 2 10 0"
          stroke="#1c5f85"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
