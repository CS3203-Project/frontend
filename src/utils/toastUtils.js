import toast from 'react-hot-toast'

// Custom toast configurations
const toastConfig = {
  duration: 5000,
  position: 'top-right',
  style: {
    background: '#fff',
    color: '#333',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
  },
}

// Success toast
export const showSuccessToast = (message) => {
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
export const showErrorToast = (message) => {
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
export const showInfoToast = (message) => {
  toast(message, {
    ...toastConfig,
    icon: 'ℹ️',
  })
}

// Warning toast
export const showWarningToast = (message) => {
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
export const showLoadingToast = (message) => {
  return toast.loading(message, {
    ...toastConfig,
  })
}

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId)
}

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss()
}
