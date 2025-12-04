import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMicroCourse, listReels } from '../../api/endpoints';
import type { Reel } from '../../types';

export function CreateCourse() {
  const navigate = useNavigate();
  const [myReels, setMyReels] = useState<Reel[]>([]);
  const [selectedReelIds, setSelectedReelIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'beginner',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyReels();
  }, []);

  const loadMyReels = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const reels = await listReels({ creator_id: user.id, limit: 100 });
      setMyReels(reels);
    } catch (err) {
      console.error('Failed to load reels');
    }
  };

  const toggleReel = (reelId: number) => {
    if (selectedReelIds.includes(reelId)) {
      setSelectedReelIds(selectedReelIds.filter((id) => id !== reelId));
    } else {
      setSelectedReelIds([...selectedReelIds, reelId]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedReelIds.length === 0) {
      setError('Please select at least one reel');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createMicroCourse({
        ...formData,
        reel_ids: selectedReelIds,
      });
      alert('Micro-course created successfully!');
      navigate('/courses');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Create Micro-Course</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Python Fundamentals in 5 Minutes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What will learners gain from this course?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">
              Select Reels ({selectedReelIds.length} selected)
            </h2>

            {myReels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You haven't created any reels yet.</p>
                <button
                  type="button"
                  onClick={() => navigate('/create-reel')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Reel
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {myReels.map((reel) => (
                  <label
                    key={reel.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReelIds.includes(reel.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedReelIds.includes(reel.id)}
                      onChange={() => toggleReel(reel.id)}
                      className="w-4 h-4 text-blue-600 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{reel.title}</div>
                      <div className="text-sm text-gray-500">{reel.duration_seconds}s</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || selectedReelIds.length === 0}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
