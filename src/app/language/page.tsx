'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '@/components/layout/footer'
import Image from 'next/image'

const LANGUAGES = [
    { code: 'en', label: 'English', image: '/assets/america.svg' },
    { code: 'ja', label: '日本語', image: '/assets/japan.svg' },
    { code: 'zh', label: '中文', image: '/assets/china.svg' },
]

export default function LanguagePage() {
    const router = useRouter()
    const [selectedLang, setSelectedLang] = useState<string | null>(null)

    const handleStart = () => {
        if (!selectedLang) return

        console.log('선택된 언어:', selectedLang)
        localStorage.setItem('lang', selectedLang)
        router.push('/dashboard')
    }

    return (
        <div className="flex flex-col h-screen">
            <Image src="/logo/all-logo.svg" alt="logo" width={180} height={180} className="ml-10 mt-5" />
            <div className="flex-1 flex flex-col items-center gap-30 pt-30 p-12 m-auto">
                <h1 className="text-5xl font-bold w-full text-center">Language Choice</h1>
                <div className="flex gap-4">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setSelectedLang(lang.code)}
                            className={`text-[var(--color-black)] px-6 py-2 rounded-lg flex flex-col items-center border-2 ${
                                selectedLang === lang.code
                                    ? 'border-[var(--color-point)] bg-[var(--color-sub-2)] text-[var(--color-main)] font-bold'
                                    : 'border-none bg-white'
                            }`}
                        >
                            <Image src={lang.image} alt={lang.label} width={80} height={80} className="mb-2" />
                            {lang.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleStart}
                    disabled={!selectedLang}
                    className={`w-full px-6 py-2 rounded text-[var(--color-main)] ${
                        selectedLang
                            ? 'bg-[var(--color-sub-1)] text-[var(--color-main)] hover:opacity-90'
                            : 'bg-gray-200 cursor-not-allowed text-[var(--color-main)]'
                    }`}
                >
                    시작하기
                </button>
            </div>

            <Footer />
        </div>
    )
}
