/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'SUPER_ADMIN' | 'DORM_1_ADMIN' | 'DORM_2_ADMIN' | 'DORM_3_ADMIN' | 'USER';

export interface Student {
  id: string;
  name: string;
  course: number;
  faculty: string;
  group: string;
  phone: string;
  gender: 'Erkak' | 'Ayol';
  dormId: 1 | 2 | 3;
  roomNumber: number;
  bedNumber: 1 | 2 | 3 | 4;
  placementDate: string;
  hemisId?: string;
}

export type RequestType = 'ADD' | 'REMOVE';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DormitoryRequest {
  id: string;
  type: RequestType;
  // For ADD requests
  studentName?: string;
  course?: number;
  faculty?: string;
  group?: string;
  phone?: string;
  gender?: 'Erkak' | 'Ayol';
  hemisId?: string;
  // For REMOVE requests
  studentId?: string;
  
  // Placement details
  dormId: 1 | 2 | 3;
  roomNumber: number;
  bedNumber: 1 | 2 | 3 | 4;
  
  // Metadata
  requestedBy: string;
  requestedAt: string;
  status: RequestStatus;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
  role: string;
}
