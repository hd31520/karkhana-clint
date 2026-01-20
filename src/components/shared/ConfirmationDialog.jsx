import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/dialog'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  destructive = false,
}) => {
  const icons = {
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
    error: XCircle,
  }

  const Icon = icons[type]

  const colors = {
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${colors[type]} bg-opacity-20`}>
              <Icon className="h-5 w-5" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={destructive ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {loading ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmationDialog