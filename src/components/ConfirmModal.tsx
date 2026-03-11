import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-card w-full max-w-md rounded-[32px] border border-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-start mb-8">
            <div className={`p-4 rounded-2xl ${
              variant === 'danger' 
              ? 'bg-destructive/10 text-destructive shadow-[inset_0_0_0_1px_rgba(var(--destructive),0.1)]' 
              : 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]'
            }`}>
              {variant === 'danger' ? <AlertTriangle size={28} /> : <Info size={28} />}
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 hover:bg-muted rounded-2xl transition-all text-muted-foreground hover:text-foreground active:scale-90"
            >
              <X size={20} />
            </button>
          </div>
          
          <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">{title}</h3>
          <p className="text-muted-foreground text-sm font-semibold leading-relaxed opacity-80">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <button
              onClick={onClose}
              className="flex-1 order-2 sm:order-1 py-4 px-6 rounded-2xl border border-border bg-card hover:bg-muted font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 order-1 sm:order-2 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                variant === 'danger' 
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>,
    document.body
  );
};
