/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Student, Role } from '../types';
import { Search, Filter, Landmark, Users, Calendar, Phone, Trash2, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  currentRole: Role;
  onRequestEviction: (student: Student) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  currentRole,
  onRequestEviction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDorm, setFilterDorm] = useState<'ALL' | 1 | 2 | 3>('ALL');
  const [filterCourse, setFilterCourse] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [filterFaculty, setFilterFaculty] = useState<string>('ALL');
  const [filterDirection, setFilterDirection] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDorm, filterCourse, filterFaculty, filterDirection]);

  // helper to extract Yo'nalish/Direction from group (e.g., 'Matematika-202' -> 'Matematika')
  const getDirection = (groupStr: string): string => {
    if (!groupStr) return '';
    const parts = groupStr.split('-');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      if (/^\d+$/.test(lastPart)) {
        return parts.slice(0, -1).join('-');
      }
    }
    return groupStr;
  };

  // Get all unique faculties dynamically
  const uniqueFaculties = useMemo(() => {
    const facs = new Set<string>();
    // Filter out only according to role access to avoid showing choices that have no available students for specific admin
    students.forEach((s) => {
      if (currentRole === 'DORM_1_ADMIN' && s.dormId !== 1) return;
      if (currentRole === 'DORM_2_ADMIN' && s.dormId !== 2) return;
      if (currentRole === 'DORM_3_ADMIN' && s.dormId !== 3) return;
      
      if (s.faculty) facs.add(s.faculty);
    });
    return Array.from(facs).sort();
  }, [students, currentRole]);

  // Get all unique directions dynamically (can cascade filter based on selected faculty)
  const uniqueDirections = useMemo(() => {
    const dirs = new Set<string>();
    students.forEach((s) => {
      if (currentRole === 'DORM_1_ADMIN' && s.dormId !== 1) return;
      if (currentRole === 'DORM_2_ADMIN' && s.dormId !== 2) return;
      if (currentRole === 'DORM_3_ADMIN' && s.dormId !== 3) return;
      
      if (filterFaculty === 'ALL' || s.faculty === filterFaculty) {
        if (s.group) {
          dirs.add(getDirection(s.group));
        }
      }
    });
    return Array.from(dirs).sort();
  }, [students, filterFaculty, currentRole]);

  const handleFacultyChange = (newFaculty: string) => {
    setFilterFaculty(newFaculty);
    setFilterDirection('ALL');
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Role-based dormitory restriction
      if (currentRole === 'DORM_1_ADMIN' && s.dormId !== 1) return false;
      if (currentRole === 'DORM_2_ADMIN' && s.dormId !== 2) return false;
      if (currentRole === 'DORM_3_ADMIN' && s.dormId !== 3) return false;

      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.faculty.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchDorm = filterDorm === 'ALL' || s.dormId === filterDorm;
      const matchCourse = filterCourse === 'ALL' || s.course === filterCourse;
      const matchFaculty = filterFaculty === 'ALL' || s.faculty === filterFaculty;
      const matchDirection = filterDirection === 'ALL' || getDirection(s.group) === filterDirection;

      return matchSearch && matchDorm && matchCourse && matchFaculty && matchDirection;
    });
  }, [students, searchQuery, filterDorm, filterCourse, filterFaculty, filterDirection, currentRole]);

  const studentsPerPage = 5;
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * studentsPerPage;
    return filteredStudents.slice(startIndex, startIndex + studentsPerPage);
  }, [filteredStudents, currentPage]);

  const hasAccessToDorm = (dormId: 1 | 2 | 3): boolean => {
    if (currentRole === 'SUPER_ADMIN') return true;
    if (currentRole === 'DORM_1_ADMIN' && dormId === 1) return true;
    if (currentRole === 'DORM_2_ADMIN' && dormId === 2) return true;
    if (currentRole === 'DORM_3_ADMIN' && dormId === 3) return true;
    return false;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-100 rounded-xl text-blue-700">
            <Users className="w-5 h-5 flex-shrink-0" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-850">
              Talabalar Umumiy Ro'yxati
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hozirda yotoqxonalarga joylashib ulgurgan {students.length} ta faol talabalar reyestri hamda ma'lumotlari.
            </p>
          </div>
        </div>

        {/* Counter */}
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-center">
          Jami filtrlandi: {filteredStudents.length} ta
        </span>
      </div>

      {/* Filters bar */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Ism, guruh yoki fakultet bo'yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-250 text-xs rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
            />
            <Search className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 px-2 flex-shrink-0">Kursi:</span>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value) as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden w-full cursor-pointer"
            >
              <option value="ALL">Barchasi (1-4-kurs)</option>
              <option value="1">1-kurs</option>
              <option value="2">2-kurs</option>
              <option value="3">3-kurs</option>
              <option value="4">4-kurs</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 px-2 flex-shrink-0">TTJ:</span>
            {currentRole === 'SUPER_ADMIN' || currentRole === 'USER' ? (
              <select
                value={filterDorm}
                onChange={(e) => setFilterDorm(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value) as any)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden w-full cursor-pointer"
              >
                <option value="ALL">Barcha yotoqxonalar</option>
                <option value="1">1-TTJ (Yotoqxona №1)</option>
                <option value="2">2-TTJ (Yotoqxona №2)</option>
                <option value="3">3-TTJ (Yotoqxona №3)</option>
              </select>
            ) : (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                {currentRole === 'DORM_1_ADMIN' ? '1-TTJ (Yotoqxona №1)' : currentRole === 'DORM_2_ADMIN' ? '2-TTJ (Yotoqxona №2)' : '3-TTJ (Yotoqxona №3)'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 px-2 flex-shrink-0">Fakultet:</span>
            <select
              value={filterFaculty}
              onChange={(e) => handleFacultyChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden w-full cursor-pointer focus:w-full"
            >
              <option value="ALL">Barcha fakultetlar</option>
              {uniqueFaculties.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 px-2 flex-shrink-0">Yo'nalish:</span>
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden w-full cursor-pointer"
            >
              <option value="ALL">Barcha yo'nalishlar</option>
              {uniqueDirections.map((dir) => (
                <option key={dir} value={dir}>
                  {dir.replace(/-/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student List View */}
      {filteredStudents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4 font-semibold">Familiya va Ismi</th>
                <th className="py-3 px-4 font-semibold">Fakulteti</th>
                <th className="py-3 px-4 font-semibold">Yo'nalishi</th>
                <th className="py-3 px-4 font-semibold">Kursi</th>
                <th className="py-3 px-4 font-semibold">Yotoqxona joylashuvi</th>
                <th className="py-3 px-4 text-center font-semibold">Operatsiya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedStudents.map((std) => {
                const isUserAdminOfStudentDorm = hasAccessToDorm(std.dormId);
                return (
                  <tr key={std.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono bg-emerald-50 text-emerald-700">
                          {std.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">{std.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: #{std.id.substring(0, 6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {std.faculty}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-700">{getDirection(std.group).replace(/-/g, ' ')}</p>
                      <span className="text-[10px] text-slate-400 font-semibold font-mono">Guruh: {std.group}</span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-600 font-mono">
                      {std.course}-kurs
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 font-bold text-[10px] rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          <Landmark className="w-3 h-3 text-blue-600" />
                          {std.dormId}-TTJ
                        </span>
                        <div className="text-[10px] text-slate-500 font-semibold font-mono">
                          Xona: <span className="text-slate-700">{std.roomNumber}</span> • Joy: <span className="text-slate-700 font-extrabold">{std.bedNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isUserAdminOfStudentDorm && currentRole !== 'USER' ? (
                        <button
                          onClick={() => onRequestEviction(std)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-150 transition-all cursor-pointer animate-fade-in"
                          title="Tizimdan chiqarish so'rovi berish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-350 italic font-medium">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <Users className="w-10 h-10 mb-2.5 text-slate-200" />
          <p className="text-sm font-semibold text-slate-500">Hech qanday talaba topilmadi!</p>
          <p className="text-xs text-slate-405 mt-1">Ism noto'g'ri kiritilgan bo'lishi mumkin yoki filtringiz bo'sh.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredStudents.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 mt-5 gap-4">
          <span className="text-xs text-slate-500 font-semibold">
            Ko'rsatilmoqda <span className="font-bold text-slate-700">{(currentPage - 1) * studentsPerPage + 1} - {Math.min(currentPage * studentsPerPage, filteredStudents.length)}</span> tadan <span className="font-bold text-slate-700">{filteredStudents.length}</span> tasi
          </span>
          <div className="flex items-center gap-1.5 animate-fade-in">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border border-slate-200 text-slate-600 transition-all ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-slate-50'
                  : 'hover:bg-slate-50 hover:text-slate-800 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const shouldShow = page === 1 || page === totalPages || Math.abs(currentPage - page) <= 1;
              if (!shouldShow) {
                if (page === 2 && currentPage > 3) {
                  return <span key="ellipsis-start" className="text-slate-400 text-xs px-1 select-none">...</span>;
                }
                if (page === totalPages - 1 && currentPage < totalPages - 2) {
                  return <span key="ellipsis-end" className="text-slate-400 text-xs px-1 select-none">...</span>;
                }
                return null;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    currentPage === page
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-extrabold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border border-slate-200 text-slate-600 transition-all ${
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed bg-slate-50'
                  : 'hover:bg-slate-50 hover:text-slate-800 cursor-pointer'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
