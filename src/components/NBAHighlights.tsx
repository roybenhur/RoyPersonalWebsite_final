import { useState } from 'react';
import { Play, ExternalLink, X } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { AvdijaStats } from '@/components/AvdijaStats';
import { nbaWeeklyVideos, deniAvdijaVideos, type YouTubeVideo } from '@/data/content';

export function NBAHighlights() {
  const nbaRef = useReveal<HTMLElement>();
  const avdijaRef = useReveal<HTMLElement>();
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  const openVideo = (video: YouTubeVideo) => setSelectedVideo(video);
  const closeVideo = () => setSelectedVideo(null);

  return (
    <>
      <section id="nba" ref={nbaRef} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-950 via-neutral-900/50 to-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="reveal text-center mb-16">
            <p className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-3">Weekly Roundup</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">NBA Weekly Highlights</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Catch up on the best moments from around the league each week. Click any video to watch it right here.
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-red-600 to-orange-400 mx-auto rounded-full mt-4" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nbaWeeklyVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => openVideo(video)}
                delay={index * 0.08}
                badge="NBA"
                badgeColor="bg-blue-600"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Deni Avdija section */}
      <section id="avdija" ref={avdijaRef} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto">
          <div className="reveal text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/30 mb-4">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-400">Special Feature</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Deni Avdija <span className="gradient-text">Highlights</span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              A dedicated collection of the best Deni Avdija moments — from his breakout performances to season-high scoring nights. The pride of Israeli basketball in the NBA.
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-red-600 to-orange-400 mx-auto rounded-full mt-4" />
          </div>

          {/* Live Season Stats */}
          <AvdijaStats />

          {/* Deni Avdija highlight videos — 4 in a row */}
          <div className="reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {deniAvdijaVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => openVideo(video)}
                delay={index * 0.1}
                badge="Avdija"
                badgeColor="bg-red-600"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={closeVideo} />
      )}
    </>
  );
}

function VideoCard({
  video,
  onClick,
  delay,
  badge,
  badgeColor,
}: {
  video: YouTubeVideo;
  onClick: () => void;
  delay: number;
  badge: string;
  badgeColor: string;
}) {
  return (
    <div
      className="reveal group cursor-pointer"
      style={{ transitionDelay: `${delay}s` }}
      onClick={onClick}
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden glass-card glass-card-hover">
        {/* Thumbnail */}
        <div className="absolute inset-0">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full image-placeholder" />
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${badgeColor}`}>
          {badge}
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/90 flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="text-white ml-1" size={24} fill="white" />
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-white line-clamp-2 text-sm">
            {video.title}
          </h3>
          <p className="text-xs text-neutral-300 mt-1 line-clamp-1">{video.description}</p>
        </div>
      </div>
    </div>
  );
}

function VideoModal({ video, onClose }: { video: YouTubeVideo; onClose: () => void }) {
  const videoId = video.url.match(/(?:\?v=|\/)([\w-]{11})/)?.[1];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <div
        className="relative w-full max-w-5xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors flex items-center gap-2"
        >
          <span className="text-sm">Close</span>
          <X size={24} />
        </button>

        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
          {videoId && (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{video.title}</h3>
            <p className="text-sm text-neutral-400 mt-1">{video.description}</p>
          </div>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 text-sm text-neutral-300 hover:text-red-400 transition-colors"
          >
            Open on YouTube
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
