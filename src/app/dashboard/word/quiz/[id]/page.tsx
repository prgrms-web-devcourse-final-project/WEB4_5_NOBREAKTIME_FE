'use client'

import WordIcon from '@/components/icon/wordIcon'
import Image from 'next/image'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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
    const selectedType = searchParams.get('type') || 'word'

    const [originalWords, setOriginalWords] = useState<WordQuizItemWithIds[]>([])
    const [words, setWords] = useState<WordQuizItemWithIds[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [index, setIndex] = useState(0)
    const [userInputs, setUserInputs] = useState<string[]>([])
    const [quizResults, setQuizResults] = useState<(boolean | null)[]>([])
    const [hintCounts, setHintCounts] = useState<number[]>([])
    const [showButtons, setShowButtons] = useState<boolean[]>([])
    const [multiInputs, setMultiInputs] = useState<string[][]>([])
    const maxHint = 3
    const [showFinalButton, setShowFinalButton] = useState(false)

    // 퀴즈 데이터 불러오기
    useEffect(() => {
        const fetchQuizWords = async () => {
            try {
                setIsLoading(true)
                let response

                if (selectedType === 'today') {
                    response = await client.GET('/api/v1/wordbooks/quiz/total')
                } else {
                    response = await client.GET('/api/v1/wordbooks/{wordbookId}/quiz', {
                        params: {
                            path: {
                                wordbookId: Number(selectedId),
                            },
                        },
                    })
                }

                if (response.data?.code === '200' && response.data?.data) {
                    const quizData = response.data.data
                    const wordsWithIds = (quizData.quizItems || []).map((item: any) => ({
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
                    setMultiInputs(wordsWithIds.map((item) => item.word.split(' ').map(() => '')))
                    setQuizResults(new Array(wordsWithIds.length).fill(null))
                    setHintCounts(new Array(wordsWithIds.length).fill(0))
                    setShowButtons(new Array(wordsWithIds.length).fill(false))
                } else {
                    setOriginalWords([])
                    setWords([])
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
                    if (quizResults[idx] !== null) {
                        const params = {
                            quizId: word.quizId,
                            wordbookItemId: word.wordbookItemId,
                            isCorrect: quizResults[idx],
                        }
                        return client.POST(
                            selectedType === 'today'
                                ? '/api/v1/wordbooks/quiz/total/result'
                                : '/api/v1/wordbooks/quiz/result',
                            {
                                body: params,
                            },
                        )
                    }
                    return null
                })
                .filter(Boolean)

            await Promise.all(savePromises)
        } catch (error) {
            console.error('결과 저장 실패:', error)
        }
    }

    const getHintPlaceholder = (index: number, inputIndex?: number) => {
        if (hintCounts[index] === 0) return ''

        const word = words[index].word
        if (!word) return ''

        if (inputIndex !== undefined) {
            // 숙어의 경우 각 단어별로 힌트 제공
            const wordParts = word.split(' ')
            const currentWord = wordParts[inputIndex]
            const oneThird = Math.ceil(currentWord.length / 3)
            const hintLength = Math.min(oneThird * hintCounts[index], currentWord.length)
            return currentWord.slice(0, hintLength)
        } else {
            // 단일 단어의 경우 기존 로직 사용
            const oneThird = Math.ceil(word.length / 3)
            const hintLength = Math.min(oneThird * hintCounts[index], word.length)
            return word.slice(0, hintLength)
        }
    }

    const handleHint = async () => {
        if (hintCounts[index] >= maxHint) return

        // 힌트 카운트 증가
        const newHintCounts = [...hintCounts]
        newHintCounts[index] = hintCounts[index] + 1
        setHintCounts(newHintCounts)

        // 사용자 입력 초기화
        const newUserInputs = [...userInputs]
        newUserInputs[index] = ''
        setUserInputs(newUserInputs)

        try {
            await client.POST('/api/v1/wordbooks/quiz/result', {
                body: {
                    quizId: words[index].quizId,
                    wordbookItemId: words[index].wordbookItemId,
                    isCorrect: false,
                },
            })
        } catch (error) {
            console.error('힌트 사용으로 인한 오답 처리 중 오류:', error)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 정답을 맞췄거나 이동 버튼이 표시된 상태면 입력 불가
        if (quizResults[index] === true || showButtons[index]) return

        const newUserInputs = [...userInputs]
        newUserInputs[index] = e.target.value
        setUserInputs(newUserInputs)
    }

    const handleMultiInputChange = (wordIndex: number, inputIndex: number, value: string) => {
        if (quizResults[wordIndex] === true || showButtons[wordIndex]) return

        const newMultiInputs = [...multiInputs]
        newMultiInputs[wordIndex][inputIndex] = value
        setMultiInputs(newMultiInputs)

        // 전체 입력값도 업데이트
        const newUserInputs = [...userInputs]
        newUserInputs[wordIndex] = newMultiInputs[wordIndex].join(' ')
        setUserInputs(newUserInputs)
    }

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, inputIndex?: number) => {
        if (e.key === 'Enter') {
            const currentWord = words[index].word
            const isMultiWord = currentWord.includes(' ')
            let isAnswerCorrect = false
            let currentInput = ''

            if (isMultiWord) {
                currentInput = multiInputs[index].join(' ').trim()
                isAnswerCorrect = currentInput.toLowerCase() === currentWord.toLowerCase()
            } else {
                currentInput = userInputs[index].trim()
                isAnswerCorrect = currentInput.toLowerCase() === currentWord.toLowerCase()
            }

            // 입력값이 비어있으면 처리하지 않음
            if (!currentInput) return

            if (hintCounts[index] === 0) {
                if (isAnswerCorrect) {
                    saveQuizResult(index, true)
                    const newShowButtons = [...showButtons]
                    newShowButtons[index] = true
                    setShowButtons(newShowButtons)

                    // 서버에 정답 결과 저장
                    if (index === words.length - 1 && isAnswerCorrect) {
                        setShowFinalButton(true);
                    }
                } else {
                    const newQuizResults = [...quizResults]
                    newQuizResults[index] = false
                    setQuizResults(newQuizResults)

                    try {
                        await client.POST('/api/v1/wordbooks/quiz/result', {
                            body: {
                                quizId: words[index].quizId,
                                wordbookItemId: words[index].wordbookItemId,
                                isCorrect: false,
                            },
                        })
                    } catch (error) {
                        console.error('오답 처리 중 오류:', error)
                    }
                }
            } else if (isAnswerCorrect) {
                saveQuizResult(index, true)
                const newShowButtons = [...showButtons]
                newShowButtons[index] = true
                setShowButtons(newShowButtons)

                // 마지막 문제에서 정답을 맞춘 경우 최종 버튼 표시
                if (index === words.length - 1) {
                    setShowFinalButton(true);
                }
            }

            // Tab 키 이동 로직
            if (isMultiWord && inputIndex !== undefined && inputIndex < multiInputs[index].length - 1) {
                const nextInput = document.querySelector(`input[data-index="${inputIndex + 1}"]`) as HTMLInputElement
                if (nextInput) nextInput.focus()
            }
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
        setShowButtons(new Array(newLength).fill(false))
    }

    const restartQuiz = () => {
        setWords(originalWords)
        setIndex(0)
        setQuizResults(new Array(originalWords.length).fill(null))
        setUserInputs(new Array(originalWords.length).fill(''))
        setShowButtons(new Array(originalWords.length).fill(false))
    }

    const handleShowResult = () => {
        const newQuizResults = [...quizResults]
        for (let i = 0; i < newQuizResults.length; i++) {
            if (newQuizResults[i] === null) {
                newQuizResults[i] = false
            }
        }
        setQuizResults(newQuizResults)
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
        if (hintCounts[index] >= maxHint) return '/assets/fail.svg'
        if (hintCounts[index] === maxHint - 1) return '/assets/check.svg'
        return '/assets/hint.svg'
    }

    const renderQuestion = () => {
        if (!current) return null

        const parts = current.question.split('{}')
        const isMultiWord = current.word.includes(' ')

        return (
            <div className="flex flex-col items-center w-full">
                <div className="bg-gray-50 w-full py-6 rounded-lg mb-8">
                    <p className="text-xl text-gray-600 text-center px-4">{current.meaning}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 text-3xl font-bold text-center bg-white py-8 px-4 rounded-lg w-full">
                    <span className="break-keep">{parts[0]}</span>
                    {isMultiWord ? (
                        <div className="flex gap-2">
                            {current.word.split(' ').map((_, inputIndex) => (
                                <input
                                    key={inputIndex}
                                    type="text"
                                    value={multiInputs[index]?.[inputIndex] || ''}
                                    onChange={(e) => handleMultiInputChange(index, inputIndex, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, inputIndex)}
                                    placeholder={getHintPlaceholder(index, inputIndex)}
                                    data-index={inputIndex}
                                    className={`w-24 min-w-[96px] h-[50px] text-2xl text-center rounded-md bg-[#ECEAFC] border-2 border-[#D1CFFA] focus:outline-none focus:border-[var(--color-main)] ${quizResults[index] === true
                                        ? 'text-green-500 border-green-500 bg-green-100'
                                        : quizResults[index] === false
                                            ? 'text-[var(--color-black)] border-red-500 bg-red-100'
                                            : 'text-[var(--color-black)]'
                                        } placeholder-gray-400`}
                                    readOnly={quizResults[index] === true || showButtons[index]}
                                />
                            ))}
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={userInputs[index]}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={getHintPlaceholder(index)}
                            style={{
                                width: `${Math.max(current.word.length * 1.2, 8)}ch`, // 최소 8ch, 길이에 따라 확장
                            }}
                            className={`w-44 min-w-[140px] h-[50px] text-2xl text-center rounded-md bg-[#ECEAFC] border-2 border-[#D1CFFA] focus:outline-none focus:border-[var(--color-main)] ${quizResults[index] === true
                                ? 'text-green-500 border-green-500 bg-green-100'
                                : quizResults[index] === false
                                    ? 'text-[var(--color-black)] border-red-500 bg-red-100'
                                    : 'text-[var(--color-black)]'
                                } placeholder-gray-400`}
                            readOnly={quizResults[index] === true || showButtons[index]}
                        />
                    )}
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
                            className="w-18 h-18 disabled:opacity-50 relative group"
                            onClick={handleHint}
                            disabled={hintCounts[index] >= maxHint || quizResults[index] === true || showButtons[index]}
                        >
                            {hintCounts[index] === 0 && (
                                <div className="absolute invisible group-hover:visible bg-black text-white text-sm px-3 py-1 rounded -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                    힌트를 쓰면 틀린 것으로 간주됩니다
                                </div>
                            )}
                            <Image src={getResultIcon()} alt="result" width={80} height={80} />
                        </button>
                        <p className="text-sm text-gray-500">
                            {quizResults[index] === true
                                ? '정답'
                                : hintCounts[index] >= maxHint
                                    ? '오답'
                                    : `힌트 사용: ${hintCounts[index]} / ${maxHint}`}
                        </p>
                    </div>

                    <div className="flex gap-2 w-full">
                        {(quizResults[index] === true || showButtons[index]) && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="flex-1 flex items-center justify-center bg-[var(--color-sub-2)] border-[var(--color-main)] border-2 rounded-sm disabled:opacity-50"
                                    disabled={index === 0}
                                >
                                    <Image src="/assets/left.svg" alt="left" width={40} height={40} />
                                </button>
                                {index === words.length - 1 ? (
                                    showFinalButton && (
                                        <button
                                            onClick={handleShowResult}
                                            className="flex-1 flex items-center justify-center bg-[var(--color-main)] text-white font-bold py-2 rounded-sm"
                                        >
                                            최종 결과 확인
                                        </button>
                                    )
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="flex-1 flex items-center justify-center bg-[var(--color-sub-2)] border-[var(--color-main)] border-2 rounded-sm disabled:opacity-50"
                                        disabled={index === words.length - 1}
                                    >
                                        <Image src="/assets/right.svg" alt="right" width={40} height={40} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
