'use client'

import Header from '@/components/layout/header'
import Nav from '@/components/layout/nav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Nav />
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <Header />
                <main className="flex-1 flex flex-col px-12 py-4 gap-4 overflow-hidden">{children}</main>
            </div>
        </div>
    )
}
