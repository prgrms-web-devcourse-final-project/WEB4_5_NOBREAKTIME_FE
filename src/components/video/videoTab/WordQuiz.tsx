'use client'

import React, { useState, useEffect } from 'react'
import client from '@/lib/backend/client'
import { WordQuizType, WordQuizProps } from '@/types/video'

const WordQuiz: React.FC<WordQuizProps> = ({ fontSize, videoId }) => {
    // 단어 퀴즈 상태 관리
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
    const [input, setInput] = useState('')
    const [quizResult, setQuizResult] = useState<null | boolean>(null)
    const [wordQuizzes, setWordQuizzes] = useState<WordQuizType[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // API 호출
    useEffect(() => {
        const fetchWordQuiz = async () => {
            try {
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

                console.log('단어 퀴즈 데이터:', data)
                if (data?.data?.quiz) {
                    setWordQuizzes(data.data.quiz as WordQuizType[])
                }
            } catch (error) {
                console.error('단어 퀴즈 데이터 요청 실패:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchWordQuiz()
    }, [videoId])

    // 현재 퀴즈
    const currentQuiz = wordQuizzes[currentQuizIndex]

    // 다음 퀴즈로 이동
    const handleNextQuiz = () => {
        setCurrentQuizIndex((prev) => (prev + 1) % wordQuizzes.length)
        setInput('')
        setQuizResult(null)
    }

    // 이전 퀴즈로 이동
    const handlePrevQuiz = () => {
        setCurrentQuizIndex((prev) => (prev - 1 + wordQuizzes.length) % wordQuizzes.length)
        setInput('')
        setQuizResult(null)
    }

    // 정답 확인
    const handleSubmit = () => {
        const isCorrect = input.trim().toLowerCase() === currentQuiz.word?.toLowerCase()
        setQuizResult(isCorrect)

        // 오답인 경우 잠시 후 자동으로 초기화
        if (!isCorrect) {
            setTimeout(() => {
                handleReset()
            }, 1500)
        }
    }

    // 초기화
    const handleReset = () => {
        setInput('')
        setQuizResult(null)
    }

    // 빈칸을 input으로 변환
    const renderSentence = () => {
        if (!currentQuiz) return null

        const parts = currentQuiz.sentence?.split('{}') || []
        return (
            <div>
                <div className="mb-1" style={{ fontSize: `${fontSize}px` }}>
                    {parts.map((part, idx) => (
                        <span key={idx}>
                            {part}
                            {idx < parts.length - 1 && (
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="border-b-2 border-purple-400 w-32 mx-1 text-center outline-none"
                                    style={{ fontSize: `${fontSize}px` }}
                                    disabled={quizResult !== null}
                                />
                            )}
                        </span>
                    ))}
                </div>
                <div
                    className="bg-purple-50 p-2 rounded text-black-800 text-sm mb-3 mt-4"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {currentQuiz.sentenceMeaning}
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse">로딩 중...</div>
            </div>
        )
    }

    if (wordQuizzes.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div>사용 가능한 단어 퀴즈가 없습니다.</div>
            </div>
        )
    }

    return (
        <div className="w-full h-full overflow-y-auto" style={{ fontSize: `${fontSize}px` }}>
            <div className="bg-white rounded-lg p-4 relative h-full flex flex-col">
                <div>{renderSentence()}</div>

                {/* 버튼들을 하단에 배치 */}
                <div className="mt-auto pt-4 flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <button
                            className="px-4 py-1 bg-purple-500 text-white rounded text-sm"
                            onClick={handleSubmit}
                            disabled={input.trim() === '' || quizResult !== null}
                        >
                            정답 확인
                        </button>

                        {/* 정답/오답 메시지 → 이미지로 대체 */}
                        {quizResult !== null && (
                            <div className="ml-3 text-md font-bold flex items-center">
                                {quizResult ? (
                                    <img src="/assets/ok.svg" alt="정답" className="w-6 h-6" />
                                ) : (
                                    <img src="/assets/fail.svg" alt="오답" className="w-6 h-6" />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 items-center">
                        <button onClick={handlePrevQuiz} className="px-2 py-1 bg-gray-200 rounded">
                            &larr;
                        </button>
                        <span className="px-2">
                            {currentQuizIndex + 1}/{wordQuizzes.length}
                        </span>
                        <button onClick={handleNextQuiz} className="px-2 py-1 bg-gray-200 rounded">
                            &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WordQuiz
