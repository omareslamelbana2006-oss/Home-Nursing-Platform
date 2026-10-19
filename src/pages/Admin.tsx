import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Shield, LayoutDashboard, Settings, CalendarDays, Calculator,
  Lock, LogOut, Search, Filter, Eye, X, Check, Clock,
  TrendingUp, Package, AlertCircle, RefreshCw, Save, ArrowLeft,
  UserPlus, UserMinus, Edit, Trash2,
} from 'lucide-react';
import {
  supabase, type Service, type BookingWithRelations, type AdminSettings, type Nurse,
  formatPrice, getStatusLabel, getStatusColor, getPaymentStatusLabel, getPaymentStatusColor,
  CANCEL_TRANSFER_FEE, type BookingStatus, type PaymentStatus,
} from '@/lib/supabase';
import { getLocalNurses, isMissingNurseAdminColumn, mergeLocalNurses, normalizeNurses, saveLocalNurses } from '@/lib/nurses';
import type { Page } from '@/components/Layout';

const DEFAULT_PASSKEY = '*Mohamed2000*';
const SESSION_KEY = 'hn_admin_session';

type AdminTab = 'dashboard' | 'orders' | 'pricing' | 'calendar' | 'refund' | 'nurses';

export function Admin({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'yes');
  const [passkey, setPasskey] = useState('');
  const [passError, setPassError] = useState('');
  const [tab, setTab] = useState<AdminTab>('dashboard');

  const handleLogin = () => {
    setPassError('');
    if (passkey === DEFAULT_PASSKEY) {
      sessionStorage.setItem(SESSION_KEY, 'yes');
      setAuthed(true);
      setPasskey('');
    } else {
      setPassError('رمز الدخول غير صحيح');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setPasskey('');
  };

  if (!authed) {
    return (
      <div className="pt-24 pb-12 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="glass-card p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0284c7]/20 to-[#0f62fe]/20 flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
                <Lock className="w-8 h-8 text-[#0284c7]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">لوحة التحكم</h1>
              <p className="text-gray-400 text-sm">أدخل رمز الدخول للوصول إلى لوحة الإدارة</p>
            </div>
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="رمز الدخول"
              className="input-field text-center tracking-widest"
              dir="ltr"
            />
            {passError && (
              <div className="mt-3 bg-red-500/10 border border-red-400/20 rounded-lg p-3 text-red-300 text-sm text-center">
                {passError}
              </div>
            )}
            <button onClick={handleLogin} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              دخول
            </button>
            <button onClick={() => onNavigate('home')} className="text-gray-500 hover:text-[#0284c7] text-sm flex items-center gap-1 mx-auto mt-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'dashboard', label: 'الإحصائيات', icon: LayoutDashboard },
    { key: 'orders', label: 'إدارة الطلبات', icon: Package },
  ];
  tabs.push(
    { key: 'pricing', label: 'التسعير والإعدادات', icon: Settings },
    { key: 'calendar', label: 'المواعيد', icon: CalendarDays },
    { key: 'refund', label: 'حاسبة الاسترجاع', icon: Calculator },
    { key: 'nurses', label: 'إدارة فريق التمريض', icon: UserPlus },
  );

  return (
    <div className="pt-20 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#1e40af] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">لوحة التحكم</h1>
              <p className="text-gray-400 text-xs">إدارة خدمة Home Nursing</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary !px-4 !py-2 flex items-center gap-2 text-sm">
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto mb-6 pb-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#0284c7]/20 text-[#0284c7] border border-[#0284c7]/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="animate-fade-in-up" key={tab}>
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'pricing' && <PricingTab />}
          {tab === 'calendar' && <CalendarTab />}
          {tab === 'refund' && <RefundTab />}
          {tab === 'nurses' && <NursesTab />}
        </div>
      </div>
    </div>
  );
}

// ===== Dashboard Tab =====
function DashboardTab() {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, village:villages(*), service:services(*)')
        .order('created_at', { ascending: false });
      setBookings((data as BookingWithRelations[]) || []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pendingDeposits = bookings.filter(b => b.payment_status === 'pending_deposit').length;
    const revenue = bookings
      .filter(b => b.payment_status === 'paid' && b.status !== 'cancelled')
      .reduce((sum, b) => sum + Number(b.total_price), 0);
    const completed = bookings.filter(b => b.status === 'completed').length;
    const newCount = bookings.filter(b => b.status === 'new').length;
    return { total, pendingDeposits, revenue, completed, newCount };
  }, [bookings]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" /></div>;
  }

  const statCards = [
    { label: 'إجمالي الطلبات', value: stats.total, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'طلبات جديدة', value: stats.newCount, icon: Clock, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { label: 'بانتظار العربون', value: stats.pendingDeposits, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'الإيرادات', value: formatPrice(stats.revenue), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent bookings */}
      <div className="glass-card p-6">
        <h3 className="text-white font-bold mb-4">أحدث الطلبات</h3>
        <div className="space-y-2">
          {bookings.slice(0, 5).map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-teal-300 font-mono text-sm" dir="ltr">{b.booking_code}</div>
                <div>
                  <div className="text-white text-sm font-medium">{b.client_name}</div>
                  <div className="text-gray-500 text-xs">{b.service?.title}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(b.status)}`}>
                  {getStatusLabel(b.status)}
                </span>
                <span className="text-gray-300 text-sm font-semibold">{formatPrice(b.total_price)}</span>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="text-center text-gray-500 py-8">لا توجد طلبات بعد</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Orders Tab =====
function OrdersTab() {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<BookingWithRelations | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, village:villages(*), service:services(*)')
      .order('created_at', { ascending: false });
    setBookings((data as BookingWithRelations[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (filter !== 'all' && b.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return b.client_name.toLowerCase().includes(q) ||
               b.client_phone.includes(q) ||
               b.booking_code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [bookings, filter, search]);

  const getReceiptUrl = (booking: BookingWithRelations) =>
    booking.receipt_url ?? getBookingNoteValue(booking.notes, 'رابط الإيصال');

  const getSenderNumber = (booking: BookingWithRelations) =>
    booking.sender_number ?? getBookingNoteValue(booking.notes, 'رقم التحويل') ?? '-';

  const getNurseName = (booking: BookingWithRelations) =>
    getBookingNoteValue(booking.notes, 'الممرض') ??
    getBookingNoteValue(booking.notes, 'الممرض المطلوب') ??
    'سيتم تعيينه حسب التوفر';

  const updateStatus = async (id: string, status: BookingStatus) => {
    if (status === 'confirmed' && selected?.id === id && !getReceiptUrl(selected)) return;
    await supabase.from('bookings').update({ status }).eq('id', id);
    fetchBookings();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const updatePayment = async (id: string, payment_status: PaymentStatus) => {
    await supabase.from('bookings').update({ payment_status }).eq('id', id);
    fetchBookings();
    if (selected?.id === id) setSelected({ ...selected, payment_status });
  };

  const filterButtons: { key: 'all' | BookingStatus; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'new', label: 'جديد' },
    { key: 'confirmed', label: 'مؤكد' },
    { key: 'completed', label: 'مكتمل' },
    { key: 'cancelled', label: 'ملغي' },
  ];

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، الهاتف، رمز الطلب..."
            className="input-field !pr-10"
          />
        </div>
        <button onClick={fetchBookings} className="btn-secondary !px-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-gray-500 shrink-0" />
        {filterButtons.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key ? 'bg-teal-500/20 text-teal-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => (
            <div key={b.id} className="glass-card p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setSelected(b)}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-teal-300 font-mono text-sm shrink-0" dir="ltr">{b.booking_code}</div>
                <div className="min-w-0">
                  <div className="text-white text-sm font-medium truncate">{b.client_name}</div>
                  <div className="text-gray-500 text-xs truncate">{b.service?.title} — {b.village?.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(b.payment_status)}`}>
                  {getPaymentStatusLabel(b.payment_status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(b.status)}`}>
                  {getStatusLabel(b.status)}
                </span>
                <span className="text-gray-300 text-sm font-semibold hidden sm:inline">{formatPrice(b.total_price)}</span>
                <Eye className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-12">لا توجد طلبات مطابقة</div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="glass-card bg-[#101c2e] border-white/15 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 step-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-lg">تفاصيل الطلب</h3>
                <div className="text-teal-300 font-mono text-sm" dir="ltr">{selected.booking_code}</div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <DetailItem label="العميل" value={selected.client_name} />
              <DetailItem label="الهاتف" value={selected.client_phone} ltr />
              <DetailItem label="رقم المحول منه" value={getSenderNumber(selected)} ltr />
              <DetailItem label="الممرض" value={getNurseName(selected)} />
              <DetailItem label="الخدمة" value={selected.service?.title ?? '-'} />
              <DetailItem label="المنطقة" value={selected.village?.name ?? getBookingNoteValue(selected.notes, 'الموقع') ?? '-'} />
              <DetailItem label="العنوان" value={selected.address} />
              <DetailItem label="الموعد" value={selected.urgent_booking ? 'عاجل' : (selected.date_time ? new Date(selected.date_time).toLocaleString('ar-EG') : '-')} />
              {selected.notes && <DetailItem label="ملاحظات" value={selected.notes} />}
              {selected.prescription_url && (
                <div>
                  <span className="text-gray-400 text-sm">الروشتة: </span>
                  <a href={selected.prescription_url} target="_blank" rel="noopener noreferrer" className="text-teal-300 hover:text-teal-200 text-sm">عرض الصورة</a>
                </div>
              )}
              <div className="border-t border-white/10 pt-3">
                <span className="text-gray-400 text-sm block mb-2">إيصال الدفع</span>
                {getReceiptUrl(selected) ? (
                  <button
                    type="button"
                    onClick={() => setReceiptPreviewUrl(getReceiptUrl(selected)!)}
                    className="group flex items-center gap-3 text-right"
                    aria-label="عرض إيصال الدفع بالحجم الكامل"
                  >
                    <img
                      src={getReceiptUrl(selected)!}
                      alt="إيصال الدفع"
                      className="w-24 h-24 object-cover rounded-lg border border-white/15 group-hover:border-teal-400/60"
                    />
                    <span className="text-teal-300 text-sm">اضغط لتكبير الإيصال</span>
                  </button>
                ) : (
                  <span className="text-gray-500 text-sm">لا يوجد إيصال مرفق</span>
                )}
              </div>
              <div className="border-t border-white/10 pt-3">
                <DetailItem label="الإجمالي" value={formatPrice(selected.total_price)} highlight />
                <DetailItem label="العربون" value={formatPrice(selected.deposit_amount)} />
              </div>
            </div>

            {/* Status controls */}
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 block">حالة الطلب</label>
                {!getReceiptUrl(selected) && (
                  <p className="text-amber-300 text-xs mb-2">لا يمكن تأكيد الطلب قبل مراجعة إيصال الدفع.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {(['new', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={s === 'confirmed' && !getReceiptUrl(selected)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        selected.status === s ? getStatusColor(s) : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                      } ${s === 'confirmed' && !getReceiptUrl(selected) ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {getStatusLabel(s)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 block">حالة الدفع</label>
                <div className="flex flex-wrap gap-2">
                  {(['pending_deposit', 'paid', 'refunded'] as PaymentStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => updatePayment(selected.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        selected.payment_status === s ? getPaymentStatusColor(s) : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {getPaymentStatusLabel(s)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {receiptPreviewUrl && (
            <div
              className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
              onClick={() => setReceiptPreviewUrl(null)}
            >
              <div className="relative max-w-5xl max-h-[90vh]" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setReceiptPreviewUrl(null)}
                  className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-[#101c2e] text-white border border-white/20 hover:bg-white/10"
                  aria-label="إغلاق معاينة الإيصال"
                >
                  <X className="w-5 h-5" />
                </button>
                <img
                  src={receiptPreviewUrl}
                  alt="إيصال الدفع بالحجم الكامل"
                  className="max-h-[85vh] max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, ltr, highlight }: { label: string; value: string; ltr?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-400 text-sm shrink-0">{label}</span>
      <span className={`text-sm ${highlight ? 'text-teal-300 font-bold text-lg' : 'text-white'}`} dir={ltr ? 'ltr' : 'rtl'}>{value}</span>
    </div>
  );
}

function getBookingNoteValue(notes: string, label: string): string | null {
  const prefix = `${label}:`;
  const line = notes.split('\n').find((entry) => entry.startsWith(prefix));
  const value = line?.slice(prefix.length).trim();
  return value || null;
}

// ===== Pricing Tab =====
function PricingTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    (async () => {
      const [s, a] = await Promise.all([
        supabase.from('services').select('*').order('created_at'),
        supabase.from('admin_settings').select('id, night_shift_fee, urgent_fee, night_shift_start_hour, created_at').limit(1).maybeSingle(),
      ]);
      if (s.data) setServices(s.data);
      if (a.data) setSettings(a.data as AdminSettings);
      setLoading(false);
    })();
  }, []);

  const updateServicePrice = async (id: string, price: number) => {
    await supabase.from('services').update({ price_base: price }).eq('id', id);
  };

  const toggleServiceVisibility = async (id: string, visible: boolean) => {
    await supabase.from('services').update({ is_visible: visible }).eq('id', id);
    setServices(services.map(s => s.id === id ? { ...s, is_visible: visible } : s));
  };

  const updateSettings = async () => {
    if (!settings) return;
    setSaving(true);
    await supabase.from('admin_settings').update({
      night_shift_fee: settings.night_shift_fee,
      urgent_fee: settings.urgent_fee,
      night_shift_start_hour: settings.night_shift_start_hour,
    }).eq('id', settings.id);
    setSaving(false);
    setSavedMsg('تم حفظ الإعدادات بنجاح');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Services pricing */}
      <div className="glass-card p-6">
        <h3 className="text-white font-bold mb-4">أسعار الخدمات</h3>
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium">{s.title}</div>
                <div className="text-gray-500 text-xs">{s.category === 'short_visit' ? 'زيارة قصيرة' : 'رعاية ممتدة'}</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={s.price_base}
                  onBlur={(e) => updateServicePrice(s.id, parseFloat(e.target.value) || 0)}
                  className="input-field !w-24 !py-2 text-center"
                />
                <span className="text-gray-400 text-sm">ج.م</span>
                <button
                  onClick={() => toggleServiceVisibility(s.id, !s.is_visible)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    s.is_visible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-gray-500'
                  }`}
                >
                  {s.is_visible ? 'ظاهر' : 'مخفي'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extra settings */}
      <div className="glass-card p-6">
        <h3 className="text-white font-bold mb-4">رسوم إضافية</h3>
        {settings && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">رسوم الوردية الليلية</label>
              <input
                type="number"
                value={settings.night_shift_fee}
                onChange={(e) => setSettings({ ...settings, night_shift_fee: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">رسوم الطلب العاجل</label>
              <input
                type="number"
                value={settings.urgent_fee}
                onChange={(e) => setSettings({ ...settings, urgent_fee: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">بداية الوردية الليلية (الساعة)</label>
              <input
                type="number"
                min={0}
                max={23}
                value={settings.night_shift_start_hour}
                onChange={(e) => setSettings({ ...settings, night_shift_start_hour: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>
        )}
        <button onClick={updateSettings} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ الإعدادات
        </button>
        {savedMsg && <span className="text-emerald-300 text-sm mr-3">{savedMsg}</span>}
      </div>
    </div>
  );
}

// ===== Calendar Tab =====
function CalendarTab() {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'today'>('upcoming');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, village:villages(*), service:services(*)')
        .not('date_time', 'is', null)
        .order('date_time', { ascending: true });
      setBookings((data as BookingWithRelations[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    if (filter === 'today') return bookings.filter(b => b.date_time && new Date(b.date_time) <= todayEnd && new Date(b.date_time) >= now);
    if (filter === 'upcoming') return bookings.filter(b => b.date_time && new Date(b.date_time) >= now);
    return bookings;
  }, [bookings, filter]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {(['upcoming', 'today', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-teal-500/20 text-teal-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f === 'upcoming' ? 'القادمة' : f === 'today' ? 'اليوم' : 'الكل'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(b => (
          <div key={b.id} className="glass-card p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex flex-col items-center justify-center shrink-0">
              <div className="text-teal-300 font-bold text-lg">{b.date_time ? new Date(b.date_time).getDate() : '-'}</div>
              <div className="text-gray-400 text-xs">{b.date_time ? new Date(b.date_time).toLocaleString('ar-EG', { month: 'short' }) : ''}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm">{b.service?.title}</div>
              <div className="text-gray-400 text-xs">{b.client_name} — {b.village?.name}</div>
              <div className="text-gray-500 text-xs">{b.date_time ? new Date(b.date_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(b.status)}`}>
              {getStatusLabel(b.status)}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-12">لا توجد مواعيد في هذه الفترة</div>
        )}
      </div>
    </div>
  );
}

// ===== Refund Calculator =====
function RefundTab() {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [cancelBy, setCancelBy] = useState<'client' | 'nurse'>('client');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, village:villages(*), service:services(*)')
        .order('created_at', { ascending: false })
        .limit(50);
      setBookings((data as BookingWithRelations[]) || []);
      setLoading(false);
    })();
  }, []);

  const selected = bookings.find(b => b.id === selectedId);
  const calc = useMemo(() => {
    if (!selected) return null;
    const deposit = Number(selected.deposit_amount);
    if (cancelBy === 'nurse') {
      return { refund: deposit, deduction: 0, full: true };
    }
    const refund = Math.max(0, deposit - CANCEL_TRANSFER_FEE);
    return { refund, deduction: CANCEL_TRANSFER_FEE, full: false };
  }, [selected, cancelBy]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="text-white font-bold">حاسبة الاسترجاع</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6">اختر طلباً واحسب مبلغ الاسترجاع حسب جهة الإلغاء</p>

        {/* Select booking */}
        <label className="text-gray-300 text-sm font-medium mb-2 block">اختر الطلب</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="input-field mb-4 cursor-pointer"
        >
          <option value="">-- اختر طلباً --</option>
          {bookings.map(b => (
            <option key={b.id} value={b.id} className="bg-[#0d1b2a]">
              {b.booking_code} — {b.client_name} — {formatPrice(b.deposit_amount)} عربون
            </option>
          ))}
        </select>

        {selected && (
          <>
            {/* Booking info */}
            <div className="glass-card p-4 mb-4">
              <div className="text-teal-300 font-mono text-sm mb-2" dir="ltr">{selected.booking_code}</div>
              <div className="text-white text-sm">{selected.client_name}</div>
              <div className="text-gray-400 text-sm">{selected.service?.title}</div>
              <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                <span className="text-gray-400 text-sm">العربون المدفوع</span>
                <span className="text-amber-300 font-semibold">{formatPrice(selected.deposit_amount)}</span>
              </div>
            </div>

            {/* Cancel by */}
            <label className="text-gray-300 text-sm font-medium mb-2 block">جهة الإلغاء</label>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCancelBy('client')}
                className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                  cancelBy === 'client' ? 'bg-amber-500/15 border-amber-400/50 text-amber-300' : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                من العميل (خصم {formatPrice(CANCEL_TRANSFER_FEE)})
              </button>
              <button
                onClick={() => setCancelBy('nurse')}
                className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                  cancelBy === 'nurse' ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                من الممرض (استرجاع كامل)
              </button>
            </div>

            {/* Result */}
            {calc && (
              <div className="glass-card p-5 bg-gradient-to-l from-teal-500/10 to-emerald-500/10">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">العربون</span>
                    <span className="text-white font-medium">{formatPrice(selected.deposit_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">الخصم</span>
                    <span className="text-red-300 font-medium">- {formatPrice(calc.deduction)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                    <span className="text-white font-bold">المبلغ المسترجع</span>
                    <span className="text-emerald-300 font-bold text-xl">{formatPrice(calc.refund)}</span>
                  </div>
                  {calc.full && (
                    <div className="text-emerald-300 text-xs flex items-center gap-1 mt-2">
                      <Check className="w-3.5 h-3.5" />
                      استرجاع كامل بدون أي خصومات
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ===== Nurses Management Tab =====
function NursesTab() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    passkey: '',
    is_main_admin: false,
  });

  const fetchNurses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nurses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching nurses:', error);
      setNurses(getLocalNurses());
      setNotice('تعذر الاتصال بقاعدة البيانات؛ يتم عرض الممرضين المحفوظين على هذا الجهاز فقط.');
    } else {
      const mergedNurses = mergeLocalNurses(normalizeNurses(data || []));
      setNurses(mergedNurses);
      setNotice(mergedNurses.some((nurse) => nurse.id.startsWith('local-'))
        ? 'توجد ممرضون محفوظون على هذا الجهاز فقط؛ لن تظهر سجلاتهم على الأجهزة الأخرى.'
        : '');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNurses();
  }, [fetchNurses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingNurse) {
      if (editingNurse.id.startsWith('local-')) {
        const updatedNurses = getLocalNurses().map((nurse) =>
          nurse.id === editingNurse.id ? { ...nurse, ...formData } : nurse,
        );
        saveLocalNurses(updatedNurses);
        setNotice('تم حفظ بيانات الممرض على هذا الجهاز فقط؛ لن تظهر على الأجهزة الأخرى.');
        setFormData({ name: '', phone: '', passkey: '', is_main_admin: false });
        setShowAddForm(false);
        setEditingNurse(null);
        fetchNurses();
        return;
      }

      // Update existing nurse
      let { error } = await supabase
        .from('nurses')
        .update({
          name: formData.name,
          phone: formData.phone,
          passkey: formData.passkey,
          is_main_admin: formData.is_main_admin,
        })
        .eq('id', editingNurse.id);

      if (error && isMissingNurseAdminColumn(error)) {
        const result = await supabase
          .from('nurses')
          .update({
            name: formData.name,
            phone: formData.phone,
            passkey: formData.passkey,
            is_supervisor: formData.is_main_admin,
          })
          .eq('id', editingNurse.id);
        error = result.error;
      }

      if (error) {
        console.error('Error updating nurse:', error);
        setNotice('تعذر تحديث بيانات الممرض في قاعدة البيانات.');
        return;
      }
    } else {
      const nurseData = {
        name: formData.name,
        phone: formData.phone,
        passkey: formData.passkey,
        is_main_admin: formData.is_main_admin,
      };
      let { error } = await supabase.from('nurses').insert([nurseData]);

      if (error && isMissingNurseAdminColumn(error)) {
        const result = await supabase.from('nurses').insert([{
          name: formData.name,
          phone: formData.phone,
          passkey: formData.passkey,
          is_supervisor: formData.is_main_admin,
        }]);
        error = result.error;
      }

      if (error) {
        console.error('Could not create nurse in Supabase; saving locally:', error);
        const localNurse: Nurse = {
          id: `local-${crypto.randomUUID()}`,
          ...nurseData,
          created_at: new Date().toISOString(),
        };
        saveLocalNurses([...getLocalNurses(), localNurse]);
        setNotice('تعذرت الإضافة إلى قاعدة البيانات؛ حُفظ الممرض على هذا الجهاز فقط ولن يظهر للأجهزة الأخرى.');
      } else {
        setNotice('');
      }
    }

    // Reset form and refresh
    setFormData({ name: '', phone: '', passkey: '', is_main_admin: false });
    setShowAddForm(false);
    setEditingNurse(null);
    fetchNurses();
  };

  const handleEdit = (nurse: Nurse) => {
    setEditingNurse(nurse);
    setFormData({
      name: nurse.name,
      phone: nurse.phone,
      passkey: nurse.passkey,
      is_main_admin: nurse.is_main_admin,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الممرض؟')) return;

    if (id.startsWith('local-')) {
      saveLocalNurses(getLocalNurses().filter((nurse) => nurse.id !== id));
      fetchNurses();
      return;
    }

    const { error } = await supabase.from('nurses').delete().eq('id', id);

    if (error) {
      console.error('Error deleting nurse:', error);
      setNotice('تعذر حذف الممرض من قاعدة البيانات.');
      return;
    }

    fetchNurses();
  };

  const handleCancel = () => {
    setFormData({ name: '', phone: '', passkey: '', is_main_admin: false });
    setShowAddForm(false);
    setEditingNurse(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">إدارة فريق التمريض</h2>
          <p className="text-gray-400 text-sm">إضافة وتعديل وحذف الممرضين</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            إضافة ممرض جديد
          </button>
        )}
      </div>

      {notice && (
        <div className="glass-card border-amber-400/20 p-3 mb-4 text-amber-200 text-sm" role="status">
          {notice}
        </div>
      )}

      {showAddForm ? (
        <div className="glass-card p-6 mb-6 animate-fade-in-up">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingNurse ? 'تعديل بيانات الممرض' : 'إضافة ممرض جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">اسم الممرض</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="أدخل اسم الممرض الكامل"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="أدخل رقم الهاتف"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">رمز الدخول الخاص</label>
              <input
                type="text"
                value={formData.passkey}
                onChange={(e) => setFormData({ ...formData, passkey: e.target.value })}
                className="input-field"
                placeholder="رمز الدخول للممرض"
                dir="ltr"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_main_admin"
                checked={formData.is_main_admin}
                onChange={(e) => setFormData({ ...formData, is_main_admin: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="is_main_admin" className="text-gray-300 text-sm">
                مشرف (يمكنه الوصول للوحة التحكم)
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">
                {editingNurse ? 'حفظ التعديلات' : 'إضافة الممرض'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary flex-1">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-8 h-8 text-[#0284c7] mx-auto animate-spin mb-3" />
          <p className="text-gray-400">جاري تحميل البيانات...</p>
        </div>
      ) : nurses.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <UserPlus className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">لا يوجد ممرضين مضافين بعد</p>
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            إضافة أول ممرض
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nurses.map((nurse) => (
            <div key={nurse.id} className="glass-card p-5 hover:border-[#0284c7]/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0284c7]/20 to-[#0f62fe]/20 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-[#0284c7]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{nurse.name}</h3>
                    {nurse.is_main_admin && (
                      <span className="text-xs text-amber-400">مشرف</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-gray-500">الهاتف:</span>
                  <span dir="ltr">{nurse.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-gray-500">رمز الدخول:</span>
                  <span dir="ltr" className="font-mono">••••••</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => handleEdit(nurse)}
                  className="flex-1 btn-secondary !py-2 text-sm flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(nurse.id)}
                  className="flex-1 btn-danger !py-2 text-sm flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
