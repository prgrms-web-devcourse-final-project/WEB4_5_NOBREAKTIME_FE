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

// TODO: clientKey는 개발자센터의 결제위젯 연동 키 > 클라이언트 키로 바꾸세요.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
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
            value: 50000,
        },
    )
    const [ready, setReady] = useState(false)
    const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null)

    useEffect(() => {
        async function fetchPaymentWidgets() {
            try {
                // ------  SDK 초기화 ------
                // @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
                const tossPayments = await loadTossPayments(clientKey)

                // 회원 결제
                // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentswidgets
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

            // ------  주문서의 결제 금액 설정 ------
            // TODO: 위젯의 결제금액을 결제하려는 금액으로 초기화하세요.
            // TODO: renderPaymentMethods, renderAgreement, requestPayment 보다 반드시 선행되어야 합니다.
            await widgets.setAmount(amount)

            // ------  결제 UI 렌더링 ------
            // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentmethods
            await widgets.renderPaymentMethods({
                selector: '#payment-method',
                // 렌더링하고 싶은 결제 UI의 variantKey
                // 결제 수단 및 스타일이 다른 멀티 UI를 직접 만들고 싶다면 계약이 필요해요.
                // @docs https://docs.tosspayments.com/guides/v2/payment-widget/admin#새로운-결제-ui-추가하기
                variantKey: 'DEFAULT',
            })

            // ------  이용약관 UI 렌더링 ------
            // @docs https://docs.tosspayments.com/reference/widget-sdk#renderagreement선택자-옵션
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
        } catch (error) {
            console.error('결제 처리 중 오류가 발생했습니다:', error)
            // TODO: 에러 처리 UI 추가
        }
    }

    return (
        <div className="wrapper">
            <div className="box_section">
                {/* 결제 UI */}
                <div id="payment-method" />
                {/* 이용약관 UI */}
                <div id="agreement" />
                {/* 쿠폰 체크박스 */}
                <div style={{ paddingLeft: '24px' }}>
                    <div className="checkable typography--p">
                        <label htmlFor="coupon-box" className="checkable__label typography--regular">
                            <input
                                id="coupon-box"
                                className="checkable__input"
                                type="checkbox"
                                aria-checked="true"
                                disabled={!ready}
                                // ------  주문서의 결제 금액이 변경되었을 경우 결제 금액 업데이트 ------
                                // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
                                onChange={async (event) => {
                                    await updateAmount({
                                        currency: amount.currency,
                                        value: event.target.checked ? amount.value - 5000 : amount.value + 5000,
                                    })
                                }}
                            />
                            <span className="checkable__label-text">5,000원 쿠폰 적용</span>
                        </label>
                    </div>
                </div>

                {/* 결제하기 버튼 */}
                <button className="button" style={{ marginTop: '30px' }} disabled={!ready} onClick={handlePayment}>
                    결제하기
                </button>
            </div>
        </div>
    )
}
