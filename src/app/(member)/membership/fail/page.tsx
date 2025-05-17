'use client'

import { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type PaymentFailureRequest = components['schemas']['PaymentFailureRequest']

export default function FailPage() {
    const searchParams = useSearchParams()
    const [isProcessing, setIsProcessing] = useState(true)

    useEffect(() => {
        async function handlePaymentFail() {
            try {
                const { error } = await client.POST('/api/v1/payment/fail', {
                    body: {
                        code: searchParams.get('code') || undefined,
                        message: searchParams.get('message') || undefined,
                        orderId: searchParams.get('orderId') || '',
                    } as PaymentFailureRequest,
                })

                if (error) {
                    throw new Error(error.message)
                }
            } catch (err) {
                console.error('결제 실패 처리 중 오류 발생:', err)
            } finally {
                setIsProcessing(false)
            }
        }

        handlePaymentFail()
    }, [searchParams])

    const errorCode = searchParams.get('code')
    const errorMessage = searchParams.get('message') || '결제 처리 중 오류가 발생했습니다.'

    if (isProcessing) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-[var(--color-main)] mb-4">처리 중...</h1>
                    <p className="text-[var(--color-sub)]">잠시만 기다려주세요.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">결제 실패</h1>
                {errorCode && <p className="text-sm text-gray-500 mb-2">에러 코드: {errorCode}</p>}
                <p className="text-[var(--color-sub)] mb-4">{errorMessage}</p>
                <p className="text-sm text-gray-500 mb-8">
                    결제에 실패했습니다. 다시 시도하시거나 다른 결제 수단을 이용해주세요.
                </p>
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
