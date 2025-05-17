'use client'

import { useSearchParams } from 'next/navigation'

export default function FailPage() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message') || '결제에 실패했습니다.'

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">결제 실패</h1>
                <p className="text-[var(--color-sub)] mb-8">{message}</p>
                <a
                    href="/membership"
                    className="inline-block px-6 py-3 bg-[var(--color-point)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                    멤버십 페이지로 돌아가기
                </a>
            </div>
        </div>
    )
}
