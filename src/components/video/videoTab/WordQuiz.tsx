'use client'

import React, { useState, useEffect } from 'react'
import client from '@/lib/backend/client'
import { WordQuizType, WordQuizProps, WordQuizResult } from '@/types/video'
import Image from 'next/image'

const WordQuiz: React.FC<WordQuizProps> = ({ fontSize, videoId, onQuizResult, wordQuizData = [] }) => {
    // 단어 퀴즈 상태 관리
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
    const [input, setInput] = useState('')
    const [quizResult, setQuizResult] = useState<null | boolean>(null)
    const [wordQuizzes, setWordQuizzes] = useState<WordQuizType[]>(wordQuizData)
    const [quizResults, setQuizResults] = useState<WordQuizResult[]>([])
    const [isLoading, setIsLoading] = useState(wordQuizData.length === 0)
    const [allAnswered, setAllAnswered] = useState(false)

    // 전달받은 wordQuizData가 변경될 때 업데이트
    useEffect(() => {
        if (wordQuizData.length > 0) {
            setWordQuizzes(wordQuizData)
            setIsLoading(false)

            // 결과 배열 초기화
            const initialResults = wordQuizData.map((quiz) => ({
                word: quiz.word || '',
                meaning: quiz.meaning,
                isCorrect: false,
            }))
            setQuizResults(initialResults)
        }
    }, [wordQuizData])

    // 모든 문제를 풀었는지 확인
    useEffect(() => {
        if (quizResults.length > 0) {
            const answered = quizResults.every((result) => result.isCorrect !== undefined)
            setAllAnswered(answered)
        }
    }, [quizResults])

    // API 호출 - 전달받은 데이터가 없을 때만 실행
    useEffect(() => {
        // 이미 데이터가 있으면 API 호출하지 않음
        if (wordQuizData.length > 0) {
            return
        }

        const fetchWordQuiz = async () => {
            try {
                setIsLoading(true)
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
                    const quizData = data.data.quiz as WordQuizType[]
                    setWordQuizzes(quizData)

                    // 결과 배열 초기화
                    const initialResults = quizData.map((quiz) => ({
                        word: quiz.word || '',
                        meaning: quiz.meaning,
                        isCorrect: false,
                    }))
                    setQuizResults(initialResults)
                }
            } catch (error) {
                console.error('단어 퀴즈 데이터 요청 실패:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchWordQuiz()
    }, [videoId, wordQuizData.length])

    // 현재 퀴즈
    const currentQuiz = wordQuizzes[currentQuizIndex]

    // 다음 퀴즈로 이동
    const handleNextQuiz = () => {
        if (currentQuizIndex < wordQuizzes.length - 1) {
            setCurrentQuizIndex(currentQuizIndex + 1)
            setInput('')
            setQuizResult(null)
        }
    }

    // 이전 퀴즈로 이동
    const handlePrevQuiz = () => {
        if (currentQuizIndex > 0) {
            setCurrentQuizIndex(currentQuizIndex - 1)
            setInput('')
            setQuizResult(null)
        }
    }

    // 정답 확인
    const handleSubmit = () => {
        if (!currentQuiz || !currentQuiz.word) return

        const isCorrect = input.trim().toLowerCase() === currentQuiz.word.toLowerCase()
        setQuizResult(isCorrect)

        // 결과 업데이트
        const newResults = [...quizResults]
        newResults[currentQuizIndex] = {
            ...newResults[currentQuizIndex],
            isCorrect: isCorrect,
        }
        setQuizResults(newResults)

        // 결과 콜백 호출 - 모달을 열지 않도록 여기서는 호출하지 않음
        // 최종 결과 확인 버튼을 클릭할 때만 호출

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

    // 최종 결과 확인 및 단어장 추가 모달 열기
    const handleCheckFinalResult = () => {
        if (onQuizResult) {
            // 최종 결과 확인 버튼을 클릭할 때만 결과 콜백 호출
            onQuizResult(quizResults)
        }
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
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && input.trim() !== '' && quizResult === null) {
                                            e.preventDefault()
                                            handleSubmit()
                                        }
                                    }}
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
                <Image src="/character/loading-1.gif" alt="loading" width={300} height={300} />
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
                        <button
                            onClick={handlePrevQuiz}
                            className={`px-2 py-1 rounded ${
                                currentQuizIndex > 0 ? 'bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={currentQuizIndex === 0}
                        >
                            &larr;
                        </button>
                        <span className="px-2">
                            {currentQuizIndex + 1}/{wordQuizzes.length}
                        </span>
                        <button
                            onClick={handleNextQuiz}
                            className={`px-2 py-1 rounded ${
                                currentQuizIndex < wordQuizzes.length - 1
                                    ? 'bg-gray-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={currentQuizIndex === wordQuizzes.length - 1}
                        >
                            &rarr;
                        </button>

                        {/* 최종 결과 확인 버튼 - 마지막 퀴즈에서만 표시 */}
                        {allAnswered && currentQuizIndex === wordQuizzes.length - 1 && (
                            <button
                                onClick={handleCheckFinalResult}
                                className="ml-4 px-4 py-1 bg-[var(--color-main)] text-white rounded-md font-bold hover:bg-purple-700 transition-colors"
                            >
                                최종 결과 확인
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WordQuiz
