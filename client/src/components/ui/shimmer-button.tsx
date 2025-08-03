"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps {
  borderRadius?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function ShimmerButton({
  borderRadius = "100px",
  background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  className,
  children,
  onClick,
  disabled,
  type = "button",
}: ShimmerButtonProps) {
  return (
    <motion.button
      initial={{ scale: 1 }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      style={{
        background,
        borderRadius,
        position: "relative",
        overflow: "hidden",
      }}
      className={cn(
        "relative px-6 py-3 font-medium text-white shadow-2xl transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        "before:animate-[shimmer_3s_ease-in-out_infinite] before:-translate-x-full before:animate-none before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent hover:before:animate-[shimmer_0.5s_ease-in-out]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}