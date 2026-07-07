'use client';

import { AnimatePresence, motion } from 'framer-motion';

export type ToastVariant = 'success' | 'error';

interface ToastProps {
  /** Message to display inside the toast. Toast is hidden entirely when `null`. */
  message: string | null;
  /** Visual style — cyan/check for success, red/warning for error. */
  variant: ToastVariant;
  /** Called when the user dismisses the toast via the close button. */
  onDismiss: () => void;
}

const VARIANT_STYLES: Record<ToastVariant, { border: string; bg: string; text: string; icon: string }> = {
  success: {
    border: 'border-[#00BEFF]/40',
    bg: 'bg-[#00BEFF]/10',
    text: 'text-[#00BEFF]',
    icon: 'rgba(0,190,255,1)',
  },
  error: {
    border: 'border-red-500/40',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    icon: 'rgba(248,113,113,1)',
  },
};

/**
 * Reusable inline toast/banner for form success and error feedback.
 * Shared across the contact form, YourCastle signup, and VoiceDemo live Q&A
 * so all three surfaces use one consistent, dismissible feedback pattern
 * instead of ad-hoc inline red text.
 */
export default function Toast({ message, variant, onDismiss }: ToastProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role={variant === 'error' ? 'alert' : 'status'}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={`flex items-start gap-3 rounded-xl border ${styles.border} ${styles.bg} px-4 py-3`}
        >
          {variant === 'success' ? (
            <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={styles.icon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={styles.icon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <p className={`flex-1 text-sm ${styles.text}`}>{message}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className={`shrink-0 ${styles.text} opacity-70 hover:opacity-100 transition-opacity`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
