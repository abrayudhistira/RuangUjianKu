import Link from 'next/link'
import AdminHeader from '@/components/admin/AdminHeader'
import QuestionImportForm from '@/components/admin/QuestionImportForm'

export default function ImportQuestionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Link href="/admin/questions" className="text-sm text-accent hover:underline">← Kembali ke bank soal</Link>
          <h1 className="mt-4 text-2xl font-bold">Import Soal dari Markdown</h1>
          <p className="mt-2 text-muted-foreground">Gunakan format pada file template-soal.md agar soal, kunci, jawaban model, dan rubrik terbaca dengan benar.</p>
        </div>
        <QuestionImportForm />
      </main>
    </div>
  )
}
