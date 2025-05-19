'use client'

import Footer from '@/components/layout/footer'
import client from '@/lib/backend/client'
import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Language = 'ENGLISH' | 'JAPANESE' | 'NONE'

const LANGUAGES = [
    { code: 'ENGLISH' as Language, label: 'English', image: '/assets/america.svg' },
    { code: 'JAPANESE' as Language, label: '日本語', image: '/assets/japan.svg' },
]

export default function LanguagePage() {
    const router = useRouter()
    const { isLogin, loginMember, setLoginMember } = useGlobalLoginMember()
    const [selectedLang, setSelectedLang] = useState<Language | null>(null)

    const handleStart = async () => {
        if (!selectedLang) return

        try {
            const { error } = await client.PATCH('/api/v1/members/update-language', {
                params: {
                    query: {
                        language: selectedLang,
                    },
                },
            })

            if (error) {
                throw new Error('언어 업데이트에 실패했습니다')
            }

            setLoginMember({
                ...loginMember,
                language: selectedLang,
            })
            router.push('/dashboard')
        } catch (error) {
            console.error('언어 업데이트 중 오류 발생:', error)
            alert('언어 설정 중 오류가 발생했습니다. 다시 시도해주세요.')
        }
    }
    useEffect(() => {
        if (isLogin && loginMember.language !== 'NONE') {
            router.push('/dashboard')
        }
    }, [isLogin])

    return (
        <div className="flex flex-col h-screen">
            <Link href="/">
                <Image src="/logo/all-logo.svg" alt="logo" width={180} height={180} className="ml-10 mt-5" />
            </Link>
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
