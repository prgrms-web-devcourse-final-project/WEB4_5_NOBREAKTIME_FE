'use client'

import client from '@/lib/backend/client'
import { loadTossPayments, TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk'
import { useEffect, useState } from 'react'

function generateRandomString() {
    if (typeof window !== 'undefined') {
        return window.btoa(Math.random().toString()).slice(0, 20)
    }
    return '' // 서버 환경일 경우 기본값 반환
}

const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
const customerKey = generateRandomString()

interface Amount {
    currency: string
    value: number
}

interface CheckoutProps {
    amount?: {
        currency: string
        value: number
    }
    subscriptionType: 'BASIC' | 'STANDARD' | 'PREMIUM'
    periodType: 'MONTHLY' | 'SIX_MONTHS' | 'YEAR'
}

export default function PaymentWidget({ amount: initialAmount, subscriptionType, periodType }: CheckoutProps) {
    const [amount, setAmount] = useState<Amount>(
        initialAmount || {
            currency: 'KRW',
            value: 0,
        },
    )
    const [ready, setReady] = useState(false)
    const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null)

    useEffect(() => {
        async function fetchPaymentWidgets() {
            try {
                const tossPayments = await loadTossPayments(clientKey)

                const widgets = tossPayments.widgets({
                    customerKey,
                })
                // 비회원 결제
                // const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

                setWidgets(widgets)
            } catch (error) {
                console.error('Error fetching payment widget:', error)
            }
        }

        fetchPaymentWidgets()
        // eslint-disable-next-line
    }, [clientKey, customerKey])

    useEffect(() => {
        async function renderPaymentWidgets() {
            if (widgets == null) {
                return
            }

            await widgets.setAmount(amount)

            await widgets.renderPaymentMethods({
                selector: '#payment-method',
                variantKey: 'DEFAULT',
            })

            await widgets.renderAgreement({
                selector: '#agreement',
                variantKey: 'AGREEMENT',
            })

            setReady(true)
        }

        renderPaymentWidgets()
        // eslint-disable-next-line
    }, [widgets])

    const updateAmount = async (amount: Amount) => {
        setAmount(amount)
        await widgets!.setAmount(amount)
    }

    const handlePayment = async () => {
        try {
            // 결제 요청 정보 생성
            const { data: response, error } = await client.POST('/api/v1/payment/request', {
                body: {
                    type: subscriptionType,
                    period: periodType,
                },
            })

            if (error || !response) {
                throw new Error('결제 요청 생성에 실패했습니다.')
            }

            console.log('Payment request response:', response)

            try {
                // 결제창 띄우기
                await widgets!.requestPayment({
                    orderId: response.data.orderId,
                    orderName: response.data.orderName || `${subscriptionType} 멤버십 ${periodType} 구독`,
                    successUrl: window.location.origin + '/membership/success',
                    failUrl: window.location.origin + '/membership/fail',
                    customerEmail: 'customer123@gmail.com', // TODO: 실제 사용자 정보로 교체
                    customerName: '김토스', // TODO: 실제 사용자 정보로 교체
                    customerMobilePhone: '01012341234', // TODO: 실제 사용자 정보로 교체
                })
            } catch (paymentError: any) {
                // 결제 중복 요청(409) 에러 처리
                if (paymentError?.code === '409-5' || paymentError?.status === 409) {
                    window.location.href = window.location.origin + '/membership/fail?error=duplicate_payment'
                    return
                }
                throw paymentError
            }
        } catch (error) {
            console.error('결제 처리 중 오류가 발생했습니다:', error)
            // 에러 메시지에 따라 적절한 실패 페이지로 리다이렉트
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            window.location.href = `${window.location.origin}/membership/fail?error=${encodeURIComponent(errorMessage)}`
        }
    }

    return (
        <div className="wrapper">
            <div className="box_section">
                {/* 결제 UI */}
                <div id="payment-method" />
                {/* 이용약관 UI */}
                <div id="agreement" />

                {/* 결제하기 버튼 */}
                <button
                    className="w-[200px] py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70 mx-auto block"
                    style={{ marginTop: '20px' }}
                    disabled={!ready}
                    onClick={handlePayment}
                >
                    {ready ? '결제하기' : '결제 준비중...'}
                </button>
            </div>
        </div>
    )
}
