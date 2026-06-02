/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DormitoryRequest, Role } from '../types';
import { Check, X, ClipboardList, Clock, CheckCircle, XCircle, Info, Filter, Landmark } from 'lucide-react';

interface RequestsPanelProps {
  requests: DormitoryRequest[];
  currentRole: Role;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

export const RequestsPanel: React.FC<RequestsPanelProps> = ({
  requests,
  currentRole,
  onApproveRequest,
  onRejectRequest,
}) => {
  const [filterStatus, setFilterStatus] = useState<DormitoryRequest['status'] | 'ALL'>('PENDING');

  // Filter requests according to role and filter status
  const visibleRequests = requests.filter((req) => {
    // Role filter
    let meetsRole = false;
    if (currentRole === 'SUPER_ADMIN' || currentRole === 'USER') {
      meetsRole = true;
    } else if (currentRole === 'DORM_1_ADMIN' && req.dormId === 1) {
      meetsRole = true;
    } else if (currentRole === 'DORM_2_ADMIN' && req.dormId === 2) {
      meetsRole = true;
    } else if (currentRole === 'DORM_3_ADMIN' && req.dormId === 3) {
      meetsRole = true;
    }

    if (!meetsRole) return false;

    // Status filter
    if (filterStatus === 'ALL') return true;
    return req.status === filterStatus;
  });

  const getDormName = (id: 1 | 2 | 3) => {
    return `${id}-TTJ`;
  };

  const getStatusBadge = (status: DormitoryRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            Kutilmoqda
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Tasdiqlandi
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded-full font-bold uppercase">
            <XCircle className="w-3 h-3 text-red-600" />
            Rad etildi
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-brand-100 rounded-xl text-brand-700">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-850">
              {currentRole === 'SUPER_ADMIN' ? 'Ariza va So\'rovlar Nazorati' : 'Yuborilgan So\'rovlar Tarixi'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Talabalarni yotoqxonaga kiritish yoki chiqarish bo'yicha yuborilgan so'rovlarni boshqarish.
            </p>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl self-start sm:self-center">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((status) => {
            const isSelected = filterStatus === status;
            let label = 'Kutilmoqda';
            if (status === 'APPROVED') label = 'Tasdiqlangan';
            if (status === 'REJECTED') label = 'Rad etilgan';
            if (status === 'ALL') label = 'Barchasi';

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests table / Card view */}
      {visibleRequests.length > 0 ? (
        <div className="space-y-4">
          {visibleRequests.map((req) => (
            <div
              key={req.id}
              id={`request-card-${req.id}`}
              className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:shadow-xs ${
                req.status === 'PENDING'
                  ? 'border-amber-100 bg-amber-50/10'
                  : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase border ${
                    req.type === 'ADD'
                      ? 'bg-blue-50 text-blue-800 border-blue-150'
                      : 'bg-red-50 text-red-800 border-red-150'
                  }`}>
                    {req.type === 'ADD' ? 'Kiritish so\'rovi' : 'Chiqarish so\'rovi'}
                  </span>
                  
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 font-mono">
                    <Landmark className="w-3.5 h-3.5" />
                    {getDormName(req.dormId)}, xona {req.roomNumber}, joy {req.bedNumber}
                  </span>

                  {getStatusBadge(req.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Talaba</span>
                    <span className="font-extrabold text-slate-800 text-sm block">
                      {req.studentName}
                    </span>
                  </div>
                  {req.type === 'ADD' && (
                    <>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Kurs / Guruh</span>
                        <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                          {req.course}-kurs • {req.group}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Fakultet</span>
                        <span className="text-xs font-semibold text-slate-700 block truncate mt-0.5">
                          {req.faculty}
                        </span>
                      </div>
                    </>
                  )}
                  {req.type === 'REMOVE' && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase font-mono">Ma'lumot</span>
                      <span className="text-xs italic text-slate-600 block mt-0.5">
                        Tizimdan chiqarish so'rovi TTJ admini tomonidan kiritilgan.
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1.5 border-t border-slate-100/60 font-medium">
                  <Info className="w-3 h-3 text-slate-400" />
                  <span>Ariza yuboruvchi: <span className="text-slate-550 font-bold">{req.requestedBy}</span> ({new Date(req.requestedAt).toLocaleDateString()} {new Date(req.requestedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>
                </div>
              </div>

              {/* Action columns */}
              {req.status === 'PENDING' && (
                <div className="flex md:flex-col items-center sm:justify-end md:justify-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 md:pl-5">
                  {currentRole === 'SUPER_ADMIN' ? (
                    <>
                      <button
                        onClick={() => onApproveRequest(req.id)}
                        className="w-full sm:w-auto md:w-28 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Tasdiqlash</span>
                      </button>
                      <button
                        onClick={() => onRejectRequest(req.id)}
                        className="w-full sm:w-auto md:w-28 px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-slate-205 text-xs font-extrabold rounded-lg shadow-2xs transition-all focus:ring-2 focus:ring-red-500 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Rad Etish</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-right">
                      <p className="text-[10px] text-amber-700 font-bold italic block bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-100">
                        Tasdiq kutilmoqda. Super administratorga so'rov yuborilgan
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <Clock className="w-10 h-10 mb-2 text-slate-250 animate-pulse" />
          <p className="text-sm font-semibold text-slate-500">Hech qanday so'rov topilmadi!</p>
          <p className="text-xs text-slate-400 mt-1">Hozirgi vaqtda barcha so'rovlar ko'rib chiqilgan.</p>
        </div>
      )}
    </div>
  );
};
