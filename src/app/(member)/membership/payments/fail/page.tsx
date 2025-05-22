'use client'

import client from '@/lib/backend/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PaymentError {
    status?: number
    message?: string
}

export default function PaymentsFailPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [errorMessage, setErrorMessage] = useState<string>('')

    useEffect(() => {
        async function handlePaymentFail() {
            const orderId = searchParams.get('orderId')
            const errorCode = searchParams.get('error')
            const subscriptionType = searchParams.get('subscriptionType')
            const periodType = searchParams.get('periodType')

            if (!orderId) {
                setErrorMessage('주문 정보를 찾을 수 없습니다.')
                return
            }

            try {
                // 빌링키 발급과 일반 결제 구분하여 처리
                const { error } = await client.POST('/api/v1/payment/fail', {
                    body: {
                        orderId,
                        errorCode,
                        subscriptionType,
                        periodType,
                    },
                })

                if (error) {
                    throw error
                }

                // 에러 메시지 설정
                switch (errorCode) {
                    case 'duplicate_payment':
                        setErrorMessage('이미 처리된 결제입니다.')
                        break
                    case 'card_error':
                        setErrorMessage('카드 정보가 올바르지 않습니다.')
                        break
                    case 'insufficient_funds':
                        setErrorMessage('잔액이 부족합니다.')
                        break
                    case 'expired_card':
                        setErrorMessage('만료된 카드입니다.')
                        break
                    case 'cancelled':
                        setErrorMessage('결제가 취소되었습니다.')
                        break
                    default:
                        setErrorMessage('결제 처리 중 오류가 발생했습니다.')
                }
            } catch (e) {
                console.error('결제 실패 처리 중 오류가 발생했습니다:', e)
                const paymentError = e as PaymentError
                setErrorMessage(paymentError.message || '결제 실패 처리 중 오류가 발생했습니다.')
            }
        }

        localStorage.removeItem('selectedPlanTitle')
        handlePaymentFail()
    }, [searchParams])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">결제 실패</h1>
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
