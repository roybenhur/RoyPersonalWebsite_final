import { useState } from 'react';
import { Camera, X, ImageIcon } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { experiencePhotos, type ExperiencePhoto } from '@/data/content';

export function Gallery() {
  const ref = useReveal<HTMLElement>();
  const [selectedPhoto, setSelectedPhoto] = useState<ExperiencePhoto | null>(null);

  return (
    <section id="gallery" ref={ref} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-950 via-neutral-900/30 to-neutral-950">
      <div className="max-w-7xl mx-auto">
        <div className="reveal text-center mb-12">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-red-400 uppercase tracking-widest mb-3">
            <Camera size={16} />
            <span>Life in Frames</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Thailand, Last Summer</h2>
          <p className="text-xl sm:text-2xl font-semibold text-white max-w-3xl mx-auto leading-relaxed">
            Ilay is my girlfriend — these are photos of us from our trip to Thailand last summer.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-red-600 to-orange-400 mx-auto rounded-full mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {experiencePhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="reveal group cursor-pointer"
              style={{ transitionDelay: `${index * 0.08}s` }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden glass-card glass-card-hover">
                {photo.imageUrl ? (
                  <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full image-placeholder flex flex-col items-center justify-center gap-3">
                    <ImageIcon className="text-neutral-600" size={32} />
                    <span className="text-xs text-neutral-600">Photo coming soon</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                  <h3 className="text-lg font-semibold text-white">{photo.title}</h3>
                  <p className="text-sm text-neutral-300 mt-1">{photo.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedPhoto(null)}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div className="relative max-w-3xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedPhoto(null)} className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors flex items-center gap-2">
              <span className="text-sm">Close</span>
              <X size={24} />
            </button>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900">
              {selectedPhoto.imageUrl && <img src={selectedPhoto.imageUrl} alt={selectedPhoto.title} className="w-full h-full object-contain" />}
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-white">{selectedPhoto.title}</h3>
              <p className="text-neutral-400 mt-1">{selectedPhoto.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
