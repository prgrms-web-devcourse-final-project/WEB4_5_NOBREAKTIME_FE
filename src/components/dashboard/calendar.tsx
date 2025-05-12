'use client'

import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { useEffect, useState } from 'react'

type LearningHistoryResponse = components['schemas']['LearningHistoryResponse']
type LearningHistory = components['schemas']['LearningHistory']

export function DashboardCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date())
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

    const getHistoryForDate = (date: Date): LearningHistory | undefined => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const dateStr = date.toISOString().split('T')[0]
        const todayStr = today.toISOString().split('T')[0]
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        if (dateStr === todayStr) return history?.today
        if (dateStr === yesterdayStr) return history?.yesterday
        return history?.week
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">학습 캘린더</CardTitle>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border w-full"
                    modifiers={{
                        studied: (date) => {
                            const history = getHistoryForDate(date)
                            return !!history
                        },
                    }}
                    modifiersStyles={{
                        studied: {
                            backgroundColor: 'var(--color-point)',
                            color: 'white',
                        },
                    }}
                />
                {date && (
                    <div className="mt-4 p-4 bg-[var(--color-sub-2)] rounded-lg">
                        <h4 className="font-bold mb-2">
                            {date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 학습
                            기록
                        </h4>
                        {getHistoryForDate(date) ? (
                            <div className="space-y-2">
                                <p>학습 시간: {getHistoryForDate(date)?.learningTime || '0h 0m'}</p>
                                <p>시청한 영상: {getHistoryForDate(date)?.videoCount || 0}개</p>
                                <p>학습한 단어: {getHistoryForDate(date)?.addedWordCount || 0}개</p>
                                <p>푼 퀴즈: {getHistoryForDate(date)?.quizCount || 0}개</p>
                            </div>
                        ) : (
                            <p>해당 날짜의 학습 기록이 없습니다.</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
