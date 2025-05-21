import client from '@/lib/backend/client'
import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import { loadTossPayments, TossPaymentsPayment } from '@tosspayments/tosspayments-sdk'
import { useEffect, useState } from 'react'

const BILLING_KEY = process.env.NEXT_PUBLIC_TOSS_BILLING_CLIENT_KEY || ''

interface Amount {
    currency: string
    value: number
}
interface BillingWidgetProps {
    amount: Amount
    subscriptionType: 'BASIC' | 'STANDARD' | 'PREMIUM'
    orderId: string
}

export default function BillingWidget({ amount, subscriptionType, orderId }: BillingWidgetProps) {
    const { loginMember } = useGlobalLoginMember()
    const [ready, setReady] = useState(false)
    const [billingWidget, setBillingWidget] = useState<TossPaymentsPayment | null>(null)
    const customerKey = crypto.randomUUID()

    useEffect(() => {
        let isMounted = true

        async function initializeAndRenderPayment() {
            try {
                const tossPayments = await loadTossPayments(BILLING_KEY)

                if (isMounted) {
                    const billingInstance = tossPayments.payment({ customerKey: customerKey })
                    setBillingWidget(billingInstance)
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
        if (!billingWidget || !loginMember.email || !loginMember.nickname) return

        try {
            const successUrl = new URL('/membership/billing/success', window.location.origin)
            const failUrl = new URL('/membership/billing/fail', window.location.origin)

            const commonParams = {
                orderId: orderId ?? '',
                amount: amount.value.toString(),
                subscriptionType,
                periodType: 'MONTHLY',
                isBillingKey: 'true',
            }

            Object.entries(commonParams).forEach(([key, value]) => {
                successUrl.searchParams.append(key, value)
                failUrl.searchParams.append(key, value)
            })

            await billingWidget.requestBillingAuth({
                method: 'CARD',
                successUrl: successUrl.toString(),
                failUrl: failUrl.toString(),
                customerEmail: loginMember.email,
                customerName: loginMember.nickname,
            })
        } catch (e) {
            console.error('결제 요청 중 오류가 발생했습니다:', e)
            alert('결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.')
        }
    }

    return (
        <div className="wrapper">
            <div className="box_section">
                <button
                    className="w-[200px] py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70 mx-auto block mt-5"
                    disabled={!ready}
                    onClick={handlePayment}
                >
                    {ready ? '정기 결제 카드 등록하기' : '위젯 준비중...'}
                </button>
            </div>
        </div>
    )
}
