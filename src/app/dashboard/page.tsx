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
            <div className="flex items-center gap-2 h-[40px]">
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Dashboard</h3>
            </div>

            <div className="flex min-h-0 h-[calc(100vh-150px)] p-2 overflow-y-auto">
                {/* 본문 좌측: 인사말 + 목표 + 레벨 */}
                <section className="flex-1 h-full flex flex-col gap-6 border-r-2 border-[var(--color-sub-2)] pr-4">
                    {/* 인사말 + 오늘의 학습 */}
                    <div className="h-[320px] bg-white rounded-2xl flex justify-between items-center px-8 py-6 shadow-md border-2 border-[var(--color-sub-2)]">
                        <div>
                            <h2 className="text-5xl font-bold text-[var(--color-black)] mb-2">
                                반가워요, <span className="text-[var(--color-point)]">{userInfo?.userName}</span>
                                님!
                            </h2>
                            <p className="text-[var(--color-black)] text-xl mt-4">
                                지금까지 총{' '}
                                <span className="text-[var(--color-point)] font-bold">
                                    {userInfo?.watchedVideoCount || 0}개
                                </span>
                                의 영상을 시청하셨군요.
                                <br />
                                오늘도 함께 시작해볼까요?
                            </p>
                            <Link href="/dashboard/word-learning">
                                <button className="mt-4 px-4 py-2 text-lg text-[var(--color-point)] bg-[var(--color-main)] rounded-full">
                                    Today's Study →
                                </button>
                            </Link>
                        </div>
                        <Image
                            src="/character/character.png"
                            alt="dashboard"
                            width={400}
                            height={400}
                            className="mt-8"
                        />
                    </div>

                    {/* 목표 / 레벨 */}
                    <div className="flex-1 grid grid-cols-2 gap-6">
                        {/* 하루 목표 */}
                        <div className="flex flex-col bg-white p-6 rounded-2xl border-2 border-[var(--color-sub-2)] shadow-md">
                            <h3 className="text-3xl font-bold mb-4">👊 나의 하루 목표는?</h3>
                            <div className="flex flex-col h-full border">
                                <DailyGoal />
                                {/* TODO: 목표 달성 표시 그래프 영역 */}
                                {/* <div className="flex-1 rounded-lg border h-full"></div> */}
                            </div>
                        </div>

                        {/* 레벨 현황 */}
                        <div className="flex flex-col bg-white p-6 rounded-2xl border-2 border-[var(--color-sub-2)] shadow-md">
                            <h3 className="text-3xl font-bold mb-4">🎓 나의 Level은?</h3>
                            <LevelBox
                                statistics={userInfo}
                                onStatisticsUpdate={(newStatistics) => setUserInfo(newStatistics)}
                            />
                            <div className="flex flex-1 flex-col ">
                                <div className="flex justify-between">
                                    <h4 className="font-semibold mb-2 text-3xl">
                                        📺 최근 시청 영상 <small>({watchHistoryList.length})</small>
                                    </h4>
                                    <Link href="/dashboard/video-learning">
                                        <button className="self-start mt-2 text-sm text-[var(--color-main)] font-bold">
                                            + 더보기
                                        </button>
                                    </Link>
                                </div>
                                <WatchHistory data={watchHistoryList} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 우측 패널 */}
                <section className="w-[400px] h-full flex flex-col gap-2 pl-4">
                    {/* 캘린더 */}
                    <div className="flex-1 bg-[var(--color-white)] rounded-2xl p-6 shadow-md flex flex-col">
                        <h3 className="text-lg font-bold mb-2">Calendar</h3>
                        <div className="flex-1">
                            <Calendar
                                mode="single"
                                className="w-full"
                                classNames={{
                                    months: 'flex flex-col w-full',
                                    month: 'space-y-4 w-full',
                                    caption: 'flex justify-center pt-1 relative items-center text-lg',
                                    caption_label: 'text-lg font-medium',
                                    nav: 'space-x-1 flex items-center',
                                    nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                                    nav_button_previous: 'absolute left-1',
                                    nav_button_next: 'absolute right-1',
                                    table: 'w-full border-collapse space-y-1',
                                    head_row: 'flex w-full justify-between',
                                    head_cell:
                                        'text-muted-foreground rounded-md w-10 text-center font-normal text-base',
                                    row: 'flex w-full mt-2 justify-between',
                                    cell: 'text-center text-base p-0 relative w-10 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                                    day: 'h-10 w-10 p-0 font-normal aria-selected:opacity-100',
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
                    <div className="flex-1 bg-white rounded-2xl p-6 shadow-md">
                        <h3 className="text-lg font-bold mb-3">Learning History</h3>
                        <LearningHistory />
                    </div>
                </section>
            </div>
        </div>
    )
}
