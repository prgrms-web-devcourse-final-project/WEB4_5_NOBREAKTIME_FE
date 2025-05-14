'use client'

import Header from '@/components/layout/header'
import Nav from '@/components/layout/nav'
import Image from 'next/image'
import { useState } from 'react'

export default function Membership() {
    const [activeTab, setActiveTab] = useState<'month' | 'quarter' | 'year'>('month')
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

    const handleMoreClick = (features: string[]) => {
        setSelectedFeatures(features)
        setModalOpen(true)
    }

    const membershipPlans = [
        {
            id: 1,
            name: 'Basic',
            price: activeTab === 'month' ? '9,900' : activeTab === 'quarter' ? '26,730' : '95,040',
            period: activeTab === 'month' ? '월' : activeTab === 'quarter' ? '6개월' : '년',
            features: ['기본 학습 콘텐츠 이용', '일일 학습 통계 확인', '기본 문법 학습', '기본 단어장 이용'],
        },
        {
            id: 2,
            name: 'Standard',
            price: activeTab === 'month' ? '19,900' : activeTab === 'quarter' ? '53,730' : '191,040',
            period: activeTab === 'month' ? '월' : activeTab === 'quarter' ? '6개월' : '년',
            features: [
                'Basic 모든 기능',
                '상세 학습 통계 및 분석',
                'AI 기반 맞춤 학습',
                '무제한 단어장 이용',
                '프리미엄 문법 강의',
                '학습 습관 트래킹',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
                '모바일 앱 연동',
            ],
            popular: true,
        },
        {
            id: 3,
            name: 'Premium',
            price: activeTab === 'month' ? '29,900' : activeTab === 'quarter' ? '80,730' : '287,040',
            period: activeTab === 'month' ? '월' : activeTab === 'quarter' ? '6개월' : '년',
            features: [
                'Standard 모든 기능',
                '1:1 학습 상담',
                '전문가 피드백',
                '프리미엄 학습 자료',
                '우선 고객 지원',
                '무제한 학습 기록',
                'AI 추천 커리큘럼',
                '추가 문법 문제 제공',
            ],
        },
    ]

    return (
        <div className="flex min-h-screen">
            <Nav />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 px-12 py-8 flex flex-col items-center justify-center">
                    {/* 헤더 */}
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
                        {membershipPlans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`bg-white rounded-2xl p-8 shadow-md border-2 flex flex-col ${
                                    plan.popular
                                        ? 'border-[var(--color-point)] relative'
                                        : 'border-[var(--color-sub-2)]'
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[var(--color-point)] text-white px-4 py-1 rounded-full text-sm font-bold">
                                        인기
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="flex items-end justify-center gap-1">
                                        <div className="flex items-end justify-center gap-2">
                                            {/* 원래 가격 (할인일 경우만) */}
                                            {activeTab !== 'month' && (
                                                <span className="text-base text-gray-400 line-through">
                                                    ₩
                                                    {plan.name === 'Basic'
                                                        ? activeTab === 'quarter'
                                                            ? '29,700'
                                                            : '118,800'
                                                        : plan.name === 'Standard'
                                                        ? activeTab === 'quarter'
                                                            ? '59,700'
                                                            : '238,800'
                                                        : plan.name === 'Premium'
                                                        ? activeTab === 'quarter'
                                                            ? '89,700'
                                                            : '358,800'
                                                        : ''}
                                                </span>
                                            )}

                                            {/* 실제 가격 강조 */}
                                            <span className="text-4xl font-bold text-[var(--color-black)]">
                                                ₩{plan.price}
                                            </span>
                                            <span className="text-lg text-[var(--color-main)]">/{plan.period}</span>
                                        </div>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-4 flex-1">
                                    {plan.features.slice(0, 6).map((feature, index) => (
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
                                {plan.features.length > 6 && (
                                    <button
                                        className="text-sm text-[var(--color-point)] underline mb-4"
                                        onClick={() => handleMoreClick(plan.features)}
                                    >
                                        혜택 더보기
                                    </button>
                                )}
                                <button
                                    className={`w-full py-3 rounded-lg font-bold transition-all mt-auto ${
                                        plan.popular
                                            ? 'bg-[var(--color-point)] text-white hover:bg-opacity-90'
                                            : 'bg-[var(--color-sub-2)] text-[var(--color-main)] hover:bg-opacity-80'
                                    }`}
                                >
                                    시작하기
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* 모달 */}
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
                                    {selectedFeatures.map((feature, index) => (
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
