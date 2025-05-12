'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import client from '@/lib/backend/client'

interface Word {
    word: string
    description?: string
    checked?: boolean
    isCorrect?: boolean
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

interface Wordbook {
    id: number
    name: string
}

const WordModal = ({
    title,
    onCancel,
    onConfirm,
    confirmText = '추가',
    cancelText = '닫기',
    initialWords,
}: WordModalProps) => {
    const [wordList, setWordList] = useState<Word[]>(initialWords || [])
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([])
    const [selectedList, setSelectedList] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)

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
                    if (wordbookData.length > 0) {
                        setSelectedList(wordbookData[0].id.toString())
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

    // initialWords가 변경되면 wordList 업데이트
    useEffect(() => {
        if (initialWords && initialWords.length > 0) {
            // 정답을 맞춘 단어(isCorrect가 true)는 체크 해제
            console.log('initialWords 업데이트:', initialWords)
            const updatedWords = initialWords.map((word) => {
                console.log('단어 처리:', word.word, '정답여부:', word.isCorrect)
                return {
                    ...word,
                    checked: word.isCorrect ? false : word.checked,
                }
            })
            console.log('업데이트된 단어 목록:', updatedWords)
            setWordList(updatedWords)
        }
    }, [initialWords])

    const toggleChecked = (index: number) => {
        const next = [...wordList]
        next[index].checked = !next[index].checked
        setWordList(next)
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

                {/* 드롭다운 */}
                <div className="mb-6">
                    <label className="text-sm font-semibold mb-1 block">단어장 선택</label>
                    <select
                        value={selectedList}
                        onChange={(e) => setSelectedList(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                        {wordbooks.map((book) => (
                            <option key={book.id} value={book.id.toString()}>
                                {book.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 단어 리스트 */}
                {wordList.length > 0 ? (
                    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 overflow-y-auto h-[300px] pr-2">
                        {wordList.map((word, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b pb-3">
                                <div className="flex-1">
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
                ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                        추가할 단어가 없습니다.
                    </div>
                )}

                {/* 안내 메시지 */}
                <div className="mt-4 text-sm text-gray-500">
                    <p>* 단어 퀴즈 중 오답인 단어만 자동으로 체크되었습니다.</p>
                    <p>* overview 탭에서 원하는 단어를 선택하여 단어장에 추가하세요.</p>
                </div>

                {/* 버튼 */}
                <div className="flex justify-between gap-2 mt-6">
                    <button
                        className="bg-[var(--color-warning)] text-[var(--color-white)] px-4 py-2 rounded text-sm"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="bg-[var(--color-main)] text-[var(--color-white)] px-4 py-2 rounded text-sm"
                        onClick={() =>
                            onConfirm(
                                wordList.filter((w) => w.checked),
                                selectedList,
                            )
                        }
                        disabled={wordList.filter((w) => w.checked).length === 0}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WordModal
