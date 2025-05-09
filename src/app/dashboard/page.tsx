'use client'

import DailySelector from '@/components/dashboard/dailySelector'
import LearningHistory from '@/components/dashboard/learningHistory'
import LevelBox from '@/components/dashboard/levelBox'
import WatchHistory from '@/components/dashboard/watchHistory'
import Header from '@/components/layout/header'
import Nav from '@/components/layout/nav'
import { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type VideoHistoryResponse = components['schemas']['VideoHistoryResponse']
type StatisticResponse = components['schemas']['StatisticResponse']

function Dashboard() {
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
        <div className="flex min-h-screen">
            <Nav />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex flex-1 px-12 py-4 overflow-hidden">
                    {/* 본문 좌측: 인사말 + 목표 + 레벨 */}
                    <section className="flex-1 flex flex-col gap-6 overflow-auto border-r-2 border-[var(--color-sub-2)] pr-4">
                        {/* 인사말 + 오늘의 학습 */}
                        <div className="h-80 bg-white rounded-2xl flex justify-between items-center px-8 py-6 shadow-md border-2 border-[var(--color-sub-2)]">
                            <div>
                                <h2 className="text-5xl font-bold text-[var(--color-black)] mb-2">
                                    반가워요,{' '}
                                    <span className="text-[var(--color-point)]">
                                        {userInfo?.userName || loginMember.nickname}
                                    </span>
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
                                <button className="mt-4 px-4 py-2 text-lg text-[var(--color-point)] bg-[var(--color-main)] rounded-full">
                                    Today's Study →
                                </button>
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
                                <div className="flex flex-col h-full ">
                                    <DailySelector />
                                    {/* TODO: 목표 달성 표시 그래프 영역 */}
                                    <div className="flex-1 bg-gray-100 rounded-lg bg-gray-200"></div>
                                </div>
                            </div>

                            {/* 레벨 현황 */}
                            <div className="flex flex-col bg-white p-6 rounded-2xl border-2 border-[var(--color-sub-2)] shadow-md">
                                <h3 className="text-3xl font-bold mb-4">🎓 나의 Level은?</h3>
                                <LevelBox />
                                <div className="flex flex-1 flex-col ">
                                    <div className="flex justify-between">
                                        <h4 className="font-semibold mb-2 text-3xl">
                                            📺 최근 시청 영상 <small>({watchHistoryList.length})</small>
                                        </h4>
                                        <Link href="/video">
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
                    <section className="flex flex-col w-100 space-y-6 pl-4">
                        {/* 캘린더 */}
                        <div className="flex-1 bg-[var(--color-white)] rounded-2xl p-6 shadow-md flex flex-col">
                            <h3 className="text-lg font-bold mb-2">Calendar</h3>
                            {/* TODO: 캘린더 영역 */}
                            <div className="bg-gray-100 rounded-lg p-4 h-full"></div>
                        </div>

                        {/* 학습 기록 */}
                        <div className="flex-1 bg-white rounded-2xl p-6 shadow-md">
                            <h3 className="text-lg font-bold mb-3">Learning History</h3>
                            <LearningHistory />
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}

export default Dashboard
