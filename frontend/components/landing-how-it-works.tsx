"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { ArrowRight, Bot, FileText, LineChart, ListChecks, Sparkles } from "lucide-react"
import Image from "next/image"

export function LandingHowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
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
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const steps = [
    {
      icon: FileText,
      title: "Upload Your RFP",
      description:
        "Simply drag and drop your RFP documents into our secure platform. We support all common file formats including PDF, DOCX, and TXT.",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      icon: Sparkles,
      title: "AI Analysis",
      description:
        "Our advanced AI analyzes the entire document, extracting key requirements, deadlines, and compliance criteria with remarkable accuracy.",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      icon: LineChart,
      title: "Review Insights",
      description:
        "Explore comprehensive visualizations of requirements, risks, and opportunities. Our platform highlights critical areas that need attention.",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      icon: ListChecks,
      title: "Take Action",
      description:
        "Use our interactive tools to create submission checklists, assess risks, and get AI-powered assistance throughout your bid process.",
      image: "/placeholder.svg?height=300&width=500",
    },
  ]

  return (
    <section ref={ref} id="how-it-works" className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/90 z-0"></div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-teal-500/5 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-500/5 rounded-full blur-3xl z-0"></div>

      <div className="container relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate={controls} className="text-center mb-16">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center rounded-full border border-teal-600/20 bg-teal-50/10 px-3 py-1 text-sm text-teal-500 backdrop-blur-md dark:bg-teal-900/10 mb-4"
          >
            <Bot className="mr-1 h-3.5 w-3.5" />
            <span>Simple Process</span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p variants={itemVariants} className="mx-auto max-w-[42rem] text-muted-foreground sm:text-xl">
            Our streamlined process takes you from complex RFP documents to actionable insights in minutes, not days.
          </motion.p>
        </motion.div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={containerVariants}
              initial="hidden"
              animate={controls}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-8 md:gap-16 items-center`}
            >
              <motion.div variants={itemVariants} className="w-full md:w-1/2 space-y-4">
                <div className="inline-flex items-center justify-center rounded-full bg-teal-500/10 p-3 text-teal-500">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                <div className="flex items-center text-teal-500 font-medium">
                  <span className="mr-2">Learn more</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="w-full md:w-1/2">
                <div className="relative rounded-xl border border-teal-500/20 bg-background/50 shadow-xl backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-indigo-500/5"></div>
                  <Image
                    src={step.image || "/placeholder.svg"}
                    alt={step.title}
                    width={500}
                    height={300}
                    className="w-full h-auto relative z-10"
                  />

                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-teal-500/10 animate-pulse"></div>
                  <div className="absolute bottom-2 left-2 h-6 w-6 rounded-full bg-indigo-500/10 animate-pulse [animation-delay:1s]"></div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

