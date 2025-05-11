'use client'

import { useRouter } from 'next/navigation'
import MainHeader from '@/components/layout/mainHeader'
import Footer from '@/components/layout/footer'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const benefits = [
    { icon: '/assets/play.svg', text: '관심 영상 기반 학습' },
    { icon: '/assets/abc.svg', text: '학습 맞춤 단어장' },
    { icon: '/assets/qna.svg', text: '퀴즈를 통한 레벨업' },
    { icon: '/assets/p.svg', text: '진도율 확인' },
]

const features = [
    '영상 위주의 학습으로 지루하지 않고 재미있게!',
    '5,000개 이상의 단어 학습으로 기초 탄탄!',
    '다양한 퀴즈로 나의 레벨 체크하며 목표율까지 도달!',
]

const images = ['/img/image1.jpg', '/img/image2.jpg', '/img/image3.jpg', '/img/image4.jpg']

export default function Home() {
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    return (
        <main className="bg-[var(--color-sub-2)] h-screen flex flex-col overflow-y-auto font-[Maplestory]">
            <MainHeader />

            <div className="flex flex-col">
                <section className="bg-main h-[800px] flex justify-center items-center px-10">
                    <Image src="/assets/img-item01.png" alt="item" width={700} height={500} />
                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-10">
                            <p className="text-[var(--color-white)] text-4xl font-bold">
                                좋아하는 <strong className="text-[var(--color-point)]">영상</strong>으로 배우는 언어
                            </p>
                            <div className="text-8xl font-bold">
                                <span className="text-[var(--color-point)]">말랑~</span>{' '}
                                <span className="text-[var(--color-white)]">하게 쉽게!</span>
                            </div>
                        </div>
                        <div className="flex gap-10 items-center">
                            <Image src="/assets/line-arrow.svg" alt="arrow" width={700} height={500} />
                            <button
                                className="bg-[var(--color-point)] text-[var(--color-white)] min-w-[300px] text-4xl font-bold rounded-full px-10 py-5"
                                onClick={() => router.push('/login')}
                            >
                                학습 바로가기
                            </button>
                        </div>
                    </div>
                </section>

                {/* 캐러셀 슬라이더 */}
                <section className="flex flex-col gap-10 justify-center items-center text-center h-[600px] px-10">
                    <h3 className="text-[var(--color-black)] text-7xl font-bold leading-snug">
                        쉽게 배우는 영단어, 자연스러운 말하기!
                    </h3>
                    <p className="text-[var(--color-black)] text-2xl font-bold">
                        그동안 어려웠던 언어의 재미! 말랑~ 하게 말하기도 단어도 한번에 잡자!
                    </p>

                    <div className="relative w-[800px] h-[400px] overflow-hidden">
                        <div className="relative w-full h-full flex justify-center items-center">
                            {images.map((src, idx) => {
                                const offset = idx - currentIndex
                                const position =
                                    offset === 0
                                        ? { left: '50%', scale: 1.2, opacity: 1, zIndex: 10, blur: '0px', y: '0px' }
                                        : offset === -1 || offset === images.length - 1
                                        ? { left: '30%', scale: 0.65, opacity: 0.6, zIndex: 5, blur: '1px', y: '20px' }
                                        : offset === 1 || offset === -(images.length - 1)
                                        ? { left: '70%', scale: 1.5, opacity: 0.7, zIndex: 5, blur: '0.5px', y: '10px' }
                                        : { left: '50%', scale: 0.5, opacity: 0, zIndex: 1, blur: '2px', y: '0px' }

                                return (
                                    <div
                                        key={idx}
                                        className="absolute transition-all duration-700 ease-in-out"
                                        style={{
                                            left: position.left,
                                            transform: `translateX(-50%) scale(${position.scale}) translateY(${position.y})`,
                                            opacity: position.opacity,
                                            zIndex: position.zIndex,
                                            filter: `blur(${position.blur})`,
                                        }}
                                        onClick={() => goToSlide(idx)}
                                    >
                                        <Image
                                            src={src}
                                            alt={`slide-${idx}`}
                                            width={550}
                                            height={350}
                                            className="rounded-xl shadow-lg object-cover"
                                            priority={idx === currentIndex}
                                        />
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-2 mt-8">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => goToSlide(idx)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        currentIndex === idx ? 'bg-orange-400 w-6' : 'bg-purple-200'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* 장점 섹션 */}
                <section className="flex flex-row gap-40 justify-center items-center h-[600px] w-full px-20 bg-gradient-to-b from-[#F4F1FB] to-[#C8B8F1]">
                    <div className="flex flex-col gap-10 max-w-[600px]">
                        <p className="text-2xl font-bold bg-[var(--color-main)] rounded-full text-white text-center py-3 px-6 w-fit">
                            실전 영어 학습
                        </p>
                        <p className="text-3xl font-bold">
                            <strong className="text-[var(--color-point)]">유튜브</strong>에서 내가 좋아하는 영상으로
                        </p>
                        <p className="text-3xl font-bold">
                            쉽고 재미있게 <strong className="text-[var(--color-point)]">외국어</strong>를 배워요!
                        </p>

                        <ul className="flex flex-col gap-5">
                            {features.map((text, idx) => (
                                <li key={idx} className="flex items-center gap-5">
                                    <Image src="/assets/check-fill.svg" width={40} height={40} alt="check" />
                                    <p className="text-2xl font-bold text-[var(--color-black)]">{text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        {benefits.map((item, i) => (
                            <div
                                key={i}
                                className="flex flex-col gap-5 bg-[var(--color-white)] rounded-sm w-[200px] h-[200px] justify-center items-center shadow"
                            >
                                <Image src={item.icon} alt={`icon-${i}`} width={60} height={60} />
                                <span className="text-center text-lg font-bold">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    )
}
