
"use client";

import { useEffect, useRef } from "react";

export default function NeuralWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationId = 0;

    let mouseY = 0;
    let smoothMouseY = 0;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function resize() {
      if (!canvas || !ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = canvas.clientWidth;
      height = canvas.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function handleMouse(e: MouseEvent) {
      mouseY = (e.clientY / window.innerHeight - 0.5) * 100;
    }

    function animate(time: number) {
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      smoothMouseY += (mouseY - smoothMouseY) * 0.04;

      const waveCount = width < 768 ? 25 : 55;

      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();

        for (let x = 0; x <= width; x += 5) {
          const y =
            height * 0.55 +
            (i - waveCount / 2) * 5 +
            Math.sin(
              x * 0.006 +
              time * 0.0007 +
              i * 0.09
            ) * 80 +
            Math.cos(
              x * 0.012 -
              time * 0.0004 +
              i * 0.04
            ) * 35 +
            smoothMouseY;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle =
          `rgba(100, 245, 175, ${0.03 + i * 0.004})`;

        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Floating particles
      for (let i = 0; i < 70; i++) {
        const x = (i * 137.51) % width;

        const y =
          (i * 61.79 +
            Math.sin(time * 0.0005 + i) * 20 +
            height) % height;

        ctx.beginPath();
        ctx.arc(x, y, i % 7 === 0 ? 1.8 : 0.7, 0, Math.PI * 2);

        ctx.fillStyle = "rgba(161, 239, 199, 0.35)";
        ctx.fill();
      }

      if (!reducedMotion) {
        animationId = requestAnimationFrame(animate);
      }
    }

    resize();
    animate(0);

    window.addEventListener("resize", resize);

    if (!reducedMotion) {
      window.addEventListener("mousemove", handleMouse);
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}
