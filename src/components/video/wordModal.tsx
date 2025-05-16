'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import client from '@/lib/backend/client'
import { components } from '@/lib/backend/apiV1/schema'

type Wordbook = components['schemas']['WordbookResponse']
type AddWordToWordbookRequest = components['schemas']['AddWordToWordbookRequest']

export interface Word extends AddWordToWordbookRequest {
    description?: string
    checked?: boolean
}

interface WordModalProps {
    title: string
    description: string
    onCancel: () => void
    onConfirm: (selectedWords: Word[], selectedList: string) => void
    confirmText?: string
    cancelText?: string
    initialWords?: Word[]
}

const WordModal = ({
    title,
    description,
    onCancel,
    onConfirm,
    confirmText = '추가',
    cancelText = '닫기',
    initialWords = [],
}: WordModalProps) => {
    const [wordList, setWordList] = useState<Word[]>(initialWords)
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([])
    const [selectedList, setSelectedList] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)

    // 단어장 목록 가져오기
    useEffect(() => {
        const fetchWordbooks = async () => {
            try {
                setIsLoading(true)
                const { data, error } = await client.GET('/api/v1/wordbooks', {})

                if (error) {
                    console.error('단어장 데이터 요청 실패:', error)
                    return
                }

                if (data?.data) {
                    const wordbookData = data.data as Wordbook[]
                    setWordbooks(wordbookData)
                    if (wordbookData.length > 0 && wordbookData[0].wordbookId) {
                        setSelectedList(wordbookData[0].wordbookId.toString())
                    }
                }
            } catch (error) {
                console.error('단어장 데이터 요청 실패:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchWordbooks()
    }, [])

    const toggleChecked = (index: number) => {
        const next = [...wordList]
        next[index].checked = !next[index].checked
        setWordList(next)
    }

    const handleConfirm = async () => {
        try {
            setIsAdding(true)
            const selectedWords = wordList.filter((w) => w.checked)

            // 선택된 단어장에 단어 추가
            const { data, error } = await client.POST('/api/v1/wordbooks/{wordbookId}/words', {
                params: {
                    path: {
                        wordbookId: parseInt(selectedList),
                    },
                },
                body: {
                    words: selectedWords.map((word) => ({
                        word: word.word,
                        subtitleId: word.subtitleId,
                        videoId: word.videoId,
                    })),
                },
            })

            if (error) {
                console.error('단어 추가 실패:', error)
                alert('단어를 추가하지 못했습니다. 다시 시도해주세요.')
                return
            }

            alert('단어가 성공적으로 추가되었습니다.')
            onConfirm(selectedWords, selectedList)
        } catch (error) {
            console.error('단어 추가 중 오류 발생:', error)
            alert('단어 추가에 실패했습니다. 다시 시도해주세요.')
        } finally {
            setIsAdding(false)
        }
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
                <div className="bg-white w-[340px] max-h-[90vh] rounded-xl p-5 shadow-xl">
                    <div className="animate-pulse text-center">단어장 불러오는 중...</div>
                </div>
            </div>
        )
    }

    if (wordbooks.length === 0) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
                <div className="bg-white w-[340px] max-h-[90vh] rounded-xl p-5 shadow-xl">
                    <div className="text-center">단어장이 없습니다. 단어장을 먼저 생성해주세요.</div>
                    <button
                        className="w-full bg-[var(--color-main)] text-[var(--color-white)] px-4 py-2 rounded text-sm mt-4"
                        onClick={onCancel}
                    >
                        닫기
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
            <div className="bg-white w-[340px] max-h-[90vh] rounded-xl p-5 shadow-xl overflow-y-auto">
                {/* 제목 */}
                <h3 className="text-lg font-bold mb-4">{title}</h3>

                {/* 설명 */}
                <p className="text-sm text-gray-600 mb-4">{description}</p>

                {/* 드롭다운 */}
                <div className="mb-6">
                    <label className="text-sm font-semibold mb-1 block">단어장 선택</label>
                    <select
                        value={selectedList}
                        onChange={(e) => setSelectedList(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                        {wordbooks.map(
                            (wordbook) =>
                                wordbook.wordbookId && (
                                    <option key={wordbook.wordbookId} value={wordbook.wordbookId.toString()}>
                                        {wordbook.name}
                                    </option>
                                ),
                        )}
                    </select>
                </div>

                {/* 단어 리스트 */}
                <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 overflow-y-auto h-[300px] pr-2">
                    {wordList.map((word, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b pb-3">
                            <div>
                                <p className="font-bold">{word.word}</p>
                                {word.description && <p className="text-sm text-gray-500">{word.description}</p>}
                            </div>
                            <input
                                type="checkbox"
                                checked={word.checked ?? false}
                                onChange={() => toggleChecked(idx)}
                                className="w-5 h-5"
                            />
                        </div>
                    ))}
                </div>

                {/* 버튼 */}
                <div className="flex justify-between gap-2 mt-6">
                    <button
                        className="bg-[var(--color-warning)] text-[var(--color-white)] px-4 py-2 rounded text-sm"
                        onClick={onCancel}
                        disabled={isAdding}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="bg-[var(--color-main)] text-[var(--color-white)] px-4 py-2 rounded text-sm"
                        onClick={handleConfirm}
                        disabled={wordList.filter((w) => w.checked).length === 0 || isAdding}
                    >
                        {isAdding ? '추가 중...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WordModal
