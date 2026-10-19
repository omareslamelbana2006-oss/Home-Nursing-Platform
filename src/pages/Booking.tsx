import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ClipboardList, Check, ChevronLeft, ChevronRight, MapPin, Clock, Search,
  Upload, FileText, User, Phone, AlertTriangle, Calendar, Zap,
  CheckCircle2, MessageCircle, Banknote, ArrowLeft, Home as HomeIcon,
} from 'lucide-react';
import {
  supabase, type Service, type Village, type AdminSettings, type Nurse,
  SUPERVISOR_PHONE, DEPOSIT_RATE, MAIN_REGION_NAMES,
  formatPrice, generateBookingCode,
} from '@/lib/supabase';
import { getServiceIcon } from '@/lib/icons';
import { mergeLocalNurses, normalizeNurses } from '@/lib/nurses';
import type { Page } from '@/components/Layout';

const CUSTOM_LOCATION_NAME = 'مكان مخصوص / خارج الحامول';
const CUSTOM_LOCATION_ID_PREFIX = 'custom-location-';

interface BookingProps {
  onNavigate: (page: Page) => void;
}

interface BookingData {
  service: Service | null;
  village: Village | null;
  nurse: Nurse | null;
  date: string;
  time: string;
  urgent: boolean;
  name: string;
  phone: string;
  address: string;
  notes: string;
  prescriptionFile: File | null;
  prescriptionUrl: string | null;
  senderNumber: string;
  receiptFile: File | null;
  receiptUrl: string | null;
}

const STEPS = ['اختر الخدمة', 'اختر المنطقة', 'اختر الممرض', 'التاريخ والوقت', 'بياناتك', 'الفاتورة', 'إثبات الدفع', 'التأكيد'];

export function Booking({ onNavigate }: BookingProps) {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [villageSearch, setVillageSearch] = useState('');
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  const [error, setError] = useState('');

  const [data, setData] = useState<BookingData>({
    service: null,
    village: null,
    nurse: null,
    date: '',
    time: '',
    urgent: false,
    name: '',
    phone: '',
    address: '',
    notes: '',
    prescriptionFile: null,
    prescriptionUrl: null,
    senderNumber: '',
    receiptFile: null,
    receiptUrl: null,
  });

  useEffect(() => {
    (async () => {
      const [s, v, n, a] = await Promise.all([
        supabase.from('services').select('*').eq('is_visible', true).order('created_at'),
        supabase.from('villages').select('*').order('name'),
        supabase.from('nurses').select('*').order('created_at'),
        supabase.from('admin_settings').select('id, night_shift_fee, urgent_fee, night_shift_start_hour, created_at').limit(1).maybeSingle(),
      ]);
      if (s.data) setServices(s.data);
      if (v.data) {
        const customLocationExists = v.data.some((village) => village.name === CUSTOM_LOCATION_NAME);
        setVillages(customLocationExists ? v.data : [
          ...v.data,
          {
            id: `${CUSTOM_LOCATION_ID_PREFIX}outside-hamoul`,
            name: CUSTOM_LOCATION_NAME,
            transfer_fee: 0,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      setNurses(mergeLocalNurses(n.data ? normalizeNurses(n.data) : []));
      if (a.data) setSettings(a.data);
      setLoading(false);
    })();
  }, []);

  const orderedVillages = useMemo(() => {
    const priorities = new Map(MAIN_REGION_NAMES.map((name, index) => [name, index]));
    return [...villages].sort((left, right) => {
      if (left.name === CUSTOM_LOCATION_NAME) return 1;
      if (right.name === CUSTOM_LOCATION_NAME) return -1;
      const leftPriority = priorities.get(left.name);
      const rightPriority = priorities.get(right.name);
      if (leftPriority !== undefined || rightPriority !== undefined) {
        if (leftPriority === undefined) return 1;
        if (rightPriority === undefined) return -1;
        return leftPriority - rightPriority;
      }
      return left.name.localeCompare(right.name, 'ar');
    });
  }, [villages]);

  const filteredVillages = useMemo(() => {
    const query = villageSearch.trim();
    return query ? orderedVillages.filter((village) => village.name.includes(query)) : orderedVillages;
  }, [orderedVillages, villageSearch]);

  // ===== Pricing calculation =====
  const pricing = useMemo(() => {
    const base = data.service?.price_base ?? 0;
    let extras = 0;

    // Night shift fee
    if (data.time && settings) {
      const hour = parseInt(data.time.split(':')[0]);
      if (hour >= settings.night_shift_start_hour || hour < 6) {
        extras += settings.night_shift_fee;
      }
    }
    // Urgent fee
    if (data.urgent && settings) {
      extras += settings.urgent_fee;
    }

    const total = base + extras;
    const deposit = total * DEPOSIT_RATE;
    return { base, extras, total, deposit };
  }, [data, settings]);

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 0: return data.service !== null;
      case 1: return data.village !== null;
      case 2: return true; // Nurse selection is optional
      case 3: return data.urgent || (data.date !== '' && data.time !== '');
      case 4: return data.name.trim() !== '' && data.phone.trim().length >= 10 && data.address.trim() !== '';
      case 6: return /^\d{11}$/.test(data.senderNumber.trim()) && data.receiptFile !== null;
      default: return true;
    }
  }, [step, data]);

  const handleNext = () => {
    if (step < STEPS.length - 1 && canProceed()) {
      setError('');
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setError('');
      setStep(step - 1);
    }
  };

  const handleFileUpload = async (file: File, folder: 'prescriptions' | 'receipts'): Promise<string> => {
    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(fileName, file, { contentType: file.type || 'application/octet-stream' });
    if (uploadError) throw new Error(`تعذر رفع الملف: ${uploadError.message}`);
    const { data: urlData } = supabase.storage
      .from('prescriptions')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const submitBooking = async () => {
    const receiptFile = data.receiptFile;
    if (!/^\d{11}$/.test(data.senderNumber.trim())) {
      setError('رقم المحول يجب أن يتكون من 11 رقمًا بالضبط');
      return;
    }
    if (!receiptFile) {
      setError('ارفع إيصال الدفع للمتابعة');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      let prescriptionUrl: string | null = null;
      if (data.prescriptionFile) {
        prescriptionUrl = await handleFileUpload(data.prescriptionFile, 'prescriptions');
      }
      const receiptUrl = await handleFileUpload(receiptFile, 'receipts');

      const code = generateBookingCode();
      const dateTime = data.urgent || !data.date || !data.time
        ? null
        : new Date(`${data.date}T${data.time}`).toISOString();
      const bookingNotes = [
        data.notes.trim(),
        ...(data.village?.name === CUSTOM_LOCATION_NAME ? [`الموقع: ${data.village.name}`] : []),
        `رقم التحويل: ${data.senderNumber.trim()}`,
        `الممرض: ${data.nurse?.name ?? 'سيتم تعيينه حسب التوفر'}`,
        `رابط الإيصال: ${receiptUrl}`,
      ].filter(Boolean).join('\n');

      const { error: insErr } = await supabase.from('bookings').insert({
        booking_code: code,
        client_name: data.name,
        client_phone: data.phone,
        address: data.address,
        village_id: data.village && !data.village.id.startsWith(CUSTOM_LOCATION_ID_PREFIX)
          ? data.village.id
          : null,
        service_id: data.service?.id ?? null,
        care_type: data.service?.category ?? 'short_visit',
        date_time: dateTime,
        urgent_booking: data.urgent,
        prescription_url: prescriptionUrl,
        total_price: pricing.total,
        deposit_amount: pricing.deposit,
        payment_status: 'pending_deposit',
        status: 'new',
        notes: bookingNotes,
      });

      if (insErr) throw new Error(insErr.message);
      setBookingCode(code);
      setData((current) => ({ ...current, receiptUrl }));
      setStep(7);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الحجز');
    } finally {
      setSubmitting(false);
    }
  };

  const buildWhatsAppMessage = (): string => {
    const lines = [
      `🩺 *طلب حجز تمريض منزلي*`,
      `━━━━━━━━━━━━━━━`,
      `📋 رقم الطلب: ${bookingCode}`,
      `🩹 الخدمة: ${data.service?.title}`,
      `📍 المنطقة: ${data.village?.name}`,
      data.urgent ? `⚡ نوع الطلب: عاجل (أقرب وقت)` : `📅 الموعد: ${data.date} ${data.time}`,
      `👤 الاسم: ${data.name}`,
      `📱 الهاتف: ${data.phone}`,
      `📲 رقم المحول منه: ${data.senderNumber}`,
      `🏠 العنوان: ${data.address}`,
      data.receiptUrl ? '🧾 تم إرفاق إيصال الدفع في لوحة الإدارة' : '',
      data.notes ? `📝 ملاحظات: ${data.notes}` : '',
      `━━━━━━━━━━━━━━━`,
      `💰 سعر الخدمة: ${formatPrice(pricing.base)}`,
      pricing.extras > 0 ? `➕ رسوم إضافية: ${formatPrice(pricing.extras)}` : '',
      `━━━━━━━━━━━━━━━`,
      `💵 الإجمالي: ${formatPrice(pricing.total)}`,
      `💳 العربون (30%): ${formatPrice(pricing.deposit)}`,
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  };

  // ===== Render =====
  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">احجز ممرض الآن</h1>
          <p className="text-gray-400">أكمل الخطوات التالية لحجز الخدمة</p>
        </div>

        {/* Progress bar */}
        {step < 6 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.slice(0, 6).map((_, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      i < step
                        ? 'bg-emerald-500 text-white'
                        : i === step
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                        : 'bg-white/10 text-gray-500'
                    }`}
                  >
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < 5 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${i < step ? 'bg-emerald-500' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-400 font-medium">
              {STEPS[step]}
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="glass-card p-6 sm:p-8 step-enter" key={step}>
          {/* Step 0: Service */}
          {step === 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((s) => {
                  const Icon = getServiceIcon(s.icon_name);
                  const selected = data.service?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setData({ ...data, service: s })}
                      className={`p-5 rounded-xl border text-right transition-all duration-200 ${
                        selected
                          ? 'bg-teal-500/15 border-teal-400/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-teal-500/20' : 'bg-white/5'}`}>
                          <Icon className={`w-6 h-6 ${selected ? 'text-teal-400' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-white font-bold text-sm">{s.title}</h3>
                            {selected && <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />}
                          </div>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{s.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${s.category === 'short_visit' ? 'bg-blue-500/10 text-blue-300' : 'bg-purple-500/10 text-purple-300'}`}>
                              {s.category === 'short_visit' ? 'زيارة قصيرة' : 'رعاية ممتدة'}
                            </span>
                            <span className="text-teal-300 font-bold text-sm">{formatPrice(s.price_base)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Village */}
          {step === 1 && (
            <div>
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  value={villageSearch}
                  onChange={(event) => setVillageSearch(event.target.value)}
                  placeholder="ابحث عن القرية أو العزبة"
                  aria-label="ابحث عن القرية أو العزبة"
                  className="input-field pr-10"
                  dir="rtl"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredVillages.map((v) => {
                  const selected = data.village?.id === v.id;
                  const customLocation = v.name === CUSTOM_LOCATION_NAME;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setData({ ...data, village: v })}
                      className={`p-4 rounded-xl border text-right transition-all duration-200 flex items-center gap-3 ${
                        selected
                          ? 'bg-teal-500/15 border-teal-400/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-teal-500/20' : 'bg-white/5'}`}>
                        <MapPin className={`w-5 h-5 ${selected ? 'text-teal-400' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-sm">{v.name}</h3>
                        {customLocation && (
                          <p className="mt-1 text-xs leading-5 text-amber-200">
                            يتم تحديد رسوم الانتقال أثناء الزيارة.
                          </p>
                        )}
                      </div>
                      {selected && <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {filteredVillages.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">لا توجد قرى مطابقة للبحث</p>
              )}
            </div>
          )}

          {/* Step 2: Nurse Selection */}
          {step === 2 && (
            <div>
              <p className="text-gray-400 text-sm mb-4">اختر الممرض المفضل لك (اختياري)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setData({ ...data, nurse: null })}
                  className={`p-4 rounded-xl border text-right transition-all duration-200 flex items-center gap-3 ${
                    !data.nurse
                      ? 'bg-teal-500/15 border-teal-400/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!data.nurse ? 'bg-teal-500/20' : 'bg-white/5'}`}>
                    <Zap className={`w-5 h-5 ${!data.nurse ? 'text-teal-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-sm">أي ممرض متاح</h3>
                    <p className="text-gray-400 text-xs">سيتم تعيين الممرض الأقرب</p>
                  </div>
                  {!data.nurse && <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />}
                </button>
                {nurses.map((nurse) => {
                  const selected = data.nurse?.id === nurse.id;
                  return (
                    <button
                      key={nurse.id}
                      onClick={() => setData({ ...data, nurse })}
                      className={`p-4 rounded-xl border text-right transition-all duration-200 flex items-center gap-3 ${
                        selected
                          ? 'bg-teal-500/15 border-teal-400/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-teal-500/20' : 'bg-white/5'}`}>
                        <User className={`w-5 h-5 ${selected ? 'text-teal-400' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-sm">{nurse.name}</h3>
                        {nurse.is_main_admin && (
                          <p className="text-amber-400 text-xs">مشرف عام</p>
                        )}
                      </div>
                      {selected && <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {nurses.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">لا يوجد ممرضين متاحين حالياً</p>
              )}
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Urgent toggle */}
              <button
                onClick={() => setData({ ...data, urgent: !data.urgent })}
                className={`w-full p-5 rounded-xl border text-right transition-all flex items-center gap-4 ${
                  data.urgent
                    ? 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.urgent ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                  <Zap className={`w-6 h-6 ${data.urgent ? 'text-amber-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">طلب عاجل - أقرب وقت متاح</h3>
                  <p className="text-gray-400 text-sm">سيتم إرسال ممرض في أقرب وقت ممكن (رسوم إضافية تطبق)</p>
                </div>
                <div className={`w-12 h-7 rounded-full transition-all relative ${data.urgent ? 'bg-amber-500' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${data.urgent ? 'left-1' : 'right-1'}`} />
                </div>
              </button>

              {/* Date & Time (disabled if urgent) */}
              {!data.urgent && (
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all ${data.urgent ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div>
                    <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      التاريخ
                    </label>
                    <input
                      type="date"
                      value={data.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setData({ ...data, date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-400" />
                      الوقت
                    </label>
                    <input
                      type="time"
                      value={data.time}
                      onChange={(e) => setData({ ...data, time: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  {data.time && settings && (() => {
                    const hour = parseInt(data.time.split(':')[0]);
                    const isNight = hour >= settings.night_shift_start_hour || hour < 6;
                    return isNight ? (
                      <div className="sm:col-span-2 flex items-center gap-2 text-amber-300 text-sm bg-amber-500/10 rounded-lg p-3">
                        <AlertTriangle className="w-4 h-4" />
                        هذا الوقت يعتبر وردية ليلية — رسوم إضافية {formatPrice(settings.night_shift_fee)}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Client Info */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-400" />
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="اكتب اسمك"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-teal-400" />
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    className="input-field"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                <User className="w-5 h-5 text-sky-600 shrink-0" />
                <span className="text-gray-300 text-sm">سيتم إسناد الطلب تلقائيًا إلى الممرض المتاح.</span>
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  العنوان بالتفصيل *
                </label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  placeholder="الشارع، رقم المنزل، علامة مميزة"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  placeholder="أي معلومات إضافية تساعد الممرض..."
                  className="input-field min-h-[80px] resize-y"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-teal-400" />
                  روشتة الطبيب (اختياري)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setData({ ...data, prescriptionFile: e.target.files?.[0] ?? null })}
                  className="input-field !py-2 cursor-pointer file:mr-3 file:ml-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-teal-500/20 file:text-teal-300 file:cursor-pointer"
                />
                {data.prescriptionFile && (
                  <p className="text-teal-300 text-xs mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {data.prescriptionFile.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Invoice */}
          {step === 5 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <Banknote className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-white font-bold text-xl">ملخص الفاتورة</h3>
              </div>

              <div className="space-y-3 mb-6">
                <InvoiceRow label="الخدمة" value={data.service?.title ?? '-'} />
                <InvoiceRow label="المنطقة" value={data.village?.name ?? '-'} />
                {data.village?.name === CUSTOM_LOCATION_NAME && (
                  <p className="rounded-lg border border-amber-300/20 bg-amber-400/5 p-3 text-sm leading-6 text-amber-200">
                    يتم تحديد رسوم الانتقال أثناء الزيارة.
                  </p>
                )}
                <InvoiceRow label="إسناد الممرض" value="تلقائي حسب التوفر" />
                <InvoiceRow label="نوع الطلب" value={data.urgent ? 'عاجل' : `${data.date} ${data.time}`} />
                <div className="border-t border-white/10 my-3" />
                <InvoiceRow label="سعر الخدمة" value={formatPrice(pricing.base)} mono />
                {pricing.extras > 0 && (
                  <InvoiceRow label="رسوم إضافية (ليلي/عاجل)" value={formatPrice(pricing.extras)} mono />
                )}
                <div className="border-t border-white/10 my-3" />
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-l from-teal-500/10 to-emerald-500/10 border border-teal-400/20">
                  <span className="text-white font-bold text-lg">الإجمالي</span>
                  <span className="text-teal-300 font-bold text-2xl">{formatPrice(pricing.total)}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-400/20">
                  <div>
                    <span className="text-white font-bold">العربون المطلوب (30%)</span>
                    <span className="block text-amber-300/70 text-xs">يُدفع عند الحجز لتأكيد الطلب</span>
                  </div>
                  <span className="text-amber-300 font-bold text-xl">{formatPrice(pricing.deposit)}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-3 text-red-300 text-sm mb-4">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 6: Payment proof */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-teal-400" />
                  دفع العربون المطلوب ({formatPrice(pricing.deposit)})
                </h3>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-300 text-sm">فودافون كاش فقط</span>
                  <span className="text-teal-300 font-semibold" dir="ltr">{SUPERVISOR_PHONE}</span>
                </div>
                <p className="text-gray-400 text-xs">أرفق صورة واضحة لإيصال التحويل بعد الدفع.</p>
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-400" />
                  رقم الهاتف المُحوَّل منه / فودافون كاش *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={data.senderNumber}
                  onChange={(event) => setData({ ...data, senderNumber: event.target.value })}
                  placeholder="010xxxxxxxx"
                  className="input-field"
                  dir="ltr"
                  minLength={11}
                  maxLength={11}
                  pattern="[0-9]{11}"
                  autoComplete="off"
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-teal-400" />
                  رفع إيصال / وصل الدفع *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setData({ ...data, receiptFile: event.target.files?.[0] ?? null })}
                  className="input-field !py-2 cursor-pointer file:mr-3 file:ml-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-teal-500/20 file:text-teal-300 file:cursor-pointer"
                  required
                />
                {data.receiptFile && (
                  <p className="text-teal-300 text-xs mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {data.receiptFile.name}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-3 text-red-300 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 7: Confirmation */}
          {step === 7 && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-2xl mb-2">تم تسجيل طلبك بنجاح!</h3>
              <p className="text-gray-400 mb-6">احتفظ برمز الطلب التالي للمتابعة</p>

              <div className="glass-card p-6 mb-6">
                <div className="text-gray-400 text-sm mb-1">رمز الطلب</div>
                <div className="text-3xl font-bold neon-text tracking-wider" dir="ltr">{bookingCode}</div>
              </div>

              {/* Payment instructions */}
              <div className="text-right space-y-4 mb-6">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-teal-400" />
                  تعليمات دفع العربون ({formatPrice(pricing.deposit)})
                </h4>
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">فودافون كاش</span>
                    <span className="text-teal-300 font-semibold" dir="ltr">{SUPERVISOR_PHONE}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  بعد إرسال العربون، اضغط على زر واتساب بالأسفل لإرسال تفاصيل الطلب تلقائياً للمشرف وتأكيد الحجز.
                </p>
              </div>

              {/* WhatsApp send */}
              <a
                href={`https://wa.me/2${SUPERVISOR_PHONE}?text=${buildWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2 !bg-green-500 hover:!bg-green-600"
              >
                <MessageCircle className="w-5 h-5" />
                إرسال الطلب عبر واتساب
              </a>

              <div className="flex gap-3 mt-4">
                <button onClick={() => onNavigate('track')} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  تتبع الطلب
                </button>
                <button onClick={() => onNavigate('home')} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <HomeIcon className="w-4 h-4" />
                  الرئيسية
                </button>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {step < 7 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <button
                onClick={handlePrev}
                disabled={step === 0}
                className="btn-secondary flex items-center gap-2 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </button>
              {step < 6 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="btn-primary flex items-center gap-2"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submitBooking}
                  disabled={submitting || !canProceed()}
                  className="btn-primary flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري رفع الإيصال وتسجيل الطلب...
                    </>
                  ) : (
                    <>
                      إرسال إثبات الدفع
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Back to home */}
        {step < 7 && (
          <div className="text-center mt-6">
            <button onClick={() => onNavigate('home')} className="text-gray-500 hover:text-teal-300 text-sm flex items-center gap-1 mx-auto transition-colors">
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`text-white font-medium ${mono ? 'text-teal-300' : ''}`}>{value}</span>
    </div>
  );
}
