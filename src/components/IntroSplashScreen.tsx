import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Clock3, HeartPulse, MapPin, Moon, ShieldCheck, Sparkles, Sun, Zap } from 'lucide-react';

const INTRO_SESSION_KEY = 'home-nursing-intro-seen';
type Theme = 'light' | 'dark';

interface IntroSplashScreenProps {
  onEnter: () => void;
  onComplete: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function IntroSplashScreen({ onEnter, onComplete, theme, onToggleTheme }: IntroSplashScreenProps) {
  const [leaving, setLeaving] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const enterPlatform = () => {
    if (leaving) return;
    window.sessionStorage.setItem(INTRO_SESSION_KEY, 'yes');
    onEnter();
    setLeaving(true);
    timeoutRef.current = setTimeout(onComplete, 700);
  };

  const features = [
    { icon: Zap, label: 'استجابة سريعة' },
    { icon: Clock3, label: 'رعاية على مدار الساعة' },
    { icon: ShieldCheck, label: 'فريق متميز' },
  ];

  return (
    <div
      className={`intro-splash intro-splash-${theme} fixed inset-0 z-[100] flex min-h-[100svh] items-start justify-center overflow-y-auto bg-[#06101f] px-4 py-8 text-white transition-colors duration-500 sm:px-8 ${leaving ? 'intro-splash-leaving' : ''}`}
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="مقدمة منصة التمريض المنزلي"
      aria-labelledby="intro-splash-title"
    >
      <button
        type="button"
        onClick={onToggleTheme}
        className="intro-theme-toggle fixed left-4 top-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-slate-900/60 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:left-7 sm:top-7"
        aria-label={theme === 'light' ? 'التبديل إلى الوضع الداكن' : 'التبديل إلى الوضع الفاتح'}
        aria-pressed={theme === 'light'}
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        {theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}
      </button>

      <div className="intro-light-wash absolute inset-0" aria-hidden="true" />
      <div className="intro-grid absolute inset-0" aria-hidden="true" />
      <div className="intro-particles absolute inset-0" aria-hidden="true" />
      <div className="intro-orb intro-orb-one absolute" aria-hidden="true" />
      <div className="intro-orb intro-orb-two absolute" aria-hidden="true" />
      <div className="intro-orb intro-orb-three absolute" aria-hidden="true" />

      <div className="intro-glass-panel relative z-10 my-auto mx-auto grid w-full max-w-6xl items-center gap-10 rounded-3xl border border-white/10 bg-slate-900/60 px-5 py-8 shadow-[0_24px_100px_rgba(0,0,0,0.32)] backdrop-blur-md sm:px-8 sm:py-10 md:grid-cols-[1.2fr_0.8fr] md:gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-12 lg:py-12">
        <div className="intro-portrait-wrap relative mx-auto w-[min(72vw,20rem)] sm:w-[min(56vw,24rem)] md:order-2 md:w-full md:max-w-[19rem] lg:max-w-[25rem]">
          <div className="intro-portrait-ring absolute -inset-3 rounded-full" aria-hidden="true" />
          <div className="relative aspect-square overflow-hidden rounded-full border border-cyan-200/40 bg-[#07182a] shadow-[0_0_85px_rgba(34,211,238,0.2)]">
            <img
              src="/mohamed-ali.jpeg"
              alt="ممرض من فريق منصة Home Nursing"
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07182a]/55 via-transparent to-cyan-100/5" />
          </div>
          <div className="intro-presence-card absolute -bottom-3 right-0 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0b1c30]/85 px-4 py-3 shadow-xl backdrop-blur-xl sm:-right-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-white">رعاية قريبة من القلب</span>
              <span className="mt-0.5 block text-xs text-slate-300">معكم في الحامول وضواحيها</span>
            </span>
            <span className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
          </div>
        </div>

        <div className="intro-copy text-center md:order-1 md:text-right">
          <div className="intro-tagline mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/[0.08] px-4 py-2 text-xs font-semibold text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.08)] sm:text-sm">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            رعايتكم أمانتنا • رحلة الشفاء تبدأ من هنا
            <span aria-hidden="true">✨</span>
          </div>

          <h1 id="intro-splash-title" className="text-3xl font-extrabold leading-[1.45] tracking-tight text-white sm:text-4xl lg:text-5xl">
            أهلاً بكم في منصة
            <span className="intro-title-glow mt-1 block text-cyan-200">التمريض المنزلي الأولي بالحامول</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg sm:leading-9 md:mx-0">
            يسعدنا ويشرفنا استقبالكم لتقديم أرقى وأسرع خدمات التمريض المنزلي المتميزة والموثوقة في الحامول وضواحيها بكل احترافية وحب.
          </p>

          <div className="intro-location-note mx-auto mt-5 flex max-w-2xl items-start gap-3 rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-3 text-right text-sm leading-7 text-cyan-50 shadow-[0_0_32px_rgba(34,211,238,0.1)] md:mx-0 sm:px-5 sm:text-base">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
            <span>
              <span className="block font-semibold">خدماتنا تغطي الحامول وضواحيها</span>
              <span className="block text-cyan-200">وخارج الحامول أيضًا 📍</span>
            </span>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
            {features.map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className="intro-feature inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-2 text-xs font-medium text-slate-200 backdrop-blur-md sm:text-sm"
                style={{ animationDelay: `${0.65 + index * 0.12}s` }}
              >
                <Icon className="h-4 w-4 text-cyan-300" />
                {label}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={enterPlatform}
            disabled={leaving}
            className="intro-cta group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-100/30 bg-gradient-to-l from-cyan-400 via-sky-500 to-blue-600 px-6 py-4 text-base font-extrabold text-white shadow-[0_12px_48px_rgba(14,165,233,0.28)] transition duration-300 hover:-translate-y-1 hover:border-cyan-100/70 hover:shadow-[0_16px_60px_rgba(34,211,238,0.42)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200/40 disabled:cursor-wait sm:w-auto sm:px-8 sm:text-lg"
          >
            دخول المنصة وابدأ الحجز
            <span aria-hidden="true">🚀</span>
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>

          <p className="mt-4 text-xs text-slate-400">خطوة واحدة تفصلك عن الرعاية التي تستحقها</p>
        </div>
      </div>
    </div>
  );
}
