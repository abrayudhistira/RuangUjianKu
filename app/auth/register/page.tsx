import RegisterForm from '@/components/auth/RegisterForm'
import ThemeToggle from '@/components/theme/ThemeToggle'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold">Ruang UjianKu</h1>
          <p className="text-muted-foreground mt-2">Daftar akun baru</p>
        </div>

        <div className="card p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}