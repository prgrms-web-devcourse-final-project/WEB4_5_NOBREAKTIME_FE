import Nav from '@/components/layout/nav'
import Header from '@/components/layout/header'

interface Props {
    title: string
    children: React.ReactNode
    icon: React.ReactNode
    className?: string
}

function DashboardLayout({ title, children, icon, className }: Props) {
    return (
        <div className="flex min-h-screen">
            <Nav />
            <div className="flex-1 flex flex-col">
                <Header userName="홍길동" userLevel={1} />
                <main className="flex flex-1 flex-col px-12 py-4 overflow-hidden gap-6">
                    {/* 타이틀 */}
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-[var(--color-main)]">{icon}</span>}
                        <h3 className="text-2xl font-bold text-[var(--color-black)]">{title}</h3>
                    </div>

                    {/* 컨텐츠 영역 */}
                    <div
                        className={`flex flex-col gap-6 bg-[var(--color-sub-2)] p-6 rounded-lg h-[calc(100vh-200px)] ${className}`}
                    >
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
