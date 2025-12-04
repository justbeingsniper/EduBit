export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: string;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Reel {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  cloudinary_public_id?: string;
  tags?: string;
  difficulty_level: string;
  duration_seconds: number;
  creator_id: number;
  creator_name?: string;
  created_at: string;
  views_count: number;
  ai_summary?: string;
  ai_key_points?: string[];
  ai_quiz?: {
    questions: QuizQuestion[];
  };
}

export interface MicroCourse {
  id: number;
  title: string;
  description?: string;
  difficulty_level: string;
  creator_id: number;
  created_at: string;
  reels: Reel[];
}

export interface Playlist {
  id: number;
  title: string;
  description?: string;
  user_id: number;
  created_at: string;
  reels: Reel[];
}

export interface Progress {
  id: number;
  user_id: number;
  reel_id?: number;
  course_id?: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface CourseProgress {
  course_id: number;
  total_reels: number;
  completed_reels: number;
  completion_percentage: number;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  reel_id: number;
  created_at: string;
  user_name?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
}

export interface Summary {
  summary: string;
  key_points: string[];
}

export interface Quiz {
  questions: QuizQuestion[];
}
