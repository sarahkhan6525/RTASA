import React from 'react';
import { Shield, Lock, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RoleSwitcher() {
  const { currentRoleKey, currentRole, setCurrentRoleKey, ROLES } = useAuth();

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
      <div className="flex items-center gap-1.5">
        <Shield className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
          Active Role:
        </span>
      </div>

      {/* Role Select Dropdown */}
      <div className="relative">
        <select
          value={currentRoleKey}
          onChange={(e) => setCurrentRoleKey(e.target.value)}
          className={`appearance-none text-xs font-semibold px-2.5 py-1 pr-6 rounded-lg border cursor-pointer focus:outline-none transition-all ${currentRole.badgeColor}`}
        >
          {Object.entries(ROLES).map(([key, role]) => (
            <option key={key} value={key} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              {role.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
      </div>
    </div>
  );
}