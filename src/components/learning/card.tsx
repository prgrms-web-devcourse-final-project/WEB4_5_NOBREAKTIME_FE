import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
interface Wordbook {
    id: number
    name: string
    language: string
    wordCount?: number
}

interface Props {
    wordbooks: Wordbook[]
    isLoading?: boolean
}

export default function Card({ wordbooks, isLoading = false }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const isExpression = pathname.startsWith('/dashboard/expression')
    const basePath = isExpression ? 'dashboard/expression' : 'dashboard/word'

    if (isLoading) {
        return (
            <div className="flex-1 grid grid-cols-2 gap-2">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-[var(--color-white)] rounded-lg p-4 shadow flex flex-col justify-between h-32 border border-gray-200 animate-pulse"
                    >
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="flex justify-end gap-2">
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="flex-1 w-[50%] learning-box gap-4 flex flex-col">
            <div className="flex-1 grid grid-cols-2 gap-2">
                {wordbooks.map((wordbook) => (
                    <div
                        key={wordbook.id}
                        className="bg-[var(--color-white)] rounded-lg p-4 shadow flex flex-col justify-between h-30 border border-gray-200"
                    >
                        {/* 날짜 + 제목 */}
                        <p className="font-semibold text-[var(--color-main)] mb-1">{wordbook.name}</p>

                        {/* 단어 수 */}
                        <strong className="text-[var(--color-point)] text-xl mb-2">
                            {wordbook.wordCount || 0}개 단어
                        </strong>

                        {/* 버튼 영역 */}
                        <div className="flex justify-end gap-2">
                            {!isExpression && (
                                <button
                                    className="bg-[var(--color-main)] text-white px-3 py-1 rounded text-sm"
                                    onClick={() =>
                                        router.push(
                                            `/${basePath}-learning/${wordbook.id}?title=${encodeURIComponent(
                                                wordbook.name,
                                            )}`,
                                        )
                                    }
                                >
                                    학습
                                </button>
                            )}

                            <button
                                className="bg-[var(--color-point)] text-white px-3 py-1 rounded text-sm"
                                onClick={() =>
                                    router.push(
                                        `/${basePath}-quiz/${wordbook.id}?title=${encodeURIComponent(wordbook.name)}`,
                                    )
                                }
                            >
                                퀴즈
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between gap-2 rounded-lg">
                <div className="flex gap-2">
                    <button className="bg-[var(--color-main)] text-sm text-[var(--color-white)] p-2 rounded-lg hover:opacity-90 transition-opacity">
                        추가
                    </button>
                    <button className="bg-[var(--color-warning)] text-sm text-[var(--color-white)] p-2 rounded-lg hover:opacity-90 transition-opacity">
                        삭제
                    </button>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Image src="/assets/left.svg" alt="arrow-left" width={24} height={24} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Image src="/assets/right.svg" alt="arrow-right" width={24} height={24} />
                    </button>
                </div>
            </div>
        </div>
    )
}
