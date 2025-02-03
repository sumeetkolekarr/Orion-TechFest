"use client";

import React from "react";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export interface ParticlesProps extends React.HTMLProps<HTMLDivElement> {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
  mouseForce?: number;
  mouseRadius?: number;
}

export function Particles({
  className = "",
  quantity = 200, // Increased default quantity
  staticity = 50,
  ease = 50,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
  mouseForce = 40, // Increased mouse force
  mouseRadius = 150, // Increased mouse radius
  ...props
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<any[]>([]);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseMoving = useRef(false);
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const time = useRef(0);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("resize", initCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  useEffect(() => {
    initCanvas();
  }, [refresh]);

  const handleMouseMove = (e: MouseEvent) => {
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      isMouseMoving.current = true;
    }
  };

  const handleMouseOut = () => {
    isMouseMoving.current = false;
  };

  const initCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current = [];
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);

      for (let i = 0; i < quantity; i++) {
        circles.current.push({
          x: Math.random() * canvasSize.current.w,
          y: Math.random() * canvasSize.current.h,
          vx: Math.random() * 2 - 1,
          vy: Math.random() * 2 - 1,
          radius: Math.random() * 1.5 + 1, // Slightly smaller particles
          phase: Math.random() * Math.PI * 2,
          amplitude: Math.random() * 20 + 15, // Reduced amplitude for tighter grouping
          speed: Math.random() * 0.2 + 0.01,
          originalX: Math.random() * canvasSize.current.w,
          originalY: Math.random() * canvasSize.current.h,
        });
      }
    }
  };

  const animate = () => {
    if (context.current && canvasSize.current) {
      context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
      time.current += 0.016;

      circles.current.forEach((circle) => {
        // Basic flow motion
        const flowX = Math.cos(time.current * circle.speed + circle.phase) * circle.amplitude;
        const flowY = Math.sin(time.current * circle.speed + circle.phase) * circle.amplitude;

        // Mouse attraction
        if (isMouseMoving.current) {
          const dx = mouse.current.x - circle.x;
          const dy = mouse.current.y - circle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRadius) {
            const force = (mouseRadius - distance) / mouseRadius;
            const angle = Math.atan2(dy, dx);
            const attractX = Math.cos(angle) * force * mouseForce;
            const attractY = Math.sin(angle) * force * mouseForce;
            circle.vx += attractX * 0.02; // Increased attraction strength
            circle.vy += attractY * 0.02;
          }
        }

        // Update position
        circle.x = circle.originalX + flowX + circle.vx;
        circle.y = circle.originalY + flowY + circle.vy;

        // Apply friction
        circle.vx *= 0.9;
        circle.vy *= 0.9;

        // Handle boundaries with bounce effect
        if (circle.x < 0) {
          circle.x = 0;
          circle.vx *= -1;
        }
        if (circle.x > canvasSize.current.w) {
          circle.x = canvasSize.current.w;
          circle.vx *= -1;
        }
        if (circle.y < 0) {
          circle.y = 0;
          circle.vy *= -1;
        }
        if (circle.y > canvasSize.current.h) {
          circle.y = canvasSize.current.h;
          circle.vy *= -1;
        }

        // Draw particle
        context.current!.beginPath();
        context.current!.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        context.current!.fillStyle = color;
        context.current!.fill();
        context.current!.closePath();

        // Draw connections with increased density
        circles.current.forEach((otherCircle) => {
          const dx = circle.x - otherCircle.x;
          const dy = circle.y - otherCircle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Increased connection distance and adjusted opacity
          if (distance < 150) { // Increased connection distance
            const opacity = Math.min(1, (1 - distance / 150) * 1.5); // Increased opacity
            context.current!.beginPath();
            context.current!.strokeStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
            context.current!.lineWidth = Math.min(1.5, (1 - distance / 150) * 2); // Thicker lines
            context.current!.moveTo(circle.x, circle.y);
            context.current!.lineTo(otherCircle.x, otherCircle.y);
            context.current!.stroke();
            context.current!.closePath();
          }

          // Draw connections to mouse when nearby
          if (isMouseMoving.current) {
            const mouseDistance = Math.sqrt(
              Math.pow(circle.x - mouse.current.x, 2) + 
              Math.pow(circle.y - mouse.current.y, 2)
            );
            if (mouseDistance < mouseRadius) {
              const opacity = (1 - mouseDistance / mouseRadius) * 0.8;
              context.current!.beginPath();
              context.current!.strokeStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
              context.current!.lineWidth = (1 - mouseDistance / mouseRadius) * 2;
              context.current!.moveTo(circle.x, circle.y);
              context.current!.lineTo(mouse.current.x, mouse.current.y);
              context.current!.stroke();
              context.current!.closePath();
            }
          }
        });
      });
    }
    requestAnimationFrame(animate);
  };

  return (
    <div
      ref={canvasContainerRef}
      className={cn("fixed inset-0", className)}
      {...props}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}