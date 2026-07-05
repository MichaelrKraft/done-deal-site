"use client";

import { useEffect, useRef, useCallback } from "react";

interface DotGridProps {
  color?: string;
  dotSize?: number;
  spacing?: number;
  glowRadius?: number;
  glowIntensity?: number;
  topOffset?: number;
}

export default function DotGrid({
  color = "#29d4ff",
  dotSize = 1.5,
  spacing = 24,
  glowRadius = 150,
  glowIntensity = 0.8,
  topOffset = 80,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const drawRef = useRef<() => void>(() => {});

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    for (let x = spacing / 2; x < canvas.width; x += spacing) {
      for (let y = spacing / 2; y < canvas.height; y += spacing) {
        const dx = x - mx;
        const dy = y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / glowRadius);

        // Fade dots in center (behind text) — full brightness at edges
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const maxDist = Math.sqrt(cx * cx + cy * cy);
        const edgeFactor = Math.min(distFromCenter / (maxDist * 0.5), 1);
        const baseAlpha = 0.05 + edgeFactor * 0.25;

        const glowAlpha = proximity * glowIntensity;
        const alpha = baseAlpha + glowAlpha;
        const size = dotSize + proximity * (glowIntensity * 2.5);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(() => drawRef.current());
  }, [color, dotSize, spacing, glowRadius, glowIntensity]);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const section = canvas.closest("section");
    if (!section) return;

    const resize = () => {
      const rect = section.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height - topOffset;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    resize();
    rafRef.current = requestAnimationFrame(() => drawRef.current());

    window.addEventListener("resize", resize);
    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [draw, topOffset]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute left-0 w-full pointer-events-none"
      style={{ top: `${topOffset}px`, zIndex: 0 }}
    />
  );
}
