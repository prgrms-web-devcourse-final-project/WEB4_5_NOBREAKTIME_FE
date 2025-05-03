'use client'

import Search from '@/components/common/search'
import DashboardLayout from '../dashboardLayout'
import WordIcon from '@/components/icon/wordIcon'
import LearningCard from '@/components/learning/learningCard'
import DropdownCheckBox from '@/components/common/dropdownCheckBox'
import ItemCard from '@/components/learning/itemCard'

function Word() {
    return (
        <DashboardLayout title="Word Learning" icon={<WordIcon />}>
            <div className="w-300 m-auto">
                <Search onSearch={() => {}} placeholder="word search..." />
            </div>
            <div className="flex-1 ">
                <LearningCard
                    title="단어"
                    descriptions={[
                        { text: '내 {title}장에서 톡톡 랜덤 등장!', strong: ['랜덤'] },
                        { text: '반복과 호기심 학습을 한번에!', strong: ['반복', '호기심'] },
                    ]}
                />
            </div>

            <div className="flex flex-col flex-1 gap-2 h-full overflow-hidden">
                {/* 상단 타이틀 */}
                <div className="flex justify-between">
                    <h1 className="text-2xl font-bold">📚 내 단어장</h1>
                    <DropdownCheckBox />
                </div>

                {/* 카드 리스트 */}
                <div className="flex-1 overflow-y-auto p-2">
                    <ItemCard />
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Word
