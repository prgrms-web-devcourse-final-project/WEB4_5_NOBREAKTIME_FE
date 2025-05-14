import { useState } from 'react'
import type { components } from '@/lib/backend/apiV1/schema'

type ExpressionBookResponse = components['schemas']['ExpressionBookResponse']

interface Props {
    isOpen: boolean
    onClose: () => void
    expressionBooks: ExpressionBookResponse[]
    onMoveExpressions: (targetExpressionBookId: number) => Promise<void>
    onDeleteExpressions: () => Promise<void>
}

export default function ExpressionMoveDeleteModal({
    isOpen,
    onClose,
    expressionBooks,
    onMoveExpressions,
    onDeleteExpressions,
}: Props) {
    const [moveTargetExpressionBookId, setMoveTargetExpressionBookId] = useState<number>(expressionBooks[0]?.id || 0)

    if (!isOpen) return null

    const handleMoveTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMoveTargetExpressionBookId(Number(e.target.value))
    }

    const handleMoveExpressions = async () => {
        try {
            await onMoveExpressions(moveTargetExpressionBookId)
            onClose()
        } catch (error) {
            console.error('표현 이동에 실패했습니다:', error)
            alert('표현 이동에 실패했습니다.')
        }
    }

    const handleDeleteExpressions = async () => {
        try {
            await onDeleteExpressions()
            alert('선택한 표현들이 삭제되었습니다.')
            onClose()
        } catch (error) {
            console.error('표현 삭제에 실패했습니다:', error)
            alert('표현 삭제에 실패했습니다.')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-[400px]">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">표현함</label>
                    <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                        value={moveTargetExpressionBookId}
                        onChange={handleMoveTargetChange}
                    >
                        {expressionBooks.map((expressionBook) => (
                            <option key={expressionBook.id} value={expressionBook.id}>
                                {expressionBook.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={handleMoveExpressions}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        이동
                    </button>
                    <button
                        onClick={handleDeleteExpressions}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </div>
    )
}
