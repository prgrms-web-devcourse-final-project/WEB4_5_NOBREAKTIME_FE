'use client'

import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import BookmarkIcon from '../icon/bookmarkIcon'
import DashboardIcon from '../icon/dashboardIcon'
import ExpressionIcon from '../icon/expressionIcon'
import VideoIcon from '../icon/videoIcon'
import AbcIcon from '../icon/wordIcon'

function Nav() {
    // 현재 경로 감지
    const pathname = usePathname()

    const { loginMember } = useGlobalLoginMember()

    return (
        <nav className="group flex flex-col h-screen bg-[var(--color-sub-2)] text-[var(--color-main)] w-[83px] lg:hover:w-[280px] transition-all duration-300 overflow-hidden p-4 flex flex-col gap-6">
            {/* 로고 */}
            <Link href="/dashboard">
                <Image src="/logo/icon-logo.svg" alt="logo" width={48} height={48} className="mx-auto" />
            </Link>
            {/* 메뉴 아이템 */}
            <NavItem icon={<DashboardIcon />} label="Dashboard" href="/dashboard" active={pathname === '/dashboard'} />
            <NavItem
                icon={<BookmarkIcon />}
                label="Bookmark"
                href="/dashboard/bookmark"
                active={pathname === '/dashboard/bookmark'}
            />
            <NavItem
                icon={<VideoIcon />}
                label="Video Learning"
                href="/dashboard/video/learning"
                active={pathname === '/dashboard/video/learning'}
            />
            <NavItem
                icon={<AbcIcon />}
                label="Word Learning"
                href="/dashboard/word/learning"
                active={pathname === '/dashboard/word/learning'}
            />
            <NavItem
                icon={<ExpressionIcon />}
                label="Expression Learning"
                href="/dashboard/expression/learning"
                active={pathname === '/dashboard/expression/learning'}
            />

            {/* 하단 구독 버튼 */}
            <div className="mt-auto pt-4 border-t border-[var(--color-main)] border-opacity-20">
                <Link
                    href="/membership"
                    className="flex flex-col items-center gap-1 px-1 py-2 rounded-lg transition-all cursor-pointer hover:bg-[var(--color-main)] hover:bg-opacity-10"
                >
                    <div className="min-w-[24px] text-[var(--color-point)]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    <span className="text-xs text-center text-[var(--color-point)]">
                        {loginMember.subscriptionType}
                    </span>
                </Link>
            </div>
        </nav>
    )
}

// 서브 컴포넌트: 메뉴 아이템
function NavItem({
    icon,
    label,
    href,
    active = false,
}: {
    icon: React.ReactElement<{ className?: string }>
    label: string
    href: string
    active?: boolean
}) {
    const iconClass = `${
        active ? 'text-[var(--color-point)]' : 'text-[var(--color-main)] opacity-60 group-hover:opacity-100'
    }`

    return (
        <Link
            href={href}
            className={`flex items-center gap-4 px-1 py-2 rounded-lg transition-all cursor-pointer
                ${
                    active
                        ? 'bg-white text-[var(--color-point)] font-bold'
                        : 'text-[var(--color-main)] opacity-60 hover:opacity-100'
                }
            `}
        >
            <div className="min-w-[24px]">{React.cloneElement(icon, { className: iconClass })}</div>
            <span className="text-sm text-left whitespace-nowrap opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                {label}
            </span>
        </Link>
    )
}

export default Nav
