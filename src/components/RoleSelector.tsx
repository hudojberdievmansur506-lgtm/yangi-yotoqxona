/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Role } from '../types';
import { Shield, User, Users, Landmark, Key } from 'lucide-react';

interface RoleSelectorProps {
  currentRole: Role;
  onChangeRole: (role: Role) => void;
  pendingRequestsCount: number;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  onChangeRole,
  pendingRequestsCount,
}) => {
  const rolesInfo: { role: Role; label: string; description: string; color: string; icon: React.ReactNode }[] = [
    {
      role: 'USER',
      label: 'Foydalanuvchi (Mehmon)',
      description: 'Faqat statistikani va bandlikni ko\'rish (Read-only)',
      color: 'bg-slate-100 border-slate-200 text-slate-700 active-slate',
      icon: <User className="w-4 h-4 text-slate-500" />
    },
    {
      role: 'SUPER_ADMIN',
      label: 'Super Admin',
      description: 'Cheksiz huquqlar, so\'rovlarni tasdiqlash/rad etish',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800 active-emerald',
      icon: <Shield className="w-4 h-4 text-emerald-600" />
    },
    {
      role: 'DORM_1_ADMIN',
      label: '1-TTJ Admin',
      description: '1-yotoqxona uchun so\'rovlar yuborish va monitoring',
      color: 'bg-blue-50 border-blue-200 text-blue-800 active-blue',
      icon: <Landmark className="w-4 h-4 text-blue-600" />
    },
    {
      role: 'DORM_2_ADMIN',
      label: '2-TTJ Admin',
      description: '2-yotoqxona uchun so\'rovlar yuborish va monitoring',
      color: 'bg-violet-50 border-violet-200 text-violet-800 active-violet',
      icon: <Landmark className="w-4 h-4 text-violet-600" />
    },
    {
      role: 'DORM_3_ADMIN',
      label: '3-TTJ Admin',
      description: '3-yotoqxona uchun so\'rovlar yuborish va monitoring',
      color: 'bg-amber-50 border-amber-200 text-amber-800 active-amber',
      icon: <Landmark className="w-4 h-4 text-amber-600" />
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-400" />
            Tizimdagi Rolni Tanlash
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Har xil huquqlarni sinab ko'rish uchun quyidagi rollardan birini tanlang. TTJ adminlari yuborgan so'rovlar Super Admin tomonidan tasdiqlanadi.
          </p>
        </div>
        
        {pendingRequestsCount > 0 && currentRole === 'SUPER_ADMIN' && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-150 animate-pulse font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Sizda {pendingRequestsCount} ta kutilayotgan so'rov bor!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {rolesInfo.map((info) => {
          const isActive = currentRole === info.role;
          return (
            <button
              key={info.role}
              id={`role-btn-${info.role.toLowerCase()}`}
              onClick={() => onChangeRole(info.role)}
              className={`flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all duration-300 relative overflow-hidden ${
                isActive 
                  ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/10' 
                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {info.icon}
                </div>
                <span className="font-semibold text-xs text-slate-800 truncate">{info.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                {info.description}
              </p>
              
              {isActive && (
                <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                  <span className="absolute transform rotate-45 bg-emerald-600 text-[9px] text-white py-0.5 px-3 font-semibold translate-x-3 -translate-y-2">
                    Faol
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
