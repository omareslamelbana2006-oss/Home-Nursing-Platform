import { useEffect, useState } from 'react';
import { Phone, Ambulance, MessageCircle, Home, Info, ClipboardList, Shield, Activity, HeartPulse, Moon, Sun, Menu, X } from 'lucide-react';
import { SUPERVISOR_PHONE, EMERGENCY_NUMBER } from '@/lib/supabase';

type Page = 'home' | 'booking' | 'track' | 'about' | 'contact' | 'policy' | 'admin';

interface NavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({ currentPage, onNavigate, theme, onToggleTheme }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  const navItems: { key: Page; label: string; icon: typeof Home }[] = [
    { key: 'home', label: 'الرئيسية', icon: Home },
    { key: 'booking', label: 'احجز الآن', icon: ClipboardList },
    { key: 'track', label: 'تتبع الطلب', icon: Activity },
    { key: 'about', label: 'من نحن', icon: Info },
    { key: 'contact', label: 'اتصل بنا', icon: Phone },
    { key: 'policy', label: 'السياسات', icon: Shield },
  ];

  return (
    <>
      <header
        className={`site-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'is-scrolled bg-[#0a192f]/95 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#1e40af] flex items-center justify-center shadow-lg shadow-[#1d4ed8]/20 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-sm leading-tight">Home Nursing</div>
                <div className="text-sky-300 text-[10px] leading-tight">الحامول وضواحيها</div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${EMERGENCY_NUMBER}`}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-red-500/20 border border-red-300/50 text-red-600 text-xs sm:text-sm font-semibold hover:bg-red-500/30 transition-all"
              >
                <Ambulance className="w-4 h-4" />
                إسعاف 123
              </a>
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                aria-label={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
                aria-pressed={theme === 'dark'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex min-h-12 min-w-12 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                aria-expanded={menuOpen}
                aria-controls="site-navigation"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] transition-[visibility] duration-300 ${menuOpen ? 'visible' : 'invisible pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
          aria-label="إغلاق القائمة بالضغط خارجها"
          className={`absolute inset-0 cursor-pointer bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          id="site-navigation"
          role="dialog"
          aria-modal={menuOpen}
          aria-label="القائمة الرئيسية"
          className={`site-navigation absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col border-l border-white/10 bg-[#0a192f] p-5 shadow-2xl transition-transform duration-300 ease-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#1e40af] flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold">القائمة الرئيسية</div>
                <div className="text-sky-300 text-xs">Home Nursing</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-16 min-w-16 -m-3 items-center justify-center rounded-2xl text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              aria-label="إغلاق القائمة"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 py-5" aria-label="التنقل الرئيسي">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onNavigate(item.key);
                    setMenuOpen(false);
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-semibold transition-all duration-200 hover:-translate-x-1 ${
                    active
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => {
                onNavigate('admin');
                setMenuOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/10 ${currentPage === 'admin' ? 'bg-sky-500/20 text-sky-300' : 'text-white'}`}
            >
              <Shield className="w-5 h-5" />
              لوحة التحكم
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

export function FloatingButtons() {
  const whatsappLink = `https://wa.me/2${SUPERVISOR_PHONE}`;
  return (
    <>
      {/* WhatsApp */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-110 transition-all animate-pulse-glow"
        title="تواصل عبر واتساب"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
      {/* Call */}
      <a
        href={`tel:${SUPERVISOR_PHONE}`}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#0284c7] flex items-center justify-center shadow-lg shadow-[#0284c7]/30 hover:scale-110 transition-all"
        title="اتصل الآن"
      >
        <Phone className="w-6 h-6 text-white" />
      </a>
    </>
  );
}

export function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="site-footer mt-20 border-t border-white/10 bg-[#0a192f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#1e40af] flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold">Home Nursing</div>
                <div className="text-sky-300 text-xs">الحامول وضواحيها</div>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              خدمة تمريض منزلي احترافية تصل إلى باب منزلك في الحامول والقرى المجاورة.
              رعاية متكاملة بأيدي ممرضين مؤهلين.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('booking')} className="text-slate-300 hover:text-sky-300 text-sm transition-colors">احجز ممرض الآن</button></li>
              <li><button onClick={() => onNavigate('track')} className="text-slate-300 hover:text-sky-300 text-sm transition-colors">تتبع طلبك</button></li>
              <li><button onClick={() => onNavigate('about')} className="text-slate-300 hover:text-sky-300 text-sm transition-colors">من نحن</button></li>
              <li><button onClick={() => onNavigate('policy')} className="text-slate-300 hover:text-sky-300 text-sm transition-colors">سياسة الإلغاء والاسترجاع</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-sky-300" />
                <a href={`tel:${SUPERVISOR_PHONE}`} className="hover:text-sky-300 transition-colors" dir="ltr">{SUPERVISOR_PHONE}</a>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Ambulance className="w-4 h-4 text-red-400" />
                <span>الطوارئ: {EMERGENCY_NUMBER}</span>
              </li>
              <li className="text-slate-300">مستر محمد علي - مشرف الخدمة</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-slate-400 text-sm">
          © 2026 Home Nursing. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}

export function SiteCreditFooter() {
  return (
    <footer className="site-credit-footer border-t px-4 py-3 text-center text-xs transition-colors duration-300">
      <p dir="ltr">Created by developer Eng/ Omar Eslam</p>
      <a href="tel:01007204136" className="mt-0.5 inline-block transition-colors hover:text-sky-500" dir="ltr">
        01007204136
      </a>
    </footer>
  );
}

export type { Page };
