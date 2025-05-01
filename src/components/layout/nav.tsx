'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import DashboardIcon from '../icon/dashboardIcon'
import QuestionIcon from '../icon/grammarIcon'
import AbcIcon from '../icon/wordIcon'
import VideoIcon from '../icon/videoIcon'
import BookmarkIcon from '../icon/bookmarkIcon'

function Nav() {
    // 현재 경로 감지
    const pathname = usePathname()

    return (
        <nav className="group flex flex-col h-screen bg-[var(--color-sub-2)] text-[var(--color-main)] w-[83px] hover:w-[280px] transition-all duration-300 overflow-hidden p-4 flex flex-col gap-6">
            {/* 로고 */}
            <img src="/logo.svg" alt="logo" className="w-12 h-12 mx-auto" />

            {/* 메뉴 아이템 */}
            <NavItem
                icon={<DashboardIcon />}
                label="Dashboard"
                href="/dashboard"
                active={pathname.startsWith('/dashboard')}
            />
            <NavItem
                icon={<BookmarkIcon />}
                label="Bookmark"
                href="/bookmark"
                active={pathname.startsWith('/bookmark')}
            />
            <NavItem icon={<VideoIcon />} label="Video Learning" href="/video" active={pathname.startsWith('/video')} />
            <NavItem icon={<AbcIcon />} label="Word Learning" href="/word" active={pathname.startsWith('/word')} />
            <NavItem
                icon={<QuestionIcon />}
                label="Grammar Learning"
                href="/grammar"
                active={pathname.startsWith('/grammar')}
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
