'use client'

import React, { useState, useEffect } from 'react'
import client from '@/lib/backend/client'
import Image from 'next/image'
import { components } from '@/lib/backend/apiV1/schema'
import WordModal, { Word } from '../wordModal'

type VideoLearningWordQuizItem = components['schemas']['VideoLearningWordQuizItem']
type VideoLearningWordQuizListResponse = components['schemas']['VideoLearningWordQuizListResponse']

// 내부 상태 관리를 위해 VideoLearningWordQuizItem 타입을 확장
interface ExtendedVideoLearningWordQuizItem extends VideoLearningWordQuizItem {
    originalWord?: string // 오답 처리 시 원래 단어를 저장하기 위한 필드
}

interface WordQuizProps {
    fontSize: number
    videoId: string
    quizData: VideoLearningWordQuizItem[]
    onWrongAnswer?: (word: VideoLearningWordQuizItem) => void
    getModalWords?: () => Word[]
}

// 퀴즈 결과 타입 정의
interface QuizResultItem {
    quizItem: VideoLearningWordQuizItem // 원본 퀴즈 데이터
    userAnswer: string // 사용자 입력
    isCorrect: boolean // 정답 여부
    isAnswered: boolean // 답변 여부
}

const WordQuiz: React.FC<WordQuizProps> = ({ fontSize, videoId, quizData, onWrongAnswer, getModalWords }) => {
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
    const [input, setInput] = useState('')
    const [quizResults, setQuizResults] = useState<QuizResultItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // 초기 퀴즈 결과 설정
    useEffect(() => {
        if (quizData.length > 0) {
            // 각 퀴즈 항목에 대한 결과 초기화
            const initialResults = quizData.map((quiz) => ({
                quizItem: quiz,
                userAnswer: '',
                isCorrect: false,
                isAnswered: false,
            }))
            setQuizResults(initialResults)
            setIsLoading(false)
        }
    }, [quizData])

    // 정답 확인
    const handleSubmit = () => {
        const currentQuiz = quizData[currentQuizIndex]
        if (!currentQuiz || !currentQuiz.word) return

        const userAnswer = input.trim()
        const isCorrect = userAnswer.toLowerCase() === currentQuiz.word.toLowerCase()

        // 현재 퀴즈 결과 업데이트
        setQuizResults((prev) => {
            const newResults = [...prev]
            newResults[currentQuizIndex] = {
                quizItem: currentQuiz,
                userAnswer: userAnswer,
                isCorrect: isCorrect,
                isAnswered: true,
            }
            return newResults
        })

        // 오답인 경우 상위 컴포넌트에 알림
        if (!isCorrect && onWrongAnswer) {
            onWrongAnswer(currentQuiz)
        }

        setInput('')

        // 마지막 문제가 아니면 다음 문제로
        if (currentQuizIndex < quizResults.length - 1) {
            setTimeout(() => {
                setCurrentQuizIndex(currentQuizIndex + 1)
            }, 1000)
        }
    }

    // 모든 문제를 풀었는지 확인
    const areAllAnswered = () => {
        return quizResults.every((result) => result.isAnswered)
    }

    // 현재 퀴즈가 마지막 퀴즈인지 확인
    const isLastQuiz = currentQuizIndex === quizData.length - 1

    // 현재 퀴즈
    const currentQuiz = quizData[currentQuizIndex]

    // 다음 퀴즈로 이동
    const handleNextQuiz = () => {
        if (currentQuizIndex < quizData.length - 1) {
            setCurrentQuizIndex(currentQuizIndex + 1)
            setInput('')
        }
    }

    // 이전 퀴즈로 이동
    const handlePrevQuiz = () => {
        if (currentQuizIndex > 0) {
            setCurrentQuizIndex(currentQuizIndex - 1)
            setInput('')
        }
    }

    // 빈칸을 input으로 변환
    const renderSentence = () => {
        if (!currentQuiz) return null

        const parts = currentQuiz.sentence?.split('{}') || []
        const currentResult = quizResults[currentQuizIndex]

        return (
            <div>
                <div className="mb-1" style={{ fontSize: `${fontSize}px` }}>
                    {parts.map((part: string, idx: number) => (
                        <span key={idx}>
                            {part}
                            {idx < parts.length - 1 && (
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && input.trim() !== '' && !currentResult?.isAnswered) {
                                            e.preventDefault()
                                            handleSubmit()
                                        }
                                    }}
                                    className="border-b-2 border-purple-400 w-32 mx-1 text-center outline-none"
                                    style={{ fontSize: `${fontSize}px` }}
                                    disabled={currentResult?.isAnswered}
                                />
                            )}
                        </span>
                    ))}
                </div>
                <div
                    className="bg-purple-50 p-2 rounded text-black-800 text-sm mb-3 mt-4"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {currentQuiz.sentenceMeaning || currentQuiz.meaning}
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

    if (quizData.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div>사용 가능한 단어 퀴즈가 없습니다.</div>
            </div>
        )
    }

    const currentResult = quizResults[currentQuizIndex]

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
                            disabled={input.trim() === '' || currentResult?.isAnswered}
                        >
                            정답 확인
                        </button>

                        {/* 정답/오답 메시지 → 이미지로 대체 */}
                        {currentResult?.isAnswered && (
                            <div className="ml-3 text-md font-bold flex items-center">
                                {currentResult.isCorrect ? (
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
                            {currentQuizIndex + 1}/{quizData.length}
                        </span>
                        <button
                            onClick={handleNextQuiz}
                            className={`px-2 py-1 rounded ${
                                currentQuizIndex < quizData.length - 1
                                    ? 'bg-gray-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={currentQuizIndex >= quizData.length - 1}
                        >
                            &rarr;
                        </button>
                        {isLastQuiz && (
                            <button
                                onClick={() => {
                                    // 안 푼 문제들을 오답으로 처리
                                    quizResults.forEach((result, index) => {
                                        if (!result.isAnswered && onWrongAnswer) {
                                            onWrongAnswer(quizData[index])
                                        }
                                    })
                                    setIsModalOpen(true)
                                }}
                                className="ml-4 px-4 py-1 bg-[var(--color-main)] text-white rounded-md font-bold hover:bg-purple-700 transition-colors"
                            >
                                단어 추가
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 단어 추가 모달 */}
            {isModalOpen && getModalWords && (
                <WordModal
                    title="단어를 단어장에 추가할까요?"
                    description="추가한 단어와 틀린 문제의 단어가 자동으로 선택되었습니다."
                    onCancel={() => {
                        setIsModalOpen(false)
                    }}
                    onConfirm={async (selectedWords, selectedList) => {
                        try {
                            // 선택된 단어를 단어장에 추가
                            const wordsToAdd = selectedWords
                                .filter((word) => word.checked)
                                .map((word) => ({
                                    word: word.word,
                                    subtitleId: word.subtitleId,
                                    videoId: word.videoId,
                                }))

                            // 성공 메시지 표시
                            alert('단어가 성공적으로 추가되었습니다.')

                            // 모달 닫기
                            setIsModalOpen(false)
                        } catch (error) {
                            console.error('단어 추가 중 오류 발생:', error)
                            alert('단어 추가에 실패했습니다. 다시 시도해주세요.')
                        }
                    }}
                    confirmText="추가하기"
                    cancelText="닫기"
                    initialWords={getModalWords()}
                />
            )}
        </div>
    )
}

export default WordQuiz
