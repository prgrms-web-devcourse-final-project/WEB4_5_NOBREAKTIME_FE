import { useState } from 'react'
import type { components } from '@/lib/backend/apiV1/schema'
import { toast } from 'sonner'

type Wordbook = components['schemas']['WordbookResponse']

interface Props {
    isOpen: boolean
    onClose: () => void
    wordbooks: {
        id: number
        name: string
        language: string
        wordCount: number
        learnedWordCount: number
    }[]
    onMoveWords: (targetWordbookId: number) => Promise<void>
    onDeleteWords: () => Promise<void>
    defaultTargetId?: number | ''
}

export default function WordMoveDeleteModal({ isOpen, onClose, wordbooks, onMoveWords, onDeleteWords }: Props) {
    const [moveTargetWordbookId, setMoveTargetWordbookId] = useState<number>(wordbooks[0]?.id || 0)

    if (!isOpen) return null

    const handleMoveTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMoveTargetWordbookId(Number(e.target.value))
    }

    const handleMoveWords = async () => {
        try {
            await onMoveWords(moveTargetWordbookId)
            onClose()
        } catch (error) {
            console.error('단어 이동에 실패했습니다:', error)
            alert('단어 이동에 실패했습니다.')
        }
    }

    const handleDeleteWords = async () => {
        try {
            await onDeleteWords()
            onClose()
        } catch (error) {
            console.error('단어 삭제에 실패했습니다:', error)
            alert('단어 삭제에 실패했습니다.')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-[400px]">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">단어장</label>
                    <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                        value={moveTargetWordbookId}
                        onChange={handleMoveTargetChange}
                    >
                        {wordbooks.map((wordbook) => (
                            <option key={wordbook.id} value={wordbook.id}>
                                {wordbook.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleMoveWords}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                        이동
                    </button>
                    <button
                        onClick={handleDeleteWords}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </div>
    )
}
