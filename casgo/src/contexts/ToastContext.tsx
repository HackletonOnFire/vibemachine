'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

// Toast types and interfaces
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  success: (title: string, message?: string, options?: Partial<Toast>) => string;
  error: (title: string, message?: string, options?: Partial<Toast>) => string;
  warning: (title: string, message?: string, options?: Partial<Toast>) => string;
  info: (title: string, message?: string, options?: Partial<Toast>) => string;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast configuration
const DEFAULT_DURATION = 5000;
const ANIMATION_DURATION = 300;

// Toast component
const ToastComponent: React.FC<{ 
  toast: Toast; 
  onRemove: (id: string) => void;
  position: ToastPosition;
}> = ({ toast, onRemove, position }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animation entrance effect
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss logic
  useEffect(() => {
    if (!toast.persistent && toast.duration !== 0) {
      const duration = toast.duration || DEFAULT_DURATION;
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast.duration, toast.persistent]);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
      toast.onClose?.();
    }, ANIMATION_DURATION);
  }, [toast.id, toast.onClose, onRemove]);

  const handleAction = useCallback(() => {
    toast.action?.onClick();
    handleClose();
  }, [toast.action, handleClose]);

  // Toast styling based on type
  const getToastStyles = (type: ToastType) => {
    const baseStyles = "relative overflow-hidden border shadow-lg backdrop-blur-sm";
    
    switch (type) {
      case 'success':
        return cn(baseStyles, "bg-emerald-50/95 border-emerald-200 text-emerald-900");
      case 'error':
        return cn(baseStyles, "bg-red-50/95 border-red-200 text-red-900");
      case 'warning':
        return cn(baseStyles, "bg-amber-50/95 border-amber-200 text-amber-900");
      case 'info':
        return cn(baseStyles, "bg-blue-50/95 border-blue-200 text-blue-900");
      default:
        return cn(baseStyles, "bg-slate-50/95 border-slate-200 text-slate-900");
    }
  };

  const getIconStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return "text-emerald-500";
      case 'error':
        return "text-red-500";
      case 'warning':
        return "text-amber-500";
      case 'info':
        return "text-blue-500";
      default:
        return "text-slate-500";
    }
  };

  const getIcon = (type: ToastType) => {
    const iconProps = { className: cn("w-5 h-5 flex-shrink-0", getIconStyles(type)) };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <XCircle {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  // Position-based animations
  const getAnimationClasses = () => {
    const isRight = position.includes('right');
    const isLeft = position.includes('left');
    const isTop = position.includes('top');
    
    let enterFrom = '';
    let enterTo = 'translate-x-0 translate-y-0 opacity-100 scale-100';
    let exitTo = '';

    if (isRight) {
      enterFrom = 'translate-x-full opacity-0 scale-95';
      exitTo = 'translate-x-full opacity-0 scale-95';
    } else if (isLeft) {
      enterFrom = '-translate-x-full opacity-0 scale-95';
      exitTo = '-translate-x-full opacity-0 scale-95';
    } else {
      // Center positions
      if (isTop) {
        enterFrom = '-translate-y-full opacity-0 scale-95';
        exitTo = '-translate-y-full opacity-0 scale-95';
      } else {
        enterFrom = 'translate-y-full opacity-0 scale-95';
        exitTo = 'translate-y-full opacity-0 scale-95';
      }
    }

    return {
      enter: isVisible && !isLeaving ? enterTo : enterFrom,
      exit: isLeaving ? exitTo : enterTo
    };
  };

  const animations = getAnimationClasses();

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl max-w-md w-full",
        "transform transition-all duration-300 ease-out",
        getToastStyles(toast.type),
        isLeaving ? animations.exit : animations.enter,
        "hover:shadow-xl hover:scale-[1.02] cursor-pointer group"
      )}
      onClick={() => !toast.persistent && handleClose()}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar for auto-dismiss */}
      {!toast.persistent && toast.duration !== 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 animate-shrink-width" 
             style={{ animationDuration: `${toast.duration || DEFAULT_DURATION}ms` }} />
      )}

      {/* Icon */}
      <div className="mt-0.5">
        {getIcon(toast.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm leading-tight mb-1">
          {toast.title}
        </div>
        {toast.message && (
          <div className="text-sm opacity-90 leading-relaxed">
            {toast.message}
          </div>
        )}
        
        {/* Action button */}
        {toast.action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            className="mt-2 px-3 py-1 text-xs font-medium rounded-md bg-current/10 hover:bg-current/20 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="flex-shrink-0 p-1 rounded-md hover:bg-current/10 transition-colors opacity-60 hover:opacity-100"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast container component
const ToastContainer: React.FC<{ 
  toasts: Toast[]; 
  onRemove: (id: string) => void;
  position: ToastPosition;
}> = ({ toasts, onRemove, position }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getContainerStyles = () => {
    const baseStyles = "fixed z-50 flex flex-col gap-3 p-4 pointer-events-none";
    
    switch (position) {
      case 'top-right':
        return cn(baseStyles, "top-0 right-0 items-end");
      case 'top-left':
        return cn(baseStyles, "top-0 left-0 items-start");
      case 'bottom-right':
        return cn(baseStyles, "bottom-0 right-0 items-end");
      case 'bottom-left':
        return cn(baseStyles, "bottom-0 left-0 items-start");
      case 'top-center':
        return cn(baseStyles, "top-0 left-1/2 transform -translate-x-1/2 items-center");
      case 'bottom-center':
        return cn(baseStyles, "bottom-0 left-1/2 transform -translate-x-1/2 items-center");
      default:
        return cn(baseStyles, "top-0 right-0 items-end");
    }
  };

  const portalTarget = document.body;

  return createPortal(
    <div className={getContainerStyles()}>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent
            toast={toast}
            onRemove={onRemove}
            position={position}
          />
        </div>
      ))}
    </div>,
    portalTarget
  );
};

// Provider component
export const ToastProvider: React.FC<{ 
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}> = ({ 
  children, 
  position = 'top-right',
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'info', title, message });
  }, [addToast]);

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        onRemove={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

// Hook for using toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider; 