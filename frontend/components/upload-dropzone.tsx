"use client"

import type React from "react"

import { useState } from "react"
import { FileText, Upload, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function UploadDropzone() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles((prev) => [...prev, ...droppedFiles])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (files.length === 0) return

    setUploading(true)

    // Simulate upload progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 5
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setUploading(false)
          setFiles([])
          setProgress(0)
        }, 500)
      }
    }, 200)
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging ? "border-teal-600 bg-teal-500/10" : "border-border"
        } ${files.length > 0 && "border-border"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <motion.div
              className="rounded-full bg-teal-500/10 p-3"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0 0 rgba(13, 148, 136, 0)",
                  "0 0 0 10px rgba(13, 148, 136, 0.1)",
                  "0 0 0 0 rgba(13, 148, 136, 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
            >
              <Upload className="h-6 w-6 text-teal-600" />
            </motion.div>
            <div>
              <p className="text-sm font-medium">Drag and drop your files here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
            </div>
            <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileChange} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="border-teal-500/20 hover:bg-teal-500/10 hover:text-teal-600"
            />
          </div>
        ) : (
          <AnimatePresence>
            <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-3 bg-background/50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-teal-500/10 p-2">
                      <FileText className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 w-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </Progress>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiles([])}
              disabled={uploading}
              className="border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
            >
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              {uploading ? "Uploading..." : "Start Analysis"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

