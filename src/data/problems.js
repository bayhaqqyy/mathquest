// Mock problem data for problem solving sessions
export const problems = {
  'aljabar-linear': {
    skillName: 'Persamaan Linear',
    topicName: 'Aljabar',
    problems: [
      {
        id: 1,
        question: 'Selesaikan persamaan berikut:',
        expression: '2x + 6 = 14',
        type: 'input',
        answer: '4',
        hints: [
          'Perhatikan: kita perlu mengisolasi variabel x',
          'Pindahkan konstanta ke ruas kanan: 2x = 14 - 6',
          'Bagi kedua ruas dengan koefisien x',
        ],
        steps: [
          {
            title: 'Identifikasi persamaan',
            explanation: 'Kita memiliki persamaan linear satu variabel',
            math: '2x + 6 = 14',
          },
          {
            title: 'Pindahkan konstanta',
            explanation: 'Kurangi kedua ruas dengan 6 untuk mengisolasi suku yang mengandung x',
            math: '2x = 14 - 6 = 8',
          },
          {
            title: 'Bagi dengan koefisien',
            explanation: 'Bagi kedua ruas dengan 2 untuk mendapatkan nilai x',
            math: 'x = 8 ÷ 2 = 4',
          },
          {
            title: 'Verifikasi',
            explanation: 'Substitusi x = 4 ke persamaan awal',
            math: '2(4) + 6 = 8 + 6 = 14 ✓',
          },
        ],
      },
      {
        id: 2,
        question: 'Tentukan nilai x:',
        expression: '3x - 9 = 18',
        type: 'input',
        answer: '9',
        hints: [
          'Langkah pertama: pindahkan -9 ke ruas kanan',
          'Rumus: ax + b = c → x = (c - b) / a',
          '3x = 18 + 9 = 27',
        ],
        steps: [
          {
            title: 'Identifikasi persamaan',
            explanation: 'Persamaan linear: 3x - 9 = 18',
            math: '3x - 9 = 18',
          },
          {
            title: 'Tambahkan 9 ke kedua ruas',
            explanation: 'Eliminasi konstanta di ruas kiri',
            math: '3x = 18 + 9 = 27',
          },
          {
            title: 'Bagi dengan 3',
            explanation: 'Isolasi x dengan membagi koefisien',
            math: 'x = 27 ÷ 3 = 9',
          },
          {
            title: 'Verifikasi',
            explanation: 'Cek: 3(9) - 9 = 27 - 9 = 18 ✓',
            math: '3(9) - 9 = 18 ✓',
          },
        ],
      },
      {
        id: 3,
        question: 'Cari nilai x dari persamaan:',
        expression: '5x + 3 = 2x + 15',
        type: 'input',
        answer: '4',
        hints: [
          'Kumpulkan suku x di satu ruas',
          '5x - 2x = 15 - 3',
          '3x = 12',
        ],
        steps: [
          {
            title: 'Identifikasi',
            explanation: 'Persamaan dengan variabel di kedua ruas',
            math: '5x + 3 = 2x + 15',
          },
          {
            title: 'Kumpulkan suku x di kiri',
            explanation: 'Kurangi 2x dari kedua ruas',
            math: '5x - 2x + 3 = 15',
          },
          {
            title: 'Sederhanakan & pindahkan konstanta',
            explanation: 'Gabungkan suku sejenis dan kurangi 3',
            math: '3x = 15 - 3 = 12',
          },
          {
            title: 'Selesaikan',
            explanation: 'Bagi kedua ruas dengan 3',
            math: 'x = 12 ÷ 3 = 4',
          },
          {
            title: 'Verifikasi',
            explanation: 'Substitusi: 5(4)+3 = 23 dan 2(4)+15 = 23 ✓',
            math: '5(4) + 3 = 2(4) + 15 → 23 = 23 ✓',
          },
        ],
      },
      {
        id: 4,
        question: 'Selesaikan:',
        expression: '4(x - 2) = 20',
        type: 'input',
        answer: '7',
        hints: [
          'Distribusikan 4 ke dalam kurung, atau bagi langsung',
          'Cara cepat: x - 2 = 20/4',
          'x - 2 = 5, maka x = ?',
        ],
        steps: [
          {
            title: 'Persamaan awal',
            explanation: 'Ada perkalian dengan kurung',
            math: '4(x - 2) = 20',
          },
          {
            title: 'Bagi kedua ruas dengan 4',
            explanation: 'Sederhanakan persamaan',
            math: 'x - 2 = 5',
          },
          {
            title: 'Tambahkan 2',
            explanation: 'Isolasi x',
            math: 'x = 5 + 2 = 7',
          },
          {
            title: 'Verifikasi',
            explanation: 'Cek: 4(7-2) = 4(5) = 20 ✓',
            math: '4(7 - 2) = 4(5) = 20 ✓',
          },
        ],
      },
      {
        id: 5,
        question: 'Tentukan x:',
        expression: 'x/3 + 4 = 10',
        type: 'input',
        answer: '18',
        hints: [
          'Isolasi x/3 terlebih dahulu',
          'x/3 = 10 - 4 = 6',
          'Kalikan dengan 3',
        ],
        steps: [
          {
            title: 'Persamaan awal',
            explanation: 'Persamaan dengan pecahan',
            math: 'x/3 + 4 = 10',
          },
          {
            title: 'Kurangi 4 dari kedua ruas',
            explanation: 'Isolasi pecahan',
            math: 'x/3 = 10 - 4 = 6',
          },
          {
            title: 'Kalikan dengan 3',
            explanation: 'Hilangkan penyebut',
            math: 'x = 6 × 3 = 18',
          },
          {
            title: 'Verifikasi',
            explanation: 'Cek: 18/3 + 4 = 6 + 4 = 10 ✓',
            math: '18/3 + 4 = 6 + 4 = 10 ✓',
          },
        ],
      },
    ],
  },
}

// Weekly activity data for analytics
export const weeklyActivity = [
  { day: 'Sen', count: 5, date: '14 Apr' },
  { day: 'Sel', count: 8, date: '15 Apr' },
  { day: 'Rab', count: 3, date: '16 Apr' },
  { day: 'Kam', count: 0, date: '17 Apr' },
  { day: 'Jum', count: 6, date: '18 Apr' },
  { day: 'Sab', count: 12, date: '19 Apr' },
  { day: 'Min', count: 7, date: '20 Apr' },
]

// Topic strength data
export const topicStrengths = [
  { name: 'Aritmatika', strength: 90, color: '#006c44' },
  { name: 'Aljabar', strength: 72, color: '#8e4e00' },
  { name: 'Trigonometri', strength: 45, color: '#6d4ea2' },
  { name: 'Geometri', strength: 35, color: '#e8913a' },
  { name: 'Probabilitas', strength: 10, color: '#534437' },
]
