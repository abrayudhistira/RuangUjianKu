import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-xl text-center">
        <div className="not-found-stage mx-auto mb-8 flex h-44 w-44 items-center justify-center" aria-hidden="true">
          <div className="not-found-orbit rounded-full border border-accent/40 p-3">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-card shadow-2xl shadow-accent/20 dark:bg-white">
              <img src="/app-icon.png" alt="" className="h-24 w-24 rounded-full object-contain" />
            </div>
          </div>
        </div>
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-accent">Ruang UjianKu</p>
        <p className="mt-4 font-mono text-7xl font-bold tracking-tight text-foreground sm:text-9xl">404</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Halaman tidak ditemukan</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          Halaman yang Anda cari mungkin sudah dipindahkan, dihapus, atau alamatnya tidak tepat.
        </p>
        <Link href="/" className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-6 py-3 font-semibold text-on-accent hover:bg-accent/90">
          Kembali ke Beranda
        </Link>
      </section>
    </main>
  )
}
