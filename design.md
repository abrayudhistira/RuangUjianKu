# Design System - Ambarsan Exam

> **Source of Truth**: Generated from [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill  
> **Version**: 1.0.0 | **Date**: 2026-10-18  
> **Product Type**: SaaS / Admin Dashboard / E-Learning

---

## 1. Design Dials

| Dial | Setting | Arti |
|------|---------|------|
| **Variance** | 5/10 | Balanced / Modern — tidak terlalu eksentrik, tetap profesional |
| **Motion** | 3/10 | Subtle — transisi halus tanpa animasi berlebihan |
| **Density** | 6/10 | Standard — readable spacing, cocok untuk dashboard |

---

## 2. Overall Pattern

**Name:** Real-Time / Operations Landing

### Karakteristik
- Hero section dengan status ujian live
- Key metrics / stat cards untuk ringkasan
- "How it works" untuk menjelaskan alur ujian
- CTA setelah metrics

### CTA Placement
- Primary CTA di navigasi (header)
- CTA sekunder setelah key metrics

### Sections
1. **Hero** — product + live preview atau status ujian
2. **Key Metrics** — statistik ringkasan (jumlah ujian, peserta, hasil)
3. **How It Works** — penjelasan alur ujian (3 langkah)
4. **CTA** — mulai ujian / contact admin

---

## 3. Style

**Name:** Glassmorphism (adapted)

### Karakteristik
- **Mode:** Light & Dark (prioritaskan dark mode untuk fokus)
- **Keywords:** Frosted glass, transparent, layered, depth
- **Best For:** Admin dashboards, form cards, modal overlays

> **Note:** Untuk aplikasi ujian, kita akan **menyesuaikan** glassmorphism agar tidak terlalu transparan — hal ini penting agar fokus peserta tidak terganggu. Card akan memiliki opisitas tinggi (~95%) dengan border lembut.

---

## 4. Color Palette

| Variable | Warna | Kode Hex | Penggunaan |
|----------|-------|----------|------------|
| `--color-primary` | Dark Slate | `#1E293B` | Header, sidebar, text utama |
| `--color-on-primary` | White | `#FFFFFF` | Text pada primary |
| `--color-secondary` | Slate Gray | `#334155` | Background card, elemen sekunder |
| `--color-on-secondary` | White | `#FFFFFF` | Text pada secondary |
| `--color-accent` | Emerald Green | `#22C55E` | CTA, tombol aksi, highlight |
| `--color-on-accent` | Dark | `#0F172A` | Text pada accent |
| `--color-background` | Dark Blue Gray | `#0F172A` | Background utama |
| `--color-foreground` | Light Gray | `#F8FAFC` | Text utama di background gelap |
| `--color-card` | Deep Blue Gray | `#1B2336` | Background card |
| `--color-card-foreground` | Light | `#F8FAFC` | Text di dalam card |
| `--color-muted` | Blue Gray | `#272F42` | Background elemen tidak aktif |
| `--color-muted-foreground` | Gray | `#94A3B8` | Text sekunder/muted |
| `--color-border` | Blue Gray | `#475569` | Border elemen |
| `--color-destructive` | Red | `#EF4444` | Hapus, error, reset |
| `--color-on-destructive` | Black | `#000000` | Text pada destructive |
| `--color-ring` | White | `#FFFFFF` | Focus ring |

### Color Usage Rules

| Use Case | Warna |
|----------|-------|
| Background utama | `var(--color-background)` |
| Card / Panel | `var(--color-card)` |
| Border | `var(--color-border)` |
| Text primary | `var(--color-foreground)` |
| Text secondary | `var(--color-muted-foreground)` |
| Tombol primari (CTA) | `var(--color-accent)` dengan text `var(--color-on-accent)` |
| Tombol sekunder | `var(--color-secondary)` dengan text `var(--color-on-secondary)` |
| Tombol berbahaya | `var(--color-destructive)` dengan text `var(--color-on-destructive)` |
| Link / interaktif | `var(--color-accent)` |

---

## 5. Typography

### Font Pairing
- **Headings & Body:** `Fira Sans` (variable, 300-700)
- **Code & Monospace:** `Fira Code` (400-700) — untuk timer dan nomor soal

### Google Fonts Import
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

### Typography Scale (Tailwind config)

| Element | Font Size | Line Height | Weight | Letter Spacing |
|---------|-----------|-------------|--------|----------------|
| Display (Hero) | 3rem (48px) | 1.1 | 700 | -0.02em |
| h1 (Halaman) | 2rem (32px) | 1.2 | 600 | -0.01em |
| h2 (Section) | 1.5rem (24px) | 1.3 | 600 | -0.01em |
| h3 (Card Title) | 1.125rem (18px) | 1.4 | 600 | normal |
| h4 (Sub-section) | 1rem (16px) | 1.4 | 600 | normal |
| Body (default) | 0.9375rem (15px) | 1.6 | 400 | normal |
| Small (helper) | 0.8125rem (13px) | 1.5 | 500 | normal |
| Caption | 0.75rem (12px) | 1.4 | 500 | 0.02em |
| Timer (exam) | 1.25rem (20px) | 1.2 | 700 (Fira Code) | - |
| Question number | 1rem (16px) | 1.2 | 600 (Fira Code) | - |

---

## 6. Spacing System (Tailwind)

| Variable | Nilai | CSS |
|----------|-------|-----|
| `--space-3xs` | 0.25rem (4px) | 4px |
| `--space-2xs` | 0.5rem (8px) | 8px |
| `--space-xs` | 0.75rem (12px) | 12px |
| `--space-sm` | 1rem (16px) | 16px |
| `--space-md` | 1.25rem (20px) | 20px |
| `--space-lg` | 1.5rem (24px) | 24px |
| `--space-xl` | 2rem (32px) | 32px |
| `--space-2xl` | 2.5rem (40px) | 40px |
| `--space-3xl` | 3rem (48px) | 48px |

---

## 7. Breakpoints (Mobile-First)

| Device | Tailwind | Width |
|--------|----------|-------|
| Mobile (sm) | `sm:` | ≥ 640px |
| Tablet (md) | `md:` | ≥ 768px |
| Laptop (lg) | `lg:` | ≥ 1024px |
| Desktop (xl) | `xl:` | ≥ 1280px |
| Wide (2xl) | `2xl:` | ≥ 1536px |

---

## 8. Components

### 8.1 Cards & Panels
```
.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```
> Untuk halaman ujian, gunakan `.card` dengan border lebih tebal (`2px`) untuk focus tetap baik.

### 8.2 Buttons
| Type | Style |
|------|-------|
| Primary (CTA) | bg-accent, hover:bg-accent/90, text-on-accent |
| Secondary | bg-secondary, hover:bg-secondary/80, text-on-secondary |
| Destructive | bg-destructive, hover:bg-destructive/90, text-on-destructive |
| Ghost | bg-transparent, hover:bg-muted, text-foreground |
| Icon Button | 44x44px, rounded-lg, flex items-center justify-center |

### 8.3 Form Elements
| Element | Style |
|---------|-------|
| Input | border: 1px solid var(--color-border), border-radius: 8px, padding: 12px, background: transparent |
| Textarea | Sama seperti input, resizable: vertical |
| Select | Native select dengan styling Tailwind |
| Radio | Custom radio dengan label di kanan |
| Checkbox | Custom checkbox |
| Toggle | Switch untuk true/false |

### 8.4 Timer
```
.timer {
  font-family: 'Fira Code', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-foreground);
  background: var(--color-card);
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
```

### 8.5 Question Card
```
.question-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}
```

---

## 9. Layout: Halaman Peserta

### 9.1 Auth Pages (Login/Register)
```
┌─────────────────────────────────────┐
│         Header (logo)               │
├─────────────────────────────────────┤
│                                     │
│        ┌──────────────────┐         │
│        │ Login Form Card  │         │
│        │ Email input      │         │
│        │ Password input   │         │
│        │ [Google OAuth]   │         │
│        │ [Login Button]   │         │
│        └──────────────────┘         │
│                                     │
│        ┌──────────────────┐         │
│        │ Register Link    │         │
│        └──────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

### 9.2 Dashboard Peserta
```
┌──────┬──────────────────────────────────┐
│ SIDE │ MAIN CONTENT                    │
│ BAR │                                   │
│     │ ┌──────────────┐ ┌──────────────┐ │
│     │ │Stat Card 1   │ │Stat Card 2   │ │
│     │ │Ujian Tersedia│ │Riwayat       │ │
│     │ └──────────────┘ └──────────────┘ │
│     │                                   │
│     │ ┌──────────────────────────────┐ │
│     │ │ Daftar Ujian Table/List     │ │
│     │ │ • Matematika (Open)         │ │
│     │ │ • Fisika (Locked) 🔒        │ │
│     │ │ • Kimia (Closed)            │ │
│     │ └──────────────────────────────┘ │
└──────┴──────────────────────────────────┘
```

### 9.3 Halaman Ujian
```
┌─────────────────────────────────────────┐
│ Header: [Back] Exam Title [Timer: 45:00]│
├─────────────────────────────────────────┤
│                                         │
│ Sidebar (mobile: bottom sheet)          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ Q1 ○    │ │ Q2 ●    │ │ Q3 ○    │    │
│ │ (Not Ans)│ │ (Saved) │ │ (Not Ans)│   │
│ └─────────┘ └─────────┘ └─────────┘    │
│                                         │
│ Main Content (Question Card)           │
│ ┌─────────────────────────────────────┐ │
│ │ 1. Berapa hasil 2 + 2?              │ │
│ │                                     │ │
│ │ ○ 3  ☐ 4  ☐ 5  ☐ 6                  │ │
│ │                                     │ │
│ │ [Save] [Next] [Prev]                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Action Bar                              │
│ ┌─────────────────────────────────────┐ │
│ │ [← Sebelumnya] [Simpan Jawaban]     │ │
│ │ [Berikutnya →]   [Submit Ujian]     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 9.4 Halaman Hasil
```
┌─────────────────────────────────────────┐
│ Header: Hasil Ujian                     │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Nilai: 85 / 100                     │ │
│ │ Status: ✅ LULUS                    │ │
│ │ Durasi: 32 menit                    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Ringkasan Jawaban                   │ │
│ │ • Soal 1: Benar ✓                   │ │
│ │ • Soal 2: Salah ✗ (jawaban: B)      │ │
│ │ • Soal 3: Benar ✓                   │ │
│ │                                     │ │
│ │ [Download PDF] [Print]              │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 10. Layout: Halaman Admin

### 10.1 Login Admin
```
┌─────────────────────────────────────┐
│                                     │
│        ┌──────────────────┐         │
│        │ Admin Login Card │         │
│        │ Email            │         │
│        │ Password         │         │
│        │ Role: [Admin]    │         │
│        │ [Login]          │         │
│        └──────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

### 10.2 Dashboard Admin
```
┌──────┬──────────────────────────────────┐
│ SIDE │ MAIN CONTENT                    │
│ BAR │                                   │
│     │ ┌─────┐┌─────┐┌─────┐┌─────┐     │
│     │ │Stat ││Stat ││Stat ││Stat │     │
│     │ │Ujian││Soal ││User ││Hasil│     │
│     │ └─────┘└─────┘└─────┘└─────┘     │
│     │                                   │
│     │ ┌──────────────────────────────┐ │
│     │ │ Quick Actions                 │ │
│     │ │ [+ Buat Ujian] [+ Tambah Soal]│ │
│     │ └──────────────────────────────┘ │
│     │                                   │
│     │ ┌──────────────────────────────┐ │
│     │ │ Recent Exams Table          │ │
│     │ └──────────────────────────────┘ │
└──────┴──────────────────────────────────┘
```

### 10.3 Kelola Soal (Form)
```
┌─────────────────────────────────────────┐
│ Header: Edit Soal                        │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Question Type: [Multiple Choice ▼]  │ │
│ │ Title: [_________________________] │ │
│ │ Question Text:                      │ │
│ │ [_______________________________]  │ │
│ │ [_______________________________]  │ │
│ │                                     │ │
│ │ Options:                            │ │
│ │ [A] [___________________________] ✓│ │
│ │ [B] [___________________________]   │ │
│ │ [C] [___________________________]   │ │
│ │ [D] [___________________________]   │ │
│ │ [+ Tambah Opsi]                      │ │
│ │                                     │ │
│ │ Difficulty: [Easy ▼]                │ │
│ │ Tags: [math] [algebra] [x]          │ │
│ │ [Simpan] [Batal]                    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 10.4 Kelola Ujian (Form)
```
┌─────────────────────────────────────────┐
│ Header: Edit Ujian                       │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Title: [_________________________] │ │
│ │ Description:                        │ │
│ │ [_______________________________]  │ │
│ │ [_______________________________]  │ │
│ │                                     │ │
│ │ Settings:                           │ │
│ │ ☐ Locked (membutuhkan unlock key)   │ │
│ │ Unlock Key: [__________]            │ │
│ │ Duration: [60] menit                │ │
│ │ Passing Score: [60] %               │ │
│ │                                     │ │
│ │ Schedule:                           │ │
│ │ Start: [2026-10-20 08:00]           │ │
│ │ End:   [2026-10-20 10:00]           │ │
│ │                                     │ │
│ │ [Simpan] [Hapus] [Batal]            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 11. Motion (Subtle)

### Scroll Reveal (300-400ms)
```js
// GSAP
gsap.from(el, { 
  opacity: 0, 
  y: 12, 
  duration: 0.35, 
  ease: 'power1.out', 
  scrollTrigger: { 
    trigger: el, 
    start: 'top 90%', 
    toggleActions: 'play none none reverse' 
  }
});
// Always respect: prefers-reduced-motion
```

### Hover States (150ms)
```css
transition: all 150ms ease;
&:hover { opacity: 0.85; }
```

---

## 12. Accessibility (Must Have)

| Check | Status |
|-------|--------|
| Text contrast ≥ 4.5:1 | ✅ |
| Focus visible on keyboard nav | ✅ |
| `aria-label` on icon buttons | ✅ |
| `prefers-reduced-motion` | ✅ |
| Semantic HTML | ✅ |
| Alt text on images | ✅ |

---

## 13. Tailwind Config

```js
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1E293B',
        secondary: '#334155',
        accent: '#22C55E',
        background: '#0F172A',
        card: '#1B2336',
        // ...
      },
      fontFamily: {
        sans: ['Fira Sans', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      spacing: {
        '3xs': '0.25rem',
        '2xs': '0.5rem',
        // ...
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '4px',
      },
    },
  },
  plugins: [],
}
```

---

## 14. File Output

Design system files persisted to:
- `design-system/ambarsan-exam/MASTER.md` — Global rules
- `design-system/ambarsan-exam/pages/dasboard.md` — Page-specific overrides (jika diperlukan)

---

*Design system ini akan diupdate seiring kebutuhan UI/UX berkembang.*