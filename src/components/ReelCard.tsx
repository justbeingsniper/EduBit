import { Link } from 'react-router-dom';
import type { Reel } from '../types';
import { TagBadge } from './TagBadge';
import { Play, Clock, Eye } from 'lucide-react';

interface ReelCardProps {
  reel: Reel;
}

export function ReelCard({ reel }: ReelCardProps) {
  const tags = reel.tags ? reel.tags.split(',').map((t) => t.trim()) : [];

  return (
    <Link
      to={`/reel/${reel.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Video Thumbnail/Preview */}
      <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden group">
        <video
          src={reel.video_url}
          className="w-full h-full object-cover"
          preload="metadata"
          poster={`${reel.video_url}#t=0.1`}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
          <Play className="h-16 w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {reel.duration_seconds}s
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2">{reel.title}</h3>

        {reel.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{reel.description}</p>
        )}

        {/* Creator & Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{reel.creator_name}</span>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {reel.views_count}
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, idx) => (
              <TagBadge key={idx} tag={tag} />
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500">+{tags.length - 3}</span>
            )}
          </div>
        )}

        {/* AI Badge */}
        {reel.ai_summary && (
          <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
            ✨ AI Enhanced
          </div>
        )}
      </div>
    </Link>
  );
}
