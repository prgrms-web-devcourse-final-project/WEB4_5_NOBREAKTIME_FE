'use client'

import client from '@/lib/backend/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PaymentError {
    status?: number
    message?: string
}

export default function SuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState<string>('')

    useEffect(() => {
        async function confirmPayment() {
            const orderId = searchParams.get('orderId')
            const paymentKey = searchParams.get('paymentKey')
            const amount = searchParams.get('amount')
            const isBillingKey = searchParams.get('isBillingKey') === 'true'
            const subscriptionType = searchParams.get('subscriptionType')
            const periodType = searchParams.get('periodType')
            const authKey = searchParams.get('authKey')

            // 로컬 스토리지에서 idempotencyKey 가져오기
            let idempotencyKey = localStorage.getItem('payment_idempotency_key')

            // idempotencyKey가 없으면 새로 생성
            if (!idempotencyKey) {
                idempotencyKey = crypto.randomUUID()
                localStorage.setItem('payment_idempotency_key', idempotencyKey)
            }

            if (!orderId || !amount || !idempotencyKey || !subscriptionType || !periodType) {
                setErrorMessage('필수 결제 정보가 누락되었습니다.')
                setStatus('error')
                return
            }

            // 빌링키 발급의 경우 authKey가 필요
            if (isBillingKey && !authKey) {
                setErrorMessage('카드 인증 정보가 누락되었습니다.')
                setStatus('error')
                return
            }

            // 일반 결제의 경우 paymentKey가 필요
            if (!isBillingKey && !paymentKey) {
                setErrorMessage('결제 정보가 누락되었습니다.')
                setStatus('error')
                return
            }

            try {
                // 빌링키 발급과 일반 결제 구분하여 처리
                const endpoint = isBillingKey ? '/api/v1/payment/confirm/issue-billing-key' : '/api/v1/payment/confirm'

                const requestBody = isBillingKey
                    ? {
                          customerKey: idempotencyKey,
                          authKey,
                          orderId,
                          orderName: `${subscriptionType} 멤버십 ${periodType} 구독`,
                          amount: Number(amount),
                      }
                    : {
                          idempotencyKey,
                          paymentKey,
                          amount: Number(amount),
                          orderId,
                      }

                const response = await client.POST(endpoint, {
                    body: requestBody,
                })
                const { error, data } = response

                // 결제 성공 후 idempotencyKey 삭제
                localStorage.removeItem('payment_idempotency_key')

                if (error) {
                    const paymentError = error as PaymentError
                    if (paymentError.status === 409) {
                        setErrorMessage('이미 처리된 결제입니다.')
                        setStatus('error')
                        return
                    }
                    throw error
                }

                if (!data) {
                    throw new Error('결제 승인 응답이 없습니다.')
                }

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
                    <h1 className="text-2xl font-bold text-[var(--color-main)] mb-4">결제 처리 중...</h1>
                    <p className="text-[var(--color-sub)]">잠시만 기다려주세요.</p>
                </div>
            </div>
        )
    }

    if (status === 'error') {
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

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-[var(--color-point)] mb-4">결제 성공</h1>
                <p className="text-[var(--color-sub)] mb-8">멤버십 구독이 완료되었습니다.</p>
                <p className="text-sm text-gray-500 mb-8">잠시 후 대시보드로 이동합니다...</p>
            </div>
        </div>
    )
}
