import React, { useEffect, useRef, useState } from "react";

interface GenerativeOrganismProps {
  className?: string;
  size?: number | string;
  interactive?: boolean;
  intensity?: "subtle" | "vibrant";
  label?: string;
}

/**
 * GenerativeOrganism: An authorial generative canvas component creating
 * an organic, dynamic harmonic nodal field simulating AI and human intelligence
 * convergence in Pop-Tech palette (#5425D8, #8557FF, #FF5CBA, #326BFF).
 */
export const GenerativeOrganism: React.FC<GenerativeOrganismProps> = ({
  className = "",
  size = "100%",
  interactive = true,
  intensity = "vibrant",
  label = "Organismo Visual Gerativo · IA + Comunicação"
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mode, setMode] = useState<"fluid" | "lattice">("fluid");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle nodes for interconnected network
    const nodeCount = mode === "lattice" ? 36 : 24;
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      baseRadius: number;
      phase: number;
    }[] = [];

    const colors = [
      "#5425D8", // Deep purple
      "#8557FF", // Electric violet
      "#FF5CBA", // Vibrant pink
      "#326BFF"  // Intense blue
    ];

    for (let i = 0; i < nodeCount; i++) {
      const baseR = 3 + Math.random() * 4;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: baseR,
        baseRadius: baseR,
        color: colors[i % colors.length],
        phase: Math.random() * Math.PI * 2
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    if (interactive && canvas) {
      canvas.addEventListener("mousemove", handleMouseMove);
    }

    let t = 0;

    const render = () => {
      t += 0.015;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Soft radial energetic aura
      const grad = ctx.createRadialGradient(
        width / 2 + Math.sin(t * 0.5) * 40,
        height / 2 + Math.cos(t * 0.4) * 40,
        10,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.65
      );
      grad.addColorStop(0, intensity === "vibrant" ? "rgba(133, 87, 255, 0.16)" : "rgba(133, 87, 255, 0.08)");
      grad.addColorStop(0.5, intensity === "vibrant" ? "rgba(255, 92, 186, 0.08)" : "rgba(255, 92, 186, 0.04)");
      grad.addColorStop(1, "rgba(250, 248, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Harmonic Fluid Sine Curves
      const curveCount = 3;
      for (let c = 0; c < curveCount; c++) {
        ctx.beginPath();
        const offset = c * 0.7;
        const color = colors[c % colors.length];

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = intensity === "vibrant" ? 0.35 : 0.2;

        const points = 18;
        for (let i = 0; i <= points; i++) {
          const ratio = i / points;
          const px = ratio * width;
          const wave1 = Math.sin(t * 1.2 + ratio * 4 + offset) * 35;
          const wave2 = Math.cos(t * 0.8 + ratio * 6 - offset) * 25;
          const mouseEffect = Math.sin((px - mouseX) * 0.02) * (isHovered ? 25 : 8);
          const py = height / 2 + wave1 + wave2 + mouseEffect;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // 3. Update & render interconnected nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;

        // Bounce within boundaries
        if (node.x < 10 || node.x > width - 10) node.vx *= -1;
        if (node.y < 10 || node.y > height - 10) node.vy *= -1;

        // Magnetic attraction to cursor if nearby
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && isHovered) {
          node.x += (dx / dist) * 0.7;
          node.y += (dy / dist) * 0.7;
        }

        node.radius = node.baseRadius + Math.sin(t * 2 + node.phase) * 1.5;

        // Connect near nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const ndx = other.x - node.x;
          const ndy = other.y - node.y;
          const ndist = Math.sqrt(ndx * ndx + ndy * ndy);

          const maxDist = mode === "lattice" ? 95 : 120;
          if (ndist < maxDist) {
            const alpha = (1 - ndist / maxDist) * 0.25;
            ctx.strokeStyle = node.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(1, node.radius), 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow halo
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(2, node.radius * 2.2), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (interactive && canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [interactive, intensity, isHovered, mode]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#17151D]/[0.02] via-[#EAF0FF]/40 to-[#FAF8FF] border border-[#5425D8]/15 ${className}`}
      style={{ width: size, height: size }}
      aria-label={label}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Subtle UI controls for generative organism */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#17151D]/60 pointer-events-auto">
        <span className="font-mono tracking-tight select-none">
          {label}
        </span>
        <button
          onClick={() => setMode((m) => (m === "fluid" ? "lattice" : "fluid"))}
          className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/80 hover:bg-white text-[#5425D8] border border-[#5425D8]/20 transition-colors shadow-xs"
          title="Alternar modo da rede neural"
        >
          Modo: {mode === "fluid" ? "Fluido" : "Rede"}
        </button>
      </div>
    </div>
  );
};
