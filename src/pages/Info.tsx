import {
  HeartPulse, Phone, MapPin, Clock, Shield, AlertTriangle,
  CheckCircle2, XCircle, User, Stethoscope, Award, MessageCircle,
} from 'lucide-react';
import {
  SUPERVISOR_NAME, SUPERVISOR_PHONE, EMERGENCY_NUMBER, CANCEL_TRANSFER_FEE,
} from '@/lib/supabase';
import type { Page } from '@/components/Layout';

export function About({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-5 rounded-full overflow-hidden border-4 border-sky-400/70 shadow-[0_0_30px_rgba(56,189,248,0.35)] bg-[#0a192f] animate-float">
            <img
              src="/mohamed-ali.jpeg"
              alt="مستر محمد علي"
              className="w-full h-full object-cover object-[center_12%] scale-110"
            />
          </div>
          <p className="text-sky-300 text-sm font-semibold mb-2">Home Nursing</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{SUPERVISOR_NAME}</h1>
          <p className="text-sky-300 text-lg">مشرف عام فريق التمريض المنزلي بالحامول</p>
        </div>

        {/* Bio card */}
        <div className="glass-card p-8 mb-6">
          <p className="text-slate-300 text-lg leading-relaxed text-center mb-6">
            مستر محمد علي — ممرض مؤهل ومشرف عام فريق التمريض المنزلي بالحامول وضواحيها.
            يقدم خدمات تمريضية احترافية بأعلى معايير الجودة والأمان، من الزيارات القصيرة
            إلى الرعاية الممتدة لكبار السن، مع التزام تام بالمواعيد والتعقيم.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Award, label: 'خبرة تمريضية', value: 'احترافية' },
              { icon: Stethoscope, label: 'خدمات متنوعة', value: '+7 خدمات' },
              { icon: MapPin, label: 'مناطق التغطية', value: 'أكثر من 120 قرية' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="text-center p-4 rounded-xl bg-white/5">
                  <Icon className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{item.value}</div>
                  <div className="text-gray-400 text-sm">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: HeartPulse, title: 'الرعاية أولاً', desc: 'رعاية المريض هي أولويتنا القصوى — نتعامل مع كل حالة باهتمام واحترافية' },
            { icon: Clock, title: 'الالتزام بالمواعيد', desc: 'نصل في الموعد المتفق عليه تماماً، ونوفر خدمة عاجلة عند الحاجة' },
            { icon: Shield, title: 'التعقيم والأمان', desc: 'نتبع أعلى معايير التعقيم والوقاية في كل زيارة منزلية' },
            { icon: User, title: 'فريق مؤهل', desc: 'ممرضون مدرّبون وذوو خبرة في التعامل مع جميع الحالات الصحية' },
          ].map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="glass-card-hover p-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="glass-card p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-4">تواصل معنا الآن</h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`tel:${SUPERVISOR_PHONE}`} className="btn-primary flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              اتصل الآن
            </a>
            <button onClick={() => onNavigate('booking')} className="btn-secondary flex items-center justify-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-400" />
              احجز خدمة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Contact({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const whatsappLink = `https://wa.me/2${SUPERVISOR_PHONE}`;
  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <Phone className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">اتصل بنا</h1>
          <p className="text-gray-400">نحن هنا لخدمتك على مدار الساعة</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <a href={`tel:${SUPERVISOR_PHONE}`} className="glass-card-hover p-6 text-center group">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-500/20 transition-colors">
              <Phone className="w-7 h-7 text-teal-400" />
            </div>
            <h3 className="text-white font-bold mb-1">اتصل مباشرة</h3>
            <p className="text-teal-300 font-semibold" dir="ltr">{SUPERVISOR_PHONE}</p>
            <p className="text-gray-500 text-xs mt-1">{SUPERVISOR_NAME}</p>
          </a>

          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="glass-card-hover p-6 text-center group">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500/20 transition-colors">
              <MessageCircle className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-white font-bold mb-1">واتساب</h3>
            <p className="text-green-300 font-semibold" dir="ltr">{SUPERVISOR_PHONE}</p>
            <p className="text-gray-500 text-xs mt-1">راسلنا على واتساب</p>
          </a>

          <a href={`tel:${EMERGENCY_NUMBER}`} className="glass-card-hover p-6 text-center group">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-red-500/20 transition-colors">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-white font-bold mb-1">الطوارئ</h3>
            <p className="text-red-300 font-semibold text-xl" dir="ltr">{EMERGENCY_NUMBER}</p>
            <p className="text-gray-500 text-xs mt-1">رقم الإسعاف</p>
          </a>

          <div className="glass-card p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-white font-bold mb-1">منطقة الخدمة</h3>
            <p className="text-blue-300 font-semibold">الحامول وضواحيها</p>
            <p className="text-gray-500 text-xs mt-1">محافظة الدقهلية</p>
          </div>
        </div>

        <div className="glass-card p-6 text-center">
          <h3 className="text-white font-bold mb-4">هل تحتاج إلى حجز خدمة؟</h3>
          <button onClick={() => onNavigate('booking')} className="btn-primary flex items-center gap-2 mx-auto">
            <Stethoscope className="w-5 h-5" />
            احجز ممرض الآن
          </button>
        </div>
      </div>
    </div>
  );
}

export function Policy() {
  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">سياسة الإلغاء والاسترجاع</h1>
          <p className="text-gray-400">نضمن لك الشفافية في كل التعاملات</p>
        </div>

        <div className="space-y-4">
          {/* Cancellation by client */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">الإلغاء من العميل</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  في حال إلغاء الطلب من العميل قبل تنفيذ الخدمة، يتم خصم
                  <span className="text-amber-300 font-semibold"> {CANCEL_TRANSFER_FEE} جنيه </span>
                  كرسوم تحويل/إجراءات إدارية، ويتم استرجاع باقي العربون.
                </p>
                <div className="bg-amber-500/5 rounded-lg p-3 text-sm">
                  <p className="text-gray-300">
                    مثال: إذا كان العربون 45 جنيه، يتم استرجاع 35 جنيه (45 - 10 = 35).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation by nurse */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">الإلغاء من قبل الممرض</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  في حال اضطرار فريق التمريض لإلغاء الطلب، يتم
                  <span className="text-emerald-300 font-semibold"> استرجاع كامل العربون </span>
                  دون أي خصومات. نلتزم بإيجاد بديل مناسب عند الحاجة.
                </p>
              </div>
            </div>
          </div>

          {/* No show */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">عدم استقبال الممرض</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  في حال وصول الممرض إلى العنوان وعدم وجود المريض، يعتبر العربون
                  <span className="text-red-300 font-semibold"> غير قابل للاسترجاع </span>
                  لتغطية تكاليف النقل والوقت.
                </p>
              </div>
            </div>
          </div>

          {/* Modification */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">تعديل الموعد</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  يمكن تعديل الموعد مجاناً قبل التنفيذ بـ 3 ساعات على الأقل. تواصل عبر الهاتف أو واتساب.
                </p>
              </div>
            </div>
          </div>

          {/* Contact for disputes */}
          <div className="glass-card p-6 bg-gradient-to-l from-teal-500/10 to-emerald-500/10">
            <h3 className="text-white font-bold text-lg mb-2">للتواصل بشأن الاسترجاع</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              في حال وجود أي مشكلة أو طلب استرجاع، تواصل مع المشرف مباشرة:
            </p>
            <a href={`tel:${SUPERVISOR_PHONE}`} className="text-teal-300 font-semibold hover:text-teal-200" dir="ltr">
              {SUPERVISOR_PHONE} - {SUPERVISOR_NAME}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
