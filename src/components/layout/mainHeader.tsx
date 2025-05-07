'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function MainHeader() {
    const router = useRouter()

    return (
        <header className="flex justify-between items-center pl-10 pr-10 pb-2">
            <div>
                <Image src="/logo/all-logo.svg" alt="logo" width={180} height={180} className="ml-10 mt-5" />
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
