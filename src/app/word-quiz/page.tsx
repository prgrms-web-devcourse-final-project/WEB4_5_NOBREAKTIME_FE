'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '../dashboardLayout'
import WordIcon from '@/components/icon/wordIcon'
import Image from 'next/image'

const wordQuizList = [
    { word: 'abandon', meaning: '버리다', stars: 2 },
    { word: 'benefit', meaning: '이익', stars: 3 },
    { word: 'focus', meaning: '집중하다', stars: 1 },
]

type QuizMode = 'word' | 'meaning' | 'random'

export default function WordQuiz() {
    const searchParams = useSearchParams()
    const selectedTitle = searchParams.get('title') || '제목 없음'

    const [index, setIndex] = useState(0)
    const [mode, setMode] = useState<QuizMode>('word')
    const [hiddenPart, setHiddenPart] = useState<'word' | 'meaning' | null>(null)
    const [userInput, setUserInput] = useState('')
    const [hintCount, setHintCount] = useState(0)
    const [isCorrect, setIsCorrect] = useState<null | boolean>(null)
    const maxHint = 3

    const current = wordQuizList[index]

    const getAnswer = () =>
        mode === 'word' || (mode === 'random' && hiddenPart === 'word') ? current.word : current.meaning

    const isHidden = mode !== 'random' ? true : !!hiddenPart

    useEffect(() => {
        resetState(index, true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode])

    const resetState = (newIndex: number, resetMode = false) => {
        setIndex(newIndex)
        setUserInput('')
        setHintCount(0)
        setIsCorrect(null)
        if (mode === 'random' || resetMode) {
            setHiddenPart(Math.random() > 0.5 ? 'word' : 'meaning')
        } else {
            setHiddenPart(null)
        }
    }

    const handlePrev = () => {
        if (index > 0) resetState(index - 1)
    }

    const handleNext = () => {
        if (index < wordQuizList.length - 1) resetState(index + 1)
    }

    const handleHint = () => {
        const answer = getAnswer()
        if (hintCount >= maxHint || userInput.length >= answer.length || isCorrect) return

        for (let i = 0; i < answer.length; i++) {
            if (userInput[i] !== answer[i]) {
                const nextInput = userInput.slice(0, i) + answer[i] + userInput.slice(i + 1)
                const padded = nextInput.padEnd(answer.length, '')
                setUserInput(padded)
                setHintCount((prev) => prev + 1)

                if (padded === answer) setIsCorrect(true)
                return
            }
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.slice(0, getAnswer().length)
        setUserInput(value)

        // 자동 채점
        if (value.length === getAnswer().length) {
            setIsCorrect(value === getAnswer())
        } else {
            setIsCorrect(null)
        }
    }

    const getResultIcon = () => {
        if (isCorrect === true) return '/assets/ok.svg'
        if (isCorrect === false) return '/assets/fail.svg'
        return '/assets/hint.svg'
    }

    const isWordMode = mode === 'word' || (mode === 'random' && hiddenPart === 'word')
    const isMeaningMode = mode === 'meaning' || (mode === 'random' && hiddenPart === 'meaning')

    return (
        <DashboardLayout
            title="Word Quiz"
            icon={<WordIcon />}
            className="bg-image p-20 flex flex-col gap-4 items-center"
        >
            <h1 className="text-5xl font-bold text-[var(--color-black)]">{selectedTitle} 단어장 퀴즈</h1>

            <div className="flex flex-row justify-between gap-4 w-180">
                <div className="bg-[var(--color-main)] text-[var(--color-point)] px-4 py-2 rounded-sm">
                    {index + 1} / {wordQuizList.length}
                </div>

                <div className="flex gap-2">
                    {(['word', 'meaning', 'random'] as QuizMode[]).map((m) => {
                        const isActive = mode === m
                        return (
                            <label
                                key={m}
                                className={`
          cursor-pointer px-4 py-2 rounded-md border text-sm
          ${
              isActive
                  ? 'bg-[var(--color-main)] text-[var(--color-point)] border-[var(--color-main)]'
                  : 'bg-[var(--color-sub-2)] text-[var(--color-main)] border-[var(--color-main)] border-2 hover:bg-[var(--color-sub-1)]'
          }
        `}
                            >
                                <input
                                    type="radio"
                                    className="hidden"
                                    checked={mode === m}
                                    onChange={() => setMode(m)}
                                />
                                <span>{m === 'word' ? '영단어' : m === 'meaning' ? '뜻' : '랜덤'}</span>
                            </label>
                        )
                    })}
                </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-[var(--color-white)] w-180 h-full gap-8 p-12">
                <div className="text-yellow-400 text-xl">
                    {Array.from({ length: current.stars }).map((_, i) => (
                        <span key={i}>⭐</span>
                    ))}
                </div>

                {isWordMode ? (
                    <input
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        placeholder="단어를 입력하세요"
                        className="text-4xl font-bold text-center border-b border-gray-300 focus:outline-none"
                    />
                ) : (
                    <p className="text-4xl font-bold text-center">{current.word}</p>
                )}

                {isMeaningMode ? (
                    <input
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        placeholder="뜻을 입력하세요"
                        className="text-lg text-center border-b border-gray-300 focus:outline-none"
                    />
                ) : (
                    <span className="text-2xl">{current.meaning}</span>
                )}

                {isHidden && (
                    <div className="flex flex-col items-center gap-2">
                        <button
                            className="w-18 h-18 disabled:opacity-50"
                            onClick={handleHint}
                            disabled={hintCount >= maxHint || isCorrect === true}
                        >
                            <Image src={getResultIcon()} alt="result" width={80} height={80} />
                        </button>
                        <p className="text-sm text-gray-500">
                            힌트 사용: {hintCount} / {maxHint}
                        </p>
                    </div>
                )}

                <div className="flex gap-2 w-full">
                    <button
                        onClick={handlePrev}
                        className="flex-1 flex items-center justify-center bg-[var(--color-sub-2)] border-[var(--color-main)] border-2 rounded-sm disabled:opacity-50"
                        disabled={index === 0}
                    >
                        <Image src="/assets/left.svg" alt="left" width={40} height={40} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 flex items-center justify-center bg-[var(--color-sub-2)] border-[var(--color-main)] border-2 rounded-sm disabled:opacity-50"
                        disabled={index === wordQuizList.length - 1}
                    >
                        <Image src="/assets/right.svg" alt="right" width={40} height={40} />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )
}
