'use client'

import DropdownCheckBox from '@/components/common/dropdownCheckBox'
import Search from '@/components/common/search'
import ExpressionIcon from '@/components/icon/expressionIcon'
import ExpressionCard from '@/components/learning/expressionCard'
import LearningCard from '@/components/learning/learningCard'

export default function ExpressionPage() {
    const wordbooks = [
        { id: 1, name: '기초 문법', language: 'ENGLISH' },
        { id: 2, name: '중급 문법', language: 'ENGLISH' },
        { id: 3, name: '고급 문법', language: 'ENGLISH' },
    ]

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    <ExpressionIcon />
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Expression Learning</h3>
            </div>

            <div className="flex flex-col gap-6 bg-[var(--color-sub-2)] p-6 rounded-lg h-[calc(100vh-200px)]">
                <div className="w-[80%] m-auto">
                    <Search onSearch={() => {}} placeholder="expression search..." />
                </div>

                <div className="flex-1">
                    <LearningCard
                        title="문장"
                        descriptions={[
                            { text: '내 {title}장에서 톡톡 랜덤 등장!', strong: ['랜덤'] },
                            { text: '반복과 호기심 학습을 한번에!', strong: ['반복', '호기심'] },
                        ]}
                        wordbooks={wordbooks}
                    />
                </div>

                <div className="flex flex-col flex-1 gap-2 h-full overflow-hidden">
                    {/* 상단 타이틀 */}
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">📚 내 문장</h1>
                        <DropdownCheckBox wordbooks={wordbooks} />
                    </div>

                    {/* 카드 리스트 */}
                    <div className="flex-1 overflow-y-auto p-2">
                        <ExpressionCard />
                    </div>
                </div>
            </div>
        </>
    )
}
