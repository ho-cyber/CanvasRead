'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from '@/app/landing.module.css';
import LandingCanvas from '@/components/LandingCanvas';

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export default function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calc = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY || 0;
      const top = scrollY + rect.top;
      const height = rect.height;

      // How far can we scroll while the hero stays sticky?
      // End when the bottom of the hero reaches the viewport bottom.
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
      window.removeEventListener('scroll', calc);
      window.removeEventListener('resize', calc);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.heroSection}>
      <div className={styles.heroSticky}>
        <div className={styles.hero}>
          <div className={styles.heroBg} aria-hidden />
          <div className={styles.heroCanvas} aria-hidden>
            <LandingCanvas progress={progress} />
          </div>

          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <div className={styles.badge}>WebGL / Three.js extraction</div>
                <h1 className={styles.h1}>Turn 3D canvases into structured data.</h1>
                <p className={styles.subhead}>
                  CanvasRead captures semantic changes from WebGL experiences and produces token‑efficient, LLM‑ready
                  output—without brittle DOM scraping.
                </p>
                <div className={styles.ctaRow}>
                  <Link className={styles.primaryButtonLg} href="/demo">
                    Run the demo
                  </Link>
                  <Link className={styles.tertiaryButtonLg} href="/examples/threejs">
                    See an example
                  </Link>
                </div>
                <div className={styles.microcopy}>Works with dynamic Three.js scenes. Designed for low token usage.</div>
              </div>

              <div className={styles.heroPanel} aria-label="Product preview">
                <div className={styles.previewHeader}>
                  <div className={styles.previewDotRow} aria-hidden>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                  <div className={styles.previewTitle}>Extraction preview</div>
                </div>
                <div className={styles.previewBody}>
                  <div className={styles.previewCode}>
                    <div className={styles.codeLineDim}>GET /api/scrape</div>
                    <div className={styles.codeLine}>
                      <span className={styles.codeKey}>mode</span>: <span className={styles.codeVal}>"canvas"</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.codeKey}>changes</span>:{' '}
                      <span className={styles.codeVal}>["camera", "materials", "text"]</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.codeKey}>tokens_saved</span>: <span className={styles.codeVal}>0.90</span>
                    </div>
                    <div className={styles.codeLineDim}>…</div>
                  </div>
                  <div className={styles.previewFootnote}>Output is illustrative. See real output in the demo.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

