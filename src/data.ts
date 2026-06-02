/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, DormitoryRequest, ActivityLog } from './types';

export const FACULTIES = [
  'Tabiiy fanlar fakulteti',
  'Pedagogika va psixologiya fakulteti',
  'Filologiya fakulteti',
  'San\'atshunoslik fakulteti',
  'Jismoniy madaniyat fakulteti',
  'Aniq fanlar fakulteti',
  'Xorijiy tillar fakulteti'
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std_1',
    name: 'Alisher Rustamov',
    course: 2,
    faculty: 'Aniq fanlar fakulteti',
    group: 'Matematika-202',
    phone: '+998 93 123 45 67',
    gender: 'Erkak',
    dormId: 1,
    roomNumber: 15,
    bedNumber: 1,
    placementDate: '2025-09-02',
    hemisId: '313201100001'
  },
  {
    id: 'std_2',
    name: 'Dilrabo Tojiyeva',
    course: 1,
    faculty: 'Filologiya fakulteti',
    group: 'Ingliz-tili-104',
    phone: '+998 90 987 65 43',
    gender: 'Ayol',
    dormId: 1,
    roomNumber: 15,
    bedNumber: 2,
    placementDate: '2025-09-03',
    hemisId: '313201100002'
  },
  {
    id: 'std_3',
    name: 'Sardorbek Qodirov',
    course: 3,
    faculty: 'Jismoniy madaniyat fakulteti',
    group: 'Sport-301',
    phone: '+998 94 456 12 34',
    gender: 'Erkak',
    dormId: 2,
    roomNumber: 104,
    bedNumber: 1,
    placementDate: '2024-09-05',
    hemisId: '313201100003'
  },
  {
    id: 'std_4',
    name: 'Zilola Umarova',
    course: 2,
    faculty: 'Pedagogika va psixologiya fakulteti',
    group: 'Boshlang\'ich-ta\'lim-201',
    phone: '+998 99 777 88 99',
    gender: 'Ayol',
    dormId: 3,
    roomNumber: 302,
    bedNumber: 3,
    placementDate: '2025-09-01',
    hemisId: '313201100004'
  },
  {
    id: 'std_5',
    name: 'Jasur Shodiyev',
    course: 4,
    faculty: 'Tabiiy fanlar fakulteti',
    group: 'Biologiya-405',
    phone: '+998 91 222 33 44',
    gender: 'Erkak',
    dormId: 1,
    roomNumber: 15,
    bedNumber: 4,
    placementDate: '2023-09-02',
    hemisId: '313201100005'
  },
  {
    id: 'std_6',
    name: 'Nargiza Karimova',
    course: 1,
    faculty: 'Xorijiy tillar fakulteti',
    group: 'Nemis-tili-102',
    phone: '+998 95 333 44 55',
    gender: 'Ayol',
    dormId: 2,
    roomNumber: 220,
    bedNumber: 2,
    placementDate: '2025-09-10',
    hemisId: '313201100006'
  },
  {
    id: 'std_7',
    name: 'Bobur Mansurov',
    course: 3,
    faculty: 'San\'atshunoslik fakulteti',
    group: 'Musiqa-303',
    phone: '+998 97 111 22 33',
    gender: 'Erkak',
    dormId: 3,
    roomNumber: 88,
    bedNumber: 1,
    placementDate: '2024-09-08',
    hemisId: '313201100007'
  },
  {
    id: 'std_8',
    name: 'Fotima Ergasheva',
    course: 2,
    faculty: 'Aniq fanlar fakulteti',
    group: 'Informatika-203',
    phone: '+998 93 444 55 66',
    gender: 'Ayol',
    dormId: 2,
    roomNumber: 104,
    bedNumber: 3,
    placementDate: '2025-09-02',
    hemisId: '313201100008'
  }
];

export const INITIAL_REQUESTS: DormitoryRequest[] = [
  {
    id: 'req_1',
    type: 'ADD',
    studentName: 'Temur Ismoilov',
    course: 2,
    faculty: 'Tabiiy fanlar fakulteti',
    group: 'Geografiya-201',
    phone: '+998 90 111 50 60',
    gender: 'Erkak',
    dormId: 1,
    roomNumber: 15,
    bedNumber: 3,
    requestedBy: 'Yotoqxona 1 Admini',
    requestedAt: '2026-06-01T10:30:00Z',
    status: 'PENDING',
    hemisId: '313201100011'
  },
  {
    id: 'req_2',
    type: 'REMOVE',
    studentId: 'std_7',
    studentName: 'Bobur Mansurov', // Cache for display
    dormId: 3,
    roomNumber: 88,
    bedNumber: 1,
    requestedBy: 'Yotoqxona 3 Admini',
    requestedAt: '2026-06-02T06:15:00Z',
    status: 'PENDING'
  },
  {
    id: 'req_3',
    type: 'ADD',
    studentName: 'Malika Rasulova',
    course: 1,
    faculty: 'Xorijiy tillar fakulteti',
    group: 'Fransuz-tili-101',
    phone: '+998 94 333 80 90',
    gender: 'Ayol',
    dormId: 2,
    roomNumber: 220,
    bedNumber: 4,
    requestedBy: 'Yotoqxona 2 Admini',
    requestedAt: '2026-06-02T07:00:00Z',
    status: 'PENDING',
    hemisId: '313201100012'
  },
  {
    id: 'req_4',
    type: 'ADD',
    studentName: 'Shavkat Akbarov',
    course: 3,
    faculty: 'Aniq fanlar fakulteti',
    group: 'Fizika-302',
    phone: '+998 99 222 11 00',
    gender: 'Erkak',
    dormId: 3,
    roomNumber: 302,
    bedNumber: 1,
    requestedBy: 'Yotoqxona 3 Admini',
    requestedAt: '2026-05-31T14:20:00Z',
    status: 'APPROVED',
    resolvedAt: '2026-06-01T09:00:00Z',
    resolvedBy: 'Super Admin',
    hemisId: '313201100013'
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-06-01T09:00:00Z',
    action: 'Talaba joylash tasdiqlandi',
    details: 'Shavkat Akbarov (Aniq fanlar) Yotoqxona 3, xona 302, 1-joyga joylashtirildi',
    user: 'Super Admin',
    role: 'SUPER_ADMIN'
  },
  {
    id: 'log_2',
    timestamp: '2026-06-02T06:15:00Z',
    action: 'Chaqirib olish so\'rovi',
    details: 'Bobur Mansurovni Yotoqxona 3, xona 88, 1-joydan chiqarish so\'rovi yuborildi',
    user: 'Yotoqxona 3 Admini',
    role: 'DORM_3_ADMIN'
  },
  {
    id: 'log_3',
    timestamp: '2026-06-02T07:00:00Z',
    action: 'Joylashtirish so\'rovi',
    details: 'Malika Rasulova uchun Yotoqxona 2, xona 220, 4-joyga so\'rov yuborildi',
    user: 'Yotoqxona 2 Admini',
    role: 'DORM_2_ADMIN'
  }
];
