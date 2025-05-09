import { useRouter, usePathname } from 'next/navigation'

interface Wordbook {
    id: number
    name: string
    language: string
}

interface Props {
    wordbooks: Wordbook[]
}

export default function Card({ wordbooks }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const isGrammar = pathname.startsWith('/grammar')
    const basePath = isGrammar ? 'grammar' : 'word'

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
                    <strong className="text-[var(--color-point)] text-xl mb-2">13개 단어</strong>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end gap-2">
                        {!isGrammar && (
                            <button
                                className="bg-[var(--color-main)] text-white px-3 py-1 rounded text-sm"
                                onClick={() =>
                                    router.push(
                                        `/${basePath}-learning?id=${wordbook.id}&title=${encodeURIComponent(
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
                                    `/${basePath}-quiz?id=${wordbook.id}&title=${encodeURIComponent(wordbook.name)}`,
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
