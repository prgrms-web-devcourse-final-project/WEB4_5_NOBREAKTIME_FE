import { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type LearningHistoryResponse = components['schemas']['LearningHistoryResponse']

export default function LearningHistory() {
    const [history, setHistory] = useState<LearningHistoryResponse | null>(null)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await client.GET('/api/v1/dashboard/calendar')
                if (response.data?.data) {
                    setHistory(response.data.data)
                }
            } catch (error) {
                console.error('Failed to fetch learning history:', error)
            }
        }

        fetchHistory()
    }, [])

    const learningHistory = [
        { id: 'total', icon: '/assets/time.svg', time: history?.today?.learningTime || '0h 0m' },
        { id: 'video', icon: '/assets/fluent_video.svg', time: `${history?.today?.videoCount || 0}개` },
        { id: 'word', icon: '/assets/tabler_abc.svg', time: `${history?.today?.addedWordCount || 0}개` },
        { id: 'quiz', icon: '/assets/quiz.svg', time: `${history?.today?.quizCount || 0}개` },
    ]

    return (
        <div className="flex flex-col space-y-2 text-xs">
            <h3 className="text-lg">Today</h3>
            <div className="grid grid-cols-2 gap-4 w-full h-full flex-1">
                {learningHistory.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-col items-center gap-2 bg-[var(--color-sub-2)] p-5 rounded-lg p-2"
                    >
                        <Image src={item.icon} alt={item.id} width={50} height={50} />
                        <span className="text-[var(--color-black)] text-lg font-bold">{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
