import { useEffect, useState } from 'react';
import { Header, FloatingButtons, Footer, SiteCreditFooter, type Page } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { Booking } from '@/pages/Booking';
import { Track } from '@/pages/Track';
import { About, Contact, Policy } from '@/pages/Info';
import { Admin } from '@/pages/Admin';
import { IntroSplashScreen } from '@/components/IntroSplashScreen';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = window.localStorage.getItem('home-nursing-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });
  const [showIntro, setShowIntro] = useState(() => window.sessionStorage.getItem('home-nursing-intro-seen') !== 'yes');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('home-nursing-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (showIntro) return;
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    return () => window.cancelAnimationFrame(frame);
  }, [showIntro]);

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = page === 'admin';

  return (
    <>
      <div className="app-shell min-h-screen flex flex-col transition-colors duration-300">
        <Header
          currentPage={page}
          onNavigate={navigate}
          theme={theme}
          onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
        />
        <main className="flex-1">
          {page === 'home' && <Home onNavigate={navigate} />}
          {page === 'booking' && <Booking onNavigate={navigate} />}
          {page === 'track' && <Track onNavigate={navigate} />}
          {page === 'about' && <About onNavigate={navigate} />}
          {page === 'contact' && <Contact onNavigate={navigate} />}
          {page === 'policy' && <Policy />}
          {page === 'admin' && <Admin onNavigate={navigate} />}
        </main>
        {!isAdmin && <Footer onNavigate={navigate} />}
        <SiteCreditFooter />
        {!isAdmin && <FloatingButtons />}
      </div>
      {showIntro && (
        <IntroSplashScreen
          onEnter={() => navigate('home')}
          onComplete={() => setShowIntro(false)}
          theme={theme}
          onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
        />
      )}
    </>
  );
}

export default App;
