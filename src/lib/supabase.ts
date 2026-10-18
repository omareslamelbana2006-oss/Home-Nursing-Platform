import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable backend features.');
}

export const supabase = createClient(
  supabaseUrl || 'http://127.0.0.1:54321',
  supabaseAnonKey || 'missing-supabase-anon-key',
);

// ===== Types =====
export type ServiceCategory = 'short_visit' | 'extended_care';
export type PaymentStatus = 'pending_deposit' | 'paid' | 'refunded';
export type BookingStatus = 'new' | 'confirmed' | 'completed' | 'cancelled';
export const MAIN_REGION_NAMES = [
  'الحامول', 'الزعفران', 'أبو بدوي', 'الشرقي', 'السحايت',
  'الثمانين', 'أبو سكين', 'المناوفة', 'غرب تيرة', 'البنا',
];

export interface Service {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  price_base: number;
  icon_name: string;
  is_visible: boolean;
  created_at: string;
}

export interface Village {
  id: string;
  name: string;
  created_at: string;
}

export interface Nurse {
  id: string;
  name: string;
  phone: string;
  passkey: string;
  is_supervisor: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  client_name: string;
  client_phone: string;
  address: string;
  village_id: string | null;
  service_id: string | null;
  care_type: string;
  date_time: string | null;
  urgent_booking: boolean;
  prescription_url: string | null;
  sender_number: string | null;
  receipt_url: string | null;
  total_price: number;
  deposit_amount: number;
  payment_status: PaymentStatus;
  status: BookingStatus;
  notes: string;
  created_at: string;
}

export interface AdminSettings {
  id: string;
  night_shift_fee: number;
  urgent_fee: number;
  night_shift_start_hour: number;
  created_at: string;
}

export interface BookingWithRelations extends Booking {
  village?: Village | null;
  service?: Service | null;
}

// ===== Constants =====
export const SUPERVISOR_NAME = 'مستر محمد علي';
export const SUPERVISOR_PHONE = '01018699395';
export const EMERGENCY_NUMBER = '123';
export const DEPOSIT_RATE = 0.30;
export const CANCEL_TRANSFER_FEE = 10;

export function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HN-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function formatPrice(price: number): string {
  return `${Math.round(price)} ج.م`;
}

export function getStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    new: 'جديد',
    confirmed: 'مؤكد',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  };
  return labels[status] || status;
}

export function getStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    new: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    confirmed: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    cancelled: 'bg-red-500/20 text-red-300 border-red-400/30',
  };
  return colors[status] || '';
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    pending_deposit: 'بانتظار العربون',
    paid: 'مدفوع',
    refunded: 'مسترجع',
  };
  return labels[status] || status;
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    pending_deposit: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    paid: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    refunded: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  };
  return colors[status] || '';
}
