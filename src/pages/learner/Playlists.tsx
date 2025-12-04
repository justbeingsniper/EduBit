import { useEffect, useState, FormEvent } from 'react';
import { getMyPlaylists, createPlaylist, listMicroCourses } from '../../api/endpoints';
import { PlaylistCard } from '../../components/PlaylistCard';
import { MicroCourseCard } from '../../components/MicroCourseCard';
import { Loader } from '../../components/Loader';
import type { Playlist, MicroCourse } from '../../types';

export function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [courses, setCourses] = useState<MicroCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [playlistsData, coursesData] = await Promise.all([
        getMyPlaylists(),
        listMicroCourses({ limit: 20 }),
      ]);
      setPlaylists(playlistsData);
      setCourses(coursesData);
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createPlaylist({ title: newTitle, description: newDescription });
      setShowModal(false);
      setNewTitle('');
      setNewDescription('');
      loadData();
    } catch (err) {
      console.error('Failed to create playlist');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Playlists Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Playlists</h1>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Playlist
            </button>
          </div>

          {playlists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No playlists yet. Create your first playlist!
            </div>
          )}
        </div>

        {/* Micro-Courses Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Micro-Courses</h2>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <MicroCourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No courses available yet.</div>
          )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Playlist</h2>
            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
