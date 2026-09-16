import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, Heart, HeartHandshake, User } from 'lucide-react';
import { UserRole } from '../types';
import { VerifiedBadge } from './VerifiedBadge';

interface UserLinkProps {
  userId?: string | number;
  name?: string;
  role?: UserRole | string;
  avatar?: string;
  showAvatar?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showRoleBadge?: boolean;
  verificada?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const UserLink: React.FC<UserLinkProps> = ({
  userId,
  name = 'Usuario',
  role,
  avatar,
  showAvatar = true,
  size = 'md',
  showRoleBadge = false,
  verificada = false,
  className = '',
  children
}) => {
  const navigate = useNavigate();

  if (!userId) {
    return <span className={`font-medium text-neutral-800 ${className}`}>{name}</span>;
  }

  const normRole = (role || '').toLowerCase();
  const isOrg = normRole === 'organizacion' || normRole === 'org' || String(userId).startsWith('org_');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOrg) {
      const orgId = String(userId).startsWith('org_') ? userId : `org_${userId}`;
      navigate(`/perfil/${orgId}`);
    }
  };

  const getRoleInfo = (r?: string) => {
    const norm = (r || '').toLowerCase();
    if (norm === 'admin') {
      return { label: 'Admin', color: 'bg-red-50 text-red-700 border-red-200', icon: Shield };
    }
    if (norm === 'organizacion' || norm === 'org') {
      return { label: 'Organización', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Building2 };
    }
    if (norm === 'voluntario') {
      return { label: 'Voluntario', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Heart };
    }
    if (norm === 'beneficiario') {
      return { label: 'Beneficiario', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: HeartHandshake };
    }
    return { label: 'Usuario', color: 'bg-neutral-100 text-neutral-700 border-neutral-200', icon: User };
  };

  const roleInfo = getRoleInfo(role);
  const RoleIcon = roleInfo.icon;

  const sizeClasses = {
    xs: {
      avatar: 'w-5 h-5 text-[10px]',
      text: 'text-xs',
      spacing: 'gap-1.5'
    },
    sm: {
      avatar: 'w-6 h-6 text-xs',
      text: 'text-xs font-medium',
      spacing: 'gap-2'
    },
    md: {
      avatar: 'w-8 h-8 text-sm',
      text: 'text-sm font-semibold',
      spacing: 'gap-2.5'
    },
    lg: {
      avatar: 'w-10 h-10 text-base',
      text: 'text-base font-bold',
      spacing: 'gap-3'
    }
  };

  const currentSize = sizeClasses[size];

  if (children) {
    return (
      <div
        onClick={handleClick}
        className={`inline-flex items-center ${isOrg ? 'cursor-pointer hover:opacity-80' : ''} transition-all duration-150 group ${className}`}
        role={isOrg ? "button" : undefined}
        tabIndex={isOrg ? 0 : undefined}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center ${currentSize.spacing} ${isOrg ? 'cursor-pointer group' : ''} transition-all duration-150 ${className}`}
      role={isOrg ? "button" : undefined}
      tabIndex={isOrg ? 0 : undefined}
      title={isOrg ? `Ver perfil de ${name}` : name}
    >
      {showAvatar && (
        <div className="relative shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className={`${currentSize.avatar} rounded-full object-cover border border-neutral-200 shadow-2xs ${isOrg ? 'group-hover:ring-2 group-hover:ring-red-400 group-hover:border-red-500' : ''} transition-all`}
            />
          ) : (
            <div className={`${currentSize.avatar} rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center border border-red-200 shadow-2xs ${isOrg ? 'group-hover:bg-red-600 group-hover:text-white' : ''} transition-all`}>
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      <span className="inline-flex items-center gap-1.5">
        <span className={`${currentSize.text} text-neutral-900 ${isOrg ? 'group-hover:text-red-600 group-hover:underline decoration-red-400 underline-offset-2' : ''} transition-colors`}>
          {name}
        </span>
        {verificada && <VerifiedBadge size={size === 'lg' ? 'md' : 'sm'} />}
      </span>

      {showRoleBadge && role && (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${roleInfo.color}`}>
          <RoleIcon className="w-2.5 h-2.5" />
          {roleInfo.label}
        </span>
      )}
    </div>
  );
};
