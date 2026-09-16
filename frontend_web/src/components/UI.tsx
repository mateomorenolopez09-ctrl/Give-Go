import React from 'react';
import { Search, Loader2, AlertCircle, CheckCircle, Info, X } from 'lucide-react';

/**
 * ==========================================
 * 0. UTILITIES
 * ==========================================
 */
export const formatCOP = (value: number): string => {
  const rounded = Math.round(value);
  const formatted = rounded.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$ ${formatted}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // If it's already in DD/MM/YYYY format
  if (dateStr.includes('/') && dateStr.split('/').length === 3) {
    const parts = dateStr.split('/');
    if (parts[0].length === 2 && parts[2].length === 4) {
      return dateStr;
    }
  }
  
  // Try splitting by '-' (YYYY-MM-DD or YYYY-M-D)
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const yyyy = parts[0];
    const mm = parts[1].padStart(2, '0');
    const dd = parts[2].padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  }
  return dateStr;
};

/**
 * ==========================================
 * 1. BUTTON COMPONENT
 * ==========================================
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const variants = {
    primary: 'bg-brand hover:bg-brand-hover text-white focus:ring-brand shadow-xs shadow-brand/25',
    secondary: 'bg-neutral-900 hover:bg-neutral-950 text-white focus:ring-neutral-900 shadow-xs',
    danger: 'bg-brand-error hover:bg-red-600 text-white focus:ring-brand-error shadow-xs',
    outline: 'border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 text-neutral-800 focus:ring-neutral-500 bg-white shadow-xs',
    ghost: 'hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-500',
    white: 'bg-white hover:bg-neutral-100 text-neutral-950 focus:ring-white shadow-xs border border-neutral-200/80',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-xs',
    lg: 'px-6 py-3.5 text-sm',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
      {children}
    </button>
  );
};

/**
 * ==========================================
 * 2. INPUT COMPONENT
 * ==========================================
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: any;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', type = 'text', ...props }, ref) => {
    const errorMessage = typeof error === 'string' ? error : error?.message;

    return (
      <div className="w-full mb-4">
        {label && (
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 select-none">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`w-full ${icon ? 'pl-10' : 'px-4'} py-3 border text-sm rounded-xl bg-white text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all duration-150 ${
              errorMessage ? 'border-brand-error focus:ring-brand-error/10' : 'border-neutral-200 hover:border-neutral-300'
            } ${className}`}
            {...props}
          />
        </div>
        {errorMessage && <p className="mt-1.5 text-xs text-brand-error font-medium">{errorMessage}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * ==========================================
 * 3. TEXTAREA COMPONENT
 * ==========================================
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: any;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', rows = 3, ...props }, ref) => {
    const errorMessage = typeof error === 'string' ? error : error?.message;

    return (
      <div className="w-full mb-4">
        {label && (
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 select-none">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full px-4 py-3 border text-sm rounded-xl bg-white text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all duration-150 ${
            errorMessage ? 'border-brand-error focus:ring-brand-error/10' : 'border-neutral-200 hover:border-neutral-300'
          } ${className}`}
          {...props}
        />
        {errorMessage && <p className="mt-1.5 text-xs text-brand-error font-medium">{errorMessage}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * ==========================================
 * 4. SELECT COMPONENT
 * ==========================================
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: any;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    const errorMessage = typeof error === 'string' ? error : error?.message;

    return (
      <div className="w-full mb-4">
        {label && (
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 select-none">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-3 border text-sm rounded-xl bg-white text-neutral-950 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all duration-150 cursor-pointer ${
            errorMessage ? 'border-brand-error focus:ring-brand-error/10' : 'border-neutral-200 hover:border-neutral-300'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errorMessage && <p className="mt-1.5 text-xs text-brand-error font-medium">{errorMessage}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

/**
 * ==========================================
 * 5. CHECKBOX COMPONENT
 * ==========================================
 */
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="inline-flex items-center cursor-pointer select-none">
          <input
            ref={ref}
            type="checkbox"
            className={`w-4 h-4 text-brand border-neutral-300 rounded focus:ring-brand/20 cursor-pointer accent-brand ${className}`}
            {...props}
          />
          <span className="ml-2.5 text-xs text-neutral-700 font-medium">{label}</span>
        </label>
        {error && <p className="mt-1 text-xs text-brand-error font-medium">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * ==========================================
 * 6. RADIO COMPONENT
 * ==========================================
 */
interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="mb-2">
        <label className="inline-flex items-center cursor-pointer select-none">
          <input
            ref={ref}
            type="radio"
            className={`w-4 h-4 text-brand border-neutral-300 focus:ring-brand/20 cursor-pointer accent-brand ${className}`}
            {...props}
          />
          <span className="ml-2.5 text-xs text-neutral-700 font-medium">{label}</span>
        </label>
        {error && <p className="mt-1 text-xs text-brand-error font-medium">{error}</p>}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

/**
 * ==========================================
 * 7. CARD COMPONENT
 * ==========================================
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  footer,
}) => {
  return (
    <div className={`bg-white border border-neutral-200/60 rounded-[18px] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-white">
          <div>
            {title && <h3 className="text-sm font-bold text-neutral-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-neutral-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className="px-6 py-6">{children}</div>
      {footer && <div className="px-6 py-4 bg-neutral-50/40 border-t border-neutral-100 flex justify-end items-center gap-2">{footer}</div>}
    </div>
  );
};

/**
 * ==========================================
 * 8. MODAL COMPONENT
 * ==========================================
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-md" onClick={onClose} />
      
      {/* Content */}
      <div className={`relative bg-white border border-neutral-200 rounded-[20px] shadow-xl w-full ${sizeClasses[size]} z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-200`}>
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-white">
          <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-150 text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-6 overflow-y-auto flex-1 bg-white">{children}</div>
        {footer && <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

/**
 * ==========================================
 * 9. LOADER COMPONENT
 * ==========================================
 */
export const Loader: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 select-none">
      <Loader2 className="w-9 h-9 text-brand animate-spin" />
      <span className="mt-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Cargando Give&amp;Go...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * ==========================================
 * 10. ALERT COMPONENT
 * ==========================================
 */
interface AlertProps {
  type?: 'success' | 'danger' | 'info' | 'error' | 'warning';
  variant?: 'success' | 'danger' | 'info' | 'error' | 'warning' | string;
  message?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  variant,
  message,
  children,
  onClose,
  className = '',
}) => {
  const rawType = type || variant || 'info';
  const finalType = rawType === 'error' ? 'danger' : rawType;

  const styles: Record<string, string> = {
    success: 'bg-green-50 border-green-200 text-green-800 rounded-xl',
    danger: 'bg-red-50 border-red-200 text-brand-error rounded-xl',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 rounded-xl',
    info: 'bg-neutral-50 border-neutral-200 text-neutral-800 rounded-xl',
  };

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-brand-success mr-2.5 shrink-0" />,
    danger: <AlertCircle className="w-4 h-4 text-brand-error mr-2.5 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-600 mr-2.5 shrink-0" />,
    info: <Info className="w-4 h-4 text-neutral-500 mr-2.5 shrink-0" />,
  };

  const content = children ?? message;

  return (
    <div className={`p-4 border flex items-start justify-between ${styles[finalType] || styles.info} ${className}`}>
      <div className="flex items-start">
        <div className="mt-0.5">{icons[finalType] || icons.info}</div>
        <div className="text-xs font-medium leading-relaxed">{content}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="ml-3 -mr-1 -mt-1 p-1 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/**
 * ==========================================
 * 11. CONFIRM DIALOG COMPONENT
 * ==========================================
 */
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'primary' | 'danger';
  variant?: 'primary' | 'danger' | string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  variant,
}) => {
  if (!isOpen) return null;
  const isDanger = (variant || type) === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white border border-neutral-200 rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 animate-in fade-in-50 zoom-in-95 duration-200">
        <h3 className="text-sm font-bold text-neutral-900 mb-2">{title}</h3>
        <p className="text-xs text-neutral-500 leading-relaxed mb-6 font-medium">{message}</p>
        <div className="flex justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={isDanger ? 'danger' : 'primary'} size="sm" onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * ==========================================
 * 12. PAGINATION COMPONENT
 * ==========================================
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6 select-none">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </Button>
      <span className="text-xs font-semibold text-neutral-600 px-3 bg-neutral-100 py-1.5 rounded-lg">
        Pág {currentPage} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente
      </Button>
    </div>
  );
};

/**
 * ==========================================
 * 13. SEARCH BAR COMPONENT
 * ==========================================
 */
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
}) => {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-neutral-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all duration-150"
      />
    </div>
  );
};

/**
 * ==========================================
 * 14. TABLE COMPONENT
 * ==========================================
 */
interface TableProps<T> {
  headers: string[];
  data: T[];
  renderRow: (item: T, idx: number) => React.ReactNode;
}

export const Table = <T,>({ headers, data, renderRow }: TableProps<T>) => {
  return (
    <div className="w-full overflow-x-auto border border-neutral-200/60 rounded-2xl shadow-xs bg-white">
      <table className="min-w-full divide-y divide-neutral-150 text-left text-xs text-neutral-700 bg-white">
        <thead className="bg-neutral-50/75 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 font-semibold select-none">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-150 text-neutral-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-10 text-center text-neutral-400 font-medium select-none uppercase tracking-wider text-[11px]">
                No hay registros disponibles.
              </td>
            </tr>
          ) : (
            data.map((item, idx) => renderRow(item, idx))
          )}
        </tbody>
      </table>
    </div>
  );
};

/**
 * ==========================================
 * 15. BADGE COMPONENT
 * ==========================================
 */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'info' | 'warning' | 'neutral' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const styles: Record<string, string> = {
    success: 'bg-green-50 text-green-700 border-green-200',
    danger: 'bg-red-50 text-brand border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    outline: 'bg-white text-neutral-700 border-neutral-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[variant]} select-none`}>
      {children}
    </span>
  );
};

/**
 * ==========================================
 * 16. EMPTY STATE COMPONENT
 * ==========================================
 */
interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-neutral-200 rounded-2xl bg-white select-none">
      {icon ? (
        <div className="mb-4 text-neutral-400">{icon}</div>
      ) : (
        <AlertCircle className="w-10 h-10 text-neutral-300 mb-4" />
      )}
      <h3 className="text-sm font-bold text-neutral-900 tracking-tight">{title}</h3>
      <p className="text-xs text-neutral-500 font-medium max-w-xs mt-2 mb-6 leading-relaxed">{description}</p>
      {action ? (
        action
      ) : actionText && onAction ? (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </div>
  );
};

