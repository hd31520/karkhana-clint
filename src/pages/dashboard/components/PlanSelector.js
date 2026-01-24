import { Button } from '../../components/ui/button'

const PlanSelector = ({ selectedPlan, onSelectPlan }) => {
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '৳200',
      workers: '1-10 Workers',
      features: ['Basic features', 'Email support']
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '৳300',
      workers: '11-20 Workers',
      features: ['All Basic features', 'Advanced reporting', 'Priority support']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '৳500',
      workers: '21-50 Workers',
      features: ['All Standard features', 'Custom integrations', '24/7 phone support']
    }
  ]

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {plans.map((plan) => (
        <div 
          key={plan.id}
          className={`rounded-lg border p-4 cursor-pointer ${
            selectedPlan === plan.id ? 'border-primary ring-2 ring-primary/20' : ''
          }`} 
          onClick={() => onSelectPlan(plan.id)}
        >
          <h4 className="font-semibold">{plan.name}</h4>
          <p className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          <p className="text-sm text-muted-foreground">{plan.workers}</p>
          {plan.features.map((feature, index) => (
            <p key={index} className="text-xs mt-2 first:mt-2">• {feature}</p>
          ))}
          <Button 
            type="button" 
            size="sm" 
            className="mt-3 w-full" 
            variant={selectedPlan === plan.id ? 'default' : 'outline'}
          >
            {selectedPlan === plan.id ? 'Selected' : 'Select'}
          </Button>
        </div>
      ))}
    </div>
  )
}

export default PlanSelector