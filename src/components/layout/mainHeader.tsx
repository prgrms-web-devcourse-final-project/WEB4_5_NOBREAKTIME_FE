'use client'

import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MainHeader() {
    const router = useRouter()
    const { isLogin } = useGlobalLoginMember()

    const handleButtonClick = () => {
        if (isLogin) {
            router.push('/dashboard')
        } else {
            router.push('/login')
        }
    }

    return (
        <header className="flex justify-between items-center px-10 py-5">
            <Link href="/">
                <Image src="/logo/all-logo.svg" alt="logo" width={180} height={180} />
            </Link>
            <button
                className="bg-[var(--color-sub-1)] rounded-sm text-[var(--color-main)] text-md px-4 py-2 font-bold"
                onClick={handleButtonClick}
            >
                {isLogin ? 'Go to Dashboard' : 'Login'}
            </button>
        </header>
    )
}
