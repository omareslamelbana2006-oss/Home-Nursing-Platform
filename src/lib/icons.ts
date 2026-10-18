import {
  Stethoscope, Syringe, Bandage, HeartPulse, Activity,
  Droplets, Thermometer, type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  Syringe,
  Bandage,
  HeartPulse,
  Activity,
  Droplets,
  Thermometer,
};

export function getServiceIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Stethoscope;
}
