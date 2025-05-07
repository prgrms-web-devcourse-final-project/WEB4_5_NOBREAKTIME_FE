'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Word {
    word: string
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
}

const dummyWords: Word[] = [
    { word: 'honest', checked: true },
    { word: 'happy', checked: true },
    { word: 'study', checked: false },
    { word: 'Menu Label', checked: true },
    { word: 'Menu Label', checked: true },
    { word: 'Menu Label', checked: true },
    { word: 'Menu Label', checked: true },
    { word: 'Menu Label', checked: true },
    { word: 'Menu Label', checked: true },
    { word: 'Menu Label', checked: true },
    { word: 'Menu Label', checked: true },
    { word: 'Menu Label', checked: true },
]

const dummyLists: string[] = ['기본', '드라마', '영화', '노래']

const WordModal = ({ title, onCancel, onConfirm, confirmText = '추가', cancelText = '닫기' }: WordModalProps) => {
    const [wordList, setWordList] = useState<Word[]>(dummyWords)
    const [selectedList, setSelectedList] = useState('기본')

    const toggleChecked = (index: number) => {
        const next = [...wordList]
        next[index].checked = !next[index].checked
        setWordList(next)
    }

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
            <div className="bg-white w-[340px] max-h-[90vh] rounded-xl p-5 shadow-xl overflow-y-auto">
                {/* 드롭다운 */}
                <div className="mb-6">
                    <label className="text-sm font-semibold mb-1 block">단어장 선택</label>
                    <select
                        value={selectedList}
                        onChange={(e) => setSelectedList(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                        {dummyLists.map((list, idx) => (
                            <option key={idx} value={list}>
                                {list}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 단어 리스트 */}
                <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 overflow-y-auto h-[300px] pr-2">
                    {wordList.map((word, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b pb-3">
                            <div>
                                <p className="font-bold">{word.word}</p>
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
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WordModal
