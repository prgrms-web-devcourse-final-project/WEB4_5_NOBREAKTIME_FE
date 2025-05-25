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

            <div className="flex flex-col w-full">
                {/* Hero Section */}
                <section className="bg-main min-h-[700px] flex flex-col md:flex-row justify-center items-center px-4 md:px-10 py-12 gap-10">
                    <Image
                        src="/assets/img-item01.png"
                        alt="item"
                        width={700}
                        height={500}
                        className="w-full max-w-[700px] h-auto"
                    />
                    <div className="flex flex-col gap-8 text-center md:text-left">
                        <p className="text-white text-2xl md:text-4xl font-bold">
                            좋아하는 <strong className="text-[var(--color-point)]">영상</strong>으로 배우는 언어
                        </p>
                        <h2 className="text-5xl md:text-7xl font-bold text-white">
                            <span className="text-[var(--color-point)]">말랑~</span> 하게 쉽게!
                        </h2>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <Image
                                src="/assets/line-arrow.svg"
                                alt="arrow"
                                width={300}
                                height={200}
                                className="hidden md:block"
                            />
                            <button
                                className="bg-[var(--color-point)] text-[var(--color-white)] text-[clamp(1rem,2vw,2rem)] text-xl md:text-2xl px-6 py-3 rounded-full font-bold"
                                onClick={() => router.push('/login')}
                            >
                                학습 바로가기
                            </button>
                        </div>
                    </div>
                </section>

                {/* Carousel Section */}
                <section className="flex flex-col gap-6 items-center text-center px-4 md:px-10 py-16">
                    <h3 className="text-[var(--color-black)] text-3xl md:text-5xl font-bold leading-snug">
                        쉽게 배우는 외국어, 자연스러운 말하기!
                    </h3>
                    <p className="text-[var(--color-black)] text-lg md:text-2xl font-medium">
                        그동안 어려웠던 언어의 재미! 말랑~ 하게 말하기도 단어도 한번에 잡자!
                    </p>

                    <div className="relative w-full max-w-[800px] h-[250px] md:h-[400px] overflow-hidden mt-6">
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
                                            className="rounded-xl shadow-lg object-cover w-[300px] md:w-[550px] h-auto"
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

                {/* Features Section */}
                <section className="flex flex-col md:flex-row gap-10 justify-center items-center px-4 md:px-20 py-16 bg-gradient-to-b from-[#F4F1FB] to-[#C8B8F1]">
                    <div className="flex flex-col gap-6 max-w-xl text-center md:text-left">
                        <p className="text-lg md:text-xl font-bold bg-[var(--color-main)] text-white rounded-full px-4 py-2 w-fit mx-auto md:mx-0">
                            실전 영어 학습
                        </p>
                        <h4 className="text-2xl md:text-4xl font-bold">
                            <span className="text-[var(--color-point)]">유튜브</span>에서 내가 좋아하는 영상으로
                        </h4>
                        <p className="text-2xl md:text-3xl font-bold">
                            쉽고 재미있게 <span className="text-[var(--color-point)]">외국어</span>를 배워요!
                        </p>
                        <ul className="mt-4 flex flex-col gap-3">
                            {features.map((text, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <Image src="/assets/check-fill.svg" width={30} height={30} alt="check" />
                                    <span className="text-lg md:text-xl text-[var(--color-black)]">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {benefits.map((item, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-md shadow p-4 flex flex-col items-center justify-center text-center w-[140px] md:w-[180px] h-[140px] md:h-[180px]"
                            >
                                <Image src={item.icon} alt={`icon-${i}`} width={40} height={40} />
                                <span className="mt-2 text-sm md:text-base font-bold">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    )
}
