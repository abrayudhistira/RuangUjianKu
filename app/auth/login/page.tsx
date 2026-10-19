import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'
import { ShieldCheck, Timer } from 'lucide-react'
import ThemeToggle from '@/components/theme/ThemeToggle'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px] lg:gap-16">
        <section className="hidden lg:block" aria-label="Tentang Ruang UjianKu">
          <Link href="/" className="inline-flex items-center gap-3 text-foreground">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl dark:bg-white">
              <img src="/app-icon.png" alt="Ruang UjianKu" className="h-full w-full rounded-2xl object-contain" />
            </span>
            <span className="text-xl font-bold tracking-tight">Ruang UjianKu</span>
          </Link>
          <div className="mt-16 max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Platform ujian online</p>
            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-balance">
              Fokus belajar. Raih hasil terbaik.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              Kelola dan ikuti ujian dengan pengalaman yang aman, terstruktur, dan mudah digunakan.
            </p>
            <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4">
                <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold">Aman & terpercaya</p>
                <p className="mt-1 text-xs text-muted-foreground">Data ujian terlindungi.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <Timer className="h-5 w-5 text-accent" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold">Real-time</p>
                <p className="mt-1 text-xs text-muted-foreground">Timer dan autosave.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-4 flex justify-end">
            <ThemeToggle />
          </div>
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3 text-foreground">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl dark:bg-white">
              <img src="/app-icon.png" alt="Ruang UjianKu" className="h-full w-full rounded-2xl object-contain" />
            </span>
              <span className="text-xl font-bold tracking-tight">Ruang UjianKu</span>
            </Link>
          </div>
          <div className="card p-6 shadow-2xl shadow-black/10 sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold text-accent">Selamat datang kembali</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Masuk ke akun Anda</h2>
              <p className="mt-2 text-sm text-muted-foreground">Lanjutkan perjalanan ujian Anda.</p>
            </div>
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">Dengan masuk, Anda menyetujui penggunaan platform Ruang UjianKu.</p>
        </section>
      </div>
    </main>
  )
}