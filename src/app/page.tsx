import Link from 'next/link';
import Image from 'next/image';
import LandingHero from '@/components/LandingHero';

export default function LandingPage() {
  return (
    <main className="bg-black text-cr-text min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-20 backdrop-blur-[14px] bg-[rgba(7,8,18,0.55)] border-b border-white/5">
        <div className="mx-auto w-[min(1120px,calc(100%-48px))] h-[72px] flex items-center gap-[18px]">
          <Link href="/" className="inline-flex items-center gap-2.5 p-2.5 rounded-xl group" aria-label="CanvasRead home">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="CanvasRead Logo" 
                fill 
                className="object-contain rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              />
            </div>
            <span className="font-[650] tracking-[-0.02em] text-white">CanvasRead</span>
          </Link>

          <nav className="hidden min-[920px]:flex items-center gap-3.5 ml-2.5 flex-1" aria-label="Primary">
            <Link className="text-cr-muted text-[14px] px-2.5 py-2 rounded-xl transition-all duration-140 hover:text-cr-text hover:bg-white/5" href="/demo">
              Demo
            </Link>
            <Link
              className="text-cr-muted text-[14px] px-2.5 py-2 rounded-xl transition-all duration-140 hover:text-cr-text hover:bg-white/5"
              href="https://github.com/ho-cyber/CanvasRead"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link className="hidden sm:inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-140 whitespace-nowrap text-cr-text bg-white/5 border border-white/10 hover:-translate-y-[1px]" href="/demo">
              View demo
            </Link>
            <Link className="inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-140 whitespace-nowrap text-white bg-black border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:-translate-y-[1px] hover:bg-[#111] hover:border-white/40" href="/demo">
              Launch Clone Studio
            </Link>
          </div>
        </div>
      </header>

      <LandingHero />

      {/* ── BLIND SPOT SECTION ─────────────────────────────────────────── */}
      <section className="py-14">
        <div className="mx-auto w-[min(1120px,calc(100%-48px))]">
          <div className="mb-5.5">
            <h2 className="text-[clamp(22px,3vw,30px)] text-white tracking-[-0.03em] font-[720]">Every AI Agent Has a Blind Spot.</h2>
            <p className="mt-2.5 text-cr-muted leading-relaxed max-w-[70ch]">
              The modern web is built on WebGL. Three.js. Canvas. None of it lives in the DOM. Every agent, every scraper, every model
              sees a single opaque <code className="font-mono text-[0.9em] px-1 py-0.5 rounded border border-white/10 bg-white/5 text-white/70">&lt;canvas&gt;</code> element — and zero understanding of what's inside it.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3.5 mt-4.5 max-[640px]:grid-cols-1">
            <div className="rounded-cr p-4.5 bg-white/3 border border-white/9">
              <div className="flex items-baseline justify-between gap-2.5 mb-3">
                <div className="font-[720] tracking-[-0.02em] text-white">Generic Agents</div>
                <div className="text-[12px] text-white/70 bg-white/4 border border-white/8 px-2.5 py-1.5 rounded-full whitespace-nowrap">Completely Blind</div>
              </div>
              <ul className="list-none p-0 m-0 grid gap-2.5 text-cr-muted leading-relaxed text-[14px]">
                <li className="relative pl-4 before:content-[''] before:absolute before:left-0.5 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-white/25">
                  Sees a single <code className="font-mono text-[0.95em] px-1.5 py-0.5 rounded-lg border border-white/8 bg-black/22 text-white/86">&lt;canvas&gt;</code> element — no structure. Just pixels.
                </li>
                <li className="relative pl-4 before:content-[''] before:absolute before:left-0.5 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-white/25">Cannot query 3D objects, materials, animations, or interactive states.</li>
                <li className="relative pl-4 before:content-[''] before:absolute before:left-0.5 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-white/25">Zero semantic understanding of WebGL state. Every response is a guess.</li>
              </ul>
            </div>

            <div className="rounded-cr p-4.5 bg-white/3 border border-white/9">
              <div className="flex items-baseline justify-between gap-2.5 mb-3">
                <div className="font-[720] tracking-[-0.02em] text-white">Vision-Only Scraping</div>
                <div className="text-[12px] text-white/70 bg-white/4 border border-white/8 px-2.5 py-1.5 rounded-full whitespace-nowrap">Expensive & Shallow</div>
              </div>
              <ul className="list-none p-0 m-0 grid gap-2.5 text-cr-muted leading-relaxed text-[14px]">
                <li className="relative pl-4 before:content-[''] before:absolute before:left-0.5 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-white/25">Sends raw screenshots — burning 2,500+ tokens per interaction on pixels.</li>
                <li className="relative pl-4 before:content-[''] before:absolute before:left-0.5 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-white/25">Misses hover states, scroll triggers, and animation transitions entirely.</li>
                <li className="relative pl-4 before:content-[''] before:absolute before:left-0.5 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-white/25">Can't read what a shader is doing — can only see what it already rendered.</li>
              </ul>
            </div>

            <div className="rounded-cr p-4.5 bg-white/6 border border-white/20">
              <div className="flex items-baseline justify-between gap-2.5 mb-3">
                <div className="font-[720] tracking-[-0.02em] text-white">CanvasRead</div>
                <div className="text-[12px] text-black bg-white border border-white px-2.5 py-1.5 rounded-full whitespace-nowrap font-bold">Native 3D Intelligence</div>
              </div>
              <ul className="list-none p-0 m-0 grid gap-2.5 text-cr-muted leading-relaxed text-[14px]">
                <li className="relative pl-4 before:content-[''] before:absolute before:left-0.5 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-white text-white/90 font-medium">Injects directly into the JS heap — reads Three.js scene graphs from memory.</li>
                <li className="relative pl-4 before:content-[''] before:absolute before:left-0.5 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-white/50">Simulates cursor movement, scroll, and hover to trigger every interactive state.</li>
                <li className="relative pl-4 before:content-[''] before:absolute before:left-0.5 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-white/50">Returns structured, semantic JSON — 83% fewer tokens, 10× more information.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── UNIQUE FEATURES ────────────────────────────────────────────── */}
      <section className="py-16 bg-[radial-gradient(900px_400px_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_60%)] border-y border-white/5">
        <div className="mx-auto w-[min(1120px,calc(100%-48px))]">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] tracking-[0.06em] uppercase text-white/60 bg-white/5 border border-white/10 font-bold mb-4">What Nobody Else Has Built</div>
            <h2 className="text-[clamp(26px,4vw,44px)] text-white tracking-[-0.04em] font-[800]">Six Capabilities.<br /><span className="text-white/40">Zero Competition.</span></h2>
            <p className="mt-3 text-cr-muted leading-relaxed max-w-[60ch] mx-auto">
              Every one of these features is novel. None exist in any other scraping tool, agent framework, or browser automation library.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-[640px]:grid-cols-1 max-[920px]:grid-cols-2">

            {/* Feature 1: Clone Studio (Moved and updated) */}
            <div className="bg-white/6 border border-white/20 rounded-[20px] p-5 shadow-[0_10px_40px_rgba(118,185,0,0.1)] hover:border-[#76B900]/40 hover:-translate-y-1 transition-all duration-200 group">
              <div className="text-2xl mb-3">🎬</div>
              <div className="font-[750] text-white mb-2 tracking-[-0.02em]">The Clone Studio Pipeline</div>
              <div className="text-cr-muted text-[14px] leading-relaxed mb-3">
                Point at any 3D hero section. Our pipeline records the session, extracts motion specs via NVIDIA Vision, and generates an R3F clone specification automatically.
              </div>
              <div className="text-[12px] font-bold text-[#76B900] uppercase tracking-wider">Primary Experience.</div>
            </div>

            {/* Feature 2: Scene Graph */}
            <div className="bg-white/3 border border-white/10 rounded-[20px] p-5 hover:border-white/20 hover:-translate-y-1 transition-all duration-200 group">
              <div className="text-2xl mb-3">🧠</div>
              <div className="font-[750] text-white mb-2 tracking-[-0.02em]">JS Heap Scene Graph Traversal</div>
              <div className="text-cr-muted text-[14px] leading-relaxed mb-3">
                Injects a runtime probe that reads the Three.js / R3F <code className="font-mono text-[0.88em] px-1 py-0.5 rounded border border-white/10 bg-white/5 text-white/70">Scene</code> object directly from memory — extracting meshes and materials.
              </div>
              <div className="text-[12px] font-bold text-white/30 uppercase tracking-wider">Zero-latency extraction.</div>
            </div>

            {/* Feature 3: Cursor Sim */}
            <div className="bg-white/3 border border-white/10 rounded-[20px] p-5 hover:border-white/20 hover:-translate-y-1 transition-all duration-200 group">
              <div className="text-2xl mb-3">🌀</div>
              <div className="font-[750] text-white mb-2 tracking-[-0.02em]">Lissajous Cursor Simulation</div>
              <div className="text-cr-muted text-[14px] leading-relaxed mb-3">
                Algorithmically moves the cursor across the viewport to trigger every hover-reactive shader and parallax layer during capture — guaranteed interaction coverage.
              </div>
              <div className="text-[12px] font-bold text-white/30 uppercase tracking-wider">Full interaction test.</div>
            </div>

            {/* Feature 4: Scroll Intelligence */}
            <div className="bg-white/3 border border-white/10 rounded-[20px] p-5 hover:border-white/20 hover:-translate-y-1 transition-all duration-200 group">
              <div className="text-2xl mb-3">📜</div>
              <div className="font-[750] text-white mb-2 tracking-[-0.02em]">Per-Section Scroll Intelligence</div>
              <div className="text-cr-muted text-[14px] leading-relaxed mb-3">
                Discovers every scrollable container and triggers multi-step interactions to capture scroll-linked transitions that standard crawlers miss.
              </div>
              <div className="text-[12px] font-bold text-white/30 uppercase tracking-wider">Depth-first observation.</div>
            </div>

            {/* Feature 5: Token Reduction */}
            <div className="bg-white/3 border border-white/10 rounded-[20px] p-5 hover:border-white/20 hover:-translate-y-1 transition-all duration-200 group">
              <div className="text-2xl mb-3">⚡</div>
              <div className="font-[750] text-white mb-2 tracking-[-0.02em]">83% Token Efficiency</div>
              <div className="text-cr-muted text-[14px] leading-relaxed mb-3">
                By returning structured semantic JSON instead of raw pixel screenshots, we cut token costs while delivering 10x more precision for your AI.
              </div>
              <div className="text-[12px] font-bold text-white/30 uppercase tracking-wider">Faster. Smarter.</div>
            </div>

            {/* Feature 6: MCP Server (Now as extra) */}
            <div className="bg-white/2 border border-white/5 rounded-[20px] p-5 opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-200 group">
              <div className="text-2xl mb-3">🤖</div>
              <div className="font-[750] text-white mb-2 tracking-[-0.02em]">MCP Agent Integration</div>
              <div className="text-cr-muted text-[14px] leading-relaxed mb-3">
                Integration layer for Claude, Cursor, and Gemini. Enables AI agents to use the Scraper as a native tool through the Model Context Protocol.
              </div>
              <div className="text-[12px] font-bold text-white/20 uppercase tracking-wider">Optional Integration.</div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CLONE CTA ──────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(118,185,0,0.08)_0%,transparent_60%)] pointer-events-none"></div>
        <div className="mx-auto w-[min(1120px,calc(100%-48px))] relative z-10">
          <div className="bg-gradient-to-br from-[#76B900]/10 to-transparent border border-[#76B900]/30 rounded-[32px] p-10 sm:p-16 text-center shadow-[0_0_60px_rgba(118,185,0,0.1)] backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#76B900] to-transparent opacity-50"></div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#76B900]/20 border border-[#76B900]/40 text-[#76B900] font-bold text-[13px] mb-6 tracking-wide uppercase shadow-[0_0_15px_rgba(118,185,0,0.3)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5" /></svg>
              The Demo That Changes Minds
            </div>

            <h2 className="text-[clamp(32px,5vw,60px)] text-white tracking-[-0.04em] font-[800] leading-tight mb-6 mt-2">
              Blind → Seeing → Building.<br />
              <span className="text-white/50 text-[0.75em]">In 30 seconds.</span>
            </h2>

            <p className="text-[clamp(16px,2vw,20px)] text-white/80 leading-relaxed max-w-4xl mx-auto mb-10 font-medium">
              Point CanvasRead at any 3D website. Watch it extract the full scene graph — every mesh, shader, animation state, and interactive element.
              <span className="text-white block mt-4 text-[1.05em] font-bold border-t border-white/10 pt-4">
                Paste the output into Claude or Cursor to <span className="text-[#76B900]">clone the entire 3D experience in React Three Fiber.</span>
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/demo" className="bg-[#76B900] text-black hover:bg-[#88d300] hover:-translate-y-1 transition-all duration-300 font-[750] text-[17px] px-10 py-4.5 rounded-xl shadow-[0_0_30px_rgba(118,185,0,0.5)] flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                Enter Clone Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="py-14 bg-[radial-gradient(900px_540px_at_10%_30%,rgba(255,255,255,0.03)_0%,transparent_55%)] border-y border-white/5">
        <div className="mx-auto w-[min(1120px,calc(100%-48px))]">
          <div className="grid grid-cols-2 gap-[18px] items-start max-[640px]:grid-cols-1">
            <div>
              <h2 className="text-[clamp(22px,3vw,30px)] text-white tracking-[-0.03em] font-[720]">From URL to Clone Spec. Automatically.</h2>
              <p className="mt-2.5 text-cr-muted leading-relaxed max-w-[70ch]">
                A single scrape triggers the entire pipeline — multi-modal observation, 3D state capture, interaction simulation, video analysis, and structured output — with no configuration.
              </p>
            </div>
            <ol className="m-1.5 p-0 list-none grid gap-2.5">
              <li className="grid grid-cols-[34px_1fr] gap-3 items-start p-3.5 rounded-cr bg-white/3 border border-white/8">
                <div className="w-[34px] h-[34px] rounded-xl grid place-items-center font-[750] text-black bg-white border border-white">1</div>
                <div>
                  <div className="font-[680] tracking-[-0.02em] text-white">Observe & Discover</div>
                  <div className="mt-1 text-cr-muted leading-relaxed text-[14px]">Playwright launches, navigates, discovers all scrollable containers and scroll-trigger sections.</div>
                </div>
              </li>
              <li className="grid grid-cols-[34px_1fr] gap-3 items-start p-3.5 rounded-cr bg-white/3 border border-white/8">
                <div className="w-[34px] h-[34px] rounded-xl grid place-items-center font-[750] text-black bg-white border border-white">2</div>
                <div>
                  <div className="font-[680] tracking-[-0.02em] text-white">Inject, Interact & Record</div>
                  <div className="mt-1 text-cr-muted leading-relaxed text-[14px]">Reads scene graph from JS heap, simulates Lissajous cursor movement, records hero video with full interaction coverage.</div>
                </div>
              </li>
              <li className="grid grid-cols-[34px_1fr] gap-3 items-start p-3.5 rounded-cr bg-white/3 border border-white/8">
                <div className="w-[34px] h-[34px] rounded-xl grid place-items-center font-[750] text-black bg-white border border-white">3</div>
                <div>
                  <div className="font-[680] tracking-[-0.02em] text-white">Synthesize Clone Spec</div>
                  <div className="mt-1 text-cr-muted leading-relaxed text-[14px]">Video frames analyzed by NVIDIA Vision, Motion Spec generated, full Clone Spec output ready for any AI code generator.</div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* ── EFFICIENCY TABLE ───────────────────────────────────────────── */}
      <section className="py-14">
        <div className="mx-auto w-[min(1120px,calc(100%-48px))]">
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(22px,3vw,30px)] text-white tracking-[-0.03em] font-[720]">Why It Beats Screenshot-Based Agents Everywhere</h2>
            <p className="mt-2.5 text-cr-muted leading-relaxed max-w-[70ch] mx-auto">
              Not just better at 3D — structurally superior for any web that uses canvas, WebGL, or scroll-linked interaction.
            </p>
          </div>

          <div className="rounded-cr bg-white/2 border border-white/10 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-white/10 bg-white/3 font-bold text-[13px] tracking-wider uppercase text-white/60 max-[640px]:grid-cols-[1fr_1fr_1fr]">
              <div className="px-6 py-4">Capability</div>
              <div className="px-6 py-4 text-center">Standard Agent</div>
              <div className="px-6 py-4 text-center text-white">CanvasRead</div>
            </div>

            {[
              ['Token Usage / Scene', '~2,500+ (High-Res Pixels)', '~450 (Semantic JSON)'],
              ['Canvas / WebGL Visibility', 'Opaque — Blind', 'Full Scene Graph'],
              ['Hover & Scroll State Detection', 'Misses Entirely', 'Lissajous + Per-Section'],
              ['Animation Understanding', 'Static Screenshot', 'Video Motion Spec'],
              ['3D Clone Output', 'Not Possible', 'React Three Fiber Spec'],
              ['Agent Integration', 'Custom Prompt Engineering', 'MCP Tool — Zero Config'],
            ].map(([metric, bad, good], i) => (
              <div key={i} className={`grid grid-cols-[1.5fr_1fr_1fr] items-center max-[640px]:grid-cols-[1fr_1fr_1fr] ${i < 5 ? 'border-b border-white/5' : ''}`}>
                <div className="px-6 py-4">
                  <div className="font-[680] text-white text-[14px]">{metric}</div>
                </div>
                <div className="px-6 py-4 text-center text-cr-muted text-[14px]">{bad}</div>
                <div className="px-6 py-4 text-center font-bold text-white text-[14px]">{good}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center text-cr-faint text-[13px]">
            *Based on real evaluation of Three.js sites including WebGL configurators, creative portfolios, and interactive 3D product experiences.
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="py-14 pb-16">
        <div className="mx-auto w-[min(1120px,calc(100%-48px))]">
          <div className="flex flex-wrap items-center justify-between gap-4 p-8 rounded-[calc(var(--radius-cr)+4px)] bg-white border border-white shadow-[0_40px_100px_rgba(255,255,255,0.1)] text-black">
            <div className="max-w-[60ch]">
              <h2 className="text-[clamp(22px,3vw,30px)] text-black tracking-[-0.03em] font-[720]">The Web is Dark. Your Agents Should See All of It.</h2>
              <p className="mt-2.5 text-black/60 leading-relaxed">
                Add CanvasRead to Claude, Cursor, or any MCP-compatible agent in under 60 seconds. Ship the only AI that can actually read the modern web.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="inline-flex items-center justify-center px-4 py-3 rounded-[14px] text-[15px] font-[650] whitespace-nowrap transition-all duration-140 hover:-translate-y-0.5 text-white bg-black border border-black shadow-[0_12px_40px_rgba(0,0,0,0.15)]" href="/demo">
                Open Web Studio
              </Link>
              <Link className="inline-flex items-center justify-center px-4 py-3 rounded-[14px] text-[15px] font-[650] whitespace-nowrap transition-all duration-140 hover:-translate-y-0.5 text-black bg-black/5 border border-black/10" href="https://github.com/dhruvagrawals/CanvasRead#installation" target="_blank" rel="noreferrer">
                Add to Claude
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-[26px] pb-[42px] border-t border-white/6 bg-black/14">
        <div className="mx-auto w-[min(1120px,calc(100%-48px))]">
          <div className="flex items-start justify-between gap-[18px] flex-wrap">
            <div className="grid gap-2">
              <div className="inline-flex items-center gap-2.5 font-[650] text-white">
                <div className="relative w-6 h-6 flex-shrink-0">
                  <Image 
                    src="/logo.png" 
                    alt="CanvasRead Logo" 
                    fill 
                    className="object-contain rounded-md"
                  />
                </div>
                CanvasRead
              </div>
              <div className="text-cr-faint text-[13px] leading-relaxed">The world's first intelligence layer for WebGL & Three.js.</div>
            </div>
            <div className="flex gap-3.5 flex-wrap text-cr-muted text-[14px]">
              <Link className="px-2.5 py-2 rounded-xl transition-all duration-140 hover:text-cr-text hover:bg-white/5" href="/demo">Demo</Link>
              <Link className="px-2.5 py-2 rounded-xl transition-all duration-140 hover:text-cr-text hover:bg-white/5" href="/examples/threejs">Example</Link>
              <Link className="px-2.5 py-2 rounded-xl transition-all duration-140 hover:text-cr-text hover:bg-white/5" href="/docs">Docs</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
