'use client'

import DailyGoal from '@/components/dashboard/DailyGoal'
import LearningHistory from '@/components/dashboard/learningHistory'
import LevelBox from '@/components/dashboard/levelBox'
import WatchHistory from '@/components/dashboard/watchHistory'
import { Calendar } from '@/components/ui/calendar'
import { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type VideoHistoryResponse = components['schemas']['VideoHistoryResponse']
type StatisticResponse = components['schemas']['StatisticResponse']

export default function DashboardPage() {
    const { loginMember } = useGlobalLoginMember()
    const [userInfo, setUserInfo] = useState<StatisticResponse | null>(null)
    const [watchHistoryList, setWatchHistoryList] = useState<VideoHistoryResponse[]>([])

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await client.GET('/api/v1/dashboard/statistics')
                if (response.data?.data) {
                    setUserInfo(response.data.data)
                }
            } catch (error) {
                console.error('Failed to fetch statistics:', error)
            }
        }

        const fetchRecentVideos = async () => {
            try {
                const response = await client.GET('/api/v1/videohistory/videos/summary')
                if (response.data?.data) {
                    setWatchHistoryList(response.data.data)
                }
            } catch (error) {
                console.error('Failed to fetch recent videos:', error)
            }
        }

        fetchStatistics()
        fetchRecentVideos()
    }, [])

    return (
        <div className="flex flex-col h-screen gap-2">
            {/* 상단 제목 */}
            <div className="h-[40px] flex items-center px-2">
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Dashboard</h3>
            </div>

            {/* 본문 레이아웃 */}
            <div className="flex flex-1 flex-col lg:flex-row gap-4 overflow-hidden px-2 pb-2">
                {/* 좌측 섹션 */}
                <section className="flex-1 flex flex-col gap-6 border-b-2 lg:border-b-0 lg:border-r-2 border-[var(--color-sub-2)] pr-0 lg:pr-4 pb-4">
                    {/* 인사말 + 오늘 학습 */}
                    <div className="min-h-[300px] bg-white rounded-2xl flex flex-col lg:flex-row justify-between items-center px-6 md:px-8 py-6 shadow-md border-2 border-[var(--color-sub-2)]">
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[var(--color-black)] mb-2">
                                반가워요, <span className="text-[var(--color-point)]">{userInfo?.userName}</span>님!
                            </h2>
                            <p className="text-base md:text-lg lg:text-xl text-[var(--color-black)] mt-4 leading-relaxed">
                                지금까지 총{' '}
                                <span className="text-[var(--color-point)] font-bold">
                                    {userInfo?.watchedVideoCount || 0}개
                                </span>
                                의 영상을 시청하셨군요.
                                <br />
                                오늘도 함께 시작해볼까요?
                            </p>
                            <Link href="/dashboard/word/learning">
                                <button className="mt-4 px-4 py-2 text-sm md:text-base lg:text-lg text-[var(--color-point)] bg-[var(--color-main)] rounded-full">
                                    Today's Study →
                                </button>
                            </Link>
                        </div>
                        <Image
                            src="/character/character.png"
                            alt="dashboard"
                            width={300}
                            height={300}
                            className="mt-8 lg:mt-0 w-full max-w-[300px]"
                        />
                    </div>

                    {/* 목표 / 레벨 */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col bg-white p-6 rounded-2xl border-2 border-[var(--color-sub-2)] shadow-md">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">👊 나의 하루 목표는?</h3>
                            <div className="flex-1 rounded-lg">
                                <DailyGoal />
                            </div>
                        </div>

                        <div className="flex flex-col bg-white p-4 rounded-2xl border-2 border-[var(--color-sub-2)] shadow-md">
                            <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2">🎓 나의 Level은?</h3>
                            <LevelBox
                                statistics={userInfo}
                                onStatisticsUpdate={(newStatistics) => setUserInfo(newStatistics)}
                            />
                            <div className="flex flex-1 flex-col mt-2 h-[250px]">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-semibold text-base">
                                        📺 최근 시청 영상 <small>({watchHistoryList.length})</small>
                                    </h4>
                                    <Link href="/dashboard/video/learning">
                                        <button className="text-xs text-[var(--color-main)] font-bold">+ 더보기</button>
                                    </Link>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <WatchHistory data={watchHistoryList} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 우측 패널 */}
                <section className="w-full lg:w-[350px] flex flex-col gap-4 border-b-2 lg:border-b-0 border-[var(--color-sub-2)] pb-4">
                    {/* 캘린더 */}
                    <div className="bg-[var(--color-white)] rounded-2xl p-4 shadow-md flex flex-col flex-1 border-t-2 border-r-2 border-[var(--color-sub-2)]">
                        <h3 className="text-base md:text-lg font-bold mb-2 pb-2 border-b-2 border-[var(--color-sub-2)]">
                            Calendar
                        </h3>
                        <div className="flex-1">
                            <Calendar
                                mode="single"
                                className="w-full h-full"
                                classNames={{
                                    months: 'flex flex-col h-full',
                                    month: 'space-y-4 h-full',
                                    caption: 'flex justify-center pt-1 relative items-center text-base md:text-lg',
                                    caption_label: 'text-base md:text-lg font-medium',
                                    nav: 'space-x-1 flex items-center',
                                    nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                                    nav_button_previous: 'absolute left-1',
                                    nav_button_next: 'absolute right-1',
                                    table: 'w-full border-collapse space-y-1',
                                    head_row: 'flex w-full justify-between',
                                    head_cell:
                                        'text-muted-foreground rounded-md w-8 md:w-10 text-center font-normal text-sm md:text-base',
                                    row: 'flex w-full mt-2 justify-between',
                                    cell: 'text-center text-sm md:text-base p-0 relative w-8 md:w-10 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                                    day: 'h-8 md:h-10 w-8 md:w-10 p-0 font-normal aria-selected:opacity-100',
                                    day_selected:
                                        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                                    day_today: 'bg-accent text-accent-foreground',
                                    day_outside: 'text-muted-foreground opacity-50',
                                    day_disabled: 'text-muted-foreground opacity-50',
                                    day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                                    day_hidden: 'invisible',
                                }}
                            />
                        </div>
                    </div>

                    {/* 학습 기록 */}
                    <div className="bg-white rounded-2xl p-4 shadow-md flex-1 min-h-[300px] flex flex-col">
                        <h3 className="text-base md:text-lg font-bold mb-3">Learning History</h3>
                        <div className="flex-1 flex justify-center items-center overflow-hidden">
                            <div className="w-full max-w-[600px]">
                                <LearningHistory />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
