'use client'

import Header from '@/components/layout/header'
import Nav from '@/components/layout/nav'

export default function Membership() {
    const membershipPlans = [
        {
            id: 1,
            name: 'Basic',
            price: '9,900',
            period: '월',
            features: ['기본 학습 콘텐츠 이용', '일일 학습 통계 확인', '기본 문법 학습', '기본 단어장 이용'],
        },
        {
            id: 2,
            name: 'Standard',
            price: '19,900',
            period: '월',
            features: [
                'Basic 모든 기능',
                '상세 학습 통계 및 분석',
                'AI 기반 맞춤 학습',
                '무제한 단어장 이용',
                '프리미엄 문법 강의',
            ],
            popular: true,
        },
        {
            id: 3,
            name: 'Premium',
            price: '29,900',
            period: '월',
            features: [
                'Standard 모든 기능',
                '1:1 학습 상담',
                '전문가 피드백',
                '프리미엄 학습 자료',
                '우선 고객 지원',
                '무제한 학습 기록',
            ],
        },
    ]

    return (
        <div className="flex min-h-screen">
            <Nav />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 px-12 py-8 flex flex-col items-center justify-center">
                    {/* 헤더 섹션 */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-[var(--color-black)] mb-4">
                            프리미엄 멤버십으로 더 효과적인 학습을
                        </h1>
                        <p className="text-lg text-[var(--color-main)]">맞춤형 학습 경험과 다양한 혜택을 만나보세요</p>
                    </div>

                    {/* 멤버십 플랜 */}
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
                                        <span className="text-4xl font-bold">₩{plan.price}</span>
                                        <span className="text-lg text-[var(--color-main)]">/{plan.period}</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, index) => (
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
                </main>
            </div>
        </div>
    )
}
