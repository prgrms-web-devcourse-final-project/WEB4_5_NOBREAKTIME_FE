import { components } from '@/lib/backend/apiV1/schema'

type VideoResponse = components['schemas']['VideoResponse']

// 비디오 제목과 설명을 생성하는 함수
const generateVideoData = (index: number): VideoResponse => {
    const categories = ['노래', '드라마', '영화', '뉴스', '교육']
    const category = categories[index % categories.length]

    return {
        videoId: `video${index}`,
        title: `${category} - 학습 비디오 ${index + 1}`,
        description: `이것은 ${category} 카테고리의 ${
            index + 1
        }번째 학습 비디오입니다. 영어 학습에 도움이 되는 내용을 담고 있습니다.`,
        thumbnailUrl: `https://picsum.photos/seed/${index}/400/300`,
        bookmarked: index % 3 === 0, // 3의 배수 인덱스만 북마크 설정
    }
}

// 50개의 비디오 데이터 생성
export const mockVideoList: VideoResponse[] = Array.from({ length: 50 }, (_, index) => generateVideoData(index))
