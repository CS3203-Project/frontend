import toast from 'react-hot-toast'

// Custom toast configurations
import type { ToastPosition } from 'react-hot-toast'

const toastConfig = {
  duration: 5000,
  position: 'top-right' as ToastPosition,
  style: {
    background: '#fff',
    color: '#333',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
  },
}

// Success toast
export const showSuccessToast = (message: string): void => {
  toast.success(message, {
    ...toastConfig,
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
    style: {
      ...toastConfig.style,
      borderLeft: '4px solid #10b981',
    },
  })
}

// Error toast
export const showErrorToast = (message: string): void => {
  toast.error(message, {
    ...toastConfig,
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
    style: {
      ...toastConfig.style,
      borderLeft: '4px solid #ef4444',
    },
  })
}

// Info toast
export const showInfoToast = (message: string): void => {
  toast(message, {
    ...toastConfig,
    icon: 'ℹ️',
  })
}

// Warning toast
export const showWarningToast = (message: string): void => {
  toast(message, {
    ...toastConfig,
    icon: '⚠️',
    style: {
      ...toastConfig.style,
      borderColor: '#f59e0b',
    },
  })
}

// Loading toast
export const showLoadingToast = (message: string): string => {
  return toast.loading(message, {
    ...toastConfig,
  }) as string
}

// Dismiss toast
export const dismissToast = (toastId: string): void => {
  toast.dismiss(toastId)
}

// Dismiss all toasts
export const dismissAllToasts = (): void => {
  toast.dismiss()
}
