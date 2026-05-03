import { cn } from "@/lib/utils"
import { motion, type HTMLMotionProps } from "framer-motion"

type MotionDivProps = HTMLMotionProps<"div">

function Skeleton({ className, ...props }: MotionDivProps) {
  return (
    <motion.div
      data-slot="skeleton"
      className={cn("bg-accent rounded-md relative overflow-hidden", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  )
}

export { Skeleton }
