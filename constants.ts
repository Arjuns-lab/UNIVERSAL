import { Movie, AnalyticsData } from './types';

export const MOCK_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Interstellar Horizons',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    posterUrl: 'https://picsum.photos/300/450?random=1',
    bannerUrl: 'https://picsum.photos/1200/600?random=1',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '2h 49m',
    year: 2014,
    rating: 'PG-13',
    genres: ['Sci-Fi', 'Adventure'],
    views: 1250000
  },
  {
    id: '2',
    title: 'Neon Cyberpunk',
    description: 'In a future world where technology exists in harmony with society, a hacker discovers a conspiracy.',
    posterUrl: 'https://picsum.photos/300/450?random=2',
    bannerUrl: 'https://picsum.photos/1200/600?random=2',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '1h 55m',
    year: 2077,
    rating: 'R',
    genres: ['Action', 'Sci-Fi'],
    views: 890000
  },
  {
    id: '3',
    title: 'The Last Kingdom',
    description: 'A historical drama about the unification of a fractured kingdom.',
    posterUrl: 'https://picsum.photos/300/450?random=3',
    bannerUrl: 'https://picsum.photos/1200/600?random=3',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '2h 10m',
    year: 2023,
    rating: 'TV-MA',
    genres: ['Drama', 'History'],
    views: 450000
  },
  {
    id: '4',
    title: 'Ocean\'s Mystery',
    description: 'Documentary exploring the deepest parts of the ocean never seen before.',
    posterUrl: 'https://picsum.photos/300/450?random=4',
    bannerUrl: 'https://picsum.photos/1200/600?random=4',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '1h 30m',
    year: 2024,
    rating: 'G',
    genres: ['Documentary', 'Nature'],
    views: 120000
  },
  {
    id: '5',
    title: 'Midnight Heist',
    description: 'A group of elite thieves plan the biggest bank robbery in history.',
    posterUrl: 'https://picsum.photos/300/450?random=5',
    bannerUrl: 'https://picsum.photos/1200/600?random=5',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    duration: '2h 05m',
    year: 2022,
    rating: 'R',
    genres: ['Action', 'Thriller'],
    views: 670000
  }
];

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { name: 'Mon', views: 4000, users: 2400 },
  { name: 'Tue', views: 3000, users: 1398 },
  { name: 'Wed', views: 2000, users: 9800 },
  { name: 'Thu', views: 2780, users: 3908 },
  { name: 'Fri', views: 1890, users: 4800 },
  { name: 'Sat', views: 2390, users: 3800 },
  { name: 'Sun', views: 3490, users: 4300 },
];