import { useReveal } from '@/hooks/useReveal';
import { personalInfo } from '@/data/content';
import { MapPin, GraduationCap, Cpu } from 'lucide-react';

export function About() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="about" ref={ref} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="reveal text-center mb-16">
          <p className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-3">Get to know me</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">About Me</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-red-600 to-orange-400 mx-auto rounded-full" />
        </div>

        <div className="reveal glass-card rounded-3xl p-6 sm:p-10 text-center">
          <h3 className="text-2xl font-semibold text-white mb-8">Hey, I'm {personalInfo.name}</h3>
          <div className="flex flex-col items-center gap-4 mb-2">
            <div className="flex items-center gap-3 text-neutral-300"><MapPin className="text-red-400 flex-shrink-0" size={18} /><span>{personalInfo.location}</span></div>
            <div className="flex items-center gap-3 text-neutral-300"><GraduationCap className="text-red-400 flex-shrink-0" size={18} /><span>B.Sc. Electrical Engineering — Technion, 4th Year</span></div>
            <div className="flex items-center gap-3 text-neutral-300"><Cpu className="text-red-400 flex-shrink-0" size={18} /><span>Formal Verification Engineer at Intel</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
