"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextAnimateProps {
  text: string;
  type?: "fadeInUp" | "slideInLeft" | "bounceIn" | "typewriter";
  className?: string;
  delay?: number;
}

const animations = {
  fadeInUp: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  slideInLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.8, ease: "easeOut" }
  },
  bounceIn: {
    initial: { scale: 0.3, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.6, type: "spring", bounce: 0.4 }
  },
  typewriter: {
    initial: { width: 0 },
    animate: { width: "100%" },
    transition: { duration: 2, ease: "linear" }
  }
} as const;

export function TextAnimate({ 
  text, 
  type = "fadeInUp", 
  className,
  delay = 0 
}: TextAnimateProps) {
  const animation = animations[type];

  if (type === "typewriter") {
    return (
      <div className={cn("overflow-hidden whitespace-nowrap", className)}>
        <motion.div
          {...animation}
          style={{ borderRight: "2px solid" }}
          transition={{ ...animation.transition, delay }}
        >
          {text}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      transition={{ ...animation.transition, delay }}
      className={className}
    >
      {text}
    </motion.div>
  );
}