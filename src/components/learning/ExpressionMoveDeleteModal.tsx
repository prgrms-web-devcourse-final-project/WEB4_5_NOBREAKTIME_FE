import { components } from '@/lib/backend/apiV1/schema'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type ExpressionBook = components['schemas']['ExpressionBookResponse']

interface Props {
    isOpen: boolean
    onClose: () => void
    expressionBooks: ExpressionBook[]
    onMoveExpressions: (targetExpressionBookId: number) => Promise<void>
    onDeleteExpressions: () => Promise<void>
    defaultTargetId?: number | ''
}

export default function ExpressionMoveDeleteModal({
    isOpen,
    onClose,
    expressionBooks,
    onMoveExpressions,
    onDeleteExpressions,
    defaultTargetId = '',
}: Props) {
    const [selectedTargetId, setSelectedTargetId] = useState<number | ''>('')

    useEffect(() => {
        if (isOpen) {
            setSelectedTargetId(defaultTargetId || '')
        }
    }, [isOpen, defaultTargetId])

    const handleMoveTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTargetId(e.target.value ? Number(e.target.value) : '')
    }

    const handleMoveExpressions = async () => {
        if (!selectedTargetId) return
        try {
            await onMoveExpressions(selectedTargetId)
        } catch (error) {
            console.error('표현 이동 실패:', error)
            toast.error('표현 이동에 실패했습니다.')
        }
    }

    const handleDeleteExpressions = async () => {
        try {
            await onDeleteExpressions()
        } catch (error) {
            console.error('표현 삭제 실패:', error)
            toast.error('표현 삭제에 실패했습니다.')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] relative">
                <h2 className="text-xl font-bold mb-4">표현 이동/삭제</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">이동할 표현함</label>
                    <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                        value={selectedTargetId}
                        onChange={handleMoveTargetChange}
                    >
                        <option value="">표현함을 선택하세요</option>
                        {expressionBooks.map((book) => (
                            <option key={book.expressionBookId} value={book.expressionBookId}>
                                {book.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleMoveExpressions}
                        disabled={!selectedTargetId}
                        className={`px-4 py-2 bg-[var(--color-main)] text-white rounded-md transition-colors ${
                            !selectedTargetId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
                        }`}
                    >
                        이동
                    </button>
                    <button
                        onClick={handleDeleteExpressions}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </div>
    )
}
