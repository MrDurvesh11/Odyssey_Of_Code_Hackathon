"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { BarChart3, Clock, FileText, TrendingUp } from "lucide-react"

export function LandingStats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const controls = useAnimation()

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
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const stats = [
    {
      icon: FileText,
      value: "10,000+",
      label: "RFPs Analyzed",
      description: "Our AI has processed thousands of complex government RFPs",
    },
    {
      icon: Clock,
      value: "85%",
      label: "Time Saved",
      description: "Customers report massive time savings in RFP Nexus",
    },
    {
      icon: TrendingUp,
      value: "42%",
      label: "Win Rate Increase",
      description: "Average improvement in contract win rates for our clients",
    },
    {
      icon: BarChart3,
      value: "$2.3B",
      label: "Contract Value",
      description: "Total value of contracts won using our platform",
    },
  ]

  return (
    <section ref={ref} className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background z-0"></div>

      <div className="container relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative overflow-hidden rounded-xl border border-teal-500/20 bg-background/50 p-6 backdrop-blur-sm shadow-lg"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-teal-500/10"></div>
              <div className="relative">
                <div className="mb-2 inline-flex items-center justify-center rounded-lg bg-teal-500/10 p-2 text-teal-500">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                  </div>
                  <h3 className="mt-1 text-base font-medium">{stat.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

