'use client'

import { useRouter } from 'next/navigation'

export default function MainHeader() {
    const router = useRouter()

    return (
        <header className="flex justify-between items-center pl-10 pr-10">
            <div>
                <img src="/logo/all-logo.svg" alt="logo" className="w-45 ml-10 mt-5" />
            </div>
            <div>
                <button
                    className="bg-[var(--color-sub-1)] rounded-sm text-[var(--color-main)] text-md pt-2 pb-2 pl-4 pr-4 font-bold"
                    onClick={() => router.push('/login')}
                >
                    Login
                </button>
            </div>
        </header>
    )
}
