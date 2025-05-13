import { components } from '@/lib/backend/apiV1/schema'

type WordResponse = components['schemas']['WordResponse']

export const mockWords: WordResponse[] = [
    {
        word: 'apple',
        pos: 'noun',
        meaning: '사과',
        difficulty: 'EASY',
        exampleSentence: 'I eat an apple every day.',
        translatedSentence: '나는 매일 사과를 먹습니다.',
    },
    {
        word: 'beautiful',
        pos: 'adjective',
        meaning: '아름다운',
        difficulty: 'EASY',
        exampleSentence: 'She has a beautiful smile.',
        translatedSentence: '그녀는 아름다운 미소를 가지고 있습니다.',
    },
    {
        word: 'sophisticated',
        pos: 'adjective',
        meaning: '세련된, 정교한',
        difficulty: 'MEDIUM',
        exampleSentence: 'The restaurant has a sophisticated atmosphere.',
        translatedSentence: '그 레스토랑은 세련된 분위기를 가지고 있습니다.',
    },
    {
        word: 'procrastinate',
        pos: 'verb',
        meaning: '미루다, 지연하다',
        difficulty: 'HARD',
        exampleSentence: 'Stop procrastinating and start working!',
        translatedSentence: '미루는 것을 그만하고 일을 시작하세요!',
    },
    {
        word: 'serendipity',
        pos: 'noun',
        meaning: '우연한 발견, 행운',
        difficulty: 'HARD',
        exampleSentence: 'Meeting you here was pure serendipity.',
        translatedSentence: '여기서 당신을 만난 것은 순전한 행운이었습니다.',
    },
]
