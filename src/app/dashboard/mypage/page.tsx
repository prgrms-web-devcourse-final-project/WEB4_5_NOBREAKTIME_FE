'use client'

import { Button } from '@/components/ui/button'
import {  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import client from '@/lib/backend/client'
import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import { Pencil } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { components } from '@/lib/backend/apiV1/schema'

type UserProfileResponse = {
    email?: string
    nickname?: string
    profileImage?: string
    subscriptionType?: 'NONE' | 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ADMIN'
    language?: 'ENGLISH' | 'JAPANESE' | 'NONE' | 'ALL'
    subscriptions?: {
        planName?: 'STANDARD' | 'PREMIUM'
        amount?: number
        startedAt?: string
        expiredAt?: string
        isPossibleToCancel?: 'true' | 'false'
    }[]
}
type Language = 'ENGLISH' | 'JAPANESE' | 'NONE' | 'ALL'

const LANGUAGES = [
    { code: 'ENGLISH' as Language, label: '영어', image: '/assets/america.svg' },
    { code: 'JAPANESE' as Language, label: '일본어', image: '/assets/japan.svg' },
]


export default function MyPage() {
    const { loginMember, setLoginMember, logoutAndHome } = useGlobalLoginMember()
    const [profileImage, setProfileImage] = useState<string | null>(loginMember?.profileImage || '/assets/user.svg')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
    const [nickname, setNickname] = useState(loginMember?.nickname || '')
    const [selectedLanguage, setSelectedLanguage] = useState<Language>((loginMember?.language as Language) || 'NONE')
    const [isLoading, setIsLoading] = useState(false)
    const [isLanguageLoading, setIsLanguageLoading] = useState(false)
    const [isImageLoading, setIsImageLoading] = useState(false)
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
    const [withdrawEmail, setWithdrawEmail] = useState('')
    const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    const getSocialIcon = (email: string) => {
        if (email.includes('@kakao.com')) return '/logo/kakao.png'
        if (email.includes('@naver.com')) return '/logo/naver.png'
        if (email.includes('@gmail.com')) return '/logo/google.png'
    }

    const languageFlags: Record<string, string> = {
        ENGLISH: '/assets/america.svg',
        JAPANESE: '/assets/japan.svg',
        NONE: '/assets/none.svg',
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]
        if (!(file instanceof File)) return

        setIsImageLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)   

            const { data, error } = await client.PATCH('/api/v1/members/me/profile', {
                body: formData as any,
            })

            if (error) {
                throw new Error(
                    (error as { data?: { message?: string } })?.data?.message || '프로필 이미지 변경에 실패했습니다',
                )
            }

            let imageUrl: string | null = null

            if (typeof data === 'string') {
                try {
                    const parsedData = JSON.parse(data)
                    if (parsedData.code === '200' && parsedData.data) {
                        imageUrl = parsedData.data
                    }
                } catch {
                    if (data.startsWith('http')) {
                        imageUrl = data
                    }
                }
            } else if (data && typeof data === 'object' && data !== null) {
                const responseData = data as { data?: string; url?: string }
                imageUrl = responseData.data || responseData.url || null
            }

            if (!imageUrl) {
                throw new Error('프로필 이미지 URL을 받지 못했습니다')
            }

            setProfileImage(imageUrl)
            setLoginMember({
                ...loginMember,
                profileImage: imageUrl,
            })
        } catch (error) {
            alert(error instanceof Error ? error.message : '프로필 이미지 변경 중 오류가 발생했습니다')
            setProfileImage('/assets/user.svg')
            setLoginMember({
                ...loginMember,
                profileImage: '/assets/user.svg',
            })
        } finally {
            setIsImageLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!nickname) return

        setIsLoading(true)
        try {
            const { error } = await client.PATCH('/api/v1/members/me', {
                body: {
                    nickname,
                    language: loginMember.language,
                },
            })

            if (error) {
                const errorMessage =
                    (error as { data?: { message?: string } })?.data?.message || '닉네임 수정에 실패했습니다'
                alert(errorMessage)
                return
            }

            setLoginMember({
                ...loginMember,
                nickname,
            })
            setIsModalOpen(false)
        } catch (error) {
            console.error('닉네임 수정 중 오류 발생:', error)
            alert('닉네임 수정 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleLanguageSubmit = async () => {
        if (!selectedLanguage) return

        setIsLanguageLoading(true)
        try {
            const { error } = await client.PATCH('/api/v1/members/me', {
                body: {
                    nickname,
                    language: selectedLanguage,
                },
            })

            if (error) {
                const errorMessage =
                    (error as { data?: { message?: string } })?.data?.message || '언어 설정 수정에 실패했습니다'
                alert(errorMessage)
                return
            }

            setLoginMember({
                ...loginMember,
                language: selectedLanguage,
            })
            setIsLanguageModalOpen(false)
        } catch (error) {
            console.error('언어 설정 수정 중 오류 발생:', error)
            alert('언어 설정 수정 중 오류가 발생했습니다.')
        } finally {
            setIsLanguageLoading(false)
        }
    }

    const handleLanguageButtonClick = () => {
        if (loginMember.subscriptionType !== 'PREMIUM') {
            alert('PREMIUM 회원인 경우에만 언어 변경이 가능합니다.');
            return;
        }
        setIsLanguageModalOpen(true);
    }

    const handleWithdrawClick = () => {
        setIsWithdrawModalOpen(true)
    }

    const handleWithdraw = async () => {
        if (withdrawEmail !== loginMember?.email) {
            alert('이메일이 일치하지 않습니다.')
            return
        }
        setIsWithdrawLoading(true)
        try {
            const { error } = await client.DELETE('/api/v1/members/me')
            if (error) {
                alert('회원 탈퇴에 실패했습니다.')
                return
            }
            alert('회원 탈퇴가 완료되었습니다.')
            // 로그아웃 처리 및 메인 페이지 이동
            logoutAndHome()
        } catch (e) {
            alert('회원 탈퇴 중 오류가 발생했습니다.')
        } finally {
            setIsWithdrawLoading(false)
        }
    }

    const handleCancelSubscription = async () => {
        if (!confirm('정말로 구독을 취소하시겠습니까?')) return

        setIsCancelling(true)
        try {
            const { error } = await client.PATCH('/api/v1/payment/cancel')
            if (error) {
                throw new Error((error as { data?: { message?: string } })?.data?.message || '구독 취소에 실패했습니다')
            }

            // 구독 취소 후 사용자 정보 새로고침
            const { data } = await client.GET('/api/v1/members/me')
            if (data && 'data' in data) {
                setLoginMember(data.data as any)
            }

            alert('구독이 취소되었습니다.')
        } catch (error) {
            alert(error instanceof Error ? error.message : '구독 취소 중 오류가 발생했습니다')
        } finally {
            setIsCancelling(false)
        }
    }

    if (!loginMember) {
        return null
    }

    console.log(loginMember)
    const language = loginMember.language || 'NONE'
    const socialIcon = getSocialIcon(loginMember.email || '')

    return (
        <>
            <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-[var(--color-black)]">My Page</h3>
            </div>

            <div className="flex flex-col gap-6 bg-[var(--color-sub-2)] p-6 rounded-lg h-[calc(100vh-200px)]">
                <div className="flex flex-col gap-8 p-6">
                    {/* 프로필 */}
                    <div className="flex items-center gap-6 p-6 bg-white rounded-xl shadow-sm">
                        <div className="relative group">
                            <div className="w-[140px] h-[140px] relative">
                                {profileImage && (
                                    <Image
                                        src={profileImage}
                                        alt="profile"
                                        fill
                                        className="rounded-full border-4 border-[var(--color-main)] shadow-md object-cover"
                                    />
                                )}
                                {isImageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                            <label
                                htmlFor="profile-image"
                                className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${isImageLoading ? 'hidden' : ''
                                    }`}
                            >
                                <span className="text-white text-sm font-medium">프로필 변경</span>
                            </label>
                            <input
                                id="profile-image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                                disabled={isImageLoading}
                            />
                            {socialIcon && (
                                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                                    <Image
                                        src={socialIcon}
                                        alt="social"
                                        width={30}
                                        height={30}
                                        className="rounded-full"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-800">{loginMember.nickname}</h2>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors"
                                    title="닉네임 수정"
                                >
                                    <Pencil className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                            <span className="text-sm text-gray-500">{loginMember.email}</span>
                            <span className="text-sm text-gray-500">구독: {loginMember.subscriptionType}</span>
                        </div>
                    </div>

                    {/* 언어 정보 */}
                    <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm text-[var(--color-black)]">선택한 언어</span>
                                {<button
                                    onClick={handleLanguageButtonClick}
                                    className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors"
                                    title="언어 수정"
                                >
                                    <Pencil className="w-4 h-4 text-gray-500" />
                                </button>}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-[var(--color-main)]">
                                    {language === 'ENGLISH'
                                        ? '영어'
                                        : language === 'JAPANESE'
                                            ? '일본어'
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
                    {<div className="flex gap-3">
                        <button className="px-6 py-3 text-sm font-medium bg-[var(--color-main)] text-white rounded-lg shadow-sm hover:bg-opacity-90 transition-all duration-200">
                            프로필 수정
                        </button>
                    </div>}
                    <div className="flex justify-between items-end gap-3 mt-8 w-full">
                        <Button
                            variant="default"
                            className="bg-[var(--color-main)] hover:bg-[var(--color-main)]/90"
                            onClick={() => setIsSubscriptionModalOpen(true)}
                        >
                            구독 내역 확인
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-700"
                            onClick={handleWithdrawClick}
                        >
                            회원 탈퇴
                        </Button>
                    </div>
                </div>
            </div>

            {/* 수정 모달 */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>닉네임 수정</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="nickname" className="text-sm font-medium">
                                닉네임
                            </label>
                            <Input
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임을 입력해주세요"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            취소
                        </Button>
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? '수정 중...' : '수정하기'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 언어 수정 모달 */}
            <Dialog open={isLanguageModalOpen} onOpenChange={setIsLanguageModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>언어 수정</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-center">학습 언어</label>
                            <div className="flex justify-center gap-4">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setSelectedLanguage(lang.code)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 w-[100px] ${selectedLanguage === lang.code
                                            ? 'border-[var(--color-point)] bg-[var(--color-sub-2)]'
                                            : 'border-gray-200'
                                            }`}
                                    >
                                        <Image
                                            src={lang.image}
                                            alt={lang.label}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                        <span className="text-sm">{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLanguageModalOpen(false)}>
                            취소
                        </Button>
                        <Button onClick={handleLanguageSubmit} disabled={isLanguageLoading}>
                            {isLanguageLoading ? '수정 중...' : '수정하기'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 회원 탈퇴 모달 */}
            <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>회원 탈퇴</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="withdraw-email" className="text-sm font-medium">
                                탈퇴하시려면 본인의 이메일을 입력해 주세요.
                            </label>
                            <Input
                                id="withdraw-email"
                                value={withdrawEmail}
                                onChange={(e) => setWithdrawEmail(e.target.value)}
                                placeholder="이메일을 입력해주세요"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsWithdrawModalOpen(false)}>
                            취소
                        </Button>
                        <Button
                            className="bg-red-500 hover:bg-red-700"
                            onClick={handleWithdraw}
                            disabled={isWithdrawLoading}
                        >
                            {isWithdrawLoading ? '탈퇴 중...' : '탈퇴하기'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 구독 내역 모달 */}
            <Dialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>구독 내역</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {loginMember?.subscriptions && loginMember.subscriptions.length > 0 ? (
                            <div className="space-y-4">
                                {loginMember.subscriptions.map((subscription, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {subscription.planName === 'STANDARD' ? '스탠다드' : '프리미엄'}{' '}
                                                    플랜
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {subscription.startedAt} ~ {subscription.expiredAt}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    {subscription.isPossibleToCancel ? (
                                                        `${subscription.amount?.toLocaleString()}원`
                                                    ) : (
                                                        <span className="text-red-500">다음달 만료</span>
                                                    )}
                                                </p>
                                                {subscription.isPossibleToCancel && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={handleCancelSubscription}
                                                        disabled={isCancelling}
                                                    >
                                                        {isCancelling ? '취소 중...' : '구독 취소'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">구독 내역이 없습니다.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsSubscriptionModalOpen(false)}>닫기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
