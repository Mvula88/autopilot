import { Sidebar } from '@/components/navigation/sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 lg:px-8 lg:pl-4">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}