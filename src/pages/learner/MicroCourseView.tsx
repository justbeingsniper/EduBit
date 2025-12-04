import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMicroCourse, getCourseProgress, markProgress } from '../../api/endpoints';
import { ReelCard } from '../../components/ReelCard';
import { Loader } from '../../components/Loader';
import type { MicroCourse, CourseProgress } from '../../types';

export function MicroCourseView() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<MicroCourse | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCourse();
      loadProgress();
    }
  }, [id]);

  const loadCourse = async () => {
    try {
      const data = await getMicroCourse(Number(id));
      setCourse(data);
    } catch (err) {
      console.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const data = await getCourseProgress(Number(id));
      setProgress(data);
    } catch (err) {
      console.error('Failed to load progress');
    }
  };

  if (loading) return <Loader />;
  if (!course) return <div className="p-8 text-center">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-gray-600 mb-6">{course.description}</p>

          {progress && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="font-medium">{progress.completion_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${progress.completion_percentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {progress.completed_reels} of {progress.total_reels} lessons completed
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{course.reels.length} lessons</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium capitalize">
              {course.difficulty_level}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Course Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {course.reels.map((reel, index) => (
            <div key={reel.id}>
              <div className="text-sm font-medium text-gray-500 mb-2">Lesson {index + 1}</div>
              <ReelCard reel={reel} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
