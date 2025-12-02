import React from 'react';
import {
  ShoppingCart,
  User,
  Settings,
  Zap,
  Dumbbell,
  Apple,
  Droplet,
  Wheat,
  Clock,
  DollarSign,
  Sparkles,
  Plus,
  X,
  Trash2,
  Edit,
  Search,
  Heart,
  Hand,
  PartyPopper,
  Calendar,
  Utensils,
  Target,
  UtensilsCrossed,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
  Flame,
  CalendarCheck,
  Smile,
  Activity,
  Sprout,
  Beef,
  Coins,
  Wallet,
  CircleDollarSign,
  Soup,
  Drumstick,
} from 'lucide-react';

export type IconName = 
  | 'shopping-cart'
  | 'user'
  | 'settings'
  | 'zap'
  | 'dumbbell'
  | 'apple'
  | 'droplet'
  | 'wheat'
  | 'clock'
  | 'dollar'
  | 'coins'
  | 'wallet'
  | 'circle-dollar'
  | 'soup'
  | 'drumstick'
  | 'sparkles'
  | 'plus'
  | 'close'
  | 'trash'
  | 'edit'
  | 'search'
  | 'heart'
  | 'hand'
  | 'party'
  | 'calendar'
  | 'utensils'
  | 'target'
  | 'utensils-crossed'
  | 'alert'
  | 'chevron-left'
  | 'chevron-right'
  | 'check'
  | 'flame'
  | 'calendar-check'
  | 'smile'
  | 'activity'
  | 'sprout'
  | 'beef';

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

const iconMap = {
  'shopping-cart': ShoppingCart,
  'user': User,
  'settings': Settings,
  'zap': Zap,
  'dumbbell': Dumbbell,
  'apple': Apple,
  'droplet': Droplet,
  'wheat': Wheat,
  'clock': Clock,
  'dollar': DollarSign,
  'coins': Coins,
  'wallet': Wallet,
  'circle-dollar': CircleDollarSign,
  'soup': Soup,
  'drumstick': Drumstick,
  'sparkles': Sparkles,
  'plus': Plus,
  'close': X,
  'trash': Trash2,
  'edit': Edit,
  'search': Search,
  'heart': Heart,
  'hand': Hand,
  'party': PartyPopper,
  'calendar': Calendar,
  'utensils': Utensils,
  'target': Target,
  'utensils-crossed': UtensilsCrossed,
  'alert': AlertTriangle,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'check': Check,
  'flame': Flame,
  'calendar-check': CalendarCheck,
  'smile': Smile,
  'activity': Activity,
  'sprout': Sprout,
  'beef': Beef,
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 20, 
  color = 'currentColor',
  className = '',
  strokeWidth = 2,
  ...rest
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <span {...rest}>
      <IconComponent 
        size={size} 
        color={color} 
        className={className}
        strokeWidth={strokeWidth}
      />
    </span>
  );
};
