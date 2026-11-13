import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, badge, onClick }) => {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
          isActive
            ? 'bg-primary-600 text-white shadow-glow-blue'
            : 'text-sidebar-text hover:bg-white/8 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator bar */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full" />
          )}

          <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-sidebar-text group-hover:text-white'}`}>
            {icon}
          </span>
          <span className="flex-1 truncate">{label}</span>
          {badge && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
              isActive ? 'bg-white/25 text-white' : 'bg-primary-600 text-white'
            }`}>
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

export default NavItem;
