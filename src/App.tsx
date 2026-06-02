/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { Role, Student, DormitoryRequest, ActivityLog } from './types';
import { FACULTIES, INITIAL_STUDENTS, INITIAL_REQUESTS, INITIAL_LOGS } from './data';
import { RoleSelector } from './components/RoleSelector';
import { StatsDashboard } from './components/StatsDashboard';
import { RoomsGrid } from './components/RoomsGrid';
import { RequestsPanel } from './components/RequestsPanel';
import { StudentList } from './components/StudentList';
import { GateCheckpoint } from './components/GateCheckpoint';
import { 
  Building2, 
  Users, 
  ClipboardCheck, 
  History, 
  LogOut, 
  Plus, 
  HelpCircle, 
  FileText, 
  Check, 
  X, 
  AlertTriangle,
  FileSpreadsheet,
  Fingerprint,
  QrCode,
  Shield
} from 'lucide-react';

export default function App() {
  // 1. Core State
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const saved = localStorage.getItem('gspi_ttj_role');
    return (saved as Role) || 'SUPER_ADMIN'; // Default to Super Admin so they immediately see the powerful controls!
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('gspi_ttj_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [requests, setRequests] = useState<DormitoryRequest[]>(() => {
    const saved = localStorage.getItem('gspi_ttj_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('gspi_ttj_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [activeTab, setActiveTab] = useState<'ROOMS' | 'REQUESTS' | 'STUDENTS' | 'GATE_CHECKPOINT'>('ROOMS');

  // Modals state
  const [placementModal, setPlacementModal] = useState<{
    isOpen: boolean;
    dormId?: 1 | 2 | 3;
    roomNumber?: number;
    bedNumber?: 1 | 2 | 3 | 4;
  }>({ isOpen: false });

  const [evictionModal, setEvictionModal] = useState<{
    isOpen: boolean;
    student?: Student;
  }>({ isOpen: false });

  // Placement Form Input State
  const [formData, setFormData] = useState({
    name: '',
    course: 1,
    faculty: FACULTIES[0],
    group: '',
    phone: '+998 ',
    gender: 'Erkak' as 'Erkak' | 'Ayol',
    hemisId: '',
  });

  // 2. Persist State to Local Storage
  useEffect(() => {
    localStorage.setItem('gspi_ttj_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('gspi_ttj_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('gspi_ttj_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('gspi_ttj_logs', JSON.stringify(logs));
  }, [logs]);

  // Handle active role changes
  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    
    // Switch active tab away from REQUESTS if newRole is USER and USER shouldn't see it
    if (newRole === 'USER' && activeTab === 'REQUESTS') {
      setActiveTab('ROOMS');
    }
    
    // Log the simulated login switch
    const logUserAndRole = (role: Role) => {
      switch (role) {
        case 'SUPER_ADMIN': return 'Super Admin';
        case 'DORM_1_ADMIN': return 'Yotoqxona 1 Admini';
        case 'DORM_2_ADMIN': return 'Yotoqxona 2 Admini';
        case 'DORM_3_ADMIN': return 'Yotoqxona 3 Admini';
        default: return 'Mehmon foydalanuvchi';
      }
    };

    addLog(
      'Foydalanuvchi roli almashtirildi',
      `Tizimda "${logUserAndRole(newRole)}" roli tanlandi`,
      logUserAndRole(newRole),
      newRole
    );
  };

  // 3. Central Logging Helper
  const addLog = (action: string, details: string, user: string, role: string) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      user,
      role,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // 4. Action Request Handlers
  
  // Triggers Placement Request Dialog
  const handleOpenPlacementRequest = (dormId: 1 | 2 | 3, roomNumber: number, bedNumber: 1 | 2 | 3 | 4) => {
    // Fill up presets nicely, and open form
    setFormData({
      name: '',
      course: 1,
      faculty: FACULTIES[0],
      group: '',
      phone: '+998 ',
      gender: 'Erkak',
      hemisId: '3132011' + Math.floor(10000 + Math.random() * 90000),
    });
    setPlacementModal({
      isOpen: true,
      dormId,
      roomNumber,
      bedNumber,
    });
  };

  // Submit Placement Request
  const handleSubmitPlacementRequest = (e: FormEvent) => {
    e.preventDefault();
    const { dormId, roomNumber, bedNumber } = placementModal;
    if (!dormId || !roomNumber || !bedNumber) return;

    // Simple validation
    if (!formData.name.trim() || formData.name.trim().length < 4) {
      alert('Iltimos, talabaning to\'liq ism-sharifini kiriting!');
      return;
    }
    if (!formData.group.trim()) {
      alert('Iltimos, guruhni kiriting! (Masalan: Kimyo-201)');
      return;
    }

    const requesterName = 
      currentRole === 'SUPER_ADMIN' ? 'Super Admin' :
      currentRole === 'DORM_1_ADMIN' ? 'Yotoqxona 1 Admini' :
      currentRole === 'DORM_2_ADMIN' ? 'Yotoqxona 2 Admini' :
      currentRole === 'DORM_3_ADMIN' ? 'Yotoqxona 3 Admini' : 'Noma\'lum';

    // Check if we are Super Admin - we can bypass approval OR create automatically approved! 
    // To respect user's exact wish: "TTJ adminlari talaba qoshmoqchi bolganda super adminga boradi sorov..."
    // Let's create a request. If current role is SUPER_ADMIN, we approve it instantly to be helpful, 
    // otherwise it goes to Super Admin with status 'PENDING'.
    const isSuper = currentRole === 'SUPER_ADMIN';

    const newRequest: DormitoryRequest = {
      id: `req_${Date.now()}`,
      type: 'ADD',
      studentName: formData.name,
      course: formData.course,
      faculty: formData.faculty,
      group: formData.group,
      phone: formData.phone,
      gender: formData.gender,
      hemisId: formData.hemisId || ('3132011' + Math.floor(10000 + Math.random() * 90000)),
      dormId,
      roomNumber,
      bedNumber,
      requestedBy: requesterName,
      requestedAt: new Date().toISOString(),
      status: isSuper ? 'APPROVED' : 'PENDING',
      ...(isSuper ? { resolvedAt: new Date().toISOString(), resolvedBy: 'Super Admin' } : {}),
    };

    setRequests((prev) => [newRequest, ...prev]);

    // Activity log writing
    addLog(
      'Joylashtirish so\'rovi kiritildi',
      `${formData.name} uchun ${dormId}-TTJ, ${roomNumber}-xona, ${bedNumber}-joyga kiritish so'rovi yuborildi`,
      requesterName,
      currentRole
    );

    // If super admin bypass, apply the additions instantly!
    if (isSuper) {
      const newStudent: Student = {
        id: `std_${Date.now()}`,
        name: formData.name,
        course: formData.course,
        faculty: formData.faculty,
        group: formData.group,
        phone: formData.phone,
        gender: formData.gender,
        dormId,
        roomNumber,
        bedNumber,
        placementDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
        hemisId: formData.hemisId || ('3132011' + Math.floor(10000 + Math.random() * 90000)),
      };
      setStudents((prev) => [...prev, newStudent]);
      addLog(
        'Tizimga talaba qo\'shildi',
        `${formData.name} to'g'ridan-to'g'ri Super Admin tomonidan joylashtirildi`,
        'Super Admin',
        'SUPER_ADMIN'
      );
    } else {
      alert(`Talaba joylashtirish so'rovi Super Adminga muvaffaqiyatli yuborildi. Tasdiqlangandan so'ng xona biriktiriladi.`);
    }

    setPlacementModal({ isOpen: false });
  };

  // Triggers Eviction (Student Removal) Request Dialog
  const handleOpenEvictionRequest = (student: Student) => {
    setEvictionModal({
      isOpen: true,
      student,
    });
  };

  // Submit Eviction Request
  const handleSubmitEvictionRequest = () => {
    const { student } = evictionModal;
    if (!student) return;

    const requesterName = 
      currentRole === 'SUPER_ADMIN' ? 'Super Admin' :
      currentRole === 'DORM_1_ADMIN' ? 'Yotoqxona 1 Admini' :
      currentRole === 'DORM_2_ADMIN' ? 'Yotoqxona 2 Admini' :
      currentRole === 'DORM_3_ADMIN' ? 'Yotoqxona 3 Admini' : 'Noma\'lum';

    const isSuper = currentRole === 'SUPER_ADMIN';

    const newRequest: DormitoryRequest = {
      id: `req_${Date.now()}`,
      type: 'REMOVE',
      studentId: student.id,
      studentName: student.name,
      dormId: student.dormId,
      roomNumber: student.roomNumber,
      bedNumber: student.bedNumber,
      requestedBy: requesterName,
      requestedAt: new Date().toISOString(),
      status: isSuper ? 'APPROVED' : 'PENDING',
      ...(isSuper ? { resolvedAt: new Date().toISOString(), resolvedBy: 'Super Admin' } : {}),
    };

    setRequests((prev) => [newRequest, ...prev]);

    addLog(
      'Chiqarish so\'rovi kiritildi',
      `${student.name}ni ${student.dormId}-TTJ, ${student.roomNumber}-xona, ${student.bedNumber}-joydan chiqarish so'rovi yuborildi`,
      requesterName,
      currentRole
    );

    if (isSuper) {
      // Remove student instantly if performed by Super Admin
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      addLog(
        'Tizimdan talaba chiqarildi',
        `${student.name} Super Admin tomonidan to'g'ridan-to'g'ri tizimdan chiqarib yuborildi`,
        'Super Admin',
        'SUPER_ADMIN'
      );
    } else {
      alert(`Talabani chiqarish so'rovi Super Adminga muvaffaqiyatli yuborildi. Tasdiqlangandan so'ng joy bo'shatiladi.`);
    }

    setEvictionModal({ isOpen: false });
  };

  // 5. Super Admin Decisions (Approve / Reject)

  // Approve request
  const handleApproveRequest = (requestId: string) => {
    if (currentRole !== 'SUPER_ADMIN') {
      alert('Faqat Super Admin so\'rovlarni tasdiqlashi mumkin!');
      return;
    }

    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    // Apply change according to request type
    if (targetReq.type === 'ADD') {
      // Create student
      const newStudent: Student = {
        id: `std_${Date.now()}`,
        name: targetReq.studentName || '',
        course: targetReq.course || 1,
        faculty: targetReq.faculty || '',
        group: targetReq.group || '',
        phone: targetReq.phone || '',
        gender: targetReq.gender || 'Erkak',
        dormId: targetReq.dormId,
        roomNumber: targetReq.roomNumber,
        bedNumber: targetReq.bedNumber,
        placementDate: new Date().toLocaleDateString('en-CA'),
        hemisId: targetReq.hemisId || ('3132011' + Math.floor(10000 + Math.random() * 90000)),
      };

      setStudents((prev) => [...prev, newStudent]);
      addLog(
        'Joylashish so\'rovi tasdiqlandi',
        `Arizachi: ${targetReq.requestedBy}. Talaba: ${targetReq.studentName} ${targetReq.dormId}-TTJ, ${targetReq.roomNumber}-xona, ${targetReq.bedNumber}-joyga kiritildi`,
        'Super Admin',
        'SUPER_ADMIN'
      );
    } else if (targetReq.type === 'REMOVE') {
      // Remove student
      setStudents((prev) => prev.filter((s) => s.id !== targetReq.studentId));
      addLog(
        'Chiqarish so\'rovi tasdiqlandi',
        `Arizachi: ${targetReq.requestedBy}. Talaba: ${targetReq.studentName} ${targetReq.dormId}-TTJ, ${targetReq.roomNumber}-xona, ${targetReq.bedNumber}-joydan chiqarib yuborildi`,
        'Super Admin',
        'SUPER_ADMIN'
      );
    }

    // Update request state
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'APPROVED', resolvedAt: new Date().toISOString(), resolvedBy: 'Super Admin' }
          : r
      )
    );
  };

  // Reject request
  const handleRejectRequest = (requestId: string) => {
    if (currentRole !== 'SUPER_ADMIN') {
      alert('Faqat Super Admin so\'rovlarni rad etishi mumkin!');
      return;
    }

    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    // Update request state
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'REJECTED', resolvedAt: new Date().toISOString(), resolvedBy: 'Super Admin' }
          : r
      )
    );

    addLog(
      'So\'rov rad etildi',
      `Yuboruvchi: ${targetReq.requestedBy}. ${targetReq.studentName} uchun qilingan so'rov Super Admin tomonidan rad etildi`,
      'Super Admin',
      'SUPER_ADMIN'
    );
  };

  // Reset all simulation database to presets (helpful feature!)
  const handleResetData = () => {
    if (window.confirm('Haqiqatdan ham sayt ma\'lumotlarini boshlang\'ich holatga qaytarmoqchimisiz? Barcha qo\'shilgan va o\'chirilgan so\'rovlar o\'chib ketadi.')) {
      localStorage.removeItem('gspi_ttj_students');
      localStorage.removeItem('gspi_ttj_requests');
      localStorage.removeItem('gspi_ttj_logs');
      setStudents(INITIAL_STUDENTS);
      setRequests(INITIAL_REQUESTS);
      setLogs(INITIAL_LOGS);
      addLog('Tizim qayta tiklandi', 'Barcha ma\'lumotlar dastlabki holatga qaytarildi', 'Tizim', 'SYSTEM');
      alert('Ma\'lumotlar muvaffaqiyatli tiklandi!');
    }
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div id="main-layout" className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-200">
      
      {/* Top Professional Header */}
      <header className="bg-white border-b border-slate-200/85 shadow-2xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 flex-col sm:flex-row gap-4">
            
            {/* Logo and Institution Branding */}
            <div className="flex items-center gap-3">
              <div id="gspi-portal-logo" className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    GSPI PORTALI
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-550 font-semibold px-2 py-0.5 rounded">
                    Yangi talqin v2.1
                  </span>
                </div>
                <h1 className="text-lg font-extrabold text-slate-800 tracking-tight mt-0.5">
                  Talabalar Turar Joyi (TTJ) Boshqaruvi
                </h1>
                <p className="text-xs text-slate-450 font-medium">
                  Guliston Davlat Pedagogika Instituti (GDPI)
                </p>
              </div>
            </div>

            {/* Simulated actions and reset buttons removed */}

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        
        {/* Dynamic Interactive Role Switcher */}
        <RoleSelector 
          currentRole={currentRole} 
          onChangeRole={handleRoleChange} 
          pendingRequestsCount={pendingRequestsCount} 
        />

        {/* Global Statistics Overview */}
        <StatsDashboard students={students} requests={requests} currentRole={currentRole} />

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-0.5">
          <button
            onClick={() => setActiveTab('ROOMS')}
            id="tab-btn-rooms"
            className={`px-4 py-2.5 font-extrabold text-xs md:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-t border-x ${
              activeTab === 'ROOMS'
                ? 'bg-white border-slate-200 text-emerald-800 border-b-2 border-b-emerald-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 border-b border-b-transparent'
            }`}
          >
            <Building2 className="w-4 h-4 text-slate-450" />
            <span>Xona va Joylar Bandligi (100 ta xona)</span>
          </button>

          {currentRole !== 'USER' && (
            <button
              onClick={() => setActiveTab('REQUESTS')}
              id="tab-btn-requests"
              className={`px-4 py-2.5 font-extrabold text-xs md:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-t border-x relative ${
                activeTab === 'REQUESTS'
                  ? 'bg-white border-slate-200 text-emerald-800 border-b-2 border-b-emerald-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 border-b border-b-transparent'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-slate-450" />
              <span>Arizalar & So'rovlar Koridori</span>
              {pendingRequestsCount > 0 && (
                <span className="bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('STUDENTS')}
            id="tab-btn-students"
            className={`px-4 py-2.5 font-extrabold text-xs md:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-t border-x ${
              activeTab === 'STUDENTS'
                ? 'bg-white border-slate-200 text-emerald-800 border-b-2 border-b-emerald-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 border-b border-b-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-slate-450" />
            <span>Talabalar Umumiy Reyestri ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('GATE_CHECKPOINT')}
            id="tab-btn-gate"
            className={`px-4 py-2.5 font-extrabold text-xs md:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-t border-x ${
              activeTab === 'GATE_CHECKPOINT'
                ? 'bg-white border-slate-200 text-emerald-800 border-b-2 border-b-emerald-600 font-black'
                : 'border-transparent hover:text-slate-700 hover:bg-slate-100/50 border-b border-b-transparent text-emerald-700 font-bold bg-emerald-50/20'
            }`}
          >
            <Fingerprint className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>HEMIS Tizimidan Izlash</span>
          </button>
        </div>

        {/* Active Tab Component Render */}
        <div className="transition-all duration-300">
          {activeTab === 'ROOMS' && (
            <RoomsGrid
              students={students}
              requests={requests}
              currentRole={currentRole}
              onRequestPlacement={handleOpenPlacementRequest}
              onRequestEviction={handleOpenEvictionRequest}
            />
          )}

          {activeTab === 'REQUESTS' && (
            <RequestsPanel
              requests={requests}
              currentRole={currentRole}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
            />
          )}

          {activeTab === 'STUDENTS' && (
            <StudentList
              students={students}
              currentRole={currentRole}
              onRequestEviction={handleOpenEvictionRequest}
            />
          )}

          {activeTab === 'GATE_CHECKPOINT' && (
            <GateCheckpoint
              students={students}
              onAddLog={addLog}
              currentRole={currentRole}
              onAddRequest={(newReq) => setRequests(prev => [newReq, ...prev])}
              onAddStudent={(newStd) => setStudents(prev => [...prev, newStd])}
            />
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs mt-16 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-sm font-semibold text-slate-300">
            Guliston Davlat Pedagogika Instituti (GSPI) Talabalar Turar Joyi Portali
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-slate-500 text-[11px] font-mono">
            <span>• 3 ta zamonaviy yotoqxona</span>
            <span>• Har bir yotoqxonada 100 tadan xona</span>
            <span>• Har bir xonada 4 tadan mustaqil talaba o'rni</span>
            <span>• 5 ta nazorat roli tizimi</span>
          </div>
          <p className="text-slate-600 text-[11px] pt-4 border-t border-slate-800">
            Sayt o'quv va amaliy maqsadlarda modernizatsiya qilingan talqin sifatida ishlab chiqildi. Barcha huquqlar himoyalangan. © {new Date().getFullYear()} Guliston.
          </p>
        </div>
      </footer>


      {/* MODAL 1: Joylashtirish so'rovini topshirish formasi */}
      {placementModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 mb-4 border-b border-slate-150">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">
                  Yangi Ariza So'rovi
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-1">
                  Talabani Joylashtirishga So'rov Berish
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Joylashuv: {placementModal.dormId}-TTJ, {placementModal.roomNumber}-Xona, Joy №{placementModal.bedNumber}
                </p>
              </div>
              <button
                onClick={() => setPlacementModal({ isOpen: false })}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

             <form onSubmit={handleSubmitPlacementRequest} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase text-[10px]">Talabaning To'liq Ism-Sharifi (F.I.SH.) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Shodiyor Qobilov Ergashevich"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase text-[10px]">Talaba HEMIS ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: 313201100015"
                    value={formData.hemisId}
                    onChange={(e) => setFormData(prev => ({ ...prev, hemisId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-bold font-mono text-[13px] text-emerald-700 tracking-wide"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase text-[10px]">Talaba Kursi *</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData(prev => ({ ...prev, course: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 cursor-pointer"
                  >
                    {[1, 2, 3, 4].map(c => (
                      <option key={c} value={c}>{c}-kurs</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase text-[10px]">Jinsi *</label>
                  <div className="flex gap-4 pt-1.5">
                    <label className="flex items-center gap-1.5 text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === 'Erkak'}
                        onChange={() => setFormData(prev => ({ ...prev, gender: 'Erkak' }))}
                        className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Erkak</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === 'Ayol'}
                        onChange={() => setFormData(prev => ({ ...prev, gender: 'Ayol' }))}
                        className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Ayol</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block uppercase text-[10px]">Fakulteti *</label>
                <select
                  value={formData.faculty}
                  onChange={(e) => setFormData(prev => ({ ...prev, faculty: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 cursor-pointer"
                >
                  {FACULTIES.map(fac => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase text-[10px]">Guruh nomi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Kimyo-22"
                    value={formData.group}
                    onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase text-[10px]">Bog'lanish uchun tel *</label>
                  <input
                    type="text"
                    required
                    placeholder="+998 XX XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-150 flex items-start gap-2.5 mt-2">
                <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed font-semibold">
                  Eslatma: TTJ admini sifatidagi so'rovingiz tizimga kiritilib, **Super Admin** tomonidan tasdiqlanganidan so'nggina talaba yotoqxonaga faol tarzda biriktiriladi.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setPlacementModal({ isOpen: false })}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs cursor-pointer focus:ring-2 focus:ring-emerald-500"
                >
                  {currentRole === 'SUPER_ADMIN' ? 'To\'g\'ridan-to\'g\'ri Qo\'shish' : 'Super Adminga So\'rov Berish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 2: Chiqarish so'rovi tasdiqlash oynasi */}
      {evictionModal.isOpen && evictionModal.student && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-150">
              <div className="p-2 bg-red-100/80 text-red-700 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  TTJdan Chiqarish So'rovi
                </h3>
                <p className="text-xs text-slate-500">
                  Tasdiqlash va so'rov yuborish
                </p>
              </div>
            </div>

            <div className="space-y-3.5 my-4 text-xs font-semibold">
              <p className="text-slate-605 leading-relaxed">
                Haqiqatdan ham quyidagi talabani umumiy yotoqxona biriktiruvchi ro'yxatidan va uning band qilgan o'rnini bo'shatish bo'yicha so'rov bermoqchimisiz?
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-slate-700">
                <p className="text-[10px] text-slate-400 uppercase font-black">Talaba Ma'lumotlari</p>
                <p className="font-extrabold text-sm text-slate-800 mt-1">{evictionModal.student.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{evictionModal.student.faculty} • {evictionModal.student.group}</p>
                <p className="text-xs text-slate-505 font-mono mt-1">
                  Joylashuvi: {evictionModal.student.dormId}-TTJ, {evictionModal.student.roomNumber}-xona, {evictionModal.student.bedNumber}-joy
                </p>
              </div>

              <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-150 text-[10px] leading-relaxed">
                {currentRole === 'SUPER_ADMIN' ? (
                  <strong>Super Admin sifatida tasdiqlaganingiz sababli talaba ro'yxatdan va joyidan shu zahoti chiqariladi!</strong>
                ) : (
                  <span>So'rov yuborilganidan so'ng joy bo'shatilishini Super Admin tasdiqlashi shart. Bu vaqtgacha joy kutilayotgan holatda qoladi.</span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-150 text-xs">
              <button
                type="button"
                onClick={() => setEvictionModal({ isOpen: false })}
                className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSubmitEvictionRequest}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-xs cursor-pointer focus:ring-2 focus:ring-red-500"
              >
                {currentRole === 'SUPER_ADMIN' ? 'To\'g\'ridan-to\'g\'ri Chiqarish' : 'Tasdiqlash va So\'rov Yuborish'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
