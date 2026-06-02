/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Student, DormitoryRequest, Role } from '../types';
import { DoorOpen, Search, Filter, Compass, AlertCircle, PlusCircle, UserMinus, Clock, Users } from 'lucide-react';

interface RoomsGridProps {
  students: Student[];
  requests: DormitoryRequest[];
  currentRole: Role;
  onRequestPlacement: (dormId: 1 | 2 | 3, roomNumber: number, bedNumber: 1 | 2 | 3 | 4) => void;
  onRequestEviction: (student: Student) => void;
}

export const RoomsGrid: React.FC<RoomsGridProps> = ({
  students,
  requests,
  currentRole,
  onRequestPlacement,
  onRequestEviction,
}) => {
  const [selectedDorm, setSelectedDorm] = useState<1 | 2 | 3>(1);
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HAVE_FREE' | 'FULL' | 'EMPTY'>('ALL');
  const [activeRoom, setActiveRoom] = useState<number | null>(null);

  // Pagination for the 100 rooms to ensure zero screen lag
  const [page, setPage] = useState(1);
  const roomsPerPage = 24;

  // TTJ 1 has 2 floors, TTJ 2 has 5 floors, TTJ 3 has 5 floors
  const maxFloors = selectedDorm === 1 ? 2 : 5;
  const floors = useMemo(() => {
    const arr: (number | 'ALL')[] = ['ALL'];
    for (let i = 1; i <= maxFloors; i++) {
      arr.push(i);
    }
    return arr;
  }, [maxFloors]);

  // Determine floor from room number based on selected dorm
  // TTJ 1 (2 floors): 50 rooms per floor.
  // TTJ 2 & 3 (5 floors): 20 rooms per floor.
  const getFloor = (roomNum: number, dormId: 1 | 2 | 3): number => {
    if (dormId === 1) {
      if (roomNum <= 50) return 1;
      return 2;
    } else {
      if (roomNum <= 20) return 1;
      if (roomNum <= 40) return 2;
      if (roomNum <= 60) return 3;
      if (roomNum <= 80) return 4;
      return 5;
    }
  };

  // Get student in a specific bed
  const getStudentInBed = (roomNum: number, bedNum: 1 | 2 | 3 | 4): Student | undefined => {
    return students.find(
      (s) => s.dormId === selectedDorm && s.roomNumber === roomNum && s.bedNumber === bedNum
    );
  };

  // Check if a bed has a pending request
  const getPendingRequestForBed = (roomNum: number, bedNum: 1 | 2 | 3 | 4): DormitoryRequest | undefined => {
    return requests.find(
      (r) => r.dormId === selectedDorm && r.roomNumber === roomNum && r.bedNumber === bedNum && r.status === 'PENDING'
    );
  };

  // Generate all 100 room data for active filters
  const processedRooms = useMemo(() => {
    const list = [];
    for (let r = 1; r <= 100; r++) {
      const roomStudents: Student[] = [];
      const roomPending: { [key: number]: DormitoryRequest } = {};
      
      for (let b = 1; b <= 4; b++) {
        const std = students.find(s => s.dormId === selectedDorm && s.roomNumber === r && s.bedNumber === b);
        if (std) roomStudents.push(std);
        
        const req = requests.find(req => req.dormId === selectedDorm && req.roomNumber === r && req.bedNumber === b && req.status === 'PENDING');
        if (req) roomPending[b] = req;
      }

      const floor = getFloor(r, selectedDorm);
      const isFloorMatch = selectedFloor === 'ALL' || floor === selectedFloor;
      
      const isSearchMatch = searchQuery === '' || r.toString().includes(searchQuery) || roomStudents.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const occupiedCount = roomStudents.length;
      const freeCount = 4 - occupiedCount;

      let isStatusMatch = true;
      if (statusFilter === 'HAVE_FREE') {
        isStatusMatch = freeCount > 0;
      } else if (statusFilter === 'FULL') {
        isStatusMatch = occupiedCount === 4;
      } else if (statusFilter === 'EMPTY') {
        isStatusMatch = occupiedCount === 0;
      }

      if (isFloorMatch && isSearchMatch && isStatusMatch) {
        list.push({
          roomNumber: r,
          floor,
          occupiedCount,
          freeCount,
          students: roomStudents,
          pending: roomPending
        });
      }
    }
    return list;
  }, [selectedDorm, selectedFloor, searchQuery, statusFilter, students, requests]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [selectedDorm, selectedFloor, searchQuery, statusFilter]);

  // Paginated rooms
  const paginatedRooms = useMemo(() => {
    const startIndex = (page - 1) * roomsPerPage;
    return processedRooms.slice(startIndex, startIndex + roomsPerPage);
  }, [processedRooms, page]);

  const totalPages = Math.ceil(processedRooms.length / roomsPerPage);

  // Automatically adjust selectedDorm when role changes to a specific dorm admin
  React.useEffect(() => {
    if (currentRole === 'DORM_1_ADMIN') {
      setSelectedDorm(1);
    } else if (currentRole === 'DORM_2_ADMIN') {
      setSelectedDorm(2);
    } else if (currentRole === 'DORM_3_ADMIN') {
      setSelectedDorm(3);
    }
  }, [currentRole]);

  // Generate list of dorms to display based on current role
  const visibleDorms = useMemo(() => {
    if (currentRole === 'DORM_1_ADMIN') return [1];
    if (currentRole === 'DORM_2_ADMIN') return [2];
    if (currentRole === 'DORM_3_ADMIN') return [3];
    return [1, 2, 3]; // For SUPER_ADMIN and USER, show all
  }, [currentRole]);

  // Check role permission for this dormitory
  const hasAccessToDorm = (dormId: 1 | 2 | 3): boolean => {
    if (currentRole === 'SUPER_ADMIN') return true;
    if (currentRole === 'DORM_1_ADMIN' && dormId === 1) return true;
    if (currentRole === 'DORM_2_ADMIN' && dormId === 2) return true;
    if (currentRole === 'DORM_3_ADMIN' && dormId === 3) return true;
    return false;
  };

  const activeRoomData = activeRoom ? processedRooms.find(r => r.roomNumber === activeRoom) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      {/* Dorm Selector Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        {visibleDorms.map((num) => {
          const dormId = num as 1 | 2 | 3;
          const isActive = selectedDorm === dormId;
          const userHasAccess = hasAccessToDorm(dormId);
          return (
            <button
              key={dormId}
              id={`dorm-tab-${dormId}`}
              onClick={() => {
                setSelectedDorm(dormId);
                setActiveRoom(null);
                setSelectedFloor('ALL');
              }}
              className={`flex-1 py-3 text-center transition-all border-b-2 font-bold text-sm md:text-base cursor-pointer flex items-center justify-center gap-2 ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
              }`}
            >
              <DoorOpen className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{dormId}-TTJ</span>
              {userHasAccess && currentRole !== 'SUPER_ADMIN' && (
                <span className="text-[10px] bg-blue-105 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold border border-blue-200">
                  Sizniki
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center pb-5 border-b border-slate-100 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Floor selection */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Qavat:
            </span>
            {floors.map((fl) => {
              const isSelected = selectedFloor === fl;
              return (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                >
                  {fl === 'ALL' ? 'Hammasi' : `${fl}-qavat`}
                </button>
              );
            })}
          </div>

          {/* Availability Status Filters */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Holat:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden pr-2 cursor-pointer"
            >
              <option value="ALL">Barchasi ({processedRooms.length})</option>
              <option value="HAVE_FREE">Bo'sh joyi bor</option>
              <option value="FULL">To'liq band</option>
              <option value="EMPTY">Butunlay bo'sh</option>
            </select>
          </div>
        </div>

        {/* Searching rooms or students */}
        <div className="relative flex-1 max-w-sm lg:w-64">
          <input
            type="text"
            placeholder="Xona raqami yoki talaba ismi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-250 text-xs rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {paginatedRooms.length > 0 ? (
          paginatedRooms.map((room) => {
            const isSelected = activeRoom === room.roomNumber;
            // Visual indicators
            let colorClass = 'border-slate-100 hover:border-slate-300 bg-white';
            if (room.occupiedCount === 0) {
              colorClass = 'border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10 bg-white';
            } else if (room.occupiedCount === 4) {
              colorClass = 'border-red-100 hover:border-red-200 hover:bg-red-50/5 bg-red-50/10';
            } else {
              colorClass = 'border-slate-100 hover:border-blue-200 bg-white';
            }

            return (
              <button
                key={room.roomNumber}
                id={`room-card-${room.roomNumber}`}
                onClick={() => setActiveRoom(room.roomNumber)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col items-stretch relative ${colorClass} ${
                  isSelected ? 'ring-2 ring-emerald-600 border-emerald-600 shadow-md scale-[1.02]' : 'shadow-xs'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-extrabold text-sm text-slate-800 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    {room.roomNumber}-Xona
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {room.floor}-qavat
                  </span>
                </div>

                {/* Progress dot indicators */}
                <div className="flex gap-1.5 items-center my-2">
                  {[1, 2, 3, 4].map((bedIdx) => {
                    const isOccupied = room.students.some((s) => s.bedNumber === bedIdx);
                    const hasPending = !!room.pending[bedIdx];
                    let dotColor = 'bg-slate-205';
                    if (isOccupied) {
                      dotColor = 'bg-blue-500';
                    } else if (hasPending) {
                      dotColor = 'bg-amber-400 animate-pulse';
                    }
                    return (
                      <span
                        key={bedIdx}
                        className={`w-3.5 h-1.5 rounded-full transition-all ${dotColor}`}
                        title={
                          isOccupied 
                            ? `${bedIdx}-joy: band` 
                            : hasPending 
                            ? `${bedIdx}-joy: so'rov kutilmoqda` 
                            : `${bedIdx}-joy: bo'sh`
                        }
                      ></span>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    {room.occupiedCount} / 4 o'rin
                  </span>
                  {room.occupiedCount === 4 ? (
                    <span className="text-[9px] bg-red-50 text-red-600 border border-red-100 px-1 py-0.5 rounded font-bold uppercase">
                      To'liq
                    </span>
                  ) : (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1 py-0.5 rounded font-bold uppercase">
                      Bo'sh joy
                    </span>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-450">
            <AlertCircle className="w-10 h-10 mb-2.5 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">Hech qanday xona topilmadi!</p>
            <p className="text-xs text-slate-400 mt-1">Siz kiritgan so'rov bo'yicha ma'lumot mos kelmadi</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-5 mt-6 border-t border-slate-100">
          <span className="text-xs text-slate-550 font-medium font-sans">
            Jami {processedRooms.length} ta xonadan {Math.min(processedRooms.length, (page - 1) * roomsPerPage + 1)} - {Math.min(processedRooms.length, page * roomsPerPage)} ko'rsatilmoqda
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-200 text-xs rounded-lg font-bold hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              Orqaga
            </button>
            <span className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-150 rounded-lg">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-slate-200 text-xs rounded-lg font-bold hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              Oldinga
            </button>
          </div>
        </div>
      )}

      {/* Room Details Modal / Interaction Section - Opens below or as side overlay when room is selected */}
      {activeRoomData && (
        <div className="mt-8 p-5 bg-slate-50 rounded-2xl border-2 border-emerald-500/10 transition-all duration-300 animate-fadeIn">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800">
                  {selectedDorm}-TTJ, {activeRoomData.roomNumber}-xona tafsiloti
                </h3>
                <p className="text-xs text-slate-500">
                  Joylashtirilgan: {activeRoomData.occupiedCount} ta talaba — Qavat: {activeRoomData.floor} — Jami 4 o'rin
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveRoom(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2.5 py-1 rounded bg-slate-200/50 hover:bg-slate-200 transition-all"
            >
              Yopish
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {([1, 2, 3, 4] as const).map((bedNum) => {
              const student = activeRoomData.students.find((s) => s.bedNumber === bedNum);
              const pendingReq = activeRoomData.pending[bedNum];
              const dormMatchRole = hasAccessToDorm(selectedDorm);

              return (
                <div
                  key={bedNum}
                  id={`bed-status-${bedNum}`}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    student
                      ? 'bg-white border-blue-100 shadow-xs'
                      : pendingReq
                      ? 'bg-amber-50/40 border-amber-200/50 border-dashed animate-pulse'
                      : 'bg-white border-slate-200/60 hover:border-slate-350'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[11px] font-extrabold text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      Joy №{bedNum}
                    </span>
                    {student ? (
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                        Band
                      </span>
                    ) : pendingReq ? (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        Kutilmoqda
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        Bo'sh joy
                      </span>
                    )}
                  </div>

                  {student ? (
                    <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs truncate" title={student.name}>
                          {student.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">{student.faculty}</p>
                        <div className="flex gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                          <span>{student.course}-kurs</span>
                          <span>•</span>
                          <span className="truncate">{student.group}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100 truncate">
                          Tel: {student.phone}
                        </p>
                      </div>

                      {dormMatchRole ? (
                        <button
                          onClick={() => onRequestEviction(student)}
                          className="w-full mt-3.5 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-50 text-red-600 hover:bg-red-100/70 text-[11px] font-bold rounded-lg transition-all cursor-pointer border border-red-100"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Chiqarish (So'rov)</span>
                        </button>
                      ) : (
                        <p className="text-[10px] text-slate-350 italic mt-3 text-center">
                          O'zgartirish uchun {selectedDorm}-TTJ admini bo'lish kerak
                        </p>
                      )}
                    </div>
                  ) : pendingReq ? (
                    <div className="py-2 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-amber-800">
                          {pendingReq.type === 'ADD' ? 'Yangi talaba' : 'Chiqarib yuborish'} kutilmoqda
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-wider">
                          {pendingReq.studentName}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 italic">
                          Tadbiq etuvchi: {pendingReq.requestedBy}
                        </p>
                      </div>
                      
                      {currentRole === 'SUPER_ADMIN' ? (
                        <div className="pt-2">
                          <span className="text-[10px] text-emerald-600 font-bold block bg-emerald-50 p-1 text-center rounded border border-emerald-100">
                            Super Adminga so'rov bor
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-700 py-1 text-center font-bold rounded block border border-amber-100">
                          Tasdiqlanishi kutilmoqda
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 flex flex-col justify-between h-full flex-1">
                      <p className="text-[11px] text-slate-450 italic">Hali hech kim joylashmagan.</p>
                      
                      {dormMatchRole ? (
                        <button
                          onClick={() => onRequestPlacement(selectedDorm, activeRoomData.roomNumber, bedNum)}
                          className="w-full mt-auto flex items-center justify-center gap-1.5 px-2 py-1.5 bg-emerald-55 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Joylashtirish (So'rov)</span>
                        </button>
                      ) : (
                        <p className="text-[10px] text-slate-350 italic text-center">
                          Harakat uchun {selectedDorm}-TTJ admini bo'lish kerak
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
