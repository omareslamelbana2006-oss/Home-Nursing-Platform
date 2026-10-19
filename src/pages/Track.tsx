import { useEffect, useRef, useState } from 'react';
import {
  Search, ClipboardList, Phone, MapPin, Calendar,
  Zap, FileText, Package, AlertCircle, ArrowLeft,
} from 'lucide-react';
import {
  supabase, type BookingWithRelations, SUPERVISOR_PHONE,
  formatPrice, getStatusLabel, getStatusColor, getPaymentStatusLabel, getPaymentStatusColor,
} from '@/lib/supabase';
import type { Page } from '@/components/Layout';
import { useHideServicePrices } from '@/lib/clientSettings';

interface TrackProps {
  onNavigate: (page: Page) => void;
}

export function Track({ onNavigate }: TrackProps) {
  const hideServicePrices = useHideServicePrices();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [booking, setBooking] = useState<BookingWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const orderResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searched && !loading && booking) {
      orderResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searched, loading, booking]);

  const handleSearch = async () => {
    if (phone.trim().length < 10 || code.trim().length < 3) {
      setError('من فضلك أدخل رقم الهاتف ورمز الطلب بشكل صحيح');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(true);
    setBooking(null);
    try {
      const { data, error: qErr } = await supabase
        .from('bookings')
        .select('*, village:villages(*), service:services(*)')
        .eq('client_phone', phone.trim())
        .eq('booking_code', code.trim().toUpperCase())
        .maybeSingle();

      if (qErr) throw new Error(qErr.message);
      setBooking(data as BookingWithRelations | null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  // Timeline steps
  const timeline = booking ? [
    { key: 'new', label: 'تم استلام الطلب', done: true },
    { key: 'confirmed', label: 'تم تأكيد الطلب', done: ['confirmed', 'completed'].includes(booking.status) },
    { key: 'completed', label: 'تم تنفيذ الخدمة', done: booking.status === 'completed' },
  ] : [];

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">تتبع طلبك</h1>
          <p className="text-gray-400 text-sm sm:text-base">أدخل رقم هاتفك ورمز الطلب لمتابعة الحالة</p>
        </div>

        {/* Search form */}
        <div className="glass-card p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="input-field"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-teal-400" />
                رمز الطلب
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="HN-XXXXXX"
                className="input-field uppercase"
                dir="ltr"
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-3 text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <button onClick={handleSearch} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  بحث
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && !loading && (
          <div className="animate-fade-in-up">
            {!booking ? (
              <div className="glass-card p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">لم يتم العثور على الطلب</h3>
                <p className="text-gray-400 text-sm mb-4">تأكد من رقم الهاتف ورمز الطلب وحاول مرة أخرى</p>
                <button onClick={() => onNavigate('booking')} className="text-teal-300 hover:text-teal-200 text-sm">
                  احجز طلب جديد →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status card */}
                <div ref={orderResultRef} className="glass-card scroll-mt-24 p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0">
                      <div className="text-gray-400 text-xs mb-1">رمز الطلب</div>
                      <div className="text-lg sm:text-xl font-bold neon-text break-words" dir="ltr">{booking.booking_code}</div>
                    </div>
                    <div className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-3 mt-6">
                    {timeline.map((t, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          t.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-600'
                        }`}>
                          {t.done ? '✓' : i + 1}
                        </div>
                        <div className={`flex-1 ${i < timeline.length - 1 ? 'border-r-2 border-white/5 pr-3 pb-3' : ''}`}>
                          <span className={t.done ? 'text-white font-medium' : 'text-gray-500'}>{t.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details card */}
                <div className="glass-card min-w-0 p-4 sm:p-6 space-y-3">
                  <h3 className="text-white font-bold mb-3">تفاصيل الطلب</h3>
                  <DetailRow icon={<ClipboardList className="w-4 h-4" />} label="الخدمة" value={booking.service?.title ?? '-'} />
                  <DetailRow icon={<MapPin className="w-4 h-4" />} label="المنطقة" value={booking.village?.name ?? '-'} />
                  <DetailRow icon={<MapPin className="w-4 h-4" />} label="العنوان" value={booking.address} />
                  <DetailRow
                    icon={booking.urgent_booking ? <Zap className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    label="الموعد"
                    value={booking.urgent_booking ? 'عاجل - أقرب وقت' : (booking.date_time ? new Date(booking.date_time).toLocaleString('ar-EG') : '-')}
                  />
                  <DetailRow icon={<Phone className="w-4 h-4" />} label="الهاتف" value={booking.client_phone} ltr />
                  {booking.notes && <DetailRow icon={<FileText className="w-4 h-4" />} label="ملاحظات" value={booking.notes} />}
                  {booking.prescription_url && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-400" />
                      <a href={booking.prescription_url} target="_blank" rel="noopener noreferrer" className="text-teal-300 hover:text-teal-200 text-sm">
                        عرض الروشتة
                      </a>
                    </div>
                  )}
                </div>

                {/* Payment card */}
                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-white font-bold mb-4">الدفعة</h3>
                  <div className="space-y-2">
                    {!hideServicePrices && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">الإجمالي</span>
                        <span className="text-white font-semibold">{formatPrice(booking.total_price)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {hideServicePrices ? 'العربون المطلوب للتأكيد' : 'العربون'}
                      </span>
                      <span className="text-amber-300 font-semibold">{formatPrice(booking.deposit_amount)}</span>
                    </div>
                    {hideServicePrices && (
                      <p className="text-xs text-gray-400">
                        يتم عرض العربون المطلوب فقط، وسيتم توضيح تفاصيل تكلفة الخدمة من خلال فريق التمريض.
                      </p>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-gray-400 text-sm">حالة الدفع</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(booking.payment_status)}`}>
                        {getPaymentStatusLabel(booking.payment_status)}
                      </span>
                    </div>
                  </div>
                </div>

                {booking.status === 'cancelled' && (
                  <div className="glass-card p-4 bg-red-500/5 border-red-400/20">
                    <p className="text-red-300 text-sm">تم إلغاء هذا الطلب. للتواصل اتصل بـ {SUPERVISOR_PHONE}</p>
                  </div>
                )}

                <button onClick={() => onNavigate('home')} className="text-gray-500 hover:text-teal-300 text-sm flex items-center gap-1 mx-auto transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  العودة للرئيسية
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, ltr }: { icon: React.ReactNode; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="text-teal-400 mt-0.5 shrink-0">{icon}</span>
      <span className="text-gray-400 text-sm min-w-[72px] shrink-0">{label}:</span>
      <span className="text-white text-sm min-w-0 flex-1 break-words whitespace-pre-wrap" dir={ltr ? 'ltr' : 'rtl'}>{value}</span>
    </div>
  );
}
