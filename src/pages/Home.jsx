import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Users,
      title: 'Worker Management',
      description: 'Manage workers, track attendance, and automate salary calculations',
    },
    {
      icon: Package,
      title: 'Inventory Control',
      description: 'Track products, manage stock levels, and set automatic alerts',
    },
    {
      icon: ShoppingCart,
      title: 'Sales Management',
      description: 'Handle online/offline sales, generate memos, and track payments',
    },
    {
      icon: DollarSign,
      title: 'Salary Automation',
      description: 'Automated salary calculation with overtime and bonus support',
    },
    {
      icon: BarChart,
      title: 'Advanced Reports',
      description: 'Generate detailed reports for sales, inventory, and performance',
    },
    {
      icon: Shield,
      title: 'Multi-role System',
      description: 'Flexible role management with granular permissions',
    },
  ]

  const testimonials = [
    {
      name: 'Abdul Karim',
      role: 'Factory Owner',
      business: 'Karim Furniture',
      content: 'Karkhana.shop transformed my business. Now I can manage everything from one place.',
      rating: 5,
    },
    {
      name: 'Fatima Begum',
      role: 'Shop Manager',
      business: 'Textile Mart',
      content: 'The sales and inventory management is superb. My daily work has become so much easier.',
      rating: 5,
    },
    {
      name: 'Raju Ahmed',
      role: 'Worker',
      business: 'Metal Works',
      content: 'I can check my salary and attendance online. Very transparent system.',
      rating: 4,
    },
  ]

  const plans = [
    {
      name: 'Basic',
      price: '৳200',
      period: '/month',
      workers: '1-10 Workers',
      features: [
        'Basic worker management',
        'Product inventory',
        'Sales tracking',
        'Daily reports',
        'Email support',
      ],
    },
    {
      name: 'Standard',
      price: '৳300',
      period: '/month',
      workers: '11-20 Workers',
      features: [
        'Everything in Basic',
        'Group management',
        'Customer database',
        'Memo system',
        'Monthly reports',
        'Priority support',
      ],
      popular: true,
    },
    {
      name: 'Premium',
      price: '৳500',
      period: '/month',
      workers: '21-50 Workers',
      features: [
        'Everything in Standard',
        'Advanced analytics',
        'Custom reports',
        'API access',
        'Multi-company support',
        '24/7 support',
      ],
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Manage Your{' '}
              <span className="text-primary">Factory, Shop & Showroom</span>{' '}
              in One Platform
            </h1>
            <p className="mb-10 text-xl text-gray-600 dark:text-gray-300">
              Karkhana.shop is a comprehensive solution for Bangladeshi manufacturers and 
              retailers. Streamline operations, automate processes, and grow your business.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link to="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Everything You Need to Run Your Business
            </h2>
            <p className="mb-12 text-lg text-gray-600 dark:text-gray-300">
              From worker management to sales tracking, we've got you covered
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="mb-12 text-lg text-gray-600 dark:text-gray-300">
              Get started in just a few simple steps
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Sign Up</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your account and set up your business profile
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Add Your Team</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add workers, set roles, and configure permissions
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Start Managing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Manage operations, track sales, and grow your business
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="mb-12 text-lg text-gray-600 dark:text-gray-300">
              Choose the plan that fits your business needs
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="my-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-300">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{plan.workers}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-8 w-full" variant={plan.popular ? 'default' : 'outline'}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Loved by Businesses
            </h2>
            <p className="mb-12 text-lg text-gray-600 dark:text-gray-300">
              See what our users have to say
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-6 italic text-gray-600 dark:text-gray-300">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {testimonial.role} • {testimonial.business}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-2xl bg-primary p-8 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to Transform Your Business?
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Join hundreds of businesses already using Karkhana.shop
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">
                  Start Free Trial
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white" asChild>
                <Link to="/contact">
                  Contact Sales
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-80">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home