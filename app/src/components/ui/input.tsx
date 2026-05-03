import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: any) {
  return (
    <motion.input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all duration-300 outline-none focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/30",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.2)' }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    />
  )
}

export { Input }
