import Nav from "@/components/layout/nav"
import Header from "@/components/layout/header"
function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <Nav />
            <div className="flex-1 flex flex-col">
                <Header userName="홍길동" userLevel={1} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout
