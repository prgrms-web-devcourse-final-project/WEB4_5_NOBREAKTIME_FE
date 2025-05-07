'use client'

import React, { useState } from 'react'

// 버튼형 빈칸 채우기 퀴즈를 위한 목업 데이터
export const expressionQuizMock = [
    {
        sentence: '{} {} {}, {} {} {}!',
        choices: ['This', 'apple', 'like', 'is', 'apple', 'I'],
        answer: 'This is apple, I like apple!',
    },
    {
        sentence: '{} {} {}, {} {} {}!',
        choices: ["Let's", 'apple', 'like', 'play', 'apple', 'I'],
        answer: "Let's play apple, I like apple!",
    },
]

interface ExpressionQuizProps {
    fontSize: number
}

const ExpressionQuiz: React.FC<ExpressionQuizProps> = ({ fontSize }) => {
    // 표현 퀴즈 상태 관리
    const [currentExpressionQuizIndex, setCurrentExpressionQuizIndex] = useState(0)
    const expressionQuiz = expressionQuizMock[currentExpressionQuizIndex]
    const expressionParts = expressionQuiz.sentence.split(/({})/g)
    const expressionBlankCount = expressionParts.filter((part) => part === '{}').length
    const [expressionBlanks, setExpressionBlanks] = useState(Array(expressionBlankCount).fill(''))
    const [usedChoices, setUsedChoices] = useState<number[]>([])
    const [expressionResult, setExpressionResult] = useState<null | boolean>(null)

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

    // 표현 퀴즈 - 정답 제출
    const handleExpressionSubmit = () => {
        let userAnswer = expressionParts
            .map((part) => {
                if (part === '{}') {
                    return expressionBlanks.shift() || ''
                }
                return part
            })
            .join('')
        const isCorrect = userAnswer === expressionQuiz.answer
        setExpressionResult(isCorrect)

        // 오답인 경우 잠시 후 자동으로 초기화
        if (!isCorrect) {
            setTimeout(() => {
                handleExpressionReset()
            }, 1500)
        }
    }

    // 표현 퀴즈 - 초기화
    const handleExpressionReset = () => {
        setExpressionBlanks(Array(expressionBlankCount).fill(''))
        setUsedChoices([])
        setExpressionResult(null)
    }

    // 표현 퀴즈 - 다음 퀴즈로 이동
    const handleNextExpressionQuiz = () => {
        setCurrentExpressionQuizIndex((prev) => (prev + 1) % expressionQuizMock.length)
        handleExpressionReset()
    }

    // 표현 퀴즈 - 이전 퀴즈로 이동
    const handlePrevExpressionQuiz = () => {
        setCurrentExpressionQuizIndex((prev) => (prev - 1 + expressionQuizMock.length) % expressionQuizMock.length)
        handleExpressionReset()
    }

    return (
        <div className="w-full h-full overflow-y-auto" style={{ fontSize: `${fontSize}px` }}>
            <div className="bg-white rounded-lg p-4 relative h-full flex flex-col">
                <div className="mb-4">
                    {expressionParts.map((part, idx) =>
                        part === '{}' ? (
                            <span key={idx} className="inline-block w-20 border-b-2 border-purple-400 mx-1 text-center">
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
                    {expressionQuiz.choices.map((choice, idx) => (
                        <button
                            key={idx}
                            className={`px-3 py-1 rounded bg-purple-200 ${
                                usedChoices.includes(idx) ? 'opacity-50' : ''
                            }`}
                            onClick={() => handleChoice(choice, idx)}
                            disabled={!usedChoices.includes(idx) && expressionBlanks.every((b) => b !== '')}
                        >
                            {choice}
                        </button>
                    ))}
                </div>

                <div className="mt-auto pt-4 flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <button
                            className="px-4 py-1 bg-purple-500 text-white rounded text-sm"
                            onClick={handleExpressionSubmit}
                            disabled={expressionBlanks.includes('') || expressionResult !== null}
                        >
                            정답 확인
                        </button>

                        {/* 정답/오답 메시지 */}
                        {expressionResult !== null && (
                            <div className="ml-3 text-md font-bold">
                                {expressionResult ? (
                                    <span className="text-green-600">정답입니다!</span>
                                ) : (
                                    <span className="text-red-600">오답입니다!</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 items-center">
                        <button onClick={handlePrevExpressionQuiz} className="px-2 py-1 bg-gray-200 rounded">
                            &larr;
                        </button>
                        <span className="px-2">
                            {currentExpressionQuizIndex + 1}/{expressionQuizMock.length}
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
