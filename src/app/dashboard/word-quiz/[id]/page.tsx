'use client'

import WordIcon from '@/components/icon/wordIcon'
import client from '@/lib/backend/client'
import Image from 'next/image'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { mockQuizData } from './mockdata'

interface Word {
    word: string
    pos: string
    meaning: string
    difficulty: string
    exampleSentence: string
    translatedSentence: string
}

type QuizMode = 'word' | 'meaning' | 'random'

export default function WordQuiz() {
    const params = useParams()
    const searchParams = useSearchParams()
    const selectedId = params.id as string
    const selectedTitle = searchParams.get('title') || '제목 없음'

    // 모든 상태 관련 훅을 맨 위에 배치
    const [words, setWords] = useState<Word[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [index, setIndex] = useState(0)
    const [mode, setMode] = useState<QuizMode>('word')
    const [hiddenPart, setHiddenPart] = useState<'word' | 'meaning' | null>(null)
    const [userInput, setUserInput] = useState<string[] | string>([])
    const [hintCount, setHintCount] = useState(0)
    const [isCorrect, setIsCorrect] = useState<null | boolean>(null)
    const [hintIndices, setHintIndices] = useState<number[]>([])
    const [initialHintIndex, setInitialHintIndex] = useState<number | null>(null)
    const maxHint = 2
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // 함수들도 상태 훅 다음에 정의
    const getAnswer = () => {
        // 단어가 없을 때 빈 문자열 반환
        if (!words.length || index >= words.length) return ''

        const current = words[index]
        return mode === 'word' || (mode === 'random' && hiddenPart === 'word') ? current.word : current.meaning
    }

    const resetState = (newIndex: number, resetMode = false) => {
        setIndex(newIndex)
        setUserInput(mode === 'meaning' || (mode === 'random' && hiddenPart === 'meaning') ? '' : [])
        setHintCount(0)
        setIsCorrect(null)
        setHintIndices([])
        setInitialHintIndex(null)
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
        if (index < words.length - 1) resetState(index + 1)
    }

    const handleHint = () => {
        if (isMeaningMode) return

        const answer = getAnswer()
        if (hintCount >= maxHint || (userInput as string[]).join('').length >= answer.length || isCorrect) return

        const newInput = [...(userInput as string[])]
        for (let i = 0; i < answer.length; i++) {
            if (newInput[i] !== answer[i]) {
                newInput[i] = answer[i]
                setUserInput(newInput)
                setHintCount((prev) => prev + 1)
                setHintIndices((prev) => [...prev, i])

                // 힌트를 2회 이상 사용하면 틀린 것으로 처리하고 모든 글자를 빨간색으로 표시
                if (hintCount + 1 >= maxHint) {
                    setIsCorrect(false)
                    // 나머지 글자들도 모두 보여줌
                    for (let j = i + 1; j < answer.length; j++) {
                        newInput[j] = answer[j]
                        setHintIndices((prev) => [...prev, j])
                    }
                    setUserInput(newInput)
                } else if (newInput.join('') === answer) {
                    setIsCorrect(true)
                }
                return
            }
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        if (!words.length) return

        if (isMeaningMode) {
            setUserInput(e.target.value)
            // 자동 채점
            if (e.target.value === current.meaning) {
                setIsCorrect(true)
            } else {
                setIsCorrect(null)
            }
        } else {
            // 힌트로 보여준 글자는 변경할 수 없음
            if (hintIndices.includes(index!)) return

            const value = e.target.value.slice(-1).toLowerCase()
            const newInput = [...(userInput as string[])]
            newInput[index!] = value
            setUserInput(newInput)

            // 자동으로 다음 입력칸으로 이동
            if (value) {
                // 다음 입력 가능한 칸 찾기
                let nextIndex = index! + 1
                while (nextIndex < getAnswer().length && hintIndices.includes(nextIndex)) {
                    nextIndex++
                }
                if (nextIndex < getAnswer().length) {
                    inputRefs.current[nextIndex]?.focus()
                }
            }

            // 자동 채점
            const currentAnswer = newInput.join('')
            if (currentAnswer.length === getAnswer().length) {
                const isAnswerCorrect = currentAnswer === getAnswer()
                setIsCorrect(isAnswerCorrect)
                if (!isAnswerCorrect) {
                    // 오답일 경우 정답으로 채우기
                    setUserInput(getAnswer().split(''))
                }
            } else {
                setIsCorrect(null)
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !userInput[index] && index > 0) {
            // 이전 입력 가능한 칸 찾기
            let prevIndex = index - 1
            while (prevIndex >= 0 && hintIndices.includes(prevIndex)) {
                prevIndex--
            }
            if (prevIndex >= 0) {
                inputRefs.current[prevIndex]?.focus()
            }
        }
    }

    const getResultIcon = () => {
        if (isCorrect === true) return '/assets/ok.svg'
        if (isCorrect === false) return '/assets/fail.svg'
        return '/assets/hint.svg'
    }

    // 서버에서 단어 데이터 가져오기
    useEffect(() => {
        const fetchQuizWords = async () => {
            try {
                setIsLoading(true)
                // 목데이터 사용
                setWords(mockQuizData.words)
                setIsLoading(false)

                /*
                const { data } = await client.GET('/api/v1/wordbooks/{wordbookId}/words', {
                    params: {
                        path: {
                            wordbookId: Number(selectedId),
                        },
                    },
                })

                if (data?.data) {
                    // 타입 안전하게 처리
                    const apiWords = data.data.map((item: any) => ({
                        word: item.word || '',
                        pos: item.pos || '',
                        meaning: item.meaning || '',
                        difficulty: item.difficulty || 'EASY',
                        exampleSentence: item.exampleSentence || '',
                        translatedSentence: item.translatedSentence || '',
                    }))

                    setWords(apiWords)
                }
                */
            } catch (error) {
                console.error('퀴즈 데이터를 가져오는데 실패했습니다:', error)
                setIsLoading(false)
            }
        }

        if (selectedId) {
            fetchQuizWords()
        }
    }, [selectedId])

    useEffect(() => {
        resetState(index, true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode])

    useEffect(() => {
        if (!words.length) return

        const answer = getAnswer()
        if (isMeaningMode) {
            setUserInput('')
        } else {
            const newInput = Array(answer.length).fill('')
            // 랜덤으로 한 글자 선택
            const randomIndex = Math.floor(Math.random() * answer.length)
            newInput[randomIndex] = answer[randomIndex]
            setUserInput(newInput)
            setHintIndices([randomIndex])
            setInitialHintIndex(randomIndex)
        }
        inputRefs.current = inputRefs.current.slice(0, answer.length)
    }, [index, mode, hiddenPart, words.length])

    // 로딩 중이거나 데이터가 없을 때 처리
    if (isLoading) {
        return (
            <>
                <div className="flex items-center gap-2">
                    <span className="text-[var(--color-main)]">
                        <WordIcon />
                    </span>
                    <h3 className="text-2xl font-bold text-[var(--color-black)]">Word Quiz</h3>
                </div>
                <div className="flex items-center justify-center h-full">
                    <p className="text-2xl">로딩 중...</p>
                </div>
            </>
        )
    }

    if (words.length === 0) {
        return (
            <>
                <div className="flex items-center gap-2">
                    <span className="text-[var(--color-main)]">
                        <WordIcon />
                    </span>
                    <h3 className="text-2xl font-bold text-[var(--color-black)]">Word Quiz</h3>
                </div>
                <div className="flex items-center justify-center h-full">
                    <p className="text-2xl">퀴즈를 위한 단어가 없습니다.</p>
                </div>
            </>
        )
    }

    // 컴포넌트 렌더링 부분 전에 필요한 계산 수행
    const current = words[index]
    const wordDifficulty = current.difficulty === 'EASY' ? 1 : current.difficulty === 'MEDIUM' ? 2 : 3

    const isHidden = mode !== 'random' ? true : !!hiddenPart
    const isWordMode = mode === 'word' || (mode === 'random' && hiddenPart === 'word')
    const isMeaningMode = mode === 'meaning' || (mode === 'random' && hiddenPart === 'meaning')

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    <WordIcon />
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Word Quiz</h3>
            </div>
            <div className="bg-image p-20 flex flex-col gap-4 items-center">
                <h1 className="text-5xl font-bold text-[var(--color-black)]">{selectedTitle} 단어장 퀴즈</h1>

                <div className="flex flex-row justify-between gap-4 w-180">
                    <div className="bg-[var(--color-main)] text-[var(--color-point)] px-4 py-2 rounded-sm">
                        {index + 1} / {words.length}
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
                        {Array.from({ length: wordDifficulty }).map((_, i) => (
                            <span key={i}>⭐</span>
                        ))}
                    </div>

                    {isWordMode ? (
                        <div className="flex gap-2">
                            {Array.from({ length: getAnswer().length }).map((_, i) => (
                                <input
                                    key={i}
                                    ref={(el) => {
                                        inputRefs.current[i] = el
                                    }}
                                    type="text"
                                    maxLength={1}
                                    value={userInput[i] || ''}
                                    onChange={(e) => handleInputChange(e, i)}
                                    onKeyDown={(e) => handleKeyDown(e, i)}
                                    className={`w-12 h-12 text-2xl text-center border-b-2 border-gray-300 focus:outline-none focus:border-[var(--color-main)] ${
                                        isCorrect === true
                                            ? 'text-green-500'
                                            : hintCount >= maxHint || isCorrect === false
                                            ? 'text-red-500'
                                            : hintIndices.includes(i) && i !== initialHintIndex && hintCount < maxHint
                                            ? 'text-yellow-500'
                                            : ''
                                    }`}
                                    readOnly={hintIndices.includes(i) || isCorrect !== null}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-4xl font-bold text-center">{current.word}</p>
                    )}

                    {isMeaningMode ? (
                        <input
                            type="text"
                            value={userInput as string}
                            onChange={handleInputChange}
                            placeholder="뜻을 입력하세요"
                            className={`w-96 text-2xl text-center border-b-2 border-gray-300 focus:outline-none focus:border-[var(--color-main)] ${
                                isCorrect === true ? 'text-green-500' : isCorrect === false ? 'text-red-500' : ''
                            }`}
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
                            disabled={index === words.length - 1}
                        >
                            <Image src="/assets/right.svg" alt="right" width={40} height={40} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
