import Image from 'next/image'
import { useState, useEffect } from 'react'
import client from '@/lib/backend/client'

interface Word {
    id?: number
    word: string
    pos: string
    meaning: string
    difficulty: string
}

interface Props {
    selectedWordbookIds?: number[]
    searchKeyword?: string
    isEditMode?: boolean
    onDeleteWord?: (word: Word) => Promise<void>
}

export default function WordCard({
    selectedWordbookIds = [],
    searchKeyword = '',
    isEditMode = false,
    onDeleteWord,
}: Props) {
    const [words, setWords] = useState<Word[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchAllWords = async () => {
            if (selectedWordbookIds.length === 0) {
                setWords([])
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const promises = selectedWordbookIds.map((id) =>
                    client.GET('/api/v1/wordbooks/{wordbookId}/words', {
                        params: {
                            path: {
                                wordbookId: id,
                            },
                        },
                    }),
                )

                const results = await Promise.all(promises)

                let allWords: Word[] = []
                results.forEach((result) => {
                    if (result.data?.data) {
                        const apiWords = result.data.data.map((item: any) => ({
                            id: item.id || undefined,
                            word: item.word || '',
                            pos: item.pos || '',
                            meaning: item.meaning || '',
                            difficulty: item.difficulty || 'EASY',
                        }))
                        allWords = [...allWords, ...apiWords]
                    }
                })

                setWords(allWords)
                setIsLoading(false)
            } catch (error) {
                console.error('단어 데이터를 가져오는데 실패했습니다:', error)
                setIsLoading(false)
                setWords([])
            }
        }

        fetchAllWords()
    }, [selectedWordbookIds])

    // 검색 키워드에 따라 단어 필터링
    const filteredWords = searchKeyword.trim()
        ? words.filter(
              (word) =>
                  word.word.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                  word.meaning.toLowerCase().includes(searchKeyword.toLowerCase()),
          )
        : words

    const getDifficultyStars = (difficulty: string) => {
        return difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 2 : 3
    }

    const speak = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US' // 영어 발음
        speechSynthesis.speak(utterance)
    }

    const handleDeleteWord = async (word: Word, e: React.MouseEvent) => {
        e.stopPropagation() // 이벤트 전파 방지
        if (onDeleteWord) {
            await onDeleteWord(word)
        }
    }

    if (selectedWordbookIds.length === 0) {
        return (
            <div className="flex justify-center items-center h-40">
                <p className="text-xl text-gray-500">단어장을 선택해주세요.</p>
            </div>
        )
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

    return (
        <div className="flex flex-wrap gap-4">
            {filteredWords.map((word, idx) => (
                <div
                    key={idx}
                    className="flex flex-col justify-between p-4 w-[32%] h-[180px] bg-[var(--color-white)] rounded-lg border border-2 border-[var(--color-main)]"
                >
                    <div className="flex justify-between">
                        <div>
                            {Array.from({ length: getDifficultyStars(word.difficulty) }).map((_, i) => (
                                <span key={i} className="text-yellow-400">
                                    ⭐
                                </span>
                            ))}
                        </div>
                        {isEditMode && (
                            <button
                                onClick={(e) => handleDeleteWord(word, e)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                            >
                                <Image src="/assets/close.svg" alt="card delete" width={24} height={24} />
                            </button>
                        )}
                    </div>
                    <p className="text-2xl font-bold text-center">{word.word}</p>
                    <button className="flex items-center gap-2 justify-center" onClick={() => speak(word.word)}>
                        <Image src="/assets/volume.svg" alt="volume" width={24} height={24} />
                        <span>{word.meaning}</span>
                    </button>
                    <p className="text-sm text-center">{word.pos}</p>
                </div>
            ))}
        </div>
    )
}
