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

            if (!orderId || !paymentKey || !amount) {
                setErrorMessage('필수 결제 정보가 누락되었습니다.')
                setStatus('error')
                return
            }

            try {
                const { error, data } = await client.POST('/api/v1/payment/confirm', {
                    body: {
                        paymentKey,
                        orderId,
                        amount: Number(amount),
                        idempotencyKey: orderId,
                    },
                })

                if (error) {
                    const paymentError = error as PaymentError
                    if (paymentError.status === 409) {
                        setStatus('success')
                        return
                    }
                    throw error
                }

                setStatus('success')
            } catch (e) {
                console.error('결제 승인 중 오류가 발생했습니다:', e)
                const paymentError = e as PaymentError
                if (paymentError.status === 409) {
                    setStatus('success')
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
            }, 2000) // 2초 후 리다이렉트

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
