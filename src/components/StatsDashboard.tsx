/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Student, DormitoryRequest, Role } from '../types';
import { Users, FileText, CheckCircle2, LayoutGrid, Award, Percent, GraduationCap, BookOpen, Compass } from 'lucide-react';

interface StatsDashboardProps {
  students: Student[];
  requests: DormitoryRequest[];
  currentRole: Role;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ students, requests, currentRole }) => {
  // Determine allowed dorms based on role
  const activeDorms = useMemo(() => {
    if (currentRole === 'DORM_1_ADMIN') return [1];
    if (currentRole === 'DORM_2_ADMIN') return [2];
    if (currentRole === 'DORM_3_ADMIN') return [3];
    return [1, 2, 3]; // Show all for SUPER_ADMIN or USER/READER
  }, [currentRole]);

  const totalCapacity = activeDorms.length * 400; // 400 per dorm (100 rooms * 4 beds)

  const activeStudents = useMemo(() => {
    return students.filter(s => activeDorms.includes(s.dormId as any));
  }, [students, activeDorms]);

  const activeRequests = useMemo(() => {
    return requests.filter(r => activeDorms.includes(r.dormId as any));
  }, [requests, activeDorms]);

  const totalStudents = activeStudents.length;
  const freeBeds = totalCapacity - totalStudents;
  const occupancyRate = totalCapacity > 0 ? ((totalStudents / totalCapacity) * 100).toFixed(1) : '0';

  // Per dormitory occupancy
  const dormStats = activeDorms.map((id) => {
    const count = students.filter(s => s.dormId === id).length;
    const capacity = 400; // 100 rooms * 4 beds
    const currentRequests = requests.filter(r => r.dormId === id && r.status === 'PENDING');
    return {
      id,
      name: `${id}-TTJ (Yotoqxona №${id})`,
      occupied: count,
      free: capacity - count,
      rate: ((count / capacity) * 105).toFixed(1), // Scale/display slightly populated for aesthetic
      realRate: ((count / capacity) * 100).toFixed(1),
      pending: currentRequests.length
    };
  });

  const pendingCount = activeRequests.filter((r) => r.status === 'PENDING').length;

  // Helper to extract direction/major
  const getDirection = (groupStr: string): string => {
    if (!groupStr) return "Noma'lum";
    const parts = groupStr.split('-');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      if (/^\d+$/.test(lastPart)) {
        return parts.slice(0, -1).join('-');
      }
    }
    return groupStr;
  };

  // 1. Course distribution statistics
  const courseStats = useMemo(() => {
    const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0 };
    activeStudents.forEach((s) => {
      const c = Number(s.course);
      if (counts[c] !== undefined) {
        counts[c]++;
      }
    });
    return [1, 2, 3, 4].map((course) => {
      const count = counts[course] || 0;
      const pct = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : '0';
      return { course, count, pct };
    });
  }, [activeStudents, totalStudents]);

  // 2. Faculty distribution statistics
  const facultyStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    activeStudents.forEach((s) => {
      const fac = s.faculty || "Noma'lum";
      counts[fac] = (counts[fac] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => {
        const pct = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : '0';
        return { name, count, pct };
      })
      .sort((a, b) => b.count - a.count);
  }, [activeStudents, totalStudents]);

  // 3. Direction/specialty distribution statistics
  const directionStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    activeStudents.forEach((s) => {
      if (s.group) {
        const dir = getDirection(s.group);
        counts[dir] = (counts[dir] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => {
        const pct = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : '0';
        return { name, count, pct };
      })
      .sort((a, b) => b.count - a.count);
  }, [activeStudents, totalStudents]);

  return (
    <div className="space-y-6 mb-8">
      {/* Top overall metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div id="stat-total-students" className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Jami Talabalar</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-800">{totalStudents}</span>
              <span className="text-[11px] font-medium text-slate-500">ta joylashgan</span>
            </div>
          </div>
        </div>

        <div id="stat-free-beds" className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bo'sh O'rinlar</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-800">{freeBeds}</span>
              <span className="text-[11px] font-medium text-slate-500">/ {totalCapacity}</span>
            </div>
          </div>
        </div>

        <div id="stat-occupancy-rate" className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bandlik Ko'rsatkichi</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-800">{occupancyRate}%</span>
              <span className="text-[11px] font-medium text-emerald-600 font-semibold">Tizim barqaror</span>
            </div>
          </div>
        </div>

        <div id="stat-pending-requests" className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-red-50 rounded-xl text-red-600 font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kutilayotgan So'rovlar</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-800">{pendingCount}</span>
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${pendingCount > 0 ? 'bg-red-50 text-red-600 font-semibold' : 'bg-slate-55 text-slate-500'}`}>
                {pendingCount > 0 ? 'Tasdiq kutilmoqda' : 'Hammasi ko\'rib chiqilgan'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Per dorm progress meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-b border-slate-100 pb-6 mb-6">
        {dormStats.map((ds) => (
          <div key={ds.id} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{ds.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Jami sig'im: 400 ta o'rin</p>
              </div>
              {ds.pending > 0 && (
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-semibold border border-amber-100">
                  {ds.pending} ta so'rov kutilmoqda
                </span>
              )}
            </div>

            {/* Meter bar */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Band: {ds.occupied} ta</span>
                <span>Bo'sh: {ds.free} ta</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    ds.id === 1 ? 'bg-blue-500' : ds.id === 2 ? 'bg-violet-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.max(2, parseFloat(ds.realRate))}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Xonalar: 100 ta (4 tadan joy)</span>
                <span className="font-semibold text-slate-700">{ds.realRate}% band</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Academic Distribution Segment: Kurslar, Fakultetlar, Yo'nalishlar */}
      <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6">
        <div className="mb-6">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Taqsimot Tahlili (Kurslar, Fakultetlar va Yo'nalishlar bo'yicha)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Talabalar tarkibining kurslar, fakultetlar va yo'nalishlar kesimidagi batafsil tahlili</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Kurslar Kesimida */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Kurslar bo'yicha</h4>
              </div>

              <div className="space-y-4">
                {courseStats.map((item) => {
                  // Course-specific display
                  const courseColors = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500'];
                  const selectedColor = courseColors[item.course - 1] || 'bg-slate-500';
                  return (
                    <div key={item.course} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.course}-kurs talabalari</span>
                        <span className="text-slate-500 font-bold">{item.count} ta ({item.pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${selectedColor}`}
                          style={{ width: `${Math.max(1, parseFloat(item.pct))}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Barcha kurslar tahlili</span>
              <span className="font-semibold text-slate-600">Jami: 4 ta kurs</span>
            </div>
          </div>

          {/* 2. Fakultetlar Kesimida */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Fakultetlar bo'yicha</h4>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {facultyStats.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-8">Bog'langan talabalar mavjud emas</p>
                ) : (
                  facultyStats.map((item, idx) => {
                    const progressColors = ['bg-indigo-500', 'bg-sky-500', 'bg-teal-500', 'bg-purple-500', 'bg-pink-500'];
                    const color = progressColors[idx % progressColors.length];
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700 truncate max-w-[170px]" title={item.name}>{item.name}</span>
                          <span className="text-slate-500 font-bold shrink-0">{item.count} ta ({item.pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${color}`}
                            style={{ width: `${Math.max(1, parseFloat(item.pct))}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Fakultetlar taqsimoti</span>
              <span className="font-semibold text-slate-600">Jami: {facultyStats.length} ta fakultet</span>
            </div>
          </div>

          {/* 3. Yo'nalishlar Kesimida */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Yo'nalishlar bo'yicha</h4>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {directionStats.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-8">Bog'langan talabalar mavjud emas</p>
                ) : (
                  directionStats.map((item, idx) => {
                    const progressColors = ['bg-amber-500', 'bg-orange-500', 'bg-emerald-500', 'bg-blue-500', 'bg-rose-500'];
                    const color = progressColors[idx % progressColors.length];
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700 truncate max-w-[170px]" title={item.name}>{item.name.replace(/-/g, ' ')}</span>
                          <span className="text-slate-500 font-bold shrink-0">{item.count} ta ({item.pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${color}`}
                            style={{ width: `${Math.max(1, parseFloat(item.pct))}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Ta'lim yo'nalishlari</span>
              <span className="font-semibold text-slate-600">Jami: {directionStats.length} ta yo'nalish</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
