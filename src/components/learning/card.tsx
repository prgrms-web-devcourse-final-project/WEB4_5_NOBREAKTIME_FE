import { useRouter, usePathname } from 'next/navigation'

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
    const isGrammar = pathname.startsWith('/grammar')
    const basePath = isGrammar ? 'grammar' : 'word'

    if (isLoading) {
        return (
            <div className="flex-1 grid grid-cols-2 gap-4">
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
        <div className="flex-1 grid grid-cols-2 gap-4">
            {wordbooks.map((wordbook) => (
                <div
                    key={wordbook.id}
                    className="bg-[var(--color-white)] rounded-lg p-4 shadow flex flex-col justify-between h-32 border border-gray-200"
                >
                    {/* 날짜 + 제목 */}
                    <p className="font-semibold text-[var(--color-main)] mb-1">
                        <span className="text-[var(--color-black)] text-sm mr-2">2025-04-28</span>
                        {wordbook.name}
                    </p>

                    {/* 단어 수 */}
                    <strong className="text-[var(--color-point)] text-xl mb-2">{wordbook.wordCount || 0}개 단어</strong>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end gap-2">
                        {!isGrammar && (
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
    )
}
