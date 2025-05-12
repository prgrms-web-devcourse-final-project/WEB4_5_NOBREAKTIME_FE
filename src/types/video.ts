export interface VideoData {
    videoId?: string
    title?: string
    description?: string
    thumbnailUrl?: string | null
}

export interface Keyword {
    word?: string
    meaning?: string
    difficulty?: number
}

export interface SubtitleResult {
    startTime?: string
    endTime?: string
    speaker?: string
    original?: string
    transcript?: string
    keywords?: Keyword[]
}

export interface AnalysisData {
    subtitleResults?: SubtitleResult[]
}

export interface WordQuizType {
    subtitleId?: number
    startTime?: string
    endTime?: string
    speaker?: string
    word?: string
    meaning?: string
    sentence?: string
    sentenceMeaning?: string
    isCorrect?: boolean
}

export interface WordQuizResult {
    word: string
    meaning?: string
    isCorrect: boolean
}

export interface WordQuizProps {
    fontSize: number
    videoId: string
    onQuizResult?: (results: WordQuizResult[]) => void
    wordQuizData?: WordQuizType[]
}

export interface ExpressionQuizType {
    expressionQuizItemId?: number
    question?: string
    original?: string
    choices?: string[]
    meaning?: string
}

export interface ExpressionQuizProps {
    fontSize: number
    videoId: string
}
