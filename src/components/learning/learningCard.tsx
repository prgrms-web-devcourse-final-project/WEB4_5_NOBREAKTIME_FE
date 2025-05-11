import Card from '@/components/learning/card'
import Image from 'next/image'

interface Description {
    text: string
    strong: string[]
}

interface Wordbook {
    id: number
    name: string
    language: string
}

interface Props {
    title: string
    descriptions: Description[]
    wordbooks: Wordbook[]
    isLoading?: boolean
}

export default function LearningCard({ title, descriptions, wordbooks, isLoading = false }: Props) {
    return (
        <div className="flex gap-4 border border-[var(--color-main)] rounded-lg shadow-lg p-4 h-[350px]">
            <div className="relative w-[clamp(160px,20vw,350px)] aspect-square">
                <Image src="/character/character-word.png" alt="word" fill className="object-contain" />
            </div>

            <div className=" m-auto">
                <h1 className="font-bold mb-8 learning-title leading-tight break-keep text-center lg:text-left">
                    오늘 함께할 {title} 퀴즈는?
                </h1>

                {descriptions.map((desc, idx) => {
                    const replaced = desc.text.replace('{title}', title)
                    const regex = new RegExp(`(${desc.strong.join('|')})`, 'g')
                    const parts = replaced.split(regex)

                    return (
                        <p key={idx} className="learning-text mb-2">
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

            <Card wordbooks={wordbooks} isLoading={isLoading} />
        </div>
    )
}
