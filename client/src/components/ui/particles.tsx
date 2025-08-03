"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
}

interface Circle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
}

export function Particles({
  className = "",
  quantity = 30,
  staticity = 50,
  ease = 50,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}: ParticlesProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "255, 255, 255";
  };

  const rgb = useMemo(() => hexToRgb(color), [color]);

  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({ w: window.innerWidth, h: window.innerHeight });
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const initCircles = () => {
      const newCircles: Circle[] = [];
      for (let i = 0; i < quantity; i++) {
        const circle: Circle = {
          x: Math.random() * canvasSize.w,
          y: Math.random() * canvasSize.h,
          translateX: 0,
          translateY: 0,
          size: Math.random() * 2 + 0.1,
          alpha: 0,
          targetAlpha: Math.random() * 0.6 + 0.1,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          magnetism: 0.1 + Math.random() * 4,
        };
        newCircles.push(circle);
      }
      setCircles(newCircles);
    };

    if (canvasSize.w && canvasSize.h) {
      initCircles();
    }
  }, [quantity, canvasSize, refresh]);

  useEffect(() => {
    const animate = () => {
      setCircles((prevCircles) =>
        prevCircles.map((circle) => {
          const edge = [
            circle.x + circle.translateX - circle.size,
            canvasSize.w - circle.x - circle.translateX - circle.size,
            circle.y + circle.translateY - circle.size,
            canvasSize.h - circle.y - circle.translateY - circle.size,
          ];
          const closestEdge = edge.reduce((a, b) => Math.min(a, b));
          const remapClosestEdge = Math.max(closestEdge, 0) / 20;

          const { x: mouseX, y: mouseY } = mousePosition;
          // const distanceToMouse = Math.hypot(
          //   mouseX - (circle.x + circle.translateX),
          //   mouseY - (circle.y + circle.translateY)
          // );

          return {
            ...circle,
            alpha: circle.targetAlpha * remapClosestEdge,
            x: circle.x + circle.dx + vx,
            y: circle.y + circle.dy + vy,
            translateX:
              circle.translateX +
              (mouseX / (staticity / circle.magnetism) - circle.translateX) /
                ease,
            translateY:
              circle.translateY +
              (mouseY / (staticity / circle.magnetism) - circle.translateY) /
                ease,
          };
        })
      );

      requestAnimationFrame(animate);
    };

    animate();
  }, [mousePosition, canvasSize, staticity, ease, vx, vy]);

  return (
    <div className={cn("pointer-events-none", className)}>
      {circles.map((circle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: circle.x + circle.translateX,
            top: circle.y + circle.translateY,
            width: circle.size,
            height: circle.size,
            backgroundColor: `rgba(${rgb}, ${circle.alpha})`,
          }}
        />
      ))}
    </div>
  );
}