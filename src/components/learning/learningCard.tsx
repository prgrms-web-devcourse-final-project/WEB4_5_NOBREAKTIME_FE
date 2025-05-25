import Card from '@/components/learning/card'
import Image from 'next/image'
import type { components } from '@/lib/backend/apiV1/schema'

type WordbookResponse = components['schemas']['WordbookResponse']

interface Props {
    title: string
    descriptions: { text: string; strong: string[] }[]
    wordbooks: WordbookResponse[]
    isLoading: boolean
}

export default function LearningCard({ title, descriptions, wordbooks, isLoading = false }: Props) {
    return (
        <div
            className="border border-[var(--color-main)] rounded-lg shadow-lg p-4 h-[350px] w-full 
    flex gap-4 max-[1030px]:grid max-[1030px]:grid-cols-2 max-[1030px]:h-auto max-[1030px]:gap-1"
        >
            {/* 이미지 */}
            <div
                className="relative w-[clamp(160px,20vw,350px)] aspect-square shrink-0 
        max-[1030px]:w-[160px] max-[1030px]:aspect-square max-[1030px]:mx-auto 
        max-[1030px]:col-start-1 max-[1030px]:row-start-1"
            >
                <Image src="/character/character-word.png" alt="word" fill className="object-contain" />
            </div>

            {/* 텍스트 설명 */}
            <div className="flex flex-col justify-center w-[40%] max-[1030px]:col-start-1 max-[1030px]:row-start-2 max-[1030px]:items-start max-[1030px]:w-[100%] ">
                <h1 className="font-bold mb-4 learning-title leading-tight break-keep text-center lg:text-left max-[1030px]:text-left">
                    오늘 함께할<br />
                    {title} 퀴즈는?
                </h1>

                {descriptions.map((desc, idx) => {
                    const replaced = desc.text.replace('{title}', title)
                    const regex = new RegExp(`(${desc.strong.join('|')})`, 'g')
                    const parts = replaced.split(regex)

                    return (
                        <p key={idx} className="mb-2 text-[clamp(1.05rem,2.2vw,1.3rem)] leading-normal break-words">
                            {parts.map((part, i) =>
                                desc.strong.includes(part) ? (
                                    <strong key={i} className="text-[var(--color-point)] learning-strong">
                                        {part}
                                    </strong>
                                ) : (
                                    <span key={i}>{part}</span>
                                ),
                            )}
                        </p>
                    )
                })}
            </div>

            <div className="flex w-full max-[1030px]:col-start-2 max-[1030px]:row-span-2 max-[1030px]:w-full max-[1030px]:h-full">
                <Card
                    title={title}
                    descriptions={descriptions}
                    wordbooks={wordbooks.map((wordbook) => ({
                        id: wordbook.wordbookId || 0,
                        name: wordbook.name || '',
                        language: wordbook.language || 'ENGLISH',
                        wordCount: wordbook.wordCount || 0,
                        learnedWordCount: wordbook.learnedWordCount || 0,
                    }))}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}
