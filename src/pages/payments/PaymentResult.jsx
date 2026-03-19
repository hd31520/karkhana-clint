import { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, CreditCard, Loader2, XCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'

const PaymentResult = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const result = useMemo(() => ({
    status: searchParams.get('status') || 'failed',
    transactionId: searchParams.get('transactionId') || '',
    validationId: searchParams.get('validationId') || '',
    token: searchParams.get('token') || '',
    plan: searchParams.get('plan') || '',
    companyId: searchParams.get('companyId') || '',
    message: searchParams.get('message') || ''
  }), [searchParams])

  useEffect(() => {
    const payload = {
      status: result.status,
      transactionId: result.transactionId,
      validationId: result.validationId,
      token: result.token,
      plan: result.plan,
      companyId: result.companyId,
      message: result.message
    }

    localStorage.setItem('subscription_payment_result', JSON.stringify(payload))

    if (window.opener && window.opener !== window) {
      window.opener.postMessage({
        type: 'subscription-payment-result',
        payload
      }, window.location.origin)
    }
  }, [result])

  const isSuccess = result.status === 'success'
  const isCancelled = result.status === 'cancelled'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-4">
          <div className={`rounded-2xl p-3 ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isSuccess ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isSuccess ? 'Payment verified' : isCancelled ? 'Payment cancelled' : 'Payment failed'}
            </h1>
            <p className="text-sm text-slate-600">
              {isSuccess
                ? 'Your subscription is now active.'
                : result.message || 'This transaction was not completed.'}
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Plan</span>
            <span className="font-medium capitalize">{result.plan || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Transaction ID</span>
            <span className="font-medium break-all text-right">{result.transactionId || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Validation ID</span>
            <span className="font-medium break-all text-right">{result.validationId || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Payment Token</span>
            <span className="font-medium break-all text-right">{result.token || 'N/A'}</span>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
          <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Keep the transaction ID and validation ID if you need support. These values come from
            the verified SSLCommerz response.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Button className="flex-1" onClick={() => navigate('/dashboard/profile')}>
            Go to Subscription
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => window.close()}>
            Close Window
          </Button>
        </div>

        {window.opener && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            The dashboard will refresh automatically in the background.
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentResult
