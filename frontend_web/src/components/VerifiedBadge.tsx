import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  showText?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  showText = false,
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = {
    xs: {
      icon: 'w-3 h-3',
      text: 'text-[10px] gap-0.5 px-1 py-0.2',
    },
    sm: {
      icon: 'w-4 h-4',
      text: 'text-xs gap-1 px-1.5 py-0.5',
    },
    md: {
      icon: 'w-5 h-5',
      text: 'text-sm gap-1.5 px-2 py-0.5',
    },
    lg: {
      icon: 'w-6 h-6',
      text: 'text-base gap-2 px-2.5 py-1',
    }
  };

  const current = sizeClasses[size];

  if (showText) {
    return (
      <span
        title="Organización Verificada"
        className={`inline-flex items-center font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs ${current.text} ${className}`}
      >
        <BadgeCheck className={`${current.icon} text-blue-600 fill-blue-100 shrink-0`} />
        <span>Verificada</span>
      </span>
    );
  }

  return (
    <span
      title="Organización Verificada por Give&Go"
      className={`inline-flex items-center shrink-0 text-blue-600 ${className}`}
    >
      <BadgeCheck className={`${current.icon} fill-blue-100 shrink-0`} />
    </span>
  );
};
