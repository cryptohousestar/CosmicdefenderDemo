"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  p: number;
  s: number;
}

export default function CosmicDefenderLanding() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let stars: Star[] = [];
    function resize() {
      if (!canvas || !ctx) return;
      canvas.width = Math.floor(window.innerWidth * DPR);
      canvas.height = Math.floor(window.innerHeight * DPR);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      const count = Math.floor((window.innerWidth * window.innerHeight) / 4500);
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: (Math.random() * 1.5 + 0.3) * DPR,
          a: Math.random() * 0.7 + 0.2,
          p: Math.random() * Math.PI * 2,
          s: Math.random() * 0.02 + 0.005,
        });
      }
    }
    let animationFrameId: number;
    function render(t: number) {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const st of stars) {
        const tw = Math.sin(st.p + t * st.s) * 0.5 + 0.5;
        const alpha = Math.min(1, Math.max(0, st.a * (0.4 + tw)));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame((n) => render(n / 1000));
    }
    window.addEventListener("resize", resize);
    resize();
    render(0);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas id="stars" ref={canvasRef} aria-hidden="true"></canvas>
      <div className="ship right d0" style={{ top: "14%" }}>
        <svg
          width="84"
          height="42"
          viewBox="0 0 84 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M68 21 L14 9 L14 33 Z"
            fill="#1e293b"
            stroke="#7DD3FC"
            strokeWidth="2"
          />
          <circle cx="28" cy="21" r="3.5" fill="#ffffff" />
        </svg>
      </div>
      <div className="ship left d1" style={{ top: "36%" }}>
        <svg
          width="84"
          height="42"
          viewBox="0 0 84 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 21 L70 9 L70 33 Z"
            fill="#1e293b"
            stroke="#C4B5FD"
            strokeWidth="2"
          />
          <circle cx="58" cy="21" r="3.5" fill="#ffffff" />
        </svg>
      </div>
      <div className="ship right d2" style={{ top: "62%" }}>
        <svg
          width="74"
          height="36"
          viewBox="0 0 74 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M58 18 L16 10 L16 26 Z"
            fill="#1e293b"
            stroke="#86EFAC"
            strokeWidth="2"
          />
          <circle cx="28" cy="18" r="3" fill="#ffffff" />
        </svg>
      </div>
      <div className="ship left d3" style={{ top: "8%" }}>
        <svg
          width="70"
          height="35"
          viewBox="0 0 70 35"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 18 L54 12 L54 24 Z"
            fill="#1e293b"
            stroke="#ef4444"
            strokeWidth="2"
          />
          <circle cx="48" cy="18" r="3" fill="#ffffff" />
        </svg>
      </div>

      <div className="center">
        <div className="content">
          <h1>Cosmic Defender</h1>
          <p>
            Defend the galaxy. Dodge meteors, upgrade your ship, and conquer the
            cosmos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link className="btn" href="/cosmic-defender.html">
              Jugar en PC
            </Link>
            <Link className="btn btn-secondary" href="/juego-movil.html">
              Jugar en Móvil
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}