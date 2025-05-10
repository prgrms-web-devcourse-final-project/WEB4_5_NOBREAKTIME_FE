'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import BookmarkIcon from '../icon/bookmarkIcon'
import DashboardIcon from '../icon/dashboardIcon'
import QuestionIcon from '../icon/grammarIcon'
import VideoIcon from '../icon/videoIcon'
import AbcIcon from '../icon/wordIcon'

function Nav() {
    // 현재 경로 감지
    const pathname = usePathname()

    return (
        <nav className="group flex flex-col h-screen bg-[var(--color-sub-2)] text-[var(--color-main)] w-[83px] hover:w-[280px] transition-all duration-300 overflow-hidden p-4 flex flex-col gap-6">
            {/* 로고 */}
            <Image src="/logo/icon-logo.svg" alt="logo" width={48} height={48} className="mx-auto" />

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
                href="/dashboard/video-learning"
                active={pathname === '/dashboard/video-learning'}
            />
            <NavItem
                icon={<AbcIcon />}
                label="Word Learning"
                href="/dashboard/word-learning"
                active={pathname === '/dashboard/word-learning'}
            />
            <NavItem
                icon={<QuestionIcon />}
                label="Grammar Learning"
                href="/dashboard/grammar"
                active={pathname === '/dashboard/grammar'}
            />
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
            <span className="text-sm text-left whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {label}
            </span>
        </Link>
    )
}

export default Nav
