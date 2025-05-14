'use client'

import React, { useState, useEffect } from 'react'
import { Keyword } from './videoTab/KeywordCard'
import WordQuiz from './videoTab/WordQuiz'
import ExpressionQuiz from './videoTab/ExpressionQuiz'
import Overview from './videoTab/Overview'
import Image from 'next/image'
import { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'

type VideoLearningWordQuizItem = components['schemas']['VideoLearningWordQuizItem']
type VideoLearningWordQuizListResponse = components['schemas']['VideoLearningWordQuizListResponse']

interface Props {
    fontSize: number // 폰트 크기
    selectedSubtitle?: {
        original: string
        transcript: string
        keywords?: Keyword[]
        subtitleId?: number
    } | null
    selectedTab: string
    onTabChange: (tab: string) => void
    isLoading: boolean
    videoId: string
    onAddKeyword?: (keyword: Keyword) => void
    onRemoveKeyword?: (keyword: Keyword) => void
    isKeywordAdded?: (keyword: Keyword) => boolean
    currentTime?: number
    subtitleIndex?: number
    onPrevSubtitle?: () => void
    onNextSubtitle?: () => void
}

function VideoTab({
    fontSize,
    selectedSubtitle,
    selectedTab,
    onTabChange,
    isLoading: parentIsLoading,
    videoId,
    onAddKeyword,
    onRemoveKeyword,
    isKeywordAdded,
    currentTime = 0,
    subtitleIndex = 0,
    onPrevSubtitle,
    onNextSubtitle,
}: Props) {
    const [quizData, setQuizData] = useState<VideoLearningWordQuizItem[]>([])
    const [isQuizLoading, setIsQuizLoading] = useState(false)

    // 단어 퀴즈 데이터 로드 - 분석이 완료되고 selectedSubtitle이 있을 때 실행
    useEffect(() => {
        const fetchWordQuiz = async () => {
            // 선택된 자막이 없거나 분석이 완료되지 않은 경우 리턴
            if (!selectedSubtitle) return

            // 이미 데이터가 있으면 API 호출하지 않음
            if (quizData.length > 0) return

            try {
                setIsQuizLoading(true)
                const { data, error } = await client.GET('/api/v1/videos/{videoId}/quiz/words', {
                    params: {
                        path: {
                            videoId: videoId,
                        },
                    },
                })

                if (error) {
                    console.error('단어 퀴즈 데이터 요청 실패:', error)
                    return
                }

                if (data?.data?.quiz) {
                    setQuizData(data.data.quiz)
                }
            } catch (error) {
                console.error('단어 퀴즈 데이터 요청 실패:', error)
            } finally {
                setIsQuizLoading(false)
            }
        }

        fetchWordQuiz()
    }, [videoId, selectedSubtitle]) // videoId와 selectedSubtitle이 변경될 때 실행

    const isLoading = parentIsLoading || isQuizLoading

    return (
        <div className="flex flex-row w-full justify-center items-center h-[180px] bg-[var(--color-white)] rounded-lg border-2 border-[var(--color-sub-1)]">
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
                                subtitleIndex={subtitleIndex}
                                onPrevSubtitle={onPrevSubtitle}
                                onNextSubtitle={onNextSubtitle}
                            />
                        )}
                        {selectedTab === '단어' && (
                            <WordQuiz fontSize={fontSize} videoId={videoId} quizData={quizData} />
                        )}
                        {selectedTab === '표현' && <ExpressionQuiz fontSize={fontSize} videoId={videoId} />}
                    </>
                )}
            </div>
        </div>
    )
}

export default VideoTab
