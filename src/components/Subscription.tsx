import React from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Free',
    features: ['20 job applications', '0 AI-generated resumes', 'Email support'],
  },
  {
    name: 'Pro',
    price: '$9.99',
    features: ['Unlimited job applications', '20 AI-generated resumes', 'Priority email support'],
  },
  {
    name: 'Enterprise',
    price: '$49.99',
    features: ['Unlimited job applications', 'Unlimited AI-generated resumes', 'Interview preparation', '24/7 phone support', 'Custom integrations'],
  },
]

export default function SubscriptionsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold">{plan.price}<span className="text-sm font-normal">/month</span></p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full">
                <Link to={`/payment?plan=${plan.name}`}>Choose Plan</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}