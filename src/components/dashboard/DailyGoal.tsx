'use client'

import { ChartContainer } from '@/components/ui/chart'
import client from '@/lib/backend/client'
import { useState } from 'react'
import { Cell as ReCell, Pie as RePie, PieChart as RePieChart } from 'recharts'

export default function DailyGoal() {
    const [videoGoal, setVideoGoal] = useState(10)
    const [wordGoal, setWordGoal] = useState(30)
    const [goalRate, setGoalRate] = useState(0)

    async function handleVideoGoalChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newVideoGoal = Number(e.target.value)
        setVideoGoal(newVideoGoal)
        fetchGoalRate(newVideoGoal, wordGoal)
    }
    async function handleWordGoalChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newWordGoal = Number(e.target.value)
        setWordGoal(newWordGoal)
        fetchGoalRate(videoGoal, newWordGoal)
    }
    async function fetchGoalRate(videoGoal: number, wordGoal: number) {
        try {
            const response = await client.PATCH('/api/v1/dashboard/goal', { body: { videoGoal, wordGoal } })
            setGoalRate(response.data?.data?.achievementRate ?? 0)
        } catch {
            setGoalRate(0)
        }
    }

    return (
        <div className="flex flex-col items-center w-full h-full">
            <div className="flex items-center gap-4 text-sm mb-2 w-full relative z-10">
                <GoalItem label="영상" options={[10, 20, 30]} value={videoGoal} onChange={handleVideoGoalChange} />
                <GoalItem label="단어" options={[30, 50, 100]} value={wordGoal} onChange={handleWordGoalChange} />
            </div>
            <div className="flex-1 flex items-start justify-center w-full">
                <ChartContainer config={{ goal: { color: '#3B82F6', label: '달성률' } }}>
                    <div className="w-56 h-56 relative">
                        <RePieChart width={224} height={224}>
                            <RePie
                                data={[
                                    { name: '달성', value: goalRate },
                                    { name: '미달성', value: 100 - goalRate },
                                ]}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                startAngle={90}
                                endAngle={-270}
                                paddingAngle={2}
                            >
                                <ReCell fill="#3B82F6" />
                                <ReCell fill="#E5E7EB" />
                            </RePie>
                        </RePieChart>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-[var(--color-black)]">{goalRate}%</span>
                            <span className="text-base text-gray-500 mt-1">달성률</span>
                        </div>
                    </div>
                </ChartContainer>
            </div>
        </div>
    )
}

interface GoalItemProps {
    label: string
    options: number[]
    value: number
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

function GoalItem({ label, options, value, onChange }: GoalItemProps) {
    return (
        <div className="flex items-center gap-2 w-1/2">
            <span className="text-lg whitespace-nowrap">{label}</span>
            <div className="relative w-full">
                <select
                    className="w-full px-2 py-1 rounded border border-[var(--color-main)] bg-white appearance-none focus:outline-none focus:ring-0 focus:border-[var(--color-main)]"
                    value={value}
                    onChange={onChange}
                >
                    {options.map((opt) => (
                        <option key={opt} value={opt} className="bg-white">
                            {opt}개
                        </option>
                    ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </div>
        </div>
    )
}
