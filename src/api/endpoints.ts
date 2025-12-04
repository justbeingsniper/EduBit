import { apiClient } from './client';
import type {
  User,
  AuthToken,
  Reel,
  MicroCourse,
  Playlist,
  Progress,
  CourseProgress,
  Comment,
  Summary,
  Quiz,
} from '../types';

// ========== Auth ==========
export const register = async (email: string, password: string, full_name: string, role: string): Promise<AuthToken> => {
  const response = await apiClient.post('/auth/register', { email, password, full_name, role });
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthToken> => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// ========== Reels ==========
export const uploadReel = async (formData: FormData): Promise<Reel> => {
  const response = await apiClient.post('/reels/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createReel = async (data: {
  title: string;
  description?: string;
  video_url: string;
  tags?: string;
  difficulty_level: string;
  duration_seconds: number;
}): Promise<Reel> => {
  const response = await apiClient.post('/reels/', data);
  return response.data;
};

export const fetchFeed = async (params?: {
  limit?: number;
  offset?: number;
  tags?: string;
  difficulty?: string;
}): Promise<Reel[]> => {
  const response = await apiClient.get('/reels/feed', { params });
  return response.data;
};

export const getReel = async (id: number): Promise<Reel> => {
  const response = await apiClient.get(`/reels/${id}`);
  return response.data;
};

export const listReels = async (params?: {
  limit?: number;
  offset?: number;
  creator_id?: number;
}): Promise<Reel[]> => {
  const response = await apiClient.get('/reels/', { params });
  return response.data;
};

// ========== Micro-Courses ==========
export const createMicroCourse = async (data: {
  title: string;
  description?: string;
  difficulty_level: string;
  reel_ids: number[];
}): Promise<MicroCourse> => {
  const response = await apiClient.post('/courses/', data);
  return response.data;
};

export const getMicroCourse = async (id: number): Promise<MicroCourse> => {
  const response = await apiClient.get(`/courses/${id}`);
  return response.data;
};

export const listMicroCourses = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<MicroCourse[]> => {
  const response = await apiClient.get('/courses/', { params });
  return response.data;
};

// ========== Playlists ==========
export const createPlaylist = async (data: {
  title: string;
  description?: string;
}): Promise<Playlist> => {
  const response = await apiClient.post('/playlists/', data);
  return response.data;
};

export const addReelToPlaylist = async (
  playlistId: number,
  reelId: number
): Promise<Playlist> => {
  const response = await apiClient.post(`/playlists/${playlistId}/reels`, { reel_id: reelId });
  return response.data;
};

export const getMyPlaylists = async (): Promise<Playlist[]> => {
  const response = await apiClient.get('/playlists/');
  return response.data;
};

export const getPlaylist = async (id: number): Promise<Playlist> => {
  const response = await apiClient.get(`/playlists/${id}`);
  return response.data;
};

// ========== Progress ==========
export const markProgress = async (data: {
  reel_id?: number;
  course_id?: number;
  completed: boolean;
}): Promise<Progress> => {
  const response = await apiClient.post('/progress/', data);
  return response.data;
};

export const getCourseProgress = async (courseId: number): Promise<CourseProgress> => {
  const response = await apiClient.get(`/progress/course/${courseId}`);
  return response.data;
};

export const getMyProgress = async (): Promise<Progress[]> => {
  const response = await apiClient.get('/progress/');
  return response.data;
};

// ========== Comments ==========
export const createComment = async (data: {
  content: string;
  reel_id: number;
}): Promise<Comment> => {
  const response = await apiClient.post('/comments/', data);
  return response.data;
};

export const getReelComments = async (reelId: number): Promise<Comment[]> => {
  const response = await apiClient.get(`/comments/reel/${reelId}`);
  return response.data;
};

// ========== AI ==========
export const getSummary = async (data: {
  reel_id?: number;
  course_id?: number;
}): Promise<Summary> => {
  const response = await apiClient.post('/ai/summary', data);
  return response.data;
};

export const getQuiz = async (data: {
  reel_id?: number;
  course_id?: number;
}): Promise<Quiz> => {
  const response = await apiClient.post('/ai/quiz', data);
  return response.data;
};
