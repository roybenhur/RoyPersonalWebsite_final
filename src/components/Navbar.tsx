import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useActiveSection } from '@/hooks/useActiveSection';

const navItems = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'logiclab', label: 'Logic Lab' },
  { id: 'nba', label: 'Basketball', children: [{ id: 'nba', label: 'NBA Highlights' }, { id: 'avdija', label: 'Deni Avdija' }] },
  { id: 'gallery', label: 'Photos' },
  { id: 'contact', label: 'Connect' },
];

const allSectionIds = ['hero', 'about', 'logiclab', 'nba', 'avdija', 'gallery', 'contact'];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress();
  const activeSection = useActiveSection(allSectionIds);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (id: string) => {
    setDropdownOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-neutral-950/85 backdrop-blur-xl border-b border-white/5 py-2.5'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="flex items-center justify-center px-4 sm:px-6">
        <div className="flex items-center gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const isActive = item.children
              ? item.children.some((c) => activeSection === c.id)
              : activeSection === item.id;

            if (item.children) {
              return (
                <div key={item.id} ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`relative flex items-center gap-1 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                      isActive ? 'text-red-400' : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 sm:w-6 bg-red-500 rounded-full" />
                    )}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 glass-card rounded-xl py-1.5 min-w-[180px] animate-fade-in shadow-xl">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleNavClick(child.id)}
                          className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                            activeSection === child.id
                              ? 'text-red-400 bg-white/5'
                              : 'text-neutral-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                  isActive ? 'text-red-400' : 'text-neutral-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 sm:w-6 bg-red-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-600 via-orange-400 to-red-600 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
    </nav>
  );
}
