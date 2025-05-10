'use client'

import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import Image from 'next/image'
import { useState } from 'react'
import DashboardLayout from '../dashboardLayout'

function My() {
    const { loginMember } = useGlobalLoginMember()
    const [profileImage, setProfileImage] = useState(loginMember?.profileImage || '/assets/user.svg')

    const getSocialIcon = (email: string) => {
        if (email.includes('@kakao.com')) return '/logo/kakao.png'
        if (email.includes('@naver.com')) return '/logo/naver.png'
        if (email.includes('@gmail.com')) return '/logo/google.png'
    }

    const languageFlags: Record<string, string> = {
        ENGLISH: '/assets/america.svg',
        JAPANESE: '/assets/japan.svg',
        NONE: '/assets/china.svg',
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const imageUrl = URL.createObjectURL(file)
            setProfileImage(imageUrl)
        }
    }

    if (!loginMember) {
        return null
    }

    const language = loginMember.language || 'NONE'
    const socialIcon = getSocialIcon(loginMember.email || '')

    return (
        <DashboardLayout title="내 페이지" icon="user">
            <div className="flex flex-col gap-8 p-6">
                {/* 프로필 */}
                <div className="flex items-center gap-6 p-6 bg-white rounded-xl shadow-sm">
                    <div className="relative group">
                        <div className="w-[140px] h-[140px] relative">
                            <Image
                                src={profileImage}
                                alt="profile"
                                fill
                                className="rounded-full border-4 border-[var(--color-main)] shadow-md object-cover"
                            />
                        </div>
                        <label
                            htmlFor="profile-image"
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <span className="text-white text-sm font-medium">프로필 변경</span>
                        </label>
                        <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        {socialIcon && (
                            <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                                <Image src={socialIcon} alt="social" width={30} height={30} className="rounded-full" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-gray-800">{loginMember.nickname}</h2>
                        <span className="text-sm text-gray-500">{loginMember.email}</span>
                        <span className="text-sm text-gray-500">구독: {loginMember.subscription}</span>
                    </div>
                </div>

                {/* 언어 정보 */}
                <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-[var(--color-black)] mb-4">선택한 언어</span>
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-[var(--color-main)]">
                                {language === 'ENGLISH'
                                    ? '영어'
                                    : language === 'JAPANESE'
                                    ? '일본어'
                                    : language === 'NONE'
                                    ? '중국어'
                                    : '미설정'}
                            </span>
                            <Image
                                src={languageFlags[language]}
                                alt={`${language} 국기`}
                                width={40}
                                height={40}
                                className="rounded-full shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* 수정 버튼 */}
                <div className="flex gap-3">
                    <button className="px-6 py-3 text-sm font-medium bg-[var(--color-main)] text-white rounded-lg shadow-sm hover:bg-opacity-90 transition-all duration-200">
                        프로필 수정
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default My
