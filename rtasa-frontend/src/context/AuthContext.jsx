import React, { createContext, useContext, useState } from 'react';

// Define roles and their permitted permissions
export const ROLES = {
  ADMIN: {
    id: 'admin',
    label: 'Admin',
    canStore: true,
    canReconstruct: true,
    canViewAudit: true,
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },
  SECURITY_OFFICER: {
    id: 'security_officer',
    label: 'Security Officer',
    canStore: false,
    canReconstruct: true,
    canViewAudit: true,
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
  },
  STANDARD_USER: {
    id: 'standard_user',
    label: 'Standard User',
    canStore: true,
    canReconstruct: false,
    canViewAudit: false,
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  }
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Default role for demo
  const [currentRoleKey, setCurrentRoleKey] = useState('ADMIN');

  const currentRole = ROLES[currentRoleKey] || ROLES.STANDARD_USER;

  return (
    <AuthContext.Provider
      value={{
        currentRoleKey,
        currentRole,
        setCurrentRoleKey,
        ROLES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}