// mockAnalysisData.ts

import { Keyword, SubtitleResult, AnalysisData } from '@/types/video'

export const mockAnalysisData: AnalysisData = {
    subtitleResults: [
        {
            startTime: '00:00:00',
            endTime: '00:00:05',
            speaker: 'Speaker 1',
            original: 'Hello and welcome to this tutorial on how to learn a new language effectively.',
            transcript: '안녕하세요, 효과적으로 새 언어를 배우는 방법에 대한 이 튜토리얼에 오신 것을 환영합니다.',
            keywords: [
                {
                    word: 'effectively',
                    meaning: '효과적으로',
                    difficulty: 2,
                },
                {
                    word: 'tutorial',
                    meaning: '튜토리얼, 학습서',
                    difficulty: 1,
                },
            ],
        },
        {
            startTime: '00:00:05',
            endTime: '00:00:10',
            speaker: 'Speaker 1',
            original:
                "Today, I'll share with you some strategies that have helped thousands of language learners around the world.",
            transcript: '오늘은 전 세계 수천 명의 언어 학습자들에게 도움이 된 몇 가지 전략을 공유하겠습니다.',
            keywords: [
                {
                    word: 'strategies',
                    meaning: '전략, 방법론',
                    difficulty: 2,
                },
                {
                    word: 'learners',
                    meaning: '학습자들',
                    difficulty: 1,
                },
            ],
        },
        {
            startTime: '00:00:10',
            endTime: '00:00:15',
            speaker: 'Speaker 1',
            original:
                'Learning a new language can seem intimidating at first, but with the right approach, it can be an enjoyable journey.',
            transcript:
                '새로운 언어를 배우는 것은 처음에는 어렵게 느껴질 수 있지만, 올바른 접근법으로 즐거운 여정이 될 수 있습니다.',
            keywords: [
                {
                    word: 'intimidating',
                    meaning: '위협적인, 두려운',
                    difficulty: 3,
                },
                {
                    word: 'approach',
                    meaning: '접근법, 방식',
                    difficulty: 2,
                },
                {
                    word: 'journey',
                    meaning: '여정',
                    difficulty: 1,
                },
            ],
        },
        {
            startTime: '00:00:15',
            endTime: '00:00:20',
            speaker: 'Speaker 1',
            original:
                "The first principle of effective language learning is consistency. It's better to study for 20 minutes every day than 2 hours once a week.",
            transcript:
                '효과적인 언어 학습의 첫 번째 원칙은 일관성입니다. 일주일에 한 번 2시간을 공부하는 것보다 매일 20분씩 공부하는 것이 더 좋습니다.',
            keywords: [
                {
                    word: 'principle',
                    meaning: '원칙, 원리',
                    difficulty: 2,
                },
                {
                    word: 'consistency',
                    meaning: '일관성',
                    difficulty: 2,
                },
            ],
        },
        {
            startTime: '00:00:20',
            endTime: '00:00:25',
            speaker: 'Speaker 1',
            original:
                'Second, immerse yourself in the language as much as possible. Listen to podcasts, watch movies, or read books in your target language.',
            transcript:
                '둘째, 가능한 한 언어에 자신을 최대한 몰입시키세요. 팟캐스트를 듣거나, 영화를 보거나, 목표 언어로 된 책을 읽으세요.',
            keywords: [
                {
                    word: 'immerse',
                    meaning: '몰입시키다',
                    difficulty: 3,
                },
                {
                    word: 'target language',
                    meaning: '목표 언어',
                    difficulty: 2,
                },
            ],
        },
        {
            startTime: '00:00:25',
            endTime: '00:00:30',
            speaker: 'Speaker 1',
            original:
                'Third, focus on high-frequency words. In most languages, just 1,000 words cover about 80% of everyday conversations.',
            transcript:
                '셋째, 고빈도 단어에 집중하세요. 대부분의 언어에서 단 1,000개의 단어가 일상 대화의 약 80%를 차지합니다.',
            keywords: [
                {
                    word: 'high-frequency',
                    meaning: '고빈도, 자주 사용되는',
                    difficulty: 2,
                },
                {
                    word: 'cover',
                    meaning: '차지하다, 포함하다',
                    difficulty: 1,
                },
            ],
        },
        {
            startTime: '00:00:30',
            endTime: '00:00:35',
            speaker: 'Speaker 1',
            original:
                'Fourth, practice with native speakers whenever possible. Language exchange apps can connect you with speakers around the world.',
            transcript: '넷째, 가능하면 원어민과 연습하세요. 언어 교환 앱을 통해 전 세계 화자들과 연결될 수 있습니다.',
            keywords: [
                {
                    word: 'native speakers',
                    meaning: '원어민',
                    difficulty: 1,
                },
                {
                    word: 'language exchange',
                    meaning: '언어 교환',
                    difficulty: 2,
                },
            ],
        },
        {
            startTime: '00:00:35',
            endTime: '00:00:40',
            speaker: 'Speaker 1',
            original:
                'Fifth, make mistakes and learn from them. Fear of making errors is the biggest obstacle to language fluency.',
            transcript:
                '다섯째, 실수를 하고 그로부터 배우세요. 실수에 대한 두려움은 언어 유창성의 가장 큰 장애물입니다.',
            keywords: [
                {
                    word: 'obstacle',
                    meaning: '장애물',
                    difficulty: 2,
                },
                {
                    word: 'fluency',
                    meaning: '유창성',
                    difficulty: 3,
                },
            ],
        },
        {
            startTime: '00:00:40',
            endTime: '00:00:45',
            speaker: 'Speaker 1',
            original:
                'Sixth, use spaced repetition systems to review vocabulary efficiently. Apps like Anki can help manage this process.',
            transcript:
                '여섯째, 어휘를 효율적으로 복습하기 위해 간격 반복 시스템을 사용하세요. Anki와 같은 앱이 이 과정을 관리하는 데 도움이 될 수 있습니다.',
            keywords: [
                {
                    word: 'spaced repetition',
                    meaning: '간격 반복',
                    difficulty: 3,
                },
                {
                    word: 'efficiently',
                    meaning: '효율적으로',
                    difficulty: 2,
                },
            ],
        },
        {
            startTime: '00:00:45',
            endTime: '00:00:50',
            speaker: 'Speaker 1',
            original:
                "Finally, set specific, achievable goals. Instead of saying 'I want to learn Spanish,' say 'I want to have a 5-minute conversation in Spanish by next month.'",
            transcript:
                "마지막으로, 구체적이고 달성 가능한 목표를 설정하세요. '스페인어를 배우고 싶다'라고 말하는 대신, '다음 달까지 스페인어로 5분 대화를 나누고 싶다'라고 말하세요.",
            keywords: [
                {
                    word: 'specific',
                    meaning: '구체적인',
                    difficulty: 2,
                },
                {
                    word: 'achievable',
                    meaning: '달성 가능한',
                    difficulty: 2,
                },
            ],
        },
        {
            startTime: '00:00:50',
            endTime: '00:00:55',
            speaker: 'Speaker 1',
            original:
                'Remember, language learning is a marathon, not a sprint. Enjoy the process and celebrate small victories along the way.',
            transcript:
                '기억하세요, 언어 학습은 단거리 경주가 아니라 마라톤입니다. 과정을 즐기고 작은 승리를 축하하세요.',
            keywords: [
                {
                    word: 'marathon',
                    meaning: '마라톤',
                    difficulty: 1,
                },
                {
                    word: 'sprint',
                    meaning: '단거리 경주',
                    difficulty: 2,
                },
                {
                    word: 'victories',
                    meaning: '승리, 성취',
                    difficulty: 2,
                },
            ],
        },
        {
            startTime: '00:00:55',
            endTime: '00:01:00',
            speaker: 'Speaker 1',
            original:
                "In the next video, we'll explore specific techniques for improving your pronunciation. Thank you for watching!",
            transcript:
                '다음 비디오에서는 발음을 향상시키기 위한 구체적인 기술을 살펴보겠습니다. 시청해 주셔서 감사합니다!',
            keywords: [
                {
                    word: 'techniques',
                    meaning: '기술, 테크닉',
                    difficulty: 2,
                },
                {
                    word: 'pronunciation',
                    meaning: '발음',
                    difficulty: 2,
                },
            ],
        },
    ],
}
