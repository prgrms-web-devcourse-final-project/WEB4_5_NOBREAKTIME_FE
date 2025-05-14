import Image from 'next/image'
import type { components } from '@/lib/backend/apiV1/schema'
import { useState } from 'react'
import ExpressionDetail from './expressionDetail'

type ExpressionResponse = components['schemas']['ExpressionResponse']

interface Props {
    expression?: ExpressionResponse
    isEditMode?: boolean
    isSelected?: boolean
    onSelect?: () => void
}

export default function ExpressionCard({ expression, isEditMode = false, isSelected = false, onSelect }: Props) {
    const [showDetail, setShowDetail] = useState(false)

    if (!expression) return null

    const handleClick = () => {
        if (isEditMode) {
            onSelect?.()
        } else {
            setShowDetail(true)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}.${month}.${day}`
    }

    return (
        <>
            <div
                className={`flex flex-col justify-between p-4 w-full h-[180px] bg-[var(--color-white)] rounded-lg border-2 
                    ${
                        isEditMode
                            ? 'cursor-pointer hover:border-[var(--color-point)]'
                            : 'border-[var(--color-main)] cursor-pointer hover:bg-gray-50'
                    }
                    ${
                        isSelected
                            ? 'border-[var(--color-point)] bg-[var(--color-sub-2)]'
                            : 'border-[var(--color-main)]'
                    }`}
                onClick={handleClick}
            >
                <div className="flex justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 mr-4">
                        <div className="w-[60px] h-[34px] relative overflow-hidden rounded-md flex-shrink-0">
                            <Image
                                src={expression.thumbnailImageUrl || '/assets/default-thumbnail.png'}
                                alt="video thumbnail"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">{expression.videoTitle || '제목 없음'}</p>
                    </div>
                    {isEditMode && (
                        <div className="w-6 h-6 border-2 rounded flex items-center justify-center flex-shrink-0">
                            {isSelected && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="var(--color-point)"
                                    className="w-5 h-5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-xl font-bold text-left line-clamp-2 overflow-hidden">{expression.sentence}</p>
                    <p className="text-sm text-left line-clamp-1 overflow-hidden text-gray-600">
                        {expression.description}
                    </p>
                </div>
                <div className="text-right text-sm text-gray-400">
                    {expression.createdAt && formatDate(expression.createdAt)}
                </div>
            </div>

            {showDetail && <ExpressionDetail expression={expression} onClose={() => setShowDetail(false)} />}
        </>
    )
}
