'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import LandingCanvas from '@/components/LandingCanvas';

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export default function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastParticleTime = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const now = Date.now();
      if (now - lastParticleTime.current > 40) {
        const newParticle = {
          id: now,
          x: e.clientX,
          y: e.clientY
        };
        setParticles(prev => [...prev.slice(-15), newParticle]);
        lastParticleTime.current = now;

        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== newParticle.id));
        }, 800);
      }
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      setParticles([]);
    };

    const el = sectionRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    }

    const calc = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY || 0;
      const top = scrollY + rect.top;
      const height = rect.height;
      const viewport = window.innerHeight || 1;
      const start = top;
      const end = top + Math.max(1, height - viewport);
      const p = (scrollY - start) / (end - start);
      setProgress(clamp01(p));
    };

    calc();
    window.addEventListener('scroll', calc, { passive: true });
    window.addEventListener('resize', calc);

    return () => {
      if (el) {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      }
      window.removeEventListener('scroll', calc);
      window.removeEventListener('resize', calc);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[120vh]">
      <div className="sticky top-[72px] h-[calc(100vh-72px)] flex items-center w-full">
        <div className="relative py-14 flex items-center min-h-full w-full max-[920px]:cursor-auto cursor-none overflow-hidden">
          {isHovering && (
            <div
              className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2"
              style={{ left: mousePos.x, top: mousePos.y }}
            />
          )}
          {isHovering && particles.map(p => (
            <div
              key={p.id}
              className="fixed top-0 left-0 w-3 h-3 bg-black border border-white/50 pointer-events-none z-[9999] star-clip animate-particle-fade"
              style={{ left: p.x, top: p.y }}
            />
          ))}
          <div className="absolute inset-0 pointer-events-none bg-black z-0" aria-hidden />
          <div className="absolute inset-0 pointer-events-none opacity-100 z-0 [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" aria-hidden>
            <LandingCanvas progress={progress} />
          </div>

          <div className="mx-auto w-[min(1120px,calc(100%-48px))] relative z-10 px-0 max-[640px]:w-[min(1120px,calc(100%-32px))]">
            <div className="grid grid-cols-[1.08fr_0.92fr] gap-7 items-center max-[920px]:grid-cols-1">
              <div className="py-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[12px] tracking-[0.06em] uppercase text-white bg-white/5 border border-white/15 font-bold">🏆 World's First 3D Web Intelligence Layer</div>
                <h1 className="mt-3.5 text-[clamp(34px,5.2vw,58px)] text-white leading-[1.02] tracking-[-0.04em] font-[800]">
                  The Web Went Dark.<br />
                  <span className="text-white/50">We Turned The <h1 className='text-bold text-white'>Lights On.</h1></span>
                </h1>
                <p className="mt-4 max-w-[56ch] text-cr-muted text-base leading-relaxed">
                  40% of the modern web renders inside a <code className="font-mono text-[0.9em] px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-white/80">&lt;canvas&gt;</code>. Every AI agent, every scraper, every accessibility tool is completely blind to it.
                  <span className="text-white font-semibold"> CanvasRead is the only tool that fixes this.</span>
                </p>
                <div className="flex flex-wrap gap-3 mt-[22px]">
                  <Link className="inline-flex items-center justify-center px-4 py-3 rounded-[14px] text-[15px] font-[650] whitespace-nowrap transition-all duration-140 hover:-translate-y-0.5 text-white bg-black border border-white/25 shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:bg-[#111] hover:border-white/40" href="/demo">
                    Try the Live Studio
                  </Link>
                  <Link className="inline-flex items-center justify-center px-4 py-3 rounded-[14px] text-[15px] font-[650] whitespace-nowrap transition-all duration-140 hover:-translate-y-0.5 text-cr-muted bg-white/5 border border-white/10 hover:text-cr-text hover:bg-white/10" href="https://github.com/dhruvagrawals/CanvasRead#installation" target="_blank" rel="noreferrer">
                    Add to Claude / Cursor
                  </Link>
                </div>
                <div className="mt-5 p-4 rounded-xl border border-[#76B900]/30 bg-[#76B900]/10 shadow-[0_0_20px_rgba(118,185,0,0.1)] transition-all duration-300 hover:border-[#76B900]/50 hover:bg-[#76B900]/15">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 flex-shrink-0 text-[#76B900]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-[700] text-white tracking-wide uppercase mb-1 flex items-center gap-2">
                        Powered by NVIDIA NIM API
                      </h4>
                      <p className="text-[13px] text-white/80 leading-relaxed">
                        Using NVIDIA's vision and language models, CanvasRead achieves <span className="text-[#76B900] font-semibold">capabilities that outperform frontier-model browser agents</span> — at a fraction of the token cost — by reading 3D scenes natively instead of guessing from screenshots.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-cr bg-cr-panel border border-white/10 shadow-cr overflow-hidden relative group" aria-label="Video Preview">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 bg-white/2">
                  <div className="flex gap-1.5" aria-hidden>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-[12px] text-cr-faint tracking-wider uppercase font-bold">Project Preview</div>
                </div>
                <div className="aspect-video bg-black relative">
                  <video
                    className="w-full h-full object-cover"
                    src="/my-movie.mp4"
                    controls
                    playsInline
                    autoPlay
                    muted={false}
                  />
                </div>
                <div className="p-4 bg-white/2 border-t border-white/5">
                  <div className="mt-1 text-[11px] text-white/40">CanvasRead enables agents to reason about dynamic video content and 3D scenes simultaneously.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

