import { useEffect, useState } from 'react';
import { Header, FloatingButtons, Footer, type Page } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { Booking } from '@/pages/Booking';
import { Track } from '@/pages/Track';
import { About, Contact, Policy } from '@/pages/Info';
import { Admin } from '@/pages/Admin';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('home-nursing-theme', theme);
  }, [theme]);

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = page === 'admin';

  return (
    <div className="min-h-screen flex flex-col">
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
      {!isAdmin && <FloatingButtons />}
    </div>
  );
}

export default App;
