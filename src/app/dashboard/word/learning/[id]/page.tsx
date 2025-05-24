'use client'

import WordIcon from '@/components/icon/wordIcon'
import Image from 'next/image'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import client from '@/lib/backend/client'
import { components } from '@/lib/backend/apiV1/schema'
import Link from 'next/link'

type WordResponse = components['schemas']['WordResponse']

// 날짜 포맷팅 함수
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date)
}

const difficultyMap = new Map<string, number>([
    ['EASY', 1],
    ['NORMAL', 2],
    ['HARD', 3],
    ['VERY_HARD', 4],
    ['EXTREME', 5],
])

const getDifficultyStars = (difficulty: string): number => {
    return difficultyMap.get(difficulty) ?? 1
}

export default function WordLearning() {
    const searchParams = useSearchParams()
    const params = useParams()
    const selectedId = params.id as string
    const selectedTitle = searchParams.get('title') || '제목 없음'

    const [words, setWords] = useState<WordResponse[]>([])
    const [index, setIndex] = useState(0)
    const wordItem = words.length
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const { data } = await client.GET('/api/v1/wordbooks/{wordbookId}/words', {
                    params: {
                        path: {
                            wordbookId: Number(selectedId),
                        },
                    },
                })
                if (data?.data) {
                    setWords(data.data)
                } else {
                    setWords([])
                }
                setIsLoading(false)
            } catch (error) {
                console.error('단어 데이터를 가져오는데 실패했습니다:', error)
                setIsLoading(false)
            }
        }

        if (selectedId) {
            fetchWords()
        }
    }, [selectedId])

    const handlePrev = () => {
        if (index > 0) setIndex(index - 1)
    }

    const handleNext = () => {
        if (index < wordItem - 1) setIndex(index + 1)
    }

    const handleGoToFirst = () => {
        setIndex(0)
    }

    function highlightWord(sentence: string | undefined, word: string | undefined) {
        if (!sentence || !word) return sentence || ''
        const regex = new RegExp(`(${word})`, 'gi') // 대소문자 구분 없이
        const parts = sentence.split(regex)

        return parts.map((part, index) =>
            part.toLowerCase() === word.toLowerCase() ? (
                <strong key={index} className="text-[var(--color-point)] font-bold">
                    {part}
                </strong>
            ) : (
                <span key={index}>{part}</span>
            ),
        )
    }

    const speak = (text: string | undefined) => {
        if (!text) return
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US' // 영어 발음
        speechSynthesis.speak(utterance)
    }

    if (isLoading) {
        return (
            <>
                <div className="flex items-center gap-2">
                    <span className="text-[var(--color-main)]">
                        <WordIcon />
                    </span>
                    <h3 className="text-2xl font-bold text-[var(--color-black)]">Word Learning</h3>
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
                    <h3 className="text-2xl font-bold text-[var(--color-black)]">Word Learning</h3>
                </div>
                <div className="flex items-center justify-center h-full">
                    <p className="text-2xl">단어가 없습니다.</p>
                </div>
            </>
        )
    }

    const current = words[index]

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    <WordIcon />
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Word Learning</h3>
            </div>
            <div className="bg-image p-20 flex flex-col gap-4 items-center relative">
                <h1 className="text-5xl font-bold text-[var(--color-black)]">{selectedTitle} 단어장 학습</h1>

                <div className="bg-[var(--color-main)] text-[var(--color-point)] px-4 py-2 rounded-sm">
                    {index + 1} / {wordItem}
                </div>

                <div className="flex flex-col items-center justify-center bg-[var(--color-white)] w-180 h-full gap-8 p-12">
                    <div className="text-yellow-400 text-xl">
                        {Array.from({
                            length: getDifficultyStars(current.difficulty || 'EASY')
                        }).map((_, i) => (
                            <span key={i}>⭐</span>
                        ))}
                    </div>

                    <p className="text-5xl font-bold text-center">{current.word}</p>

                    <button className="flex items-center gap-2 justify-center" onClick={() => speak(current.word)}>
                        <Image src="/assets/volume.svg" alt="volume" width={24} height={24} />
                        <span className="text-lg">
                            [{current.pos}] {current.meaning}
                        </span>
                    </button>

                    <div>
                        <p className="text-md text-center">{highlightWord(current.exampleSentence, current.word)}</p>
                        <p className="text-md text-center">{current.translatedSentence}</p>
                    </div>

                    {current.videoId && (
                        <Link
                            href={`/dashboard/video/learning/${current.videoId}`}
                            className="mt-4 block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-2 justify-center">
                                <div className="w-[80px] h-[45px] relative overflow-hidden rounded-md">
                                    <Image
                                        src={current.imageUrl || '/assets/default-thumbnail.png'}
                                        alt="video thumbnail"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <p className="text-md text-center flex-1">{current.videoTitle}</p>
                            </div>
                        </Link>
                    )}

                    <div className="w-full flex justify-end">
                        <p className="text-sm text-gray-400">{formatDate(current.createdAt)}</p>
                    </div>

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
                            disabled={index === wordItem - 1}
                        >
                            <Image src="/assets/right.svg" alt="right" width={40} height={40} />
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleGoToFirst}
                    className="absolute bottom-8 right-8 w-14 h-14 bg-[var(--color-point)] rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    title="처음 단어로 이동"
                    disabled={index === 0}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="white"
                        className="w-8 h-8"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
                        />
                    </svg>
                </button>
            </div>
        </>
    )
}
