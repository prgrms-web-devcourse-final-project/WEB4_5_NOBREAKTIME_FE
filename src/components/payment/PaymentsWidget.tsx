import client from '@/lib/backend/client'
import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import { loadTossPayments, TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk'
import { useEffect, useState } from 'react'

const WIDGET_KEY = process.env.NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY || ''

interface Amount {
    currency: string
    value: number
}

interface PaymentsWidgetProps {
    amount: Amount
    subscriptionType: 'BASIC' | 'STANDARD' | 'PREMIUM'
    periodType: 'MONTHLY' | 'SIX_MONTHS' | 'YEAR'
}

export default function PaymentsWidget({ amount, subscriptionType, periodType }: PaymentsWidgetProps) {
    const { loginMember } = useGlobalLoginMember()
    const [ready, setReady] = useState(false)
    const [paymentsWidget, setPaymentsWidget] = useState<TossPaymentsWidgets | null>(null)
    const customerKey = crypto.randomUUID()

    useEffect(() => {
        let isMounted = true

        async function initializeAndRenderPayment() {
            try {
                const tossPayments = await loadTossPayments(WIDGET_KEY)

                if (isMounted) {
                    const paymentsInstance = tossPayments.widgets({
                        customerKey: customerKey,
                    })
                    setPaymentsWidget(paymentsInstance)

                    await paymentsInstance.setAmount(amount)
                    await paymentsInstance.renderPaymentMethods({
                        selector: '#payment-method',
                        variantKey: 'DEFAULT',
                    })
                    await paymentsInstance.renderAgreement({
                        selector: '#agreement',
                        variantKey: 'AGREEMENT',
                    })
                    setReady(true)
                }
            } catch (error) {
                console.error('Error initializing payment:', error)
                if (isMounted) {
                    setReady(false)
                }
            }
        }

        initializeAndRenderPayment()

        return () => {
            isMounted = false
        }
    }, [])

    const handlePayment = async () => {
        if (!paymentsWidget || !loginMember.email || !loginMember.nickname) return

        try {
            const { error: requestError, data: requestData } = await client.POST('/api/v1/payment/request', {
                body: {
                    type: subscriptionType,
                    period: periodType,
                },
            })

            if (requestError || !requestData) throw requestError || new Error('결제 요청 실패')

            const {
                orderId,
                orderName,
                amount: responseAmount,
            } = (requestData as { data?: { orderId?: string; orderName?: string; amount?: number } }).data || {}

            console.log('responseAmount', responseAmount)

            const successUrl = new URL('/membership/payments/success', window.location.origin)
            const failUrl = new URL('/membership/paymentsfail', window.location.origin)

            // orderId, amount는 paymentsWidget에서 받아오는 값이므로 여기서는 사용하지 않음
            const commonParams = {
                subscriptionType,
                periodType,
            }

            Object.entries(commonParams).forEach(([key, value]) => {
                successUrl.searchParams.append(key, value)
                failUrl.searchParams.append(key, value)
            })

            await paymentsWidget.requestPayment({
                orderId: orderId ?? '',
                orderName: orderName ?? '',
                successUrl: successUrl.toString(),
                failUrl: failUrl.toString(),
                customerName: loginMember.nickname,
                customerEmail: loginMember.email,
            })
        } catch (e) {
            console.error('결제 요청 중 오류가 발생했습니다:', e)
            alert('결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.')
        }
    }

    return (
        <div className="wrapper">
            <div className="box_section">
                <div id="payment-method" />
                <div id="agreement" />
                <button
                    className="w-[200px] py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70 mx-auto block mt-5"
                    disabled={!ready}
                    onClick={handlePayment}
                >
                    {ready ? '결제하기' : '결제 준비중...'}
                </button>
            </div>
        </div>
    )
}
