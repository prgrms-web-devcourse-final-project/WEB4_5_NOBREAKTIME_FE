'use client'

import Header from '@/components/layout/header'
import Nav from '@/components/layout/nav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <Nav />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex flex-col h-[calc(100vh-80px)] overflow-auto px-12 py-4 gap-4">{children}</main>
            </div>
        </div>
    )
}
