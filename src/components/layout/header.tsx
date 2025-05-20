'use client'
import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function Header() {
    const { loginMember, logoutAndHome } = useGlobalLoginMember()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [profileImg, setProfileImg] = useState(loginMember.profileImage ?? '/assets/user.svg')
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <header className="flex items-center justify-end h-12 pt-4 px-12 relative">
            <div className="flex items-center gap-2">
                {/* 프로필 아이콘 */}
                <div className="w-6 h-6 rounded-full border-2 border-[var(--color-main)] flex items-center justify-center overflow-hidden">
                    <Image
                        src={profileImg}
                        alt="profile image"
                        width={24}
                        height={24}
                        className="rounded-full object-cover w-full h-full"
                        onError={() => setProfileImg('/assets/user.svg')}
                    />
                </div>

                {/* 이름 + 레벨 + 드롭다운 */}
                <div className="flex items-center gap-1 cursor-pointer" ref={dropdownRef}>
                    <span className="text-sm font-semibold text-gray-800">{loginMember.nickname}</span>
                    <span className="text-sm text-gray-500">{loginMember.subscriptionType}</span>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <Image src="/assets/bottmBTN.svg" alt="dropdown" width={24} height={24} />
                    </button>

                    {/* 드롭다운 메뉴 */}
                    {isDropdownOpen && (
                        <div className="absolute top-16 right-6 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                            <Link
                                href="/dashboard/mypage"
                                className="block px-4 py-2 text-sm text-[var(--color-black)] hover:bg-gray-100"
                            >
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
                </div>
            </div>
        </header>
    )
}
