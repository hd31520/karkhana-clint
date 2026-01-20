import { toast, Toaster } from 'react-hot-toast'
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'

export const showSuccessToast = (message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } pointer-events-auto flex w-full max-w-md items-center rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800`}
    >
      <div className="w-0 flex-1 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Success
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:text-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  ))
}

export const showErrorToast = (message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } pointer-events-auto flex w-full max-w-md items-center rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800`}
    >
      <div className="w-0 flex-1 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <XCircle className="h-6 w-6 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Error
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:text-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  ))
}

export const showInfoToast = (message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } pointer-events-auto flex w-full max-w-md items-center rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800`}
    >
      <div className="w-0 flex-1 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Info className="h-6 w-6 text-blue-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Information
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:text-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  ))
}

export const showWarningToast = (message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } pointer-events-auto flex w-full max-w-md items-center rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800`}
    >
      <div className="w-0 flex-1 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Warning
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:text-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  ))
}

export const showLoadingToast = (message) => {
  return toast.loading(message, {
    duration: 4000,
  })
}

export const dismissToast = (id) => {
  toast.dismiss(id)
}

const ToastNotification = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
        success: {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        },
        error: {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
        },
        loading: {
          icon: '⏳',
        },
      }}
    />
  )
}

export default ToastNotification