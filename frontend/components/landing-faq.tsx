"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { HelpCircle } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function LandingFAQ() {
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

  const faqs = [
    {
      question: "How does the AI analyze RFP documents?",
      answer:
        "Our AI uses advanced natural language processing and machine learning algorithms to scan and analyze RFP documents. It identifies key requirements, deadlines, evaluation criteria, and potential risks, then organizes this information into actionable insights and visualizations.",
    },
    {
      question: "What file formats are supported?",
      answer:
        "We support all common document formats including PDF, DOCX, DOC, TXT, RTF, and HTML. Our system can also extract text from scanned documents using OCR technology, though the quality of the scan may affect accuracy.",
    },
    {
      question: "How accurate is the AI analysis?",
      answer:
        "Our AI typically achieves 90-95% accuracy in identifying key requirements and compliance criteria. However, we always recommend human review of the AI-generated insights, especially for high-value or complex RFPs. The system improves over time as it learns from your feedback.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We employ bank-level encryption for all data both in transit and at rest. Your documents are stored in secure, SOC 2 compliant cloud infrastructure. We never share your data with third parties, and you can delete your documents at any time.",
    },
    {
      question: "Can I customize the analysis for my industry?",
      answer:
        "Yes, our Professional and Enterprise plans allow for customization based on your industry and specific needs. The system learns from your feedback and adjusts its analysis accordingly. Enterprise customers can also receive custom AI model training for their specific industry requirements.",
    },
    {
      question: "How long does it take to analyze a document?",
      answer:
        "Most standard RFPs (20-100 pages) are analyzed within 2-5 minutes. Larger or more complex documents may take longer. The system processes documents in parallel, so you can upload multiple RFPs simultaneously without significant additional wait time.",
    },
  ]

  return (
    <section ref={ref} id="faq" className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background z-0"></div>

      <div className="container relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate={controls} className="text-center mb-12">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center rounded-full border border-teal-600/20 bg-teal-50/10 px-3 py-1 text-sm text-teal-500 backdrop-blur-md dark:bg-teal-900/10 mb-4"
          >
            <HelpCircle className="mr-1 h-3.5 w-3.5" />
            <span>Common Questions</span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p variants={itemVariants} className="mx-auto max-w-[42rem] text-muted-foreground sm:text-xl">
            Everything you need to know about the RFP Nexus Suite
          </motion.p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate={controls} className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem value={`item-${index}`} className="border-b border-teal-500/20">
                  <AccordionTrigger className="text-left hover:text-teal-500 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}

