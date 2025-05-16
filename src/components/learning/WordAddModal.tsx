import { useState, useEffect } from 'react'
import type { components } from '@/lib/backend/apiV1/schema'

type WordbookResponse = components['schemas']['WordbookResponse']

interface Props {
    isOpen: boolean
    onClose: () => void
    selectedWordbookId: number | null
    selectedWordbookIds: number[]
    wordbooks: WordbookResponse[]
    onAddWord: (wordbookId: number, word: string) => Promise<void>
    onWordbookSelect?: (id: number) => void
}

interface WordData {
    word: string
}

export default function WordAddModal({
    isOpen,
    onClose,
    selectedWordbookId,
    selectedWordbookIds,
    wordbooks,
    onAddWord,
    onWordbookSelect,
}: Props) {
    const [newWordData, setNewWordData] = useState<WordData>({
        word: '',
    })
    const [selectedId, setSelectedId] = useState<number | null>(
        wordbooks.find((wb) => wb.name === '기본 단어장')?.wordbookId ||
            selectedWordbookId ||
            wordbooks[0]?.wordbookId ||
            null,
    )

    useEffect(() => {
        if (!selectedId && wordbooks.length > 0) {
            const defaultWordbook = wordbooks.find((wb) => wb.name === '기본 단어장')
            const id = defaultWordbook?.wordbookId || selectedWordbookId || wordbooks[0]?.wordbookId || null
            setSelectedId(id)
            if (id) {
                onWordbookSelect?.(id)
            }
        }
    }, [wordbooks, selectedWordbookId, onWordbookSelect, selectedId])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewWordData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleWordbookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = Number(e.target.value)
        setSelectedId(newId)
        onWordbookSelect?.(newId)
    }

    const handleAddWord = async () => {
        if (!selectedId) {
            alert('단어를 추가할 단어장을 선택해주세요.')
            return
        }

        if (!newWordData.word) {
            alert('단어를 입력해주세요.')
            return
        }

        try {
            await onAddWord(selectedId, newWordData.word)
            setNewWordData({ word: '' }) // 입력 필드 초기화
            onClose()
        } catch (error) {
            console.error('단어 추가에 실패했습니다:', error)
            alert('단어 추가에 실패했습니다. 다시 시도해주세요.')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">단어 추가</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">단어장 선택</label>
                    <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                        value={selectedId || ''}
                        onChange={handleWordbookChange}
                    >
                        {!selectedId && <option value="">단어장을 선택하세요</option>}
                        {wordbooks.map((wordbook) => {
                            const id = wordbook.wordbookId || 0
                            return (
                                <option key={`wordbook-${id}`} value={id}>
                                    {wordbook.name}
                                </option>
                            )
                        })}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">단어*</label>
                    <input
                        type="text"
                        name="word"
                        value={newWordData.word}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                        placeholder="영단어를 입력하세요"
                        required
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleAddWord}
                        className="px-4 py-2 bg-[var(--color-main)] text-white rounded-md hover:bg-opacity-90 transition-colors"
                    >
                        추가
                    </button>
                </div>
            </div>
        </div>
    )
}
