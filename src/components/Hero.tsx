import { ArrowDown, Sparkles } from 'lucide-react';
import { personalInfo, quickStats } from '@/data/content';
import { Code, Calendar, Trophy, Coffee } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  code: <Code size={20} />,
  calendar: <Calendar size={20} />,
  trophy: <Trophy size={20} />,
  coffee: <Coffee size={20} />,
};

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden pt-20">
      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center text-center">
          {/* Profile photo placeholder */}
          <div
            className="relative mb-8 animate-scale-in"
          >
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full image-placeholder flex items-center justify-center animate-pulse-glow">
              {personalInfo.photo ? (
                <img src={personalInfo.photo} alt={personalInfo.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Sparkles className="text-neutral-500" size={32} />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-neutral-950 flex items-center justify-center">
              <span className="w-3 h-3 bg-green-300 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Name & tagline */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm font-medium text-red-400 uppercase tracking-widest mb-3">
              Welcome to my world
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 text-shadow-lg">
              {personalInfo.name}
            </h1>
            <p className="text-lg sm:text-xl text-neutral-400 font-light max-w-2xl mb-8">
              {personalInfo.tagline}
            </p>
          </div>

          {/* Bio */}
          <p
            className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed mb-12 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            {personalInfo.bio}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {quickStats.map((stat) => (
              <div key={stat.label} className="glass-card glass-card-hover rounded-2xl p-4 sm:p-6 text-center">
                <div className="flex justify-center text-red-400 mb-2">{iconMap[stat.icon]}</div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-neutral-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-16 animate-fade-in-up flex flex-col items-center gap-2 text-neutral-400 hover:text-red-400 transition-colors duration-300"
            style={{ animationDelay: '0.8s' }}
          >
            <span className="text-sm uppercase tracking-widest">Scroll to explore</span>
            <ArrowDown size={20} className="animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
}
