import Link from 'next/link';
import styles from './landing.module.css';
import LandingHero from '@/components/LandingHero';
import CanvasReadDemoVideo from '@/components/CanvasReadDemoVideo';

export default function LandingPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="CanvasRead home">
            <span className={styles.brandMark} aria-hidden />
            <span className={styles.brandText}>CanvasRead</span>
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <Link className={styles.navLink} href="/demo">
              Demo
            </Link>
            <Link className={styles.navLink} href="/docs">
              Docs
            </Link>
            <Link
              className={styles.navLink}
              href="https://github.com/dhruvagrawals/CanvasRead"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </Link>
          </nav>

          <div className={styles.headerCtas}>
            <Link className={styles.secondaryButton} href="/demo">
              View demo
            </Link>
            <Link className={styles.primaryButton} href="/demo">
              Try CanvasRead
            </Link>
          </div>
        </div>
      </header>

      <LandingHero />

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.h2}>The Problem</h2>
            <p className={styles.lead}>
              WebGL experiences don’t live in the DOM. Traditional extraction either misses the meaning—or pays for it in tokens.
            </p>
          </div>

          <div className={styles.compareGrid}>
            <div className={styles.compareCard}>
              <div className={styles.compareHeader}>
                <div className={styles.compareTitle}>Normal browsers / DOM extraction</div>
                <div className={styles.compareTag}>Misses canvas content</div>
              </div>
              <ul className={styles.compareList}>
                <li>
                  Sees a single <code className={styles.inlineCode}>&lt;canvas&gt;</code> element, not the scene
                </li>
                <li>Little to no semantic context (objects, labels, states)</li>
                <li>Breaks when UI is rendered inside WebGL</li>
              </ul>
            </div>

            <div className={styles.compareCard}>
              <div className={styles.compareHeader}>
                <div className={styles.compareTitle}>Screenshot stream extraction</div>
                <div className={styles.compareTag}>Token heavy</div>
              </div>
              <ul className={styles.compareList}>
                <li>Sends lots of pixels, even when nothing meaningful changed</li>
                <li>Hard to keep consistent structure across frames</li>
                <li>High latency and costs from repeated vision passes</li>
              </ul>
            </div>

            <div className={styles.compareCardStrong}>
              <div className={styles.compareHeader}>
                <div className={styles.compareTitle}>CanvasRead</div>
                <div className={styles.compareTagStrong}>Semantic + efficient</div>
              </div>
              <ul className={styles.compareList}>
                <li>Detects meaningful canvas changes before sampling</li>
                <li>Captures minimal evidence (smart crops / fallbacks)</li>
                <li>Publishes structured JSON for reliable downstream automation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.h2}>Built for the parts the DOM can’t see</h2>
            <p className={styles.lead}>
              Professional-grade extraction for WebGL canvases—focused, reliable, and fast to iterate on.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.cardIcon} aria-hidden>
                ⦿
              </div>
              <div className={styles.cardTitle}>Change detection</div>
              <div className={styles.cardBody}>
                Detect meaningful visual updates and sample only when the scene actually changes.
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon} aria-hidden>
                ⧉
              </div>
              <div className={styles.cardTitle}>Token-efficient output</div>
              <div className={styles.cardBody}>
                Smart cropping and structured results reduce noise and keep LLM context tight.
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon} aria-hidden>
                ◎
              </div>
              <div className={styles.cardTitle}>Graceful fallbacks</div>
              <div className={styles.cardBody}>
                When cross-origin buffers are inaccessible, fall back to screenshot mode with clear UI messaging.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.split}>
            <div>
              <h2 className={styles.h2}>How it works</h2>
              <p className={styles.lead}>
                A simple pipeline: observe the canvas, capture minimal evidence, then publish structured results.
              </p>
            </div>
            <ol className={styles.steps}>
              <li className={styles.step}>
                <div className={styles.stepNum}>1</div>
                <div>
                  <div className={styles.stepTitle}>Observe</div>
                  <div className={styles.stepBody}>Track frame-to-frame changes and debounce noisy updates.</div>
                </div>
              </li>
              <li className={styles.step}>
                <div className={styles.stepNum}>2</div>
                <div>
                  <div className={styles.stepTitle}>Capture</div>
                  <div className={styles.stepBody}>Extract canvas data or screenshots with intelligent cropping.</div>
                </div>
              </li>
              <li className={styles.step}>
                <div className={styles.stepNum}>3</div>
                <div>
                  <div className={styles.stepTitle}>Summarize</div>
                  <div className={styles.stepBody}>Generate consistent JSON for downstream automation and QA.</div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.h2}>Watch a 30‑second demo</h2>
            <p className={styles.lead}>
              See how CanvasRead attaches to a canvas, detects meaningful changes, and publishes structured output ready for LLMs.
            </p>
          </div>
          <div className={styles.demoVideoFrame}>
            <CanvasReadDemoVideo />
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <div>
              <h2 className={styles.h2}>Ready to professionalize your 3D scraping?</h2>
              <p className={styles.lead}>
                Run the demo and inspect the final JSON output.
              </p>
            </div>
            <div className={styles.ctaRow}>
              <Link className={styles.primaryButtonLg} href="/demo">
                Open demo
              </Link>
              <Link className={styles.secondaryButtonLg} href="https://github.com/dhruvagrawals/CanvasRead" target="_blank" rel="noreferrer">
                View repo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <div className={styles.brandSmall}>
                <span className={styles.brandMark} aria-hidden />
                CanvasRead
              </div>
              <div className={styles.footerNote}>Token-efficient scraping for WebGL & Three.js.</div>
            </div>
            <div className={styles.footerLinks}>
              <Link href="/demo">Demo</Link>
              <Link href="/examples/threejs">Example</Link>
              <Link href="/docs">Docs</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
