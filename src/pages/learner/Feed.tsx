import { useEffect, useState } from 'react';
import { fetchFeed } from '../../api/endpoints';
import { ReelCard } from '../../components/ReelCard';
import { Loader } from '../../components/Loader';
import type { Reel } from '../../types';

export function Feed() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    tags: '',
    difficulty: '',
  });

  useEffect(() => {
    loadFeed();
  }, [filters]);

  const loadFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchFeed({
        limit: 50,
        tags: filters.tags || undefined,
        difficulty: filters.difficulty || undefined,
      });
      setReels(data);
    } catch (err: any) {
      setError('Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Feed</h1>
          <p className="text-gray-600">Personalized educational reels based on your interests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by tags
            </label>
            <input
              type="text"
              placeholder="e.g., python, javascript"
              value={filters.tags}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty level
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && <Loader />}

        {/* Feed Grid */}
        {!loading && reels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reels.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && reels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No reels found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
