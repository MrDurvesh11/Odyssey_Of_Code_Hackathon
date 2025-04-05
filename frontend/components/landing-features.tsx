"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, Bot, CheckCircle, ListChecks, Shield, Sparkles } from "lucide-react"
import Image from "next/image"
import { motion, useAnimation } from "framer-motion"

export function LandingFeatures() {
  const controls = useAnimation()
  const featuresRef = useRef<HTMLDivElement>(null)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start("visible")
        }
      },
      { threshold: 0.1 },
    )

    if (featuresRef.current) {
      observer.observe(featuresRef.current)
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current)
      }
    }
  }, [controls])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6)
    }, 4000)

    return () => clearInterval(interval)
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

  const features = [
    {
      title: "AI-Powered Document Analysis",
      description:
        "Our advanced AI analyzes complex RFP documents to extract key requirements, deadlines, and compliance criteria.",
      icon: Sparkles,
      image: "/feat1.avif",
    },
    {
      title: "Risk Assessment Visualization",
      description:
        "Identify high-risk contract clauses with our intuitive heatmap and get AI-suggested mitigation strategies.",
      icon: AlertCircle,
      image: "/feat2.webp",
    },
    {
      title: "Interactive Submission Checklist",
      description: "Track your proposal preparation with dynamic checklists that ensure you meet every requirement.",
      icon: ListChecks,
      image: "/feat3.avif",
    },
    {
      title: "Eligibility Comparison",
      description: "See how your company's capabilities match up against RFP requirements with visual gap analysis.",
      icon: CheckCircle,
      image: "/feat3.webp",
    },
    {
      title: "AI Assistant",
      description: "Get instant answers to your questions about the RFP with our intelligent AI assistant.",
      icon: Bot,
      image: "/feat5.avif",
    },
    {
      title: "Compliance Tracking",
      description: "Monitor your compliance status in real-time and receive alerts for critical requirements.",
      icon: Shield,
      image: "/feat6.webp",
    },
  ]

  return (
    <section ref={featuresRef} id="features" className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background z-0"></div>
      <div className="absolute top-1/4 right-0 w-1/3 h-1/3 bg-teal-500/5 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-1/4 left-0 w-1/3 h-1/3 bg-indigo-500/5 rounded-full blur-3xl z-0"></div>

      <div className="container relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate={controls} className="text-center mb-16">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center rounded-full border border-teal-600/20 bg-teal-50/10 px-3 py-1 text-sm text-teal-500 backdrop-blur-md dark:bg-teal-900/10 mb-4"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            <span>Powerful Features</span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4"
          >
            Everything You Need to Win More Contracts
          </motion.h2>
          <motion.p variants={itemVariants} className="mx-auto max-w-[42rem] text-muted-foreground sm:text-xl">
            Our comprehensive suite of tools transforms the RFP analysis process from overwhelming to manageable.
          </motion.p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div variants={containerVariants} initial="hidden" animate={controls} className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`group flex cursor-pointer gap-5 rounded-xl border p-4 transition-all hover:border-teal-500/50 hover:bg-teal-500/5 ${
                  activeFeature === index ? "border-teal-500/50 bg-teal-500/5" : "border-border"
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div
                  className={`rounded-lg p-2 ${
                    activeFeature === index
                      ? "bg-teal-500 text-white"
                      : "bg-muted text-muted-foreground group-hover:bg-teal-500 group-hover:text-white"
                  }`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-xl border border-teal-500/20 bg-background/50 shadow-xl backdrop-blur-sm overflow-hidden h-96" // Added fixed height for better presentation
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  activeFeature === index ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                  priority={index === 0}
                />
              </div>
            ))}

            {/* Animated elements */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4 flex items-center space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    activeFeature === index ? "w-8 bg-teal-500" : "w-2 bg-muted"
                  }`}
                  onClick={() => setActiveFeature(index)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}