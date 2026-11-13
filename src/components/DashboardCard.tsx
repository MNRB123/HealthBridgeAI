import React from 'react';
import { useNavigate } from 'react-router-dom';

type AccentColor = 'blue' | 'green' | 'purple' | 'amber';

interface DashboardCardProps {
  title: string;
  stat: string;
  statSub?: string;
  description: string;
  icon: React.ReactNode;
  accentColor: AccentColor;
  buttonLabel: string;
  buttonTo: string;
  trend?: { value: string; positive: boolean };
  sparkline?: number[]; // relative bar heights 1-5
}

const colorConfig: Record<AccentColor, {
  gradient: string;
  iconBg: string;
  iconRing: string;
  btn: string;
  btnHover: string;
  sparkBar: string;
  sparkBarActive: string;
  trendUp: string;
  trendDown: string;
  badge: string;
  badgeText: string;
  glow: string;
}> = {
  blue: {
    gradient: 'from-primary-600 to-primary-800',
    iconBg: 'bg-white/15',
    iconRing: 'ring-white/20',
    btn: 'bg-white text-primary-700',
    btnHover: 'hover:bg-primary-50',
    sparkBar: 'bg-white/25',
    sparkBarActive: 'bg-white/80',
    trendUp: 'text-green-300',
    trendDown: 'text-red-300',
    badge: 'bg-white/15',
    badgeText: 'text-white/80',
    glow: 'shadow-glow-blue',
  },
  green: {
    gradient: 'from-success-600 to-success-700',
    iconBg: 'bg-white/15',
    iconRing: 'ring-white/20',
    btn: 'bg-white text-success-700',
    btnHover: 'hover:bg-success-50',
    sparkBar: 'bg-white/25',
    sparkBarActive: 'bg-white/80',
    trendUp: 'text-green-200',
    trendDown: 'text-red-300',
    badge: 'bg-white/15',
    badgeText: 'text-white/80',
    glow: 'shadow-glow-green',
  },
  purple: {
    gradient: 'from-accent-600 to-accent-700',
    iconBg: 'bg-white/15',
    iconRing: 'ring-white/20',
    btn: 'bg-white text-accent-700',
    btnHover: 'hover:bg-accent-50',
    sparkBar: 'bg-white/25',
    sparkBarActive: 'bg-white/80',
    trendUp: 'text-green-300',
    trendDown: 'text-red-300',
    badge: 'bg-white/15',
    badgeText: 'text-white/80',
    glow: 'shadow-glow-purple',
  },
  amber: {
    gradient: 'from-warning-600 to-warning-700',
    iconBg: 'bg-white/15',
    iconRing: 'ring-white/20',
    btn: 'bg-white text-warning-700',
    btnHover: 'hover:bg-warning-50',
    sparkBar: 'bg-white/25',
    sparkBarActive: 'bg-white/80',
    trendUp: 'text-green-300',
    trendDown: 'text-red-300',
    badge: 'bg-white/15',
    badgeText: 'text-white/80',
    glow: 'shadow-glow-amber',
  },
};

const heightMap: Record<number, string> = {
  1: 'h-1',
  2: 'h-2',
  3: 'h-3',
  4: 'h-4',
  5: 'h-5',
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  stat,
  statSub,
  description,
  icon,
  accentColor,
  buttonLabel,
  buttonTo,
  trend,
  sparkline = [2, 3, 2, 4, 3, 5, 4],
}) => {
  const navigate = useNavigate();
  const c = colorConfig[accentColor];

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${c.gradient} ${c.glow} shadow-card hover:shadow-card-hover hover:scale-[1.01] transition-all duration-200 cursor-pointer group animate-slide-up`}
      onClick={() => navigate(buttonTo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(buttonTo)}
      aria-label={`${title}: ${stat}. ${description}`}
    >
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-hero-pattern opacity-100 pointer-events-none" />

      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative p-5 flex flex-col h-full">
        {/* Top row: icon + badge */}
        <div className="flex items-start justify-between mb-5">
          <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${c.iconBg} ring-1 ${c.iconRing} text-white backdrop-blur-sm`}>
            {icon}
          </div>
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${c.badge} ${c.badgeText} backdrop-blur-sm`}>
            Demo Data
          </span>
        </div>

        {/* Stat */}
        <div className="mb-1">
          <p className="text-[13px] font-medium text-white/70 mb-0.5">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white tracking-tight">{stat}</p>
            {statSub && <span className="text-sm text-white/60">{statSub}</span>}
          </div>
        </div>

        {/* Trend badge */}
        {trend && (
          <div className={`flex items-center gap-1 mb-2 ${trend.positive ? c.trendUp : c.trendDown}`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              {trend.positive ? (
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
            <span className="text-xs font-semibold">{trend.value}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-[13px] text-white/65 leading-relaxed mb-4 flex-1">{description}</p>

        {/* Sparkline */}
        <div className="flex items-end gap-1 mb-4 h-5">
          {sparkline.map((val, idx) => (
            <div
              key={idx}
              className={`flex-1 rounded-sm transition-all ${
                idx === sparkline.length - 1 ? c.sparkBarActive : c.sparkBar
              } ${heightMap[val] ?? 'h-3'}`}
            />
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate(buttonTo); }}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 ${c.btn} ${c.btnHover} shadow-sm group-hover:shadow-md`}
          aria-label={buttonLabel}
        >
          <span className="flex items-center justify-center gap-1.5">
            {buttonLabel}
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default DashboardCard;
