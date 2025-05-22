'use client'

import client from '@/lib/backend/client'
import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PaymentError {
    status?: number
    message?: string
}

type UserProfileResponse = {
    email?: string
    nickname?: string
    profileImage?: string
    subscriptionType?: 'NONE' | 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ADMIN'
    language?: 'ENGLISH' | 'JAPANESE' | 'NONE' | 'ALL'
    subscriptions?: {
        planName: 'STANDARD' | 'PREMIUM'
        amount: number
        startedAt: string
        expiredAt: string
        isPossibleToCancel: 'true' | 'false'
    }[]
}

export default function BillingSuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { setLoginMember } = useGlobalLoginMember()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const amount = searchParams.get('amount')
    const subscriptionType = searchParams.get('subscriptionType') as 'BASIC' | 'STANDARD' | 'PREMIUM'
    const orderId = searchParams.get('orderId')
    const customerKey = searchParams.get('customerKey')

    const fetchMember = async () => {
        try {
            const response = await client.GET('/api/v1/members/me')
            if (response.data && 'data' in response.data) {
                setLoginMember(response.data.data as UserProfileResponse)
            }
        } catch (error) {
            console.error('사용자 정보 새로고침 중 오류 발생:', error)
        }
    }

    useEffect(() => {
        async function confirmPayment() {
            const periodType = searchParams.get('periodType')
            const authKey = searchParams.get('authKey')

            if (!orderId || !amount || !customerKey || !subscriptionType || !periodType || !authKey) {
                setErrorMessage('필수 결제 정보가 누락되었습니다.')
                setStatus('error')
                return
            }

            try {
                const billingRequestBody = {
                    customerKey,
                    authKey,
                    orderId,
                    orderName: localStorage.getItem('selectedPlanTitle') || '',
                    amount: Number(amount),
                }
                const confirmResponse = await client.POST('/api/v1/payment/issue-billing-key', {
                    body: billingRequestBody,
                })
                const { error: confirmError, data: confirmData } = confirmResponse
                if (confirmError) {
                    const paymentError = confirmError as PaymentError
                    if (paymentError.status === 409) {
                        setErrorMessage('이미 처리된 결제입니다.')
                        setStatus('error')
                        return
                    }
                    throw confirmError
                }
                if (!confirmData) {
                    throw new Error('결제 승인 응답이 없습니다.')
                }
                // 결제 성공 후 사용자 정보 새로고침
                await fetchMember()

                // 로컬 스토리지에서 플랜 제목 삭제
                localStorage.removeItem('selectedPlanTitle')

                setStatus('success')
            } catch (e) {
                console.error('결제 승인 중 오류가 발생했습니다:', e)
                const paymentError = e as PaymentError
                if (paymentError.status === 409) {
                    setErrorMessage('이미 처리된 결제입니다.')
                    setStatus('error')
                    return
                }
                setErrorMessage(paymentError.message || '결제 처리 중 오류가 발생했습니다.')
                setStatus('error')
            }
        }

        confirmPayment()
    }, [searchParams])

    // 성공 상태일 때 자동으로 대시보드로 이동
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-[var(--color-main)] mb-4">정기 결제 카드 등록 처리 중...</h1>
                    <p className="text-[var(--color-sub)]">잠시만 기다려주세요.</p>
                </div>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">정기 결제 카드 등록 실패</h1>
                    <p className="text-[var(--color-sub)] mb-4">{errorMessage}</p>
                    <p className="text-sm text-gray-500 mb-8">문제가 지속되면 고객센터로 문의해주세요.</p>
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

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-[var(--color-point)] mb-4">결제 성공</h1>
                <p className="text-[var(--color-sub)] mb-8">정기 결제 카드 등록이 완료되었습니다.</p>
                <p className="text-sm text-gray-500 mb-8">잠시 후 대시보드로 이동합니다...</p>
            </div>
        </div>
    )
}
