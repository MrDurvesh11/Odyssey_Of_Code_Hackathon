"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ParticlesContainer } from "@/components/particles-container"

export function LandingHero() {
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current)
      }
    }
  }, [])

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
    <section ref={heroRef} className="relative overflow-hidden py-20 md:py-32">
      {/* Particle background */}
      <ParticlesContainer />

      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80 z-0"></div>
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-teal-500/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-indigo-500/10 rounded-full blur-3xl z-0"></div>

      {/* Animated grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(13,148,136,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(13,148,136,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="container relative z-10">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center rounded-full border border-teal-600/20 bg-teal-50/10 px-3 py-1 text-sm text-teal-500 backdrop-blur-md dark:bg-teal-900/10 mb-6"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            <span>AI-Powered RFP Analysis</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-indigo-500 mb-6"
          >
            Transform Complex RFPs <br className="hidden sm:inline" />
            Into Winning Proposals
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 mb-8"
          >
            The Compliance Navigator uses advanced AI to analyze government RFPs, identify critical requirements, assess
            risks, and guide you to successful bids.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/20"
            >
              <Link href="/dashboard">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 border-teal-500/20 hover:bg-teal-500/10">
              <Link href="#features">See Features</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 text-sm font-medium"
          >
            <div className="flex items-center gap-x-2">
              <CheckCircle className="h-4 w-4 text-teal-500" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-x-2">
              <CheckCircle className="h-4 w-4 text-teal-500" />
              <span>Risk Assessment</span>
            </div>
            <div className="flex items-center gap-x-2">
              <CheckCircle className="h-4 w-4 text-teal-500" />
              <span>Compliance Tracking</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative mx-auto mt-16 max-w-[58rem] rounded-xl border border-teal-500/20 bg-background/50 shadow-2xl backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-4 text-sm font-medium text-muted-foreground">
            Intelligent RFP Analysis Dashboard
          </div>
          <div className="overflow-hidden rounded-xl">
            <Image
              src="/home.png"
              width={600}
              height={600}
              alt="Dashboard Preview"
              className="w-full object-cover"
            />

            {/* Animated overlay elements */}
            <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-teal-500/20 animate-ping [animation-duration:3s] [animation-iteration-count:infinite]"></div>
            <div className="absolute bottom-1/3 right-1/3 w-12 h-12 rounded-full bg-indigo-500/20 animate-ping [animation-duration:4s] [animation-iteration-count:infinite]"></div>

            {/* UI Overlay elements */}
            <div className="absolute top-4 left-4 rounded-lg bg-background/80 backdrop-blur-sm p-2 border border-teal-500/20 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                <span className="text-xs font-medium">AI Analysis Active</span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 rounded-lg bg-background/80 backdrop-blur-sm p-2 border border-teal-500/20 shadow-lg">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium">Compliance Score:</span>
                <span className="text-xs font-bold text-teal-500">92%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

