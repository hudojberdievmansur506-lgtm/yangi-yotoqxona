/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { 
  Fingerprint, 
  Search, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Building,
  UserCheck,
  Phone,
  BookOpen,
  Calendar,
  Lock,
  Send,
  Sparkles,
  Award
} from 'lucide-react';

interface GateCheckpointProps {
  students: Student[];
  onAddLog: (action: string, details: string, user: string, role: string) => void;
  currentRole: string;
  onAddRequest: (newReq: any) => void;
  onAddStudent: (newStd: any) => void;
}

export function GateCheckpoint({ 
  students, 
  onAddLog, 
  currentRole, 
  onAddRequest, 
  onAddStudent 
}: GateCheckpointProps) {
  const [searchId, setSearchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  // Custom type for student returned by the HEMIS search api
  const [foundStudent, setFoundStudent] = useState<{
    full_name: string;
    student_id_number: string;
    faculty: string;
    specialty: string;
    course: number;
    group_name: string;
    image: string;
  } | null>(null);

  // States for placement form
  const [selectedDorm, setSelectedDorm] = useState<'1' | '2' | '3'>(() => {
    if (currentRole === 'DORM_1_ADMIN') return '1';
    if (currentRole === 'DORM_2_ADMIN') return '2';
    if (currentRole === 'DORM_3_ADMIN') return '3';
    return '1';
  });
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [bedNumber, setBedNumber] = useState<'1' | '2' | '3' | '4'>('1');
  const [phone, setPhone] = useState<string>('+998 ');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-fill phone when student loads
  useEffect(() => {
    if (foundStudent) {
      setPhone('+998 ' + Math.floor(900000000 + Math.random() * 90000000));
    }
  }, [foundStudent]);

  // Synchronize role constraints
  useEffect(() => {
    if (currentRole === 'DORM_1_ADMIN') setSelectedDorm('1');
    else if (currentRole === 'DORM_2_ADMIN') setSelectedDorm('2');
    else if (currentRole === 'DORM_3_ADMIN') setSelectedDorm('3');
  }, [currentRole]);

  // API Call to search student via HEMIS ID
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchId.trim();
    if (!query) return;

    setIsLoading(true);
    setErrorText(null);
    setFoundStudent(null);
    setSuccessMsg(null);

    try {
      const API_BASE_URL = "/api";
      const response = await fetch(`${API_BASE_URL}/students/search/${query}`);
      const data = await response.json();

      if (data.success && data.student) {
        setFoundStudent(data.student);
      } else {
        setErrorText("Talaba topilmadi");
      }
    } catch (err) {
      console.error("API error during HEMIS student search:", err);
      setErrorText("API ulanishida xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit placement request/direct addition to Super Admin
  const handleRequestSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundStudent) return;

    const parsedRoom = parseInt(roomNumber, 10);
    if (isNaN(parsedRoom) || parsedRoom < 1 || parsedRoom > 100) {
      alert("Iltimos, haqiqiy xona raqamini kiriting (1 dan 100 gacha)!");
      return;
    }

    // Check if bed is already occupied in the system
    const isOccupied = students.some(
      (s) => 
        s.dormId === Number(selectedDorm) && 
        s.roomNumber === parsedRoom && 
        s.bedNumber === Number(bedNumber)
    );

    if (isOccupied) {
      alert(`Tanlangan ${selectedDorm}-TTJ, ${parsedRoom}-xona, ${bedNumber}-o'rin allaqachon band! Iltimos, boshqa o'rin tanlang.`);
      return;
    }

    const requesterName = 
      currentRole === 'SUPER_ADMIN' ? 'Super Admin' :
      currentRole === 'DORM_1_ADMIN' ? 'Yotoqxona 1 Admini' :
      currentRole === 'DORM_2_ADMIN' ? 'Yotoqxona 2 Admini' :
      currentRole === 'DORM_3_ADMIN' ? 'Yotoqxona 3 Admini' : 'Noma\'lum';

    const isSuper = currentRole === 'SUPER_ADMIN';

    // Build Request
    const requestPayload = {
      id: `req_${Date.now()}`,
      type: 'ADD',
      studentName: foundStudent.full_name,
      course: foundStudent.course,
      faculty: foundStudent.faculty,
      group: foundStudent.group_name,
      phone: phone,
      gender: 'Erkak' as 'Erkak' | 'Ayol', // Default or logical selection
      hemisId: foundStudent.student_id_number,
      dormId: Number(selectedDorm) as 1 | 2 | 3,
      roomNumber: parsedRoom,
      bedNumber: Number(bedNumber) as 1 | 2 | 3 | 4,
      requestedBy: requesterName,
      requestedAt: new Date().toISOString(),
      status: isSuper ? 'APPROVED' : 'PENDING',
      ...(isSuper ? { resolvedAt: new Date().toISOString(), resolvedBy: 'Super Admin' } : {}),
    };

    onAddRequest(requestPayload);

    // Apply log
    onAddLog(
      isSuper ? 'To\'g\'ridan-to\'g\'ri TTJga joylashtirish' : 'Joylashtirish so\'rovi yuborish',
      `HEMIS tizimidan olingan talaba ${foundStudent.full_name} (${foundStudent.student_id_number}) uchun ${selectedDorm}-TTJ ${parsedRoom}-xonaga so'rov yuborildi.`,
      requesterName,
      currentRole
    );

    if (isSuper) {
      // Place student directly
      const newStudent: Student = {
        id: `std_${Date.now()}`,
        name: foundStudent.full_name,
        course: foundStudent.course,
        faculty: foundStudent.faculty,
        group: foundStudent.group_name,
        phone: phone,
        gender: 'Erkak',
        dormId: Number(selectedDorm) as 1 | 2 | 3,
        roomNumber: parsedRoom,
        bedNumber: Number(bedNumber) as 1 | 2 | 3 | 4,
        placementDate: new Date().toLocaleDateString('en-CA'),
        hemisId: foundStudent.student_id_number,
      };
      onAddStudent(newStudent);
      setSuccessMsg(`Talaba ${foundStudent.full_name} to'g'ridan-to'g'ri ${selectedDorm}-TTJ ${parsedRoom}-xonaga muvaffaqiyatli joylashtirildi!`);
    } else {
      setSuccessMsg(`Ssenariy muvaffaqiyatli: ${foundStudent.full_name} uchun ${selectedDorm}-TTJ, ${parsedRoom}-xona bo'yicha talabnoma Super Adminga ko'rib chiqish uchun yuborildi!`);
    }

    // Reset Form and Student selection safely after submission
    setFoundStudent(null);
    setSearchId('');
    setRoomNumber('');
  };

  // Helper chip selector
  const handleQuickChipClick = (id: string) => {
    setSearchId(id);
    setTimeout(() => {
      // Perform immediate programmatic search
      const API_BASE_URL = "/api";
      setIsLoading(true);
      setErrorText(null);
      setFoundStudent(null);
      setSuccessMsg(null);
      fetch(`${API_BASE_URL}/students/search/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.student) {
            setFoundStudent(data.student);
          } else {
            setErrorText("Talaba topilmadi");
          }
        })
        .catch(err => {
          console.error(err);
          setErrorText("API ulanishida xatolik yuz berdi");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 100);
  };

  return (
    <div className="bg-slate-50 space-y-6">
      
      {/* Informative Header Widget */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">
                HEMIS Tizimidan Talabalarni Izlash va TTJ uchun So'rov Yuborish
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Talaba HEMIS ID-si orqali ma'lumotlar bazasidan qidiriladi. Topilgach, tegishli TTJ, xona va o'ringa joylash so'rovi Super Adminga tasdiqlash uchun jo'natiladi.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 self-start md:self-center">
            <ShieldCheck className="w-3.5 h-3.5" />
            HEMIS Api Integratsiyasi Faol
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Core Search Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-emerald-600" />
              Talabaning 12 xonali HEMIS ID raqamini kiriting
            </h3>
          </div>

          {/* Preset Test Student Chips */}
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              Tezkor sinab ko'rish uchun HEMIS ID'lar (Bosing):
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: '313201100011', name: 'Shohruhbek Q.' },
                { id: '313201100012', name: 'Sevara X.' },
                { id: '313201100013', name: 'Bekzod R.' },
                { id: '313201100014', name: 'Zarina E.' },
                { id: '313201100015', name: 'Jasurbek T.' },
                { id: '313201100016', name: 'Dilnoza S.' },
              ].map((std) => (
                <button
                  key={std.id}
                  onClick={() => handleQuickChipClick(std.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    searchId === std.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50/20 hover:bg-emerald-50/50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  <Fingerprint className="w-3 h-3 text-emerald-500" />
                  <span>{std.name} ({std.id})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Inputs */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                maxLength={12}
                placeholder="Masalan: 313201100011"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.replace(/\D/g, ''))} // only digits
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-bold font-mono tracking-wider text-sm outline-hidden"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchId.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <QrCode className="w-4 h-4" />
              )}
              <span>Izlash</span>
            </button>
          </form>

          {/* Error Screen */}
          {errorText && (
            <div className="bg-red-50 border border-red-150 text-red-700 p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-extrabold text-[#991B1B]">{errorText}!</p>
                <p className="text-[10px] text-red-500 font-normal mt-0.5">Kiritilgan ID bo'yicha HEMIS tizimidagi talabalar ro'yxatida hech qanday moslik topilmadi.</p>
              </div>
            </div>
          )}

          {/* Global placement success banner */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3.5 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-900 font-black text-xs md:text-sm">{successMsg}</p>
                <p className="text-[11px] text-emerald-600 font-normal mt-1 leading-relaxed">
                  So'rovlar statusini kuzatib borish uchun yuqoridagi <strong>"So'rovlar paneli"</strong> tabiga o'ting. Agar siz admin bo'lsangiz, so'rovlarni u yerda bevosita tasdiqlashingiz mumkin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Found Student Card & Room Allocation section */}
        {foundStudent && (
          <div className="space-y-6 animate-fade-in">
            {/* Student Passport Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-emerald-600 px-5 py-3 text-white flex justify-between items-center">
                <span className="text-[11px] font-bold font-mono tracking-wider">HEMIS INTEGRATION RESIDENCY</span>
                <span className="inline-flex items-center gap-1 bg-emerald-700/60 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest font-mono">
                  <Award className="w-3 h-3" />
                  Muvaffaqiyatli Topildi
                </span>
              </div>

              <div className="p-6 flex flex-col sm:flex-row gap-6">
                {/* Student Photo */}
                <div className="w-28 h-28 mx-auto sm:mx-0 rounded-2xl border-2 border-emerald-100 overflow-hidden shadow-2xs flex-shrink-0 bg-slate-50 relative">
                  <img
                    src={foundStudent.image}
                    alt={foundStudent.full_name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 right-1.5 bg-emerald-600/90 text-white rounded-full p-1 shadow-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Passport Information */}
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] bg-slate-100 text-slate-605 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Talabaning To'liq Ism-Sharifi (F.I.SH)
                    </span>
                    <h4 className="text-base md:text-lg font-black text-slate-855 mt-1 leading-tight">
                      {foundStudent.full_name}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">HEMIS GUID ID</p>
                      <p className="font-bold text-emerald-800 font-mono text-[13px]">{foundStudent.student_id_number}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Fakulteti</p>
                      <p className="font-extrabold text-slate-800">{foundStudent.faculty}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Mutaxassislik/Yo'nalish</p>
                      <p className="font-bold text-slate-750">{foundStudent.specialty}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Kurs va Guruh</p>
                      <p className="font-bold text-slate-750 font-mono">
                        {foundStudent.course}-Kurs • Guruh: {foundStudent.group_name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Allocation Form (TTJ selection & placement) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-indigo-50 pb-3">
                <h4 className="text-sm font-black text-slate-850 flex items-center gap-2">
                  <Building className="w-4.5 h-4.5 text-indigo-500" />
                  Talaba uchun Yotoqxona (TTJ) joylashuvini tanlang
                </h4>
                <p className="text-[11px] text-slate-450 mt-0.5">
                  Talabani qaysi yotoqxonaga, xona va o'ringa joylash so'robnomasi yubormoqchiligingizni belgilang.
                </p>
              </div>

              <form onSubmit={handleRequestSubmission} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Dorm */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase text-[10px] font-extrabold tracking-wider block">Yotoqxona (TTJ) *</label>
                    <div className="relative">
                      <select
                        required
                        disabled={currentRole !== 'SUPER_ADMIN' && currentRole !== 'USER'}
                        value={selectedDorm}
                        onChange={(e) => setSelectedDorm(e.target.value as '1' | '2' | '3')}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 appearance-none font-bold"
                      >
                        <option value="1">1-TTJ (O'g'il bolalar)</option>
                        <option value="2">2-TTJ (Qizlar)</option>
                        <option value="3">3-TTJ (O'g'il bolalar)</option>
                      </select>
                      {currentRole !== 'SUPER_ADMIN' && currentRole !== 'USER' && (
                        <div className="absolute right-3.5 top-3 text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                          <Lock className="w-3 h-3" />
                          Cheklangan
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Room Number */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase text-[10px] font-extrabold tracking-wider block">Xona Raqami (1 - 100) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      placeholder="Xona raqami, masalan: 15"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bed Number */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase text-[10px] font-extrabold tracking-wider block">O'rin/Joy Yo'nalishi *</label>
                    <select
                      required
                      value={bedNumber}
                      onChange={(e) => setBedNumber(e.target.value as '1' | '2' | '3' | '4')}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-bold"
                    >
                      <option value="1">1-o'rin (Deraza oldi)</option>
                      <option value="2">2-o'rin (Eshik oldi)</option>
                      <option value="3">3-o'rin (Tepada - 1)</option>
                      <option value="4">4-o'rin (Tepada - 2)</option>
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase text-[10px] font-extrabold tracking-wider block">Aloqa Telefoni *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-bold font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Role constraints visual advice */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-[10px] font-medium text-slate-500 leading-relaxed flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-700 block text-[11px] mb-0.5">Ariza jo'natish qoidasi:</span>
                    Sizning hozirgi rolingiz: <strong className="text-emerald-700">
                      {currentRole === 'SUPER_ADMIN' ? 'Super Admin' :
                       currentRole === 'DORM_1_ADMIN' ? 'Yotoqxona 1 Admini' :
                       currentRole === 'DORM_2_ADMIN' ? 'Yotoqxona 2 Admini' :
                       currentRole === 'DORM_3_ADMIN' ? 'Yotoqxona 3 Admini' : 'Obyekt Admini'}
                    </strong>. 
                    {currentRole === 'SUPER_ADMIN' 
                      ? " Super admin bo'lganligingiz sababli tizimda to'g'ridan-to'g'ri joylashtirish amalga oshadi."
                      : " Talaba ma'lumotlari to'ldirilib so'rov etilganda ariza kutilayotganlar paneliga (Super adminga) tushadi."
                    }
                  </div>
                </div>

                {/* Actions Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition-all cursor-pointer shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {currentRole === 'SUPER_ADMIN' 
                        ? "Hozirroq Joylashtirish" 
                        : "Super Adminga Joylashtirish So'rovini Yuborish"
                      }
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
