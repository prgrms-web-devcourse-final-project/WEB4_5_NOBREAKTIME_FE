import Image from 'next/image'
import { useState } from 'react'
import type { components } from '@/lib/backend/apiV1/schema'

type WordResponse = components['schemas']['WordResponse']

interface Props {
    selectedWordbookIds?: number[]
    searchKeyword?: string
    isEditMode?: boolean
    onSelectWords?: (words: WordResponse[]) => void
    words: WordResponse[]
    isLoading?: boolean
    selectedWords?: WordResponse[]
}

export default function WordCard({
    selectedWordbookIds = [],
    searchKeyword = '',
    isEditMode = false,
    onSelectWords,
    words,
    isLoading,
    selectedWords = [],
}: Props) {
    // 검색 키워드에 따라 단어 필터링
    const filteredWords = searchKeyword.trim()
        ? words.filter(
              (word) =>
                  (word.word || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
                  (word.meaning || '').toLowerCase().includes(searchKeyword.toLowerCase()),
          )
        : words

    const getDifficultyStars = (difficulty: string) => {
        return difficulty === 'EASY' ? 1 : difficulty === 'NORMAL' ? 2 : 3
    }

    const speak = (text: string | undefined) => {
        if (!text) return
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US' // 영어 발음
        speechSynthesis.speak(utterance)
    }

    const handleWordSelect = (word: WordResponse, e?: React.ChangeEvent<HTMLInputElement>) => {
        if (e) {
            e.stopPropagation()
        }
        const isSelected = selectedWords.some((w) => w.word === word.word)
        const newSelectedWords = isSelected
            ? selectedWords.filter((w) => w.word !== word.word)
            : [...selectedWords, word]
        onSelectWords?.(newSelectedWords)
    }

    if (isLoading) {
        return (
            <div className="flex flex-wrap gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col justify-between p-4 w-[310px] h-[180px] bg-[var(--color-white)] rounded-lg border border-2 border-[var(--color-main)] animate-pulse"
                    >
                        <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        <div className="h-6 bg-gray-200 rounded w-32 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-40 mx-auto"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (filteredWords.length === 0 && !isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <p className="text-xl text-gray-500">
                    {searchKeyword.trim()
                        ? `'${searchKeyword}'에 해당하는 단어가 없습니다.`
                        : '선택한 단어장에 단어가 없습니다.'}
                </p>
            </div>
        )
    }

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date)
    }

    return (
        <div className="flex flex-wrap gap-4">
            {filteredWords.map((word, idx) => (
                <div
                    key={idx}
                    onClick={() => {
                        if (isEditMode) {
                            const isSelected = selectedWords.some((w) => w.word === word.word)
                            const newSelectedWords = isSelected
                                ? selectedWords.filter((w) => w.word !== word.word)
                                : [...selectedWords, word]
                            onSelectWords?.(newSelectedWords)
                        }
                    }}
                    className={`flex flex-col justify-between p-4 w-[32%] h-[180px] bg-[var(--color-white)] rounded-lg border border-2 ${
                        selectedWords.some((w) => w.word === word.word)
                            ? 'border-[var(--color-point)]'
                            : 'border-[var(--color-main)]'
                    } ${isEditMode ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                >
                    <div className="flex justify-between">
                        <div>
                            {Array.from({ length: getDifficultyStars(word.difficulty || 'EASY') }).map((_, i) => (
                                <span key={i} className="text-yellow-400">
                                    ⭐
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditMode && (
                                <input
                                    type="checkbox"
                                    checked={selectedWords.some((w) => w.word === word.word)}
                                    onChange={(e) => {
                                        e.stopPropagation()
                                        const isSelected = selectedWords.some((w) => w.word === word.word)
                                        const newSelectedWords = isSelected
                                            ? selectedWords.filter((w) => w.word !== word.word)
                                            : [...selectedWords, word]
                                        onSelectWords?.(newSelectedWords)
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-5 h-5 text-[var(--color-main)] border-gray-300 rounded focus:ring-[var(--color-main)]"
                                />
                            )}
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-center">{word.word}</p>
                    {!isEditMode ? (
                        <button
                            className="flex items-center gap-2 justify-center"
                            onClick={(e) => {
                                e.stopPropagation()
                                speak(word.word)
                            }}
                        >
                            <Image src="/assets/volume.svg" alt="volume" width={24} height={24} />
                            <span>
                                [{word.pos}] {word.meaning}
                            </span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 justify-center">
                            <span>
                                [{word.pos}] {word.meaning}
                            </span>
                        </div>
                    )}
                    <p className="text-sm text-center text-gray-500">{formatDate(word.createdAt)}</p>
                </div>
            ))}
        </div>
    )
}
