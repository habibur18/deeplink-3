"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function SubscriptionPlan({ currentPlan = "free" }) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan)

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Basic features for personal use",
      price: "$0",
      features: ["Up to 10 active links", "1 custom domain", "Basic analytics", "Standard support"],
    },
    {
      id: "basic",
      name: "Basic",
      description: "Essential features for small businesses",
      price: "$9.99",
      features: ["Up to 50 active links", "5 custom domains", "Advanced analytics", "Priority support", "Custom slugs"],
    },
    {
      id: "premium",
      name: "Premium",
      description: "Advanced features for growing businesses",
      price: "$19.99",
      features: [
        "Unlimited active links",
        "10 custom domains",
        "Advanced analytics with exports",
        "Priority support",
        "Custom slugs",
        "API access",
      ],
    },
  ]

  function handleSelectPlan(planId) {
    setSelectedPlan(planId)
  }

  function handleSubscribe() {
    // This would connect to a payment processor in a real app
    toast({
      title: "Coming Soon",
      description: "Subscription functionality will be available soon!",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={`${selectedPlan === plan.id ? "border-primary" : "border-border"}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={selectedPlan === plan.id ? "default" : "outline"}
                className="w-full"
                onClick={() => handleSelectPlan(plan.id)}
                disabled={currentPlan === plan.id}
              >
                {currentPlan === plan.id ? "Current Plan" : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedPlan !== currentPlan && (
        <div className="flex justify-end">
          <Button onClick={handleSubscribe}>Subscribe to {plans.find((p) => p.id === selectedPlan)?.name} Plan</Button>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        <p>
          All plans include unlimited access to our link redirection service. Upgrade anytime to get more features and
          higher limits.
        </p>
      </div>
    </div>
  )
}

