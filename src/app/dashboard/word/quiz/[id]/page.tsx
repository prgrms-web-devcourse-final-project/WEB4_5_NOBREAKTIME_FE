'use client'

import WordIcon from '@/components/icon/wordIcon'
import Image from 'next/image'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import client from '@/lib/backend/client'
import QuizComplete from '@/components/learning/Quiz/QuizComplete'
import { components } from '@/lib/backend/apiV1/schema'

type WordQuizItem = components['schemas']['WordQuizItem']

interface WordQuizItemWithIds extends WordQuizItem {
    quizId: number
    wordbookItemId: number
    word: string
    question: string
    original: string
    meaning: string
}

export default function WordQuiz() {
    const params = useParams()
    const searchParams = useSearchParams()
    const selectedId = params.id as string
    const selectedTitle = searchParams.get('title') || '제목 없음'

    const [originalWords, setOriginalWords] = useState<WordQuizItemWithIds[]>([])
    const [words, setWords] = useState<WordQuizItemWithIds[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [index, setIndex] = useState(0)
    const [userInputs, setUserInputs] = useState<string[]>([])
    const [hintCounts, setHintCounts] = useState<number[]>([])
    const [quizResults, setQuizResults] = useState<(boolean | null)[]>([])
    const maxHint = 3

    // 퀴즈 데이터 불러오기
    useEffect(() => {
        const fetchQuizWords = async () => {
            try {
                setIsLoading(true)

                const response = await client.GET('/api/v1/wordbooks/{wordbookId}/quiz', {
                    params: {
                        path: {
                            wordbookId: Number(selectedId),
                        },
                    },
                })

                if (response.data?.code === '200' && response.data?.data) {
                    const quizData = response.data.data
                    const wordsWithIds = (quizData.quizItems || []).map((item) => ({
                        word: item.word || '',
                        meaning: item.meaning || '',
                        question: item.question || '',
                        original: item.original || '',
                        quizId: quizData.quizId,
                        wordbookItemId: item.wordbookItemId || 0,
                    })) as WordQuizItemWithIds[]

                    setOriginalWords(wordsWithIds)
                    setWords(wordsWithIds)
                    setUserInputs(new Array(wordsWithIds.length).fill(''))
                    setHintCounts(new Array(wordsWithIds.length).fill(0))
                    setQuizResults(new Array(wordsWithIds.length).fill(null))
                }

                setIsLoading(false)
            } catch (error) {
                console.error('퀴즈 데이터를 가져오는데 실패했습니다:', error)
                setIsLoading(false)
            }
        }

        if (selectedId) {
            fetchQuizWords()
        }
    }, [selectedId])

    // 최종 결과 저장 함수
    const saveAllResults = async () => {
        try {
            const savePromises = words
                .map((word, idx) => {
                    // null이 아닌 모든 결과(정답/오답) 저장
                    if (quizResults[idx] !== null) {
                        const params = {
                            quizId: word.quizId,
                            wordbookItemId: word.wordbookItemId,
                            isCorrect: quizResults[idx],
                        }
                        return client.POST('/api/v1/wordbooks/quiz/result', {
                            body: params,
                        })
                    }
                    return null
                })
                .filter(Boolean)

            await Promise.all(savePromises)
        } catch (error) {
            console.error('결과 저장 실패:', error)
        }
    }

    const handleHint = async () => {
        if (hintCounts[index] >= maxHint || quizResults[index] !== null) return

        // 마지막 힌트(정답 보기)를 사용하는 경우
        if (hintCounts[index] === maxHint - 1) {
            const newUserInputs = [...userInputs]
            newUserInputs[index] = words[index].word
            setUserInputs(newUserInputs)

            const newHintCounts = [...hintCounts]
            newHintCounts[index] = hintCounts[index] + 1
            setHintCounts(newHintCounts)

            saveQuizResult(index, false)
            return
        }

        // 힌트 사용 시 다음 글자 하나 보여주기
        const answer = words[index].word
        const currentInput = userInputs[index]
        let matchLength = 0
        for (let i = 0; i < currentInput.length && i < answer.length; i++) {
            if (currentInput[i] === answer[i]) {
                matchLength++
            } else {
                break
            }
        }

        if (matchLength < answer.length) {
            const newInput = answer.slice(0, matchLength + 1)
            const newUserInputs = [...userInputs]
            newUserInputs[index] = newInput
            setUserInputs(newUserInputs)

            const newHintCounts = [...hintCounts]
            newHintCounts[index] = hintCounts[index] + 1
            setHintCounts(newHintCounts)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (quizResults[index] !== null || hintCounts[index] >= maxHint) return
        const newUserInputs = [...userInputs]
        newUserInputs[index] = e.target.value
        setUserInputs(newUserInputs)
    }

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && quizResults[index] === null && hintCounts[index] < maxHint) {
            const isAnswerCorrect = userInputs[index].toLowerCase() === (words[index].word || '').toLowerCase()

            // 오답인 경우 정답 표시
            if (!isAnswerCorrect) {
                const newUserInputs = [...userInputs]
                newUserInputs[index] = words[index].word
                setUserInputs(newUserInputs)
            }

            saveQuizResult(index, isAnswerCorrect)
        }
    }

    const handlePrev = () => {
        if (index > 0) {
            setIndex(index - 1)
        }
    }

    const handleNext = () => {
        if (index < words.length - 1) {
            setIndex(index + 1)
        }
    }

    const saveQuizResult = (index: number, result: boolean) => {
        setQuizResults((prev) => {
            const newResults = [...prev]
            newResults[index] = result
            return newResults
        })
    }

    const calculateScore = () => {
        return quizResults.filter((result) => result === true).length
    }

    const isQuizCompleted = () => {
        return quizResults.every((result) => result !== null)
    }

    const filterIncorrectWords = () => {
        return originalWords.filter((_, index) => quizResults[index] === false)
    }

    const resetQuiz = () => {
        const incorrectWords = filterIncorrectWords()
        setWords(incorrectWords.length > 0 ? incorrectWords : originalWords)
        setIndex(0)
        const newLength = incorrectWords.length || originalWords.length
        setQuizResults(new Array(newLength).fill(null))
        setUserInputs(new Array(newLength).fill(''))
        setHintCounts(new Array(newLength).fill(0))
    }

    const restartQuiz = () => {
        setWords(originalWords)
        setIndex(0)
        setQuizResults(new Array(originalWords.length).fill(null))
        setUserInputs(new Array(originalWords.length).fill(''))
        setHintCounts(new Array(originalWords.length).fill(0))
    }

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
                    <Image src="/character/loading-2.gif" alt="loading" width={300} height={300} />
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

    if (isQuizCompleted()) {
        const score = calculateScore()
        const incorrectCount = filterIncorrectWords().length

        // 결과 저장 후 완료 화면 표시
        saveAllResults()

        return (
            <QuizComplete
                quizType="word"
                score={score}
                totalCount={words.length}
                incorrectCount={incorrectCount}
                onResetQuiz={resetQuiz}
                onRestartQuiz={restartQuiz}
            />
        )
    }

    const current = words[index]
    const getResultIcon = () => {
        if (quizResults[index] === true) return '/assets/ok.svg'
        if (quizResults[index] === false) return '/assets/fail.svg'
        if (hintCounts[index] >= maxHint - 1) return '/assets/check.svg'
        return '/assets/hint.svg'
    }

    const renderQuestion = () => {
        if (!current) return null

        // question이 비어있거나 {}가 없는 경우 전체 문장을 표시
        if (!current.question || !current.question.includes('{}')) {
            return (
                <div className="flex flex-col items-center w-full">
                    <div className="bg-gray-50 w-full py-6 rounded-lg mb-8">
                        <p className="text-xl text-gray-600 text-center px-4">{current.meaning}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-3xl font-bold text-center bg-white py-8 px-4 rounded-lg w-full">
                        <p>{current.question || current.original || '문제 데이터가 없습니다.'}</p>
                    </div>
                </div>
            )
        }

        const parts = current.question.split('{}')

        return (
            <div className="flex flex-col items-center w-full">
                <div className="bg-gray-50 w-full py-6 rounded-lg mb-8">
                    <p className="text-xl text-gray-600 text-center px-4">{current.meaning}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 text-3xl font-bold text-center bg-white py-8 px-4 rounded-lg w-full">
                    <span className="break-keep">{parts[0]}</span>
                    <input
                        type="text"
                        value={userInputs[index]}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className={`w-44 min-w-[140px] h-[50px] text-2xl text-center rounded-md bg-[#ECEAFC] border-2 border-[#D1CFFA] focus:outline-none focus:border-[var(--color-main)] ${
                            quizResults[index] === true
                                ? 'text-green-500 border-green-500 bg-green-100'
                                : quizResults[index] === false || hintCounts[index] >= maxHint
                                ? 'text-red-500 border-red-500 bg-red-100'
                                : ''
                        }`}
                        readOnly={quizResults[index] !== null || hintCounts[index] >= maxHint}
                    />
                    <span className="break-keep">{parts[1]}</span>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    <WordIcon />
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Word Quiz</h3>
            </div>
            <div className="bg-image p-30 flex flex-col gap-4 items-center">
                <h1 className="text-5xl font-bold text-[var(--color-black)]">{selectedTitle} 퀴즈</h1>

                <div className="flex flex-row justify-between gap-4 w-250">
                    <div className="bg-[var(--color-main)] text-[var(--color-point)] px-4 py-2 rounded-sm">
                        {index + 1} / {words.length}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-[var(--color-white)] w-250 h-full gap-8 p-12">
                    {renderQuestion()}

                    <div className="flex flex-col items-center gap-2">
                        <button
                            className="w-18 h-18 disabled:opacity-50"
                            onClick={handleHint}
                            disabled={hintCounts[index] >= maxHint || quizResults[index] !== null}
                        >
                            <Image src={getResultIcon()} alt="result" width={80} height={80} />
                        </button>
                        <p className="text-sm text-gray-500">
                            {hintCounts[index] >= maxHint - 1
                                ? '정답 보기'
                                : `힌트 사용: ${hintCounts[index]} / ${maxHint}`}
                        </p>
                    </div>

                    <div className="flex gap-2 w-full">
                        <button
                            onClick={handlePrev}
                            className="flex-1 flex items-center justify-center bg-[var(--color-sub-2)] border-[var(--color-main)] border-2 rounded-sm disabled:opacity-50"
                            disabled={index === 0}
                        >
                            <Image src="/assets/left.svg" alt="left" width={40} height={40} />
                        </button>
                        {index === words.length - 1 ? (
                            <button
                                onClick={() => {
                                    // 풀지 않은 문제들을 오답으로 처리
                                    const newQuizResults = [...quizResults]
                                    for (let i = 0; i < newQuizResults.length; i++) {
                                        if (newQuizResults[i] === null) {
                                            newQuizResults[i] = false
                                        }
                                    }
                                    setQuizResults(newQuizResults)
                                }}
                                className="flex-1 flex items-center justify-center bg-[var(--color-main)] text-white font-bold py-2 rounded-sm"
                            >
                                결과 제출
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex-1 flex items-center justify-center bg-[var(--color-sub-2)] border-[var(--color-main)] border-2 rounded-sm disabled:opacity-50"
                                disabled={index === words.length - 1}
                            >
                                <Image src="/assets/right.svg" alt="right" width={40} height={40} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
