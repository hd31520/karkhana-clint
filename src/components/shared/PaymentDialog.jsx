import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'

const PaymentDialog = ({ isOpen, onOpenChange, paymentData }) => {
  const [redirecting, setRedirecting] = useState(false)

  const handleRedirectToSSLCommerz = useCallback(() => {
    if (!paymentData?.payment?.paymentUrl) {
      return
    }

    setRedirecting(true)
    const popup = window.open(
      paymentData.payment.paymentUrl,
      'sslcommerz-checkout',
      'popup,width=960,height=760'
    )

    if (!popup) {
      window.location.href = paymentData.payment.paymentUrl
      return
    }

    window.setTimeout(() => {
      setRedirecting(false)
      onOpenChange(false)
    }, 500)
  }, [onOpenChange, paymentData])

  useEffect(() => {
    if (!isOpen || !paymentData?.payment?.paymentUrl) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      handleRedirectToSSLCommerz()
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [handleRedirectToSSLCommerz, isOpen, paymentData])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Processing</DialogTitle>
          <DialogDescription>
            Complete your SSLCommerz checkout to activate the selected plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <LoaderCircle className="mt-0.5 h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                {redirecting ? 'Redirecting to SSLCommerz' : 'Preparing secure checkout'}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {redirecting
                  ? 'The payment popup should open now.'
                  : 'We have created a pending transaction for your selected plan.'}
              </p>
            </div>
          </div>

          {paymentData?.subscription && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium capitalize">
                  {paymentData.subscription.pendingPayment?.plan || paymentData.subscription.plan}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ৳{paymentData.subscription.pendingPayment?.amount || paymentData.subscription.monthlyFee}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaction ID</span>
                <span className="font-medium text-xs">{paymentData.payment?.transactionId}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Only verified payments are activated. After payment, the popup will show the real
              transaction confirmation and validation token from SSLCommerz.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={redirecting}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={handleRedirectToSSLCommerz}
              disabled={!paymentData?.payment?.paymentUrl || redirecting}
              className="flex-1"
            >
              {redirecting ? 'Opening...' : 'Continue to Payment'}
            </Button>
          </div>
        </div>

        <div className="border-t pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Your payment is handled securely by SSLCommerz.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentDialog
