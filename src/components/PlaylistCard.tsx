import { Link } from 'react-router-dom';
import type { Playlist } from '../types';

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link
      to={`/playlist/${playlist.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border"
    >
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2">{playlist.title}</h3>
        {playlist.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">{playlist.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{playlist.reels.length} reels</span>
          <span className="text-sm text-blue-600 font-medium">View →</span>
        </div>
      </div>
    </Link>
  );
}
