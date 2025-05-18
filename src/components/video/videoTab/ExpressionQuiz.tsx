'use client'

import React, { useState, useEffect } from 'react'
import client from '@/lib/backend/client'
import Image from 'next/image'
import { components } from '@/lib/backend/apiV1/schema'

type ExpressionQuizItem = components['schemas']['ExpressionQuizItem']

interface ExpressionQuizProps {
    fontSize: number
    videoId: string
}

const ExpressionQuiz: React.FC<ExpressionQuizProps> = ({ fontSize, videoId }) => {
    // 표현 퀴즈 상태 관리
    const [currentExpressionQuizIndex, setCurrentExpressionQuizIndex] = useState(0)
    const [expressionQuizzes, setExpressionQuizzes] = useState<ExpressionQuizItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // API 호출
    useEffect(() => {
        const fetchExpressionQuiz = async () => {
            try {
                const { data, error } = await client.GET('/api/v1/videos/{videoId}/quiz/expressions', {
                    params: {
                        path: {
                            videoId: videoId,
                        },
                    },
                })

                if (error) {
                    console.error('표현 퀴즈 데이터 요청 실패:', error)
                    return
                }
                if (data?.data?.quiz) {
                    setExpressionQuizzes(data.data.quiz as ExpressionQuizItem[])
                }
            } catch (error) {
                console.error('표현 퀴즈 데이터 요청 실패:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchExpressionQuiz()
    }, [videoId])

    const expressionQuiz = expressionQuizzes[currentExpressionQuizIndex]
    const expressionParts = expressionQuiz?.question?.split(/({})/g) || []
    const expressionBlankCount = expressionParts.filter((part) => part === '{}').length
    const [expressionBlanks, setExpressionBlanks] = useState(Array(expressionBlankCount).fill(''))
    const [usedChoices, setUsedChoices] = useState<number[]>([])
    const [expressionResult, setExpressionResult] = useState<null | boolean>(null)

    // expressionQuiz가 바뀔 때마다 상태 초기화
    useEffect(() => {
        if (!expressionQuiz) return
        setExpressionBlanks(Array(expressionBlankCount).fill(''))
        setUsedChoices([])
        setExpressionResult(null)
    }, [expressionQuiz?.expressionId, expressionBlankCount])

    // 표현 퀴즈 - 빈칸에 단어 채우기
    const handleChoice = (choice: string, idx: number) => {
        if (usedChoices.includes(idx)) {
            const choiceIndex = usedChoices.indexOf(idx)
            const newUsedChoices = usedChoices.filter((_, i) => i !== choiceIndex)
            setUsedChoices(newUsedChoices)

            const blankIndex = expressionBlanks.findIndex((b) => b === choice)
            if (blankIndex !== -1) {
                const newBlanks = [...expressionBlanks]
                newBlanks.splice(blankIndex, 1)
                newBlanks.push('')
                setExpressionBlanks(newBlanks)
            }
            return
        }

        const firstEmpty = expressionBlanks.findIndex((b) => b === '')
        if (firstEmpty === -1) return
        const newBlanks = [...expressionBlanks]
        newBlanks[firstEmpty] = choice
        setExpressionBlanks(newBlanks)
        setUsedChoices([...usedChoices, idx])
    }

    // 정답 제출
    const handleExpressionSubmit = () => {
        // expressionBlanks의 원본을 보존하기 위해 복사본 사용
        const blanksCopy = [...expressionBlanks]
        let userAnswer = expressionParts
            .map((part) => {
                if (part === '{}') {
                    return blanksCopy.shift() || ''
                }
                return part
            })
            .join('')
        const isCorrect = userAnswer === expressionQuiz.original
        setExpressionResult(isCorrect)

        // 오답인 경우에만 자동 초기화 (정답이면 절대 초기화 X)
        if (isCorrect === false) {
            setTimeout(() => {
                handleExpressionReset()
            }, 1500)
        }
    }

    // 초기화
    const handleExpressionReset = () => {
        setExpressionBlanks(Array(expressionBlankCount).fill(''))
        setUsedChoices([])
        setExpressionResult(null)
    }

    // 다음 퀴즈로 이동
    const handleNextExpressionQuiz = () => {
        setCurrentExpressionQuizIndex((prev) => (prev + 1) % expressionQuizzes.length)
        handleExpressionReset()
    }

    // 이전 퀴즈로 이동
    const handlePrevExpressionQuiz = () => {
        setCurrentExpressionQuizIndex((prev) => (prev - 1 + expressionQuizzes.length) % expressionQuizzes.length)
        handleExpressionReset()
    }

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Image src="/character/loading-1.gif" alt="loading" width={300} height={300} />
            </div>
        )
    }

    if (expressionQuizzes.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div>사용 가능한 표현 퀴즈가 없습니다.</div>
            </div>
        )
    }

    return (
        <div className="w-full h-full overflow-y-auto" style={{ fontSize: `${fontSize}px` }}>
            <div className="bg-white rounded-lg p-4 relative h-full flex flex-col">
                <div className="mb-4">
                    {expressionQuiz &&
                        expressionParts.map((part, idx) =>
                            part === '{}' ? (
                                <span
                                    key={idx}
                                    className={`inline-block w-20 border-b-2 border-purple-400 mx-1 text-center transition-colors duration-200 ${
                                        expressionResult === true ? 'text-green-600 font-bold' : ''
                                    }`}
                                >
                                    {expressionBlanks[expressionParts.slice(0, idx).filter((p) => p === '{}').length] ||
                                        ' '}
                                </span>
                            ) : (
                                <span key={idx} className="mx-1">
                                    {part}
                                </span>
                            ),
                        )}
                </div>

                {/* 버튼형 빈칸 채우기 퀴즈 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {expressionQuiz &&
                        expressionQuiz.choices?.map((choice, idx) => (
                            <button
                                key={idx}
                                className={`px-3 py-1 rounded bg-purple-200 ${
                                    usedChoices.includes(idx) ? 'opacity-50' : ''
                                }`}
                                onClick={() => handleChoice(choice, idx)}
                                disabled={
                                    expressionResult !== null ||
                                    (!usedChoices.includes(idx) && expressionBlanks.every((b) => b !== ''))
                                }
                            >
                                {choice}
                            </button>
                        ))}
                </div>

                <div className="mt-auto pt-4 flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <button
                            className="px-4 py-1 bg-red-400 text-white rounded text-sm"
                            onClick={handleExpressionReset}
                            disabled={expressionResult !== null}
                        >
                            초기화
                        </button>
                        <button
                            className="px-4 py-1 bg-[#F3ECFF] text-[#6C2FFB] font-bold border border-[#E3D6FF] rounded text-sm"
                            onClick={handleExpressionSubmit}
                            disabled={expressionBlanks.includes('') || expressionResult !== null}
                        >
                            정답 확인
                        </button>

                        {/* 정답/오답 이미지 */}
                        {expressionResult !== null && (
                            <div className="ml-3 text-md font-bold flex items-center">
                                {expressionResult ? (
                                    <img src="/assets/ok.svg" alt="정답" className="w-6 h-6" />
                                ) : (
                                    <img src="/assets/fail.svg" alt="오답" className="w-6 h-6" />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 items-center">
                        <button onClick={handlePrevExpressionQuiz} className="px-2 py-1 bg-gray-200 rounded">
                            &larr;
                        </button>
                        <span className="px-2">
                            {currentExpressionQuizIndex + 1}/{expressionQuizzes.length}
                        </span>
                        <button onClick={handleNextExpressionQuiz} className="px-2 py-1 bg-gray-200 rounded">
                            &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExpressionQuiz
