'use client'

import React from 'react'
import { Keyword } from './videoTab/KeywordCard'
import WordQuiz from './videoTab/WordQuiz'
import ExpressionQuiz from './videoTab/ExpressionQuiz'
import Overview from './videoTab/Overview'

interface Props {
    fontSize: number // 폰트 크기
    selectedSubtitle?: {
        original: string
        transcript: string
        keywords?: Keyword[]
    } | null
    selectedTab: string
    onTabChange: (tab: string) => void
    isLoading: boolean
}

function VideoTab({ fontSize, selectedSubtitle, selectedTab, onTabChange, isLoading }: Props) {
    return (
        <div className="flex flex-row w-full h-[240px] bg-[var(--color-white)] rounded-lg">
            {/* 좌측 탭 목록 */}
            <div className="flex justify-center items-center w-50 h-full p-4">
                <ul className="w-full h-full flex flex-col border-r-2 border-[var(--color-main)] px-2">
                    {['overview', '단어', '표현'].map((tab) => (
                        <li
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={`flex-1 text-lg font-bold cursor-pointer flex items-center pl-2 ${
                                selectedTab === tab
                                    ? 'border-b-2 border-[var(--color-main)] text-[var(--color-main)]'
                                    : 'text-[var(--color-sub-1)]'
                            }`}
                        >
                            {tab}
                        </li>
                    ))}
                </ul>
            </div>

            {/* 우측 탭 내용 */}
            <div className="w-full h-full p-4 relative">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="animate-pulse">로딩 중...</div>
                    </div>
                ) : (
                    <>
                        {selectedTab === 'overview' && (
                            <Overview fontSize={fontSize} selectedSubtitle={selectedSubtitle} />
                        )}
                        {selectedTab === '단어' && <WordQuiz fontSize={fontSize} />}
                        {selectedTab === '표현' && <ExpressionQuiz fontSize={fontSize} />}
                    </>
                )}
            </div>
        </div>
    )
}

export default VideoTab
