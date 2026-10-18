# PRD - Ambarsan Exam (Aplikasi Ujian Online)

## 1. Gambaran Umum

**Nama Produk:** Ambarsan Exam  
**Versi:** 1.0.0  
**Tanggal:** 2026-10-18  
**Tech Stack:** Next.js 16, React 19, Supabase, Tailwind CSS  
**Deployment:** Vercel (planned)

### Ringkasan
Aplikasi ujian online berbasis web yang mendukung dua peran pengguna: **Peserta** dan **Admin**. Peserta dapat mengerjakan ujian yang dikunci dengan autentikasi wajib, sementara Admin dapat mengelola soal ujian, mengatur kunci jawaban, dan memantau hasil.

---

## 2. Persona & Peran

| Peran | Deskripsi | Akses |
|-------|-----------|-------|
| **Peserta** | Pengguna yang terdaftar untuk mengikuti ujian | Login, akses soal, kirim jawaban, lihat hasil |
| **Admin** | Pengelola sistem dan soal ujian | CRUD soal, atur kunci jawaban, kelola peserta, lihat semua hasil |

---

## 3. Asumsi Bisnis

1. Ujian bersifat **tutup** — hanya peserta terdaftar yang dapat mengakses
2. Soal ujian **dikunci** (encrypted/protected) dan memerlukan **kunci** untuk dibuka
3. Admin menjadi sumber otoritas — mereka yang membuat dan Mengunci soal
4. Sistem mendukung beberapa jenis soal: **multiple-choice**, **short answer**, **essay**, **true/false**, **matching**, **dropdown**
5. Login dapat dilakukan via **email/password** atau **OAuth (Google)**
6. Setiap ujian memiliki **kunci jawaban** yang digunakan untuk:
   - Membuka kunci soal saat ujian dimulai (unlock_key)
   - Menyimpan kunci jawaban benar untuk auto-grading

---

## 4. Fitur

### 4.1 Fitur Autentikasi & Otorisasi

#### 4.1.1 Registrasi & Login (Peserta)

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Tinggi |
| **Deskripsi** | Peserta dapat mendaftar akun dan masuk |
| **UI** | Form registrasi/login di `/auth/register` dan `/auth/login` |
| **Metode Login** | Email/password **atau** OAuth Google |
| **Validasi** | Email valid, password minimal 8 karakter |
| **Backend** | Supabase Auth (built-in OAuth providers) |

#### 4.1.2 Login Admin

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Tinggi |
| **Deskripsi** | Admin masuk ke panel khusus |
| **UI** | Form login di `/admin/login` |
| **Otorisasi** | Role-based di Supabase (`admin`) |

#### 4.1.3 Session & Middleware

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Tinggi |
| **Deskripsi** | Melindungi route berdasarkan role |
| **Middleware** | `middleware.ts` — redirect berdasarkan role |
| **State Management** | Session context via Supabase client |

---

### 4.2 Fitur Admin

#### 4.2.1 Dashboard Admin

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Tinggi |
| **Deskripsi** | Panel kontrol utama admin |
| **Rute** | `/admin` |
| **Komponen** | Statistik singkat, aksi cepat, navigasi ke fitur lain |

#### 4.2.2 Kelola Soal Ujian (CRUD)

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Tinggi |
| **Deskripsi** | Admin dapat membuat, membaca, mengedit, menghapus soal |
| **Rute** | `/admin/questions` |
| **Form Fields** | |  
| | - `title` (string): judul soal |
| | - `question_text` (text): isi soal |
| | - `question_type` (enum): `multiple_choice`, `short_answer`, `essay` |
| | - `options` (array of objects): untuk multiple_choice — `[{ label: "A", text: "...", is_correct: boolean }]` |
| | - `exam_id` (FK): soal milik ujian mana |
| | - `difficulty` (enum): `easy`, `medium`, `hard` |
| | - `tags` (array of strings): topik/kategori |
| **Aksi** | |
| | - Buat soal baru di `/admin/questions/new` |
| | - Edit di `/admin/questions/[id]/edit` |
| | - Hapus dengan konfirmasi |
| | - Upload CSV bulk (opsional, v2) |

#### 4.2.3 Kelola Ujian (CRUD)

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Tinggi |
| **Deskripsi** | Admin dapat membuat dan mengelola ujian |
| **Rute** | `/admin/exams` |
| **Form Fields** | |
| | - `title` (string): nama ujian |
| | - `description` (text): deskripsi singkat |
| | - `is_locked` (boolean): apakah ujian dikunci |
| | - `unlock_key` (string): kunci untuk membuka ujian |
| | - `duration_minutes` (integer): durasi dalam menit |
| | - `start_time` (timestamp): kapan ujian dibuka |
| | - `end_time` (timestamp): kapan ujian ditutup |
| | - `passing_score` (integer): nilai lulus |
| **Logic** | |
| | - Saat `is_locked = true`, peserta membutuhkan `unlock_key` untuk mengakses soal |
| | - Ujian hanya bisa dimulai dalam rentang `[start_time, end_time]` |

#### 4.2.4 Kelola Peserta

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Sedang |
| **Deskripsi** | Admin dapat melihat daftar peserta |
| **Rute** | `/admin/participants` |
| **Fitur** | |
| | - List peserta dengan filter |
| | - Lihat progres / hasil peserta |
| | - Import peserta via CSV (opsional, v2) |

#### 4.2.5 Hasil Ujian

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Tinggi |
| **Deskripsi** | Admin melihat semua hasil ujian |
| **Rute** | `/admin/results` |
| **Data** | |
| | - Nilai peserta |
| | - Waktu pengerjaan |
| | - Jawaban per soal |
| | - Export ke CSV |

---

### 4.3 Fitur Peserta

#### 4.3.1 Dashboard Peserta

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Tinggi |
| **Deskripsi** | Halaman utama peserta setelah login |
| **Rute** | `/` (authenticated) |
| **Komponen** | |
| | - Daftar ujian yang tersedia |
| | - Status ujian (buka/tutup/deadline) |
| | - Tombol "Mulai Ujian" |

#### 4.3.2 Membuka Kunci Ujian

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Tinggi |
| **Deskripsi** | Peserta memasukkan kunci untuk membuka ujian yang dikunci |
| **UI** | Modal atau halaman input kunci |
| | Field: `unlock_key` |
| **Validasi** | Key harus cocok dengan `unlock_key` di database |
| **State** | Setelah berhasil, ujian status = `unlocked` untuk sesi ini |

#### 4.3.3 Halaman Ujian

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Tinggi |
| **Deskripsi** | Interface utama untuk mengerjakan ujian |
| **Rute** | `/exam/[examId]` |
| **Fitur** | |
| | - Timer countdown (berdasarkan `duration_minutes`) |
| | - Navigasi soal (sidebar / pagination) |
| | - Auto-save jawaban tiap perubahan |
| | - Tombol "Kirim" / "Submit" |
| | - Konfirmasi sebelum submit |
| **Soal Multiple Choice** | Radio button per opsi |
| **Soal True/False** | Toggle atau radio buttons |
| **Soal Dropdown** | Select dropdown |
| **Soal Matching** | Dual-select atau drag-and-drop |
| **Soal Essay/Short Answer** | Textarea |

#### 4.3.4 Riwayat & Hasil

| Atribut | Nilai |
|---------|-------|
| **Prioritas** | Sedang |
| **Deskripsi** | Peserta melihat riwayat ujian yang pernah dikerjakan |
| **Rute** | `/results` atau `/profile/results` |
| **Data** | |
| | - Nilai akhir |
| | - Status lulus/tidak |
| | - Tanggal pengerjaan |

---

## 5. Database Schema (Supabase)

### 5.1 Auth (Supabase Built-in)

| Tabel | Kolom | Tipe | Keterangan |
|-------|-------|------|------------|
| `auth.users` | id | UUID | User ID |
| | email | string | Email |
| | password | encrypted | Password hash |
| | role | string | `user` / `admin` |

### 5.2 `exams`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID (PK) | Primary key |
| title | string | Nama ujian |
| description | text | Deskripsi |
| is_locked | boolean | Default: true |
| unlock_key | string | Kunci pembuka |
| duration_minutes | integer | Durasi ujian |
| start_time | timestamp | Waktu buka |
| end_time | timestamp | Waktu tutup |
| passing_score | integer | Nilai lulus (0-100) |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### 5.3 `questions`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID (PK) | Primary key |
| exam_id | UUID (FK → exams) | Ujian tempat soal ini |
| title | string | Judul soal |
| question_text | text | Isi soal |
| question_type | enum | `multiple_choice`, `short_answer`, `essay`, `true_false`, `matching`, `dropdown` |
| options | jsonb | Array of options `[{label, text, is_correct}]` (untuk choice-based) |
| difficulty | enum | `easy`, `medium`, `hard` |
| tags | text[] | Array tag |
| order_index | integer | Urutan soal |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### 5.4 `exam_attempts`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID (PK) | Primary key |
| user_id | UUID (FK → auth.users) | Peserta |
| exam_id | UUID (FK → exams) | Ujian |
| started_at | timestamp | Waktu mulai |
| submitted_at | timestamp | Waktu kirim |
| score | numeric | Nilai akhir |
| is_passed | boolean | Apakah lulus |
| status | enum | `in_progress`, `submitted`, `graded` |

### 5.5 `answers`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID (PK) | Primary key |
| attempt_id | UUID (FK → exam_attempts) | Attempt tempat jawaban ini |
| question_id | UUID (FK → questions) | Soal yang dijawab |
| selected_option | string | Untuk multiple choice: label opsi yang dipilih |
| answer_text | text | Untuk essay/short answer: teks jawaban |
| score | numeric | Nilai per soal (auto-graded) |
| graded_by | UUID (nullable) | FK → admin (untuk essay) |

---

## 6. Security

| Concern | Solusi |
|---------|--------|
| **Unauthorized access** | Middleware proteksi route + RBAC di DB |
| **Soal bocor** | Soal hanya ditampilkan setelah unlock_key valid |
| **Auto-submit** | Timer + auto-save + submit otomatis saat waktu habiru |
| **Data leakage** | Row Level Security (RLS) di Supabase |
| **SQL Injection** | Gunakan Supabase client (parameterized) |

---

## 7. Arsitektur

```
app/
├── api/
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   └── logout/route.ts
│   ├── exams/
│   │   ├── route.ts                    # GET all, POST new
│   │   └── [id]/route.ts               # GET, PUT, DELETE
│   ├── questions/
│   │   ├── route.ts                    # GET, POST
│   │   └── [id]/route.ts               # GET, PUT, DELETE
│   ├── attempts/
│   │   ├── route.ts                    # POST new attempt, GET list
│   │   └── [id]/route.ts               # GET, PUT (submit, save answer)
│   └── grading/
│       └── [attemptId]/route.ts        # Auto-grade attempt
├── auth/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── admin/
│   ├── page.tsx                        # Dashboard admin
│   ├── exams/
│   │   ├── page.tsx                    # List, create
│   │   ├── new/
│   │   │   └── page.tsx                # Form create
│   │   └── [id]/
│   │       ├── page.tsx                # Detail
│   │       └── edit/
│   │           └── page.tsx            # Form edit
│   ├── questions/
│   │   ├── page.tsx                    # List, filter by exam
│   │   ├── new/
│   │   │   └── page.tsx                # Form create
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx            # Form edit
│   ├── results/
│   │   └── page.tsx                    # List semua hasil
│   └── participants/
│       └── page.tsx                    # List peserta
├── exam/
│   └── [examId]/
│       └── page.tsx                    # Halaman kerjakan ujian
├── results/
│   └── page.tsx                        # Hasil peserta
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthProvider.tsx
│   ├── exam/
│   │   ├── ExamTimer.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── QuestionNavigation.tsx
│   │   └── AnswerInput.tsx
│   ├── admin/
│   │   ├── ExamForm.tsx
│   │   ├── QuestionForm.tsx
│   │   └── ResultsTable.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── utils/
│   │   ├── auth.ts
│   │   ├── grading.ts
│   │   └── time.ts
│   └── types/
│       ├── index.ts
│       └── exam.ts
└── middleware.ts                       # Proteksi route
```

---

## 8. User Flow

### 8.1 Peserta

```
[Landing Page]
     ↓
[Register / Login]
     ↓
[Dashboard - Lihat Daftar Ujian]
     ↓
[Klik "Mulai Ujian"]
     ↓
[Input Unlock Key (jika locked)]
     ↓
[Halaman Ujian]
     ↓
[Kerjakan Soal] → [Auto-save setiap perubahan]
     ↓
[Submit Ujian] → [Konfirmasi]
     ↓
[Hasil Ujian (auto-graded)]
```

### 8.2 Admin

```
[Login Admin]
     ↓
[Dashboard Admin]
     ↓
Pilih aksi:
├── [Kelola Ujian] → CRUD ujian
├── [Kelola Soal] → CRUD soal (pilih ujian dulu)
├── [Lihat Hasil] → Filter & export
└── [Kelola Peserta] → Lihat & import

[Ujian] → [Input Unlock Key] → [Preview Mode (read-only)]
```

---

## 9. API Endpoints

### 9.1 Auth
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Daftar peserta baru | Public |
| POST | `/api/auth/login` | Login via email/password | Public |
| GET | `/api/auth/login/google` | Login via OAuth Google | Public |
| POST | `/api/auth/logout` | Logout | Peserta |
| POST | `/api/auth/admin/login` | Login admin | Public |

### 9.2 Exams
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/exams` | List semua ujian | Admin |
| POST | `/api/exams` | Buat ujian baru | Admin |
| GET | `/api/exams/[id]` | Detail ujian | Admin |
| PUT | `/api/exams/[id]` | Update ujian | Admin |
| DELETE | `/api/exams/[id]` | Hapus ujian | Admin |

### 9.3 Questions
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/exams/[id]/questions` | List soal ujian | Admin |
| POST | `/api/exams/[id]/questions` | Tambah soal | Admin |
| GET | `/api/questions/[id]` | Detail soal | Admin |
| PUT | `/api/questions/[id]` | Update soal | Admin |
| DELETE | `/api/questions/[id]` | Hapus soal | Admin |

### 9.4 Attempts & Answers
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/attempts` | Mulai attempt ujian | Peserta |
| GET | `/api/attempts` | List semua attempt | Admin |
| GET | `/api/attempts/[id]` | Detail attempt | Peserta/Admin |
| PUT | `/api/attempts/[id]` | Update attempt (save/submit) | Peserta |
| POST | `/api/attempts/[id]/answers` | Save jawaban | Peserta |
| POST | `/api/attempts/[id]/submit` | Submit ujian | Peserta |
| POST | `/api/attempts/[id]/grade` | Auto-grade | System/Admin |

---

## 10. Rencana Pengembangan (MVP Phases)

### Phase 1: Foundation (Week 1-2)
- [x] Setup proyek Next.js + Supabase
- [x] Auth (login/register) untuk peserta
- [x] Admin role & login
- [x] Middleware proteksi route
- [x] Database schema design & migrations

### Phase 2: Admin Features (Week 2-3)
- [x] CRUD ujian (dengan lock/unlock key)
- [x] CRUD soal (multiple choice)
- [x] Dashboard admin
- [x] RLS policies

### Phase 3: Peserta Features (Week 3-4)
- [x] Dashboard peserta (lihat daftar ujian)
- [x] Unlock ujian dengan key
- [x] Halaman ujian (timer, soal, auto-save)
- [x] Submit ujian
- [x] Halaman hasil

### Phase 4: Grading & Results (Week 4)
- [x] Auto-grading multiple choice
- [x] Dashboard hasil admin
- [x] Riwayat hasil peserta
- [x] Export CSV (admin)

### Phase 5: Polish & Deploy (Week 5)
- [x] Responsive design
- [x] Error handling & validation
- [x] Deploy ke Vercel
- [x] Testing manual

---

## 11. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Performance** | Page load < 2s |
| **Responsiveness** | Mobile-first, support tablet |
| **Security** | HTTPS, RLS, input sanitization |
| **Scalability** | Stateless API, Supabase auto-scaling |
| **Accessibility** | WCAG 2.1 AA compliance |

---

## 12. Open Questions

1. **Bulk import soal** — akan dilakukan via CSV upload (v2) setelah MVP
2. **Email verification** — diperlukan untuk registrasi, tapi bisa dilewati untuk OAuth Google
3. **Notification** — tidak termasuk di MVP, pertimbangkan untuk v2
4. **Essay grading** — manual oleh admin untuk v1 (auto-grade hanya untuk choice-based)
5. **Ujian ulang** — peserta **bisa** mengerjakan berulang kali, masing-masing attempt tercatat terpisah

---

*PRD ini akan diupdate seiring pengembangan berjalan.*