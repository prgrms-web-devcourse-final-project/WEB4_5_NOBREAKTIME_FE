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
        <nav className="flex flex-col h-screen bg-[var(--color-sub-2)] text-[var(--color-main)] w-[120px] p-4 flex flex-col gap-6">
            {/* 로고 */}
            <Link href="/dashboard">
                <Image src="/logo/icon-logo.svg" alt="logo" width={48} height={48} className="mx-auto" />
            </Link>
            {/* 메뉴 아이템 */}
            <div className="flex flex-col items-center gap-1">
                <NavItem
                    icon={<DashboardIcon />}
                    label="Dashboard"
                    href="/dashboard"
                    active={pathname === '/dashboard'}
                />
            </div>
            <div className="flex flex-col items-center gap-1">
                <NavItem
                    icon={<BookmarkIcon />}
                    label="Bookmark"
                    href="/dashboard/bookmark"
                    active={pathname === '/dashboard/bookmark'}
                />
            </div>
            <div className="flex flex-col items-center gap-1">
                <NavItem
                    icon={<VideoIcon />}
                    label="Video"
                    href="/dashboard/video-learning"
                    active={pathname === '/dashboard/video-learning'}
                />
            </div>
            <div className="flex flex-col items-center gap-1">
                <NavItem
                    icon={<AbcIcon />}
                    label="Word"
                    href="/dashboard/word-learning"
                    active={pathname === '/dashboard/word-learning'}
                />
            </div>
            <div className="flex flex-col items-center gap-1">
                <NavItem
                    icon={<QuestionIcon />}
                    label="Grammar"
                    href="/dashboard/grammar"
                    active={pathname === '/dashboard/grammar'}
                />
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
    const iconClass = `${active ? 'text-[var(--color-point)]' : 'text-[var(--color-main)] opacity-60'}`

    return (
        <Link
            href={href}
            className={`flex flex-col items-center gap-1 px-1 py-2 rounded-lg transition-all cursor-pointer
                ${active ? 'text-[var(--color-point)] font-bold' : 'text-[var(--color-main)] opacity-60'}
            `}
        >
            <div className="min-w-[24px]">{React.cloneElement(icon, { className: iconClass })}</div>
            <span className="text-xs text-center">{label}</span>
        </Link>
    )
}

export default Nav
