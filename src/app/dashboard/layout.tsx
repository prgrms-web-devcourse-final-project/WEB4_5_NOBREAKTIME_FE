import Header from '@/components/layout/header'
import Nav from '@/components/layout/nav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <Nav />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex flex-1 flex-col px-12 py-4 overflow-auto gap-4">{children}</main>
            </div>
        </div>
    )
}
