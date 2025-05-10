'use client'
import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
    const { loginMember, logoutAndHome } = useGlobalLoginMember()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    return (
        <header className="flex items-center justify-end h-16 px-6 relative">
            <div className="flex items-center gap-4">
                {/* 프로필 아이콘 */}
                <div className="w-6 h-6 rounded-full bg-[var(--color-main)] flex items-center justify-center overflow-hidden">
                    <Image
                        src={loginMember.profileImage ?? '/assets/user.svg'}
                        alt="user"
                        width={24}
                        height={24}
                        className="rounded-full object-cover w-full h-full"
                    />
                </div>

                {/* 이름 + 레벨 + 드롭다운 */}
                <div className="flex items-center gap-1 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-800">{loginMember.nickname}</span>
                    <span className="text-sm text-gray-500">Lv. 0</span>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <Image src="/assets/bottmBTN.svg" alt="dropdown" width={24} height={24} />
                    </button>
                </div>
            </div>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
                <div className="absolute top-16 right-6 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link href="/my" className="block px-4 py-2 text-sm text-[var(--color-black)] hover:bg-gray-100">
                        마이페이지
                    </Link>
                    <button
                        onClick={logoutAndHome}
                        className="block w-full text-left px-4 py-2 text-sm text-[var(--color-black)] hover:bg-gray-100"
                    >
                        로그아웃
                    </button>
                </div>
            )}
        </header>
    )
}
