'use client'

import DashboardLayout from '@/app/dashboardLayout'
import WordIcon from '@/components/icon/wordIcon'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const grammarQuizList = [
    { sentence: 'I abandoned my plan.', meaning: '나는 내 계획을 버렸다.', stars: 2 },
    { sentence: 'This policy benefits everyone.', meaning: '이 정책은 모두에게 이익이 된다.', stars: 3 },
    { sentence: 'Please focus on your work.', meaning: '일에 집중해 주세요.', stars: 1 },
]

type QuizMode = 'sentence' | 'meaning' | 'random'

export default function GrammarQuiz() {
    const params = useParams()
    const selectedTitle = (params.title as string) || '제목 없음'
    const [index, setIndex] = useState(0)
    const [mode, setMode] = useState<QuizMode>('sentence')
    const [hiddenPart, setHiddenPart] = useState<'sentence' | 'meaning' | null>(null)

    const [userInputs, setUserInputs] = useState<string[]>(Array(grammarQuizList.length).fill(''))
    const [hintCounts, setHintCounts] = useState<number[]>(Array(grammarQuizList.length).fill(0))
    const [correctStates, setCorrectStates] = useState<(boolean | null)[]>(Array(grammarQuizList.length).fill(null))

    const maxHint = 3

    const current = grammarQuizList[index]
    const userInput = userInputs[index]
    const hintCount = hintCounts[index]
    const isCorrect = correctStates[index]

    const normalize = (str: string) => str.trim().replace(/[.]/g, '').replace(/\s+/g, ' ')
    const getAnswer = () =>
        mode === 'sentence' || (mode === 'random' && hiddenPart === 'sentence') ? current.sentence : current.meaning
    const isHidden = mode !== 'random' ? true : !!hiddenPart

    const updateState = (setter: React.Dispatch<React.SetStateAction<any[]>>, value: any, i?: number) => {
        setter((prev: any[]) => {
            const next = [...prev]
            next[i !== undefined ? i : index] = value
            return next
        })
    }

    useEffect(() => {
        if (mode === 'random') {
            setHiddenPart(Math.random() > 0.5 ? 'sentence' : 'meaning')
        } else {
            setHiddenPart(null)
        }
    }, [mode, index])

    const handlePrev = () => {
        if (index > 0) setIndex(index - 1)
    }

    const handleNext = () => {
        if (index < grammarQuizList.length - 1) setIndex(index + 1)
    }

    const handleHint = () => {
        const answer = getAnswer()
        if (hintCount >= maxHint || isCorrect) return

        const answerWords = normalize(answer).split(' ')
        const inputWords = normalize(userInput).split(' ')

        for (let i = 0; i < answerWords.length; i++) {
            if (inputWords[i] !== answerWords[i]) {
                const nextWords = [...inputWords]
                nextWords[i] = answerWords[i]
                const padded = [...nextWords, ...Array(answerWords.length - nextWords.length).fill('')].join(' ')
                updateState(setUserInputs, padded)
                updateState(setHintCounts, hintCount + 1)
                if (normalize(padded) === normalize(answer)) {
                    updateState(setCorrectStates, true, index)
                }
                return
            }
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const answer = getAnswer()
        const normalizedAnswer = normalize(answer)

        const rawValue = e.target.value
        updateState(setUserInputs, rawValue)

        const normalizedInput = normalize(rawValue)
        if (normalizedInput === normalizedAnswer) {
            updateState(setCorrectStates, true, index)
        } else if (normalizedInput.length === normalizedAnswer.length) {
            updateState(setCorrectStates, false, index)
        } else {
            updateState(setCorrectStates, null, index)
        }
    }

    const getResultIcon = () => {
        if (isCorrect === true) return '/assets/ok.svg'
        if (isCorrect === false) return '/assets/fail.svg'
        return '/assets/hint.svg'
    }

    const isSentenceMode = mode === 'sentence' || (mode === 'random' && hiddenPart === 'sentence')
    const isMeaningMode = mode === 'meaning' || (mode === 'random' && hiddenPart === 'meaning')

    return (
        <DashboardLayout
            title="문장 퀴즈"
            icon={<WordIcon />}
            className="bg-image p-20 flex flex-col gap-4 items-center"
        >
            <h1 className="text-5xl font-bold text-[var(--color-black)]">{selectedTitle} 문장 퀴즈</h1>

            <div className="flex flex-row justify-between gap-4 w-180">
                <div className="bg-[var(--color-main)] text-[var(--color-point)] px-4 py-2 rounded-sm">
                    {index + 1} / {grammarQuizList.length}
                </div>

                <div className="flex gap-2">
                    {(['sentence', 'meaning', 'random'] as QuizMode[]).map((m) => {
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
                                <span>{m === 'sentence' ? '문장' : m === 'meaning' ? '뜻' : '랜덤'}</span>
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

                {isSentenceMode ? (
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={userInput}
                            onChange={handleInputChange}
                            placeholder="문장을 입력하세요"
                            className="text-2xl font-bold text-center border-b border-gray-300 focus:outline-none w-full pr-6"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold select-none pointer-events-none">
                            .
                        </span>
                    </div>
                ) : (
                    <p className="text-2xl font-bold text-center">{current.sentence}</p>
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
                    <span className="text-xl text-gray-700">{current.meaning}</span>
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
                        disabled={index === grammarQuizList.length - 1}
                    >
                        <Image src="/assets/right.svg" alt="right" width={40} height={40} />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )
}
