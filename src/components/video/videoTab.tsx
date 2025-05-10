'use client'

import React, { useState } from 'react'
import { Keyword } from './videoTab/KeywordCard'
import WordQuiz from './videoTab/WordQuiz'
import ExpressionQuiz from './videoTab/ExpressionQuiz'
import Overview from './videoTab/Overview'
import Image from 'next/image'
import { WordQuizResult, WordQuizType } from '@/types/video'

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
    videoId: string
    onQuizResults?: (results: WordQuizResult[]) => void
    wordQuizData?: WordQuizType[]
    onAddKeyword?: (keyword: Keyword) => void
    onRemoveKeyword?: (keyword: Keyword) => void
    isKeywordAdded?: (keyword: Keyword) => boolean
    currentTime?: number
}

function VideoTab({
    fontSize,
    selectedSubtitle,
    selectedTab,
    onTabChange,
    isLoading,
    videoId,
    onQuizResults,
    wordQuizData = [],
    onAddKeyword,
    onRemoveKeyword,
    isKeywordAdded,
    currentTime = 0,
}: Props) {
    const [wordQuizResults, setWordQuizResults] = useState<WordQuizResult[]>([])

    // 단어 퀴즈 결과 처리
    const handleWordQuizResults = (results: WordQuizResult[]) => {
        setWordQuizResults(results)
        if (onQuizResults) {
            onQuizResults(results)
        }
    }

    return (
        <div className="flex flex-row w-full justify-center items-center h-[180px] bg-[var(--color-white)] rounded-lg">
            {/* 좌측 탭 목록 */}
            <div className="flex justify-center items-center w-50 h-[80%] p-2">
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
            <div className="w-full h-full p-2 relative">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="animate-pulse">
                            <Image src="/character/loading-1.gif" alt="loading" width={300} height={300} />
                        </div>
                    </div>
                ) : (
                    <>
                        {selectedTab === 'overview' && (
                            <Overview
                                fontSize={fontSize}
                                selectedSubtitle={selectedSubtitle}
                                onAddKeyword={onAddKeyword}
                                onRemoveKeyword={onRemoveKeyword}
                                isKeywordAdded={isKeywordAdded}
                                videoId={videoId}
                                currentTime={currentTime}
                            />
                        )}
                        {selectedTab === '단어' && (
                            <WordQuiz
                                fontSize={fontSize}
                                videoId={videoId}
                                onQuizResult={handleWordQuizResults}
                                wordQuizData={wordQuizData}
                            />
                        )}
                        {selectedTab === '표현' && <ExpressionQuiz fontSize={fontSize} videoId={videoId} />}
                    </>
                )}
            </div>
        </div>
    )
}

export default VideoTab
