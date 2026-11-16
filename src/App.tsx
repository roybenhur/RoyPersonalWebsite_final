import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { LogicLab } from '@/components/LogicLab';
import { NBAHighlights } from '@/components/NBAHighlights';
import { Gallery } from '@/components/Gallery';
import { Contact } from '@/components/Contact';

function App() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 overflow-x-hidden">
      <div className="noise-overlay" />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <About />
        <LogicLab />
        <NBAHighlights />
        <Gallery />
        <Contact />
      </main>
    </div>
  );
}

export default App;
