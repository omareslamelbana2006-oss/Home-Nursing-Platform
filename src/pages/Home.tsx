import { useEffect, useState } from 'react';
import {
  HeartPulse, Ambulance, ClipboardList, Shield, Clock,
  MapPin, Star, ChevronLeft, Stethoscope, Phone,
  User, Calendar, Upload, CheckCircle, MessageCircle,
} from 'lucide-react';
import {
  supabase, type Service, type Village, SUPERVISOR_PHONE, EMERGENCY_NUMBER, MAIN_REGION_NAMES,
  formatPrice,
} from '@/lib/supabase';
import { getServiceIcon } from '@/lib/icons';
import type { Page } from '@/components/Layout';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, v] = await Promise.all([
        supabase.from('services').select('*').eq('is_visible', true).order('created_at'),
        supabase.from('villages').select('*').order('name'),
      ]);
      if (s.data) setServices(s.data);
      if (v.data) setVillages(v.data);
      setLoading(false);
    })();
  }, []);

  const features = [
    { icon: Stethoscope, title: 'خبرة واحترافية', desc: 'كادر تمريضي مرخص وذو خبرة عالية' },
    { icon: Ambulance, title: 'استجابة سريعة', desc: 'تلبية طلباتكم على مدار الساعة 24/7' },
    { icon: HeartPulse, title: 'رحمة ورعاية منزلية', desc: 'نهتم بصحتكم كأنكم في منزلكم' },
  ];

  const bookingSteps = [
    { icon: ClipboardList, title: 'اختر الخدمة', desc: 'حدد الخدمة التمريضية المناسبة' },
    { icon: Calendar, title: 'حدد الموعد', desc: 'اختر الوقت والمناسب لك' },
    { icon: Upload, title: 'ارفع الإيصال', desc: 'إرفاق صورة الدفع' },
    { icon: CheckCircle, title: 'تأكيد الحجز', desc: 'استقبل الممرض في منزلك' },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#0f172a] to-[#1e293b]" />
          <div className="absolute inset-0 bg-black/20" />
          {/* Soft ambient glow effects */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-ambient-glow" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-700/25 rounded-full blur-3xl animate-ambient-glow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-white text-sm font-medium">خدمة متاحة الآن</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Home Nursing
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl">رعاية تمريضية منزلية</span>
            <br />
            <span className="neon-text">بروح الإنسانية والاحترافية</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            نقدم خدمات تمريضية متكاملة في الحامول وضواحيها، بلمسة دافئة وخبرة واسعة لضمان راحتكم وصحتكم.
          </p>

          {/* Cinematic CTA Button with heartbeat pulse */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => onNavigate('booking')}
              className="bg-[#1d4ed8] text-white font-semibold rounded-2xl px-8 py-4 text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(29,78,216,0.7)] hover:scale-[1.02] active:scale-[0.98] animate-heartbeat flex items-center gap-3"
            >
              <ClipboardList className="w-6 h-6" />
              استكشف الخدمات وابدأ الحجز Now ➔
            </button>
            <a href={`tel:${EMERGENCY_NUMBER}`} className="bg-white/10 backdrop-blur-md border border-red-400/40 text-red-300 font-semibold rounded-2xl px-8 py-4 text-lg transition-all duration-300 hover:bg-white/15 hover:border-red-400 hover:shadow-lg flex items-center gap-3">
              <Ambulance className="w-6 h-6" />
              رقم الإسعاف 123
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '+7', label: 'خدمات تمريضية' },
              { value: '+120', label: 'منطقة مغطاة' },
              { value: '+200', label: 'مريض اتعاملوا معانا' },
              { value: '24/7', label: 'خدمة 24 ساعة' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6">
                <div className="text-3xl sm:text-4xl font-bold neon-text">{stat.value}</div>
                <div className="text-sm text-slate-300 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wavy Divider */}
      <div className="wavy-divider" />

      {/* Feature Badges Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">مميزاتنا</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">لماذا تختار خدماتنا التمريضية؟</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-card-hover p-8 group animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="w-16 h-16 rounded-2xl bg-sky-500/15 flex items-center justify-center mb-6 group-hover:bg-sky-500/25 transition-all">
                  <Icon className="w-8 h-8 text-sky-300" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-slate-300 text-base leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Wavy Divider */}
      <div className="wavy-divider" style={{ transform: 'rotate(180deg)' }} />

      {/* Nurse Profile Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">فريقنا المتميز</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">تعرف على المشرف العام لفريق التمريض المنزلي</p>
        </div>
        <div className="max-w-md mx-auto">
          <div className="glass-card-hover rounded-3xl p-8 animate-fade-in-up">
            <div className="w-44 h-44 mx-auto mb-6 rounded-full overflow-hidden border-4 border-sky-400/70 shadow-[0_0_30px_rgba(56,189,248,0.35)] bg-[#0a192f]">
              <img
                src="/mohamed-ali.jpeg"
                alt="مستر محمد علي"
                className="w-full h-full object-cover object-[center_12%] scale-110"
              />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">مستر محمد علي</h3>
              <p className="text-sky-300 font-medium mb-4">مشرف عام فريق التمريض المنزلي بالحامول</p>
              <p className="text-slate-300 leading-relaxed">
                "أكثر من 5 عاماً في خدمة ورعاية أهلنا في الحامول. أمانة، دقة، ورحمة في كل زيارة."
              </p>
              <a href={`tel:${SUPERVISOR_PHONE}`} className="mt-6 inline-flex items-center gap-2 btn-primary">
                <Phone className="w-5 h-5" />
                اتصل الآن
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Wavy Divider */}
      <div className="wavy-divider" />

      {/* Services Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-sky-300 text-sm font-medium mb-2">
            <Stethoscope className="w-4 h-4" />
            خدماتنا
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">خدمات تمريضية متنوعة</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">اختر الخدمة التي تحتاجها وسيصل الممرض إلى منزلك</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-white/10 mb-4" />
                <div className="h-5 bg-white/10 rounded mb-3 w-2/3" />
                <div className="h-4 bg-white/5 rounded mb-2" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = getServiceIcon(service.icon_name);
              return (
                <div
                  key={service.id}
                  className="glass-card-hover p-6 group cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => onNavigate('booking')}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-sky-500/15 flex items-center justify-center group-hover:bg-sky-500/25 transition-all">
                      <Icon className="w-7 h-7 text-sky-300" />
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full border ${
                      service.category === 'short_visit'
                        ? 'bg-sky-500/15 text-sky-200 border-sky-400/40'
                        : 'bg-purple-500/15 text-purple-200 border-purple-400/40'
                    }`}>
                      {service.category === 'short_visit' ? 'زيارة قصيرة' : 'رعاية ممتدة'}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{service.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <span className="text-slate-400 text-xs">السعر يبدأ من</span>
                      <div className="text-sky-300 font-bold text-xl">{formatPrice(service.price_base)}</div>
                    </div>
                    <div className="flex items-center gap-1 text-sky-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      احجز الآن
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Wavy Divider */}
      <div className="wavy-divider" />

      {/* Booking Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">كيف تحجز؟</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">خطوات بسيطة للحصول على الرعاية التمريضية</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bookingSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative">
                <div className="glass-card-hover p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/15 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-sky-300" />
                  </div>
                  <div className="text-sky-300 font-bold text-2xl mb-2">{i + 1}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-300 text-sm">{step.desc}</p>
                </div>
                {i < bookingSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-sky-400/50">
                    <ChevronLeft className="w-6 h-6" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Wavy Divider */}
      <div className="wavy-divider" style={{ transform: 'rotate(180deg)' }} />

      {/* Coverage Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-sky-300 text-sm font-medium mb-2">
            <MapPin className="w-4 h-4" />
            مناطق التغطية
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">نخدم الحامول وضواحيها</h2>
        </div>
        {!loading && (
          <div className="flex flex-wrap justify-center gap-3">
            {villages.filter((village) => MAIN_REGION_NAMES.includes(village.name)).map((v) => (
              <div key={v.id} className="glass-card px-5 py-3 flex items-center gap-2 hover:border-sky-400/50 transition-all">
                <MapPin className="w-4 h-4 text-sky-300" />
                <span className="text-white text-sm font-medium">{v.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Wavy Divider */}
      <div className="wavy-divider" />

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl animate-ambient-glow" />
          <div className="relative z-10">
            <Star className="w-12 h-12 text-sky-300 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">تحتاج رعاية تمريضية عاجلة؟</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              اطلب الآن واستقبل الممرض في منزلك. العربون 30% فقط للحجز، والباقي عند الوصول.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => onNavigate('booking')} className="btn-primary flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                ابدأ الحجز
              </button>
              <a href={`tel:${SUPERVISOR_PHONE}`} className="btn-secondary flex items-center gap-2">
                <Phone className="w-5 h-5 text-sky-300" />
                اتصل بمستر محمد علي
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
