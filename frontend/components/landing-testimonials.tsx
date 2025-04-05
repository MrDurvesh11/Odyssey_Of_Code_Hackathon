"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation } from "framer-motion"
import { Quote } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function LandingTestimonials() {
  const controls = useAnimation()
  const testimonialsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start("visible")
        }
      },
      { threshold: 0.1 },
    )

    if (testimonialsRef.current) {
      observer.observe(testimonialsRef.current)
    }

    return () => {
      if (testimonialsRef.current) {
        observer.unobserve(testimonialsRef.current)
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

  const testimonials = [
    {
      quote:
        "The RFP Analysis Suite has transformed our bid process. We've increased our win rate by 35% and cut analysis time in half.",
      name: "Sarah Johnson",
      title: "Proposal Manager, TechSolutions Inc.",
      avatar: "SJ",
    },
    {
      quote:
        "The risk assessment feature alone has saved us from several problematic contract clauses that would have cost us dearly.",
      name: "Michael Chen",
      title: "Legal Counsel, Global Services Group",
      avatar: "MC",
    },
    {
      quote:
        "As a small business, we couldn't compete for government contracts before. This tool levels the playing field.",
      name: "Alicia Rodriguez",
      title: "CEO, Innovative Systems",
      avatar: "AR",
    },
  ]

  return (
    <section ref={testimonialsRef} className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/90 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[radial-gradient(ellipse_at_center,rgba(13,148,136,0.15),transparent_50%)]"></div>

      <div className="container relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate={controls} className="text-center mb-16">
          <motion.h2
            variants={itemVariants}
            className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4"
          >
            Trusted by Industry Leaders
          </motion.h2>
          <motion.p variants={itemVariants} className="mx-auto max-w-[42rem] text-muted-foreground sm:text-xl">
            See how organizations are transforming their RFP response process with our AI-powered platform.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid gap-8 md:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full bg-background/50 backdrop-blur-sm border-teal-500/20 hover:border-teal-500/50 transition-all overflow-hidden group">
                <CardContent className="p-6 relative">
                  <Quote className="absolute top-6 right-6 h-12 w-12 text-teal-500/10 group-hover:text-teal-500/20 transition-all" />
                  <div className="space-y-4">
                    <p className="text-lg italic relative z-10">{testimonial.quote}</p>
                    <div className="flex items-center gap-4 pt-4">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?text=${testimonial.avatar}`} />
                        <AvatarFallback className="bg-teal-100 text-teal-800">{testimonial.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          className="mt-16 flex flex-wrap justify-center gap-8"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center justify-center h-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
            >
              <img
                src={`/placeholder.svg?text=LOGO${i}&width=120&height=40`}
                alt={`Client ${i}`}
                className="h-full object-contain"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

