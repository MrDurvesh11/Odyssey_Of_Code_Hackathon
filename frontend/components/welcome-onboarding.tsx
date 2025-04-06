"use client"

import { useState } from "react"
import { CheckCircle, ChevronRight, FileText } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WelcomeOnboardingProps {
  onClose?: () => void
}

export function WelcomeOnboarding({ onClose }: WelcomeOnboardingProps) {
  const [open, setOpen] = useState(true)
  const [step, setStep] = useState(0)

  const handleClose = () => {
    setOpen(false)
    onClose?.()
  }

  const steps = [
    {
      title: "Welcome to RFP Nexus Suite",
      description:
        "Transform complex government contract documents into clear, actionable insights with our AI-powered analysis tool.",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Upload and Analyze",
      description:
        "Drag and drop your RFP documents to begin analysis. Our AI will process the document and provide you with actionable insights.",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Review Insights",
      description:
        "Get a comprehensive analysis of your RFP, including bid recommendations, risk assessment, and compliance requirements.",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Take Action",
      description:
        "Use our interactive tools to create submission checklists, assess risks, and get AI-powered assistance throughout your bid process.",
      image: "/placeholder.svg?height=300&width=500",
    },
  ]

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] border-teal-500/20 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <FileText className="mr-2 h-5 w-5 text-teal-600" />
            {steps[step].title}
          </DialogTitle>
          <DialogDescription>{steps[step].description}</DialogDescription>
        </DialogHeader>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center py-4"
          >
            <Image
              src={steps[step].image || "/placeholder.svg"}
              alt={steps[step].title}
              width={500}
              height={300}
              className="rounded-lg border"
            />
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center space-x-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-8 rounded-full transition-all ${index === step ? "bg-teal-600" : "bg-muted"}`}
            />
          ))}
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex space-x-2">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="border-teal-500/20 hover:bg-teal-500/10 hover:text-teal-600"
              >
                Back
              </Button>
            )}
            <Button variant="ghost" onClick={handleClose}>
              Skip Tour
            </Button>
          </div>
          <Button
            onClick={nextStep}
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
          >
            {step < steps.length - 1 ? (
              <>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Get Started <CheckCircle className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

