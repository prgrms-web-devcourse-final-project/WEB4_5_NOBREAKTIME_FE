'use client'

import React, { useState } from 'react'

// 단어 퀴즈를 위한 목업 데이터
export const wordQuizMock = [
    {
        word: 'distracted',
        meaning: '주의가 산만한, 집중이 안 되는',
        sentence: 'A reader will be {} by the readable content.',
        sentenceMeaning: '독자는 읽기 쉬운 내용에 집중이 안 될 것이다.',
    },
    {
        word: 'established',
        meaning: '설립된, 확립된',
        sentence: 'It is a long {} fact that a reader will be distracted.',
        sentenceMeaning: '독자가 주의가 산만해진다는 것은 오래 전부터 확립된 사실이다.',
    },
    {
        word: 'layout',
        meaning: '레이아웃, 배치',
        sentence: 'The reader is distracted by the {} of the page.',
        sentenceMeaning: '독자는 페이지의 레이아웃에 의해 주의가 산만해진다.',
    },
]

interface WordQuizProps {
    fontSize: number
}

const WordQuiz: React.FC<WordQuizProps> = ({ fontSize }) => {
    // 단어 퀴즈 상태 관리
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
    const [input, setInput] = useState('')
    const [quizResult, setQuizResult] = useState<null | boolean>(null)

    // 현재 퀴즈
    const currentQuiz = wordQuizMock[currentQuizIndex]

    // 다음 퀴즈로 이동
    const handleNextQuiz = () => {
        setCurrentQuizIndex((prev) => (prev + 1) % wordQuizMock.length)
        setInput('')
        setQuizResult(null)
    }

    // 이전 퀴즈로 이동
    const handlePrevQuiz = () => {
        setCurrentQuizIndex((prev) => (prev - 1 + wordQuizMock.length) % wordQuizMock.length)
        setInput('')
        setQuizResult(null)
    }

    // 정답 확인
    const handleSubmit = () => {
        const isCorrect = input.trim().toLowerCase() === currentQuiz.word.toLowerCase()
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
        const parts = currentQuiz.sentence.split('{}')
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

                        {/* 정답/오답 메시지 */}
                        {quizResult !== null && (
                            <div className="ml-3 text-md font-bold">
                                {quizResult ? (
                                    <span className="text-green-600">정답입니다!</span>
                                ) : (
                                    <span className="text-red-600">오답입니다!</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 items-center">
                        <button onClick={handlePrevQuiz} className="px-2 py-1 bg-gray-200 rounded">
                            &larr;
                        </button>
                        <span className="px-2">
                            {currentQuizIndex + 1}/{wordQuizMock.length}
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
