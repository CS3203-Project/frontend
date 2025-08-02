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
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#10B981',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  })
}

// Error toast
export const showErrorToast = (message: string): void => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#EF4444',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
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
    position: 'top-right',
    style: {
      background: '#3B82F6',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
    },
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
