import { Linkedin, Github, Mail, ExternalLink, Heart } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { socialLinks, personalInfo } from '@/data/content';

const iconMap: Record<string, React.ReactNode> = {
  linkedin: <Linkedin size={22} />,
  github: <Github size={22} />,
  mail: <Mail size={22} />,
};

export function Contact() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="contact" ref={ref} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto">
        <div className="reveal text-center mb-16">
          <p className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-3">Let's Connect</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Find Me Online</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Whether you want to talk basketball, collaborate on a project, or just say hi — I'm always up for a conversation.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-red-600 to-orange-400 mx-auto rounded-full mt-4" />
        </div>

        {/* Social grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-16">
          {socialLinks.map((social, index) => {
            const hasLink = social.url.length > 0;
            const Wrapper = hasLink ? 'a' : 'div';
            return (
              <Wrapper
                key={social.name}
                {...(hasLink ? { href: social.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="reveal group"
                style={{ transitionDelay: `${index * 0.08}s` }}
              >
                <div className="glass-card glass-card-hover rounded-2xl p-6 text-center h-full">
                  <div className="flex justify-center text-red-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                    {iconMap[social.icon]}
                  </div>
                  <h3 className="font-semibold text-white text-sm sm:text-base">{social.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {hasLink ? social.handle : 'Link coming soon'}
                  </p>
                  {hasLink && (
                    <div className="flex justify-center mt-2 text-neutral-500 group-hover:text-red-400 transition-colors">
                      <ExternalLink size={14} />
                    </div>
                  )}
                </div>
              </Wrapper>
            );
          })}
        </div>

      </div>

      {/* Footer */}
      <footer className="relative max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <p>
            &copy; {new Date().getFullYear()} {personalInfo.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Built with <Heart size={14} className="text-red-500 fill-red-500" /> & a love for basketball
          </p>
        </div>
      </footer>
    </section>
  );
}
