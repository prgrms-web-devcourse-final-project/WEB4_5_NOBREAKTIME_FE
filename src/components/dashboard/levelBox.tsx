'use client'
import { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { useState } from 'react'
import { toast } from 'sonner'

type LevelCheckResponse = components['schemas']['LevelCheckResponse']
type StatisticResponse = components['schemas']['StatisticResponse']

interface LevelBoxProps {
    statistics: StatisticResponse | null
    onStatisticsUpdate: (statistics: StatisticResponse) => void
}

export default function LevelBox({ statistics, onStatisticsUpdate }: LevelBoxProps) {
    const [isLoading, setIsLoading] = useState(false)
 
    const isMeasured =
        statistics?.levelStatus?.word === '-' &&
        statistics?.levelStatus?.expression === '-'

    const formatDateTime = (dateString: string | undefined) => {
        if (isMeasured || !dateString) return '측정 전'
        const date = new Date(dateString)
        return date
            .toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            })
            .replace(/\. /g, '-')
            .replace('.', '')
    }

    const handleReMeasure = async () => {
        if (!statistics?.levelStatus?.remeasurable) {
            toast.error('퀴즈 결과가 부족해 레벨 측정이 불가합니다.')
            return
        }

        try {
            setIsLoading(true)
            const response = await client.POST('/api/v1/dashboard/level')
            if (response.data?.data) {

                // 레벨 재측정 후 통계 정보 다시 받아오기
                const statisticsResponse = await client.GET('/api/v1/dashboard/statistics')
                if (statisticsResponse.data?.data) {
                    onStatisticsUpdate(statisticsResponse.data.data)
                }

                alert('레벨이 재측정되었습니다.')
            }
        } catch (error) {
            console.error('레벨 재측정 실패:', error)
            alert('레벨 재측정에 실패했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const commonColor = 'text-[var(--color-success)]'

    const levelColor: Record<string, string> = {
        S: 'text-[var(--color-point)]',
        A: 'text-[var(--color-main)]',
        B: commonColor,
        C: commonColor,
        D: 'text-[var(--color-warning)]',
        NONE: 'text-gray-400',
    }

    const categories = [
        { key: 'word', label: '단어' },
        { key: 'expression', label: '표현' },
    ]

    return (
        <div className="flex flex-col gap-4 mb-4 ">
            <div className="flex justify-between text-sm">
                {categories.map(({ label, key }) => {
                    const levelRaw = statistics?.levelStatus?.[key as 'word' | 'expression'] ?? '-'
                    const displayLevel = levelRaw === '-' ? 'NONE' : levelRaw
                    return (
                        <div key={key} className="flex flex-1 justify-center gap-4 items-center">
                            <span className="text-lg whitespace-nowrap">{label}</span>
                            <span className={`${levelColor[displayLevel]} text-2xl font-bold`}>{displayLevel}</span>
                        </div>
                    )
                })}
            </div>
            <button
                onClick={handleReMeasure}
                disabled={isLoading}
                className="flex flex-col items-center m-auto text-sm text-[var(--color-white)] w-[200px] bg-[var(--color-warning)] rounded-full px-2 py-1 hover:bg-opacity-90 disabled:opacity-50"
            >
                {isLoading ? '측정 중...' : '레벨 재측정'}
                <small>기준: {formatDateTime(statistics?.levelStatus?.lastUpdated)}</small>
            </button>
        </div>
    )
}
