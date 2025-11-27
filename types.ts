export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  bannerUrl: string;
  videoUrl: string;
  duration: string;
  year: number;
  rating: string;
  genres: string[];
  views: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar: string;
  watchlist: string[]; // List of Movie IDs
}

export interface AnalyticsData {
  name: string;
  views: number;
  users: number;
}

export enum ViewMode {
  USER = 'USER',
  ADMIN = 'ADMIN'
}