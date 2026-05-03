import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

type MotionTableProps = HTMLMotionProps<"table">
type MotionTheadProps = HTMLMotionProps<"thead">
type MotionTbodyProps = HTMLMotionProps<"tbody">
type MotionTfootProps = HTMLMotionProps<"tfoot">
type MotionTrProps = HTMLMotionProps<"tr">
type MotionThProps = HTMLMotionProps<"th">
type MotionTdProps = HTMLMotionProps<"td">
type MotionCaptionProps = HTMLMotionProps<"caption">

function Table({ className, ...props }: MotionTableProps) {
  return (
    <motion.table
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-slot="table"
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <motion.thead
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props as MotionTheadProps}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <motion.tbody
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props as MotionTbodyProps}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <motion.tfoot
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props as MotionTfootProps}
    />
  )
}

function TableRow({ className, ...props }: MotionTrProps) {
  return (
    <motion.tr
      whileHover={{ backgroundColor: "rgba(0, 212, 255, 0.05)", scale: 1.005 }}
      transition={{ duration: 0.2 }}
      data-slot="table-row"
      className={cn(
        "border-b transition-colors duration-200 hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: MotionThProps) {
  return (
    <motion.th
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      data-slot="table-head"
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: MotionTdProps) {
  return (
    <motion.td
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: MotionCaptionProps) {
  return (
    <motion.caption
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
