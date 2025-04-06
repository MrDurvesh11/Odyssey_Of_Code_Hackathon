"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { ArrowRight, Check, CreditCard } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function LandingPricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const controls = useAnimation()
  const [annual, setAnnual] = useState(true)

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small businesses and occasional RFP responses",
      price: annual ? "$49" : "$59",
      period: annual ? "/month, billed annually" : "/month",
      features: [
        "10 RFP analyses per month",
        "Basic risk assessment",
        "Submission checklist generator",
        "Email support",
        "1 user account",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      description: "Ideal for growing businesses with regular RFP submissions",
      price: annual ? "$99" : "$119",
      period: annual ? "/month, billed annually" : "/month",
      features: [
        "30 RFP analyses per month",
        "Advanced risk assessment",
        "Interactive compliance tracking",
        "AI assistant access",
        "Priority email support",
        "3 user accounts",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For organizations with high-volume RFP responses",
      price: "Custom",
      period: "tailored to your needs",
      features: [
        "Unlimited RFP analyses",
        "Custom AI model training",
        "Advanced analytics dashboard",
        "API access",
        "Dedicated account manager",
        "Unlimited user accounts",
        "SSO & advanced security",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section ref={ref} id="pricing" className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background z-0"></div>
      <div className="absolute top-1/4 left-0 w-1/3 h-1/3 bg-teal-500/5 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-1/4 right-0 w-1/3 h-1/3 bg-indigo-500/5 rounded-full blur-3xl z-0"></div>

      <div className="container relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate={controls} className="text-center mb-12">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center rounded-full border border-teal-600/20 bg-teal-50/10 px-3 py-1 text-sm text-teal-500 backdrop-blur-md dark:bg-teal-900/10 mb-4"
          >
            <CreditCard className="mr-1 h-3.5 w-3.5" />
            <span>Simple Pricing</span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4"
          >
            Plans for Teams of All Sizes
          </motion.h2>
          <motion.p variants={itemVariants} className="mx-auto max-w-[42rem] text-muted-foreground sm:text-xl">
            Choose the perfect plan to streamline your RFP process and increase your win rate.
          </motion.p>

          <motion.div variants={itemVariants} className="flex items-center justify-center mt-8 mb-12">
            <Label htmlFor="billing-toggle" className={`mr-2 ${!annual ? "text-muted-foreground" : ""}`}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={annual}
              onCheckedChange={setAnnual}
              className="data-[state=checked]:bg-teal-500"
            />
            <Label
              htmlFor="billing-toggle"
              className={`ml-2 flex items-center ${annual ? "text-teal-500" : "text-muted-foreground"}`}
            >
              Annual
              <span className="ml-1.5 rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-500">
                Save 20%
              </span>
            </Label>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid gap-8 md:grid-cols-3"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative ${plan.popular ? "md:-mt-8 md:mb-8" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-max rounded-full bg-teal-500 px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <Card
                className={`h-full overflow-hidden border-teal-500/20 ${
                  plan.popular ? "border-teal-500/50 shadow-lg shadow-teal-500/10" : ""
                }`}
              >
                <CardHeader className={`pb-8 ${plan.popular ? "bg-teal-500/10" : ""}`}>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    {plan.price}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-teal-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="bg-muted/50 px-6 py-4">
                  <Button
                    asChild
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                        : ""
                    }`}
                  >
                    <Link href="/dashboard">
                      {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

