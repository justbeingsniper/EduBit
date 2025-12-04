import { Link } from 'react-router-dom';
import type { MicroCourse } from '../types';

interface MicroCourseCardProps {
  course: MicroCourse;
}

export function MicroCourseCard({ course }: MicroCourseCardProps) {
  return (
    <Link
      to={`/course/${course.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border"
    >
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2">{course.title}</h3>
        {course.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">{course.reels.length} lessons</span>
          <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
            {course.difficulty_level}
          </span>
        </div>

        <div className="flex items-center text-sm text-blue-600 font-medium">
          Start Learning →
        </div>
      </div>
    </Link>
  );
}
