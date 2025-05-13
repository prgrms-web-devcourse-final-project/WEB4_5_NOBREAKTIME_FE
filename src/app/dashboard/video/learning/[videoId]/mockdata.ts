import { components } from '@/lib/backend/apiV1/schema'

type AnalyzeVideoResponse = components['schemas']['AnalyzeVideoResponse']
type VideoLearningWordQuizListResponse = components['schemas']['VideoLearningWordQuizListResponse']

export const mockAnalysisData: AnalyzeVideoResponse = {
    subtitleResults: [
        {
            subtitleId: 1,
            startTime: '00:00:00',
            endTime: '00:00:05',
            speaker: 'Speaker 1',
            original: "Hello everyone! Today we're going to learn some useful English phrases.",
            transcript: '안녕하세요 여러분! 오늘은 유용한 영어 표현들을 배워보겠습니다.',
            keywords: [
                {
                    word: 'phrases',
                    meaning: '구문, 어구',
                    difficulty: 2,
                },
            ],
        },
        {
            subtitleId: 2,
            startTime: '00:00:05',
            endTime: '00:00:10',
            speaker: 'Speaker 1',
            original: "Let's start with some common expressions used in daily conversations.",
            transcript: '일상 대화에서 자주 사용되는 표현들부터 시작해보겠습니다.',
            keywords: [
                {
                    word: 'expressions',
                    meaning: '표현',
                    difficulty: 1,
                },
                {
                    word: 'conversations',
                    meaning: '대화',
                    difficulty: 1,
                },
            ],
        },
        {
            subtitleId: 3,
            startTime: '00:00:10',
            endTime: '00:00:15',
            speaker: 'Speaker 1',
            original: 'The first expression is "It\'s a piece of cake", which means something is very easy.',
            transcript: '첫 번째 표현은 "It\'s a piece of cake"입니다. 이는 무언가가 매우 쉽다는 의미입니다.',
            keywords: [
                {
                    word: 'piece of cake',
                    meaning: '식은 죽 먹기, 아주 쉬운 일',
                    difficulty: 3,
                },
            ],
        },
    ],
}

export const mockQuizData: VideoLearningWordQuizListResponse = {
    quiz: [
        {
            subtitleId: 1,
            startTime: '00:00:00',
            endTime: '00:00:05',
            speaker: 'Speaker 1',
            word: 'phrases',
            meaning: '구문, 어구',
            sentence: "Today we're going to learn some useful English {}.",
            sentenceMeaning: '오늘은 유용한 영어 구문들을 배워보겠습니다.',
        },
        {
            subtitleId: 2,
            startTime: '00:00:05',
            endTime: '00:00:10',
            speaker: 'Speaker 1',
            word: 'expressions',
            meaning: '표현',
            sentence: "Let's start with some common {} used in daily conversations.",
            sentenceMeaning: '일상 대화에서 자주 사용되는 표현들부터 시작해보겠습니다.',
        },
        {
            subtitleId: 3,
            startTime: '00:00:10',
            endTime: '00:00:15',
            speaker: 'Speaker 1',
            word: 'piece of cake',
            meaning: '식은 죽 먹기, 아주 쉬운 일',
            sentence: "It's a {} means something is very easy.",
            sentenceMeaning: "'It's a piece of cake'는 무언가가 매우 쉽다는 의미입니다.",
        },
    ],
}
