import { components } from '@/lib/backend/apiV1/schema'

type VideoResponse = components['schemas']['VideoResponse']

export const mockVideoList: VideoResponse[] = [
    {
        videoId: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
        description:
            'The official music video for "Never Gonna Give You Up" by Rick Astley. Learn English with this classic pop song!',
        thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        bookmarked: false,
    },
    {
        videoId: 'dhYOPzcsbGM',
        title: 'Friends - The Best Moments (Season 1)',
        description: 'Learn English with Friends! Watch the best moments from Season 1 of the hit TV show Friends.',
        thumbnailUrl: 'https://i.ytimg.com/vi/dhYOPzcsbGM/maxresdefault.jpg',
        bookmarked: true,
    },
    {
        videoId: 'kVOnsGM_dm8',
        title: "Harry Potter and the Philosopher's Stone - Official Trailer",
        description:
            'Watch the magical trailer of Harry Potter and improve your English vocabulary and listening skills.',
        thumbnailUrl: 'https://i.ytimg.com/vi/kVOnsGM_dm8/maxresdefault.jpg',
        bookmarked: false,
    },
    {
        videoId: 'jNQXAC9IVRw',
        title: 'TED Talk: The Power of Vulnerability',
        description: 'Improve your English while learning about personal growth with this inspiring TED Talk.',
        thumbnailUrl: 'https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
        bookmarked: true,
    },
    {
        videoId: 'M7lc1UVf-VE',
        title: 'BBC News - Global Climate Change Report',
        description: 'Stay updated with current events while practicing your English listening skills with BBC News.',
        thumbnailUrl: 'https://i.ytimg.com/vi/M7lc1UVf-VE/maxresdefault.jpg',
        bookmarked: false,
    },
]
