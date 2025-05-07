'use client'
import Image from 'next/image'
import { useRef } from 'react'

interface WatchHistoryProps {
    data: { id: number; title: string; thumbnail: string; watchedAt: string }[]
}

export default function WatchHistory({ data }: WatchHistoryProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -240 : 240,
            behavior: 'smooth',
        })
    }

    return (
        <div className="flex flex-row items-center gap-4 w-full h-full">
            <button
                onClick={() => scroll('left')}
                className="flex justify-center items-center w-10 h-10 border-2 border-[var(--color-sub-2)] rounded-full"
            >
                <Image src="/assets/left.svg" alt="arrow-left" width={24} height={24} />
            </button>

            <div
                ref={scrollRef}
                className="flex flex-row gap-4 overflow-hidden scroll-smooth no-scrollbar"
                style={{ width: '100%' }}
            >
                {data.map((item) => (
                    <WatchHistoryCard
                        key={item.id}
                        title={item.title}
                        thumbnail={item.thumbnail}
                        watchedAt={item.watchedAt}
                    />
                ))}
            </div>

            <button
                onClick={() => scroll('right')}
                className="flex justify-center items-center w-10 h-10 border-2 border-[var(--color-sub-2)] rounded-full"
            >
                <Image src="/assets/right.svg" alt="arrow-right" width={24} height={24} />
            </button>
        </div>
    )
}

const WatchHistoryCard = ({ title, thumbnail, watchedAt }: { title: string; thumbnail: string; watchedAt: string }) => (
    <div className="flex flex-col justify-between w-[240px] h-[180px] bg-white rounded shadow p-2 shrink-0 border border-[var(--color-sub-2)]">
        <Image src={thumbnail} alt={title} width={240} height={180} className="object-cover rounded" />
        <div className="flex flex-col justify-center mt-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
            <span className="text-xs text-gray-500">{watchedAt} 시청</span>
        </div>
    </div>
)
