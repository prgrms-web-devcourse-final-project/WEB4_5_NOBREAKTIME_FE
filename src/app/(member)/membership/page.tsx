'use client'

import PaymentsWidget from '@/components/payment/PaymentsWidget'
import { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type PlanResponse = components['schemas']['PlanResponse']
type PeriodType = components['schemas']['PaymentSimpleRequest']['period']
type SubscriptionType = Extract<components['schemas']['PaymentSimpleRequest']['type'], 'BASIC' | 'STANDARD' | 'PREMIUM'>

interface SelectedPlan {
    name: string
    price: string
    period: string
    type: SubscriptionType
    periodType: PeriodType
}

export default function Membership() {
    const [activeTab, setActiveTab] = useState<'month' | 'quarter' | 'year'>('month')
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null)
    const [membershipPlans, setMembershipPlans] = useState<PlanResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const { data, error } = await client.GET('/api/v1/plans')
                if (error) {
                    throw new Error('플랜 정보를 가져오는데 실패했습니다.')
                }
                if (!data) {
                    throw new Error('플랜 정보가 없습니다.')
                }
                setMembershipPlans(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchPlans()
    }, [])

    const handleMoreClick = (features: string[]) => {
        setSelectedFeatures(features)
        setModalOpen(true)
    }

    const handleStartClick = (plan: PlanResponse) => {
        const periodType = activeTab === 'month' ? 'MONTHLY' : activeTab === 'quarter' ? 'SIX_MONTHS' : 'YEAR'
        const selectedPlanData = membershipPlans.find((p) => p.type === plan.type && p.period === periodType)

        if (!selectedPlanData?.priceInfo?.discountPrice) return

        setSelectedPlan({
            name: plan.title || plan.type || '',
            price: selectedPlanData.priceInfo.discountPrice.toString(),
            period: activeTab === 'month' ? '월' : activeTab === 'quarter' ? '6개월' : '년',
            type: plan.type as SubscriptionType,
            periodType: periodType as PeriodType,
        })
        setCheckoutModalOpen(true)
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-point)] mx-auto"></div>
                    <p className="mt-4 text-[var(--color-main)]">플랜 정보를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-[var(--color-point)] text-white rounded-lg hover:bg-opacity-90"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        )
    }

    const filteredPlans = membershipPlans.filter((plan) => {
        const periodType = activeTab === 'month' ? 'MONTHLY' : activeTab === 'quarter' ? 'SIX_MONTHS' : 'YEAR'
        return plan.period === periodType
    })

    return (
        <div className="flex min-h-screen">
            <div className="flex-1 flex flex-col">
                <Link href="/dashboard">
                    <Image src="/logo/all-logo.svg" alt="logo" width={180} height={180} className="ml-10 mt-5" />
                </Link>
                <main className="flex-1 px-12 py-8 flex flex-col items-center justify-center">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-[var(--color-black)] mb-4">
                            프리미엄 멤버십으로 더 효과적인 학습을
                        </h1>
                        <p className="text-lg text-[var(--color-main)]">맞춤형 학습 경험과 다양한 혜택을 만나보세요</p>
                    </div>

                    {/* 탭 */}
                    <div className="flex gap-4 mb-8">
                        {['month', 'quarter', 'year'].map((term) => (
                            <button
                                key={term}
                                onClick={() => setActiveTab(term as typeof activeTab)}
                                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                                    activeTab === term
                                        ? 'bg-[var(--color-point)] text-white'
                                        : 'bg-[var(--color-sub-2)] text-[var(--color-main)]'
                                }`}
                            >
                                {term === 'month'
                                    ? '월간 구독'
                                    : term === 'quarter'
                                    ? '6개월 구독(10%)'
                                    : '연간 구독(20%)'}
                            </button>
                        ))}
                    </div>

                    {/* 플랜 카드 */}
                    <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
                        {filteredPlans.map((plan) => (
                            <div
                                key={plan.type}
                                className={`bg-white rounded-2xl p-8 shadow-md border-2 flex flex-col ${
                                    plan.type === 'STANDARD'
                                        ? 'border-[var(--color-point)] relative'
                                        : 'border-[var(--color-sub-2)]'
                                }`}
                            >
                                {plan.type === 'STANDARD' && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[var(--color-point)] text-white px-4 py-1 rounded-full text-sm font-bold">
                                        인기
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold mb-2">{plan.title || plan.type || ''}</h3>
                                    <div className="flex items-end justify-center gap-1">
                                        <div className="flex items-end justify-center gap-2">
                                            {/* 원래 가격 (할인일 경우만) */}
                                            {(plan.priceInfo?.discountRate ?? 0) > 0 &&
                                                plan.priceInfo?.originalPrice && (
                                                    <span className="text-base text-gray-400 line-through">
                                                        ₩{plan.priceInfo.originalPrice.toLocaleString()}
                                                    </span>
                                                )}

                                            {/* 실제 가격 강조 */}
                                            <span className="text-4xl font-bold text-[var(--color-black)]">
                                                ₩{(plan.priceInfo?.discountPrice || 0).toLocaleString()}
                                            </span>
                                            <span className="text-lg text-[var(--color-main)]">
                                                /
                                                {activeTab === 'month'
                                                    ? '월'
                                                    : activeTab === 'quarter'
                                                    ? '6개월'
                                                    : '년'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-4 flex-1">
                                    {plan.features?.slice(0, 6).map((feature: string, index: number) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="text-[var(--color-point)]"
                                            >
                                                <path
                                                    d="M8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                            <span className="text-[var(--color-main)]">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                {plan.features && plan.features.length > 6 && (
                                    <button
                                        className="text-sm text-[var(--color-point)] underline mb-4"
                                        onClick={() => handleMoreClick(plan.features || [])}
                                    >
                                        혜택 더보기
                                    </button>
                                )}
                                <button
                                    className={`w-full py-3 rounded-lg font-bold transition-all mt-auto ${
                                        plan.type === 'STANDARD'
                                            ? 'bg-[var(--color-point)] text-white hover:bg-opacity-90'
                                            : 'bg-[var(--color-sub-2)] text-[var(--color-main)] hover:bg-opacity-80'
                                    }`}
                                    onClick={() => handleStartClick(plan)}
                                >
                                    시작하기
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* 결제 위젯 모달 */}
                    {checkoutModalOpen && selectedPlan && (
                        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                            <div className="w-[800px] h-[600px] bg-white rounded-2xl shadow-lg flex relative">
                                {/* 닫기 버튼 */}
                                <button
                                    onClick={() => setCheckoutModalOpen(false)}
                                    className="absolute -right-4 -top-4 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                    <Image
                                        src="/assets/close.svg"
                                        alt="닫기"
                                        width={20}
                                        height={20}
                                        className="text-gray-500"
                                    />
                                </button>
                                {/* 왼쪽 정보 섹션 */}
                                <div className="w-[320px] p-6 border-r border-gray-100 flex flex-col">
                                    <div>
                                        <h2 className="text-xl font-bold text-[var(--color-main)] mb-3">
                                            {selectedPlan.name} 멤버십
                                        </h2>
                                        <div className="mb-4">
                                            <div className="text-2xl font-bold text-[var(--color-black)] mb-1">
                                                ₩{selectedPlan.price}
                                                <span className="text-base text-[var(--color-main)] ml-1">
                                                    /{selectedPlan.period}
                                                </span>
                                            </div>
                                            {activeTab !== 'month' && (
                                                <div className="text-sm text-[var(--color-point)]">
                                                    {activeTab === 'quarter' ? '10% 할인' : '20% 할인'} 적용
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-[var(--color-main)] text-sm">주요 혜택</h3>
                                            <ul className="space-y-1.5">
                                                {membershipPlans
                                                    .find((p) => p.type === selectedPlan.type)
                                                    ?.features?.slice(0, 4)
                                                    .map((feature: string, index: number) => (
                                                        <li
                                                            key={index}
                                                            className="flex items-center gap-2 text-[var(--color-main)]"
                                                        >
                                                            <Image
                                                                src="/assets/check.svg"
                                                                alt="체크"
                                                                width={16}
                                                                height={16}
                                                                className="text-[var(--color-point)] flex-shrink-0"
                                                            />
                                                            <span className="text-sm">{feature}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-[var(--color-main)] mb-3">
                                            <Image
                                                src="/assets/clock.svg"
                                                alt="시계"
                                                width={14}
                                                height={14}
                                                className="text-[var(--color-point)]"
                                            />
                                            <span className="text-sm">결제 후 즉시 이용 가능</span>
                                        </div>
                                    </div>
                                </div>
                                {/* 오른쪽 결제 섹션 */}
                                <div className="flex-1 p-6">
                                    <PaymentsWidget
                                        amount={{
                                            currency: 'KRW',
                                            value: parseInt(selectedPlan.price.replace(/,/g, '')),
                                        }}
                                        subscriptionType={selectedPlan.type}
                                        periodType={selectedPlan.periodType}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 기존 모달 */}
                    {modalOpen && (
                        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-screen h-[40%] shadow-lg relative mt-10 mb-10">
                                <button
                                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                                    onClick={() => setModalOpen(false)}
                                >
                                    <Image src="/assets/close.svg" alt="close" width={24} height={24} />
                                </button>
                                <h2 className="text-xl font-bold mb-4 text-[var(--color-main)]">모든 혜택</h2>
                                <ul className="space-y-3 h-[90%] overflow-y-auto">
                                    {selectedFeatures.map((feature: string, index: number) => (
                                        <li key={index} className="flex items-center gap-2 text-[var(--color-main)]">
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="text-[var(--color-point)]"
                                            >
                                                <path
                                                    d="M8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
