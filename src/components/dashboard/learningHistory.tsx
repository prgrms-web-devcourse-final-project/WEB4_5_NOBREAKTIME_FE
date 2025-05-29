import { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

type LearningHistoryResponse = components['schemas']['LearningHistoryResponse']

interface Props {
    selectedDate?: Date
}

export default function LearningHistory({ selectedDate }: Props) {
    const [history, setHistory] = useState<LearningHistoryResponse | null>(null)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const targetDate = selectedDate ?? new Date()

                const year = targetDate.getFullYear();
                const month = String(targetDate.getMonth() + 1).padStart(2, '0');
                const day = String(targetDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/calendar?date=${encodeURIComponent(dateStr)}`;
                const res = await fetch(url, { credentials: 'include' });
                const json = await res.json();
                setHistory(json?.data);
            } catch (error) {
                console.error('Failed to fetch learning history:', error)
            }
        }

        fetchHistory()
    }, [selectedDate]) // 날짜 변경 시 요청

    const learningData = history?.today

    const learningHistory = [
        { id: 'total', icon: '/assets/time.svg', label: '총 학습 시간', time: learningData?.learningTime || '0h 0m' },
        { id: 'video', icon: '/assets/fluent_video.svg', label: '학습 영상 수', time: `${history?.today?.videoCount || 0}개` },
        { id: 'word', icon: '/assets/tabler_abc.svg', label: '학습 단어 수', time: `${history?.today?.addedWordCount || 0}개` },
        { id: 'quiz', icon: '/assets/quiz.svg', label: '학습 퀴즈 수', time: `${history?.today?.quizCount || 0}개` },
    ]

    return (
        <div className="flex flex-col space-y-2 text-xs">
            <h3 className="text-md font-semibold text-black">
                {(selectedDate ?? new Date()).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: 'long', day: 'numeric'
                })} 학습 기록
            </h3>
            <div className="grid grid-cols-2 gap-2 flex-1">
                {learningHistory.map((item) => (
                    <div
                        key={item.id}
                        className="relative flex flex-col h-[100px] items-center justify-center gap-2 bg-[var(--color-sub-2)] rounded-lg"
                    >
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="absolute top-1.5 right-1.5 text-[14px] font-bold text-gray-500 hover:text-black">
                                        ?
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent
                                    side="top"
                                    align="center"
                                    sideOffset={8}
                                    className="relative bg-white text-black text-sm px-4 py-2 rounded-lg shadow-md border border-gray-300 z-50 whitespace-nowrap [&>svg]:hidden [&>div>svg]:hidden"
                                >
                                    {item.label}

                                    <div
                                        className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white z-40"
                                    />
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Image src={item.icon} alt={item.id} width={38} height={38} />
                        <span className="text-[var(--color-black)] text-lg font-bold">{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
