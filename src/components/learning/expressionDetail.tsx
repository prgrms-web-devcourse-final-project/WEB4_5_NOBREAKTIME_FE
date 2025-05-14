import Image from 'next/image'
import type { components } from '@/lib/backend/apiV1/schema'
import Link from 'next/link'

type ExpressionResponse = components['schemas']['ExpressionResponse']

interface Props {
    expression: ExpressionResponse
    onClose: () => void
}

export default function ExpressionDetail({ expression, onClose }: Props) {
    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-[800px] max-h-[85vh] overflow-y-auto relative">
                {/* 닫기 버튼 */}
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-gray-700">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* 비디오 정보 */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-[180px] h-[100px] relative overflow-hidden rounded-md">
                        <Image
                            src={expression.thumbnailImageUrl || '/assets/default-thumbnail.png'}
                            alt="video thumbnail"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2">{expression.videoTitle}</h3>
                        <Link
                            href={`/dashboard/video/learning/${expression.videoId}`}
                            className="text-[var(--color-main)] hover:underline text-sm"
                        >
                            비디오로 이동
                        </Link>
                    </div>
                </div>

                {/* 표현 내용 */}
                <div className="space-y-8">
                    <div className="bg-[var(--color-sub-2)] p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-[var(--color-main)] mb-3">원문</h4>
                        <p className="text-xl font-bold">{expression.sentence}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-[var(--color-main)] mb-3">설명</h4>
                        <p className="text-lg leading-relaxed whitespace-pre-wrap">{expression.description}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-[var(--color-main)] mb-3">문장 분석</h4>
                        <p className="text-lg leading-relaxed whitespace-pre-wrap">{expression.sentenceAnalysis}</p>
                    </div>
                    <div className="text-md text-gray-500 text-right pt-4 border-t">
                        {new Date(expression.createdAt || '').toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    )
}
