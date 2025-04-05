"use client"

import { useEffect, useRef } from "react"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion, useAnimation } from "framer-motion"

import { Button } from "@/components/ui/button"

export function LandingCTA() {
  const controls = useAnimation()
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start("visible")
        }
      },
      { threshold: 0.1 },
    )

    if (ctaRef.current) {
      observer.observe(ctaRef.current)
    }

    return () => {
      if (ctaRef.current) {
        observer.unobserve(ctaRef.current)
      }
    }
  }, [controls])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section ref={ctaRef} className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,148,136,0.15),transparent_70%)]"></div>

      <div className="container relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="mx-auto max-w-[58rem] rounded-2xl border border-teal-500/30 bg-background/50 p-8 backdrop-blur-sm md:p-12"
        >
          <motion.h2
            variants={itemVariants}
            className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-indigo-500"
          >
            Ready to Transform Your RFP Process?
          </motion.h2>

          <motion.p variants={itemVariants} className="mt-4 text-center text-muted-foreground sm:text-xl">
            Join hundreds of organizations winning more contracts with less effort.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              <Link href="/dashboard">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 border-teal-500/20 hover:bg-teal-500/10">
              <Link href="#">Schedule Demo</Link>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-teal-500" />
              <div>
                <h3 className="font-medium">Free 14-day trial</h3>
                <p className="text-sm text-muted-foreground">No credit card required</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-teal-500" />
              <div>
                <h3 className="font-medium">Unlimited RFP analysis</h3>
                <p className="text-sm text-muted-foreground">During your trial period</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-teal-500" />
              <div>
                <h3 className="font-medium">Priority support</h3>
                <p className="text-sm text-muted-foreground">Get help when you need it</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

