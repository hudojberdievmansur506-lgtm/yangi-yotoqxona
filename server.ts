/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Mock HEMIS Database for simulated /api/students/search/:studentId calls
const MOCK_HEMIS_STUDENTS: Record<string, {
  full_name: string;
  student_id_number: string;
  faculty: string;
  specialty: string;
  course: number;
  group_name: string;
  image: string;
}> = {
  '313201100011': {
    full_name: 'Shohruhbek Qodirov Ergashevich',
    student_id_number: '313201100011',
    faculty: 'Matematika-fizika',
    specialty: 'Fizika o\'qitish metodikasi',
    course: 3,
    group_name: 'Fiz-311',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
  },
  '313201100012': {
    full_name: 'Sevara Xalilova Olimjonovna',
    student_id_number: '313201100012',
    faculty: 'Tabiiy fanlar',
    specialty: 'Kimyo o\'qitish metodikasi',
    course: 2,
    group_name: 'Kim-202',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  '313201100013': {
    full_name: 'Bekzod Rustamov Axmadovich',
    student_id_number: '313201100013',
    faculty: 'Tillar va adabiyot',
    specialty: 'O\'zbek tili va adabiyoti',
    course: 4,
    group_name: 'Uzb-401',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  '313201100014': {
    full_name: 'Zarina Ergasheva Shavkatovna',
    student_id_number: '313201100014',
    faculty: 'Pedagogika',
    specialty: 'Maktabgacha ta\'lim',
    course: 1,
    group_name: 'Makt-103',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
  },
  '313201100015': {
    full_name: 'Jasurbek To\'rayev Husniddin o\'g\'li',
    student_id_number: '313201100015',
    faculty: 'Tarix va ijtimoiy fanlar',
    specialty: 'Tarix (mamlakatlar va yo\'nalishlar bo\'yicha)',
    course: 2,
    group_name: 'Tar-201',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  },
  '313201100016': {
    full_name: 'Dilnoza Soliyeva Bahodirovna',
    student_id_number: '313201100016',
    faculty: 'Milliy g\'oya va huquq',
    specialty: 'Huquqiy ta\'lim',
    course: 3,
    group_name: 'Huq-304',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
  },
  '313201111111': {
    full_name: 'Davron Karimov Botiraliyevich',
    student_id_number: '313201111111',
    faculty: 'Matematika-fizika',
    specialty: 'Amaliy matematika va informatika',
    course: 4,
    group_name: 'Mat-410',
    image: 'https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?auto=format&fit=crop&w=150&q=80'
  },
  '313201122222': {
    full_name: 'Laylo Ismoilova Sodiqovna',
    student_id_number: '313201122222',
    faculty: 'Milliy g\'oya va huquq',
    specialty: 'Siyosatshunoslik',
    course: 1,
    group_name: 'Siy-101',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80'
  }
};

async function start() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // GET /api/students/search/:studentId
  app.get('/api/students/search/:studentId', (req, res) => {
    const { studentId } = req.params;
    console.log(`[HEMIS Integration] Searching student with ID: ${studentId}`);
    
    const record = MOCK_HEMIS_STUDENTS[studentId];
    if (record) {
      res.json({
        success: true,
        student: record
      });
    } else {
      res.json({
        success: false
      });
    }
  });

  // Vite Integration in Express
  if (process.env.NODE_ENV !== 'production') {
    const viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(viteInstance.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
