'use client';

import { useState, useRef, useEffect } from 'react';

export default function Dashboard() {
    const [url, setUrl] = useState('');
    const [selector, setSelector] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({ snaps: 0, tokens: 0 });
    const [extractions, setExtractions] = useState<any[]>([]);
    const [finalSummary, setFinalSummary] = useState<string>('');
    const [sceneDoc, setSceneDoc] = useState<string>('');

    // UI Tabs
    const [activeTab, setActiveTab] = useState<'extract' | 'a11y' | 'qa' | 'clone'>('extract');

    // Accessibility feature state
    const [isGeneratingA11y, setIsGeneratingA11y] = useState(false);
    const [a11yReport, setA11yReport] = useState<string>('');

    // QA Testing feature state
    const [qaQuery, setQaQuery] = useState('');
    const [isTestingQA, setIsTestingQA] = useState(false);
    const [qaResult, setQaResult] = useState<{ pass: boolean, reasoning: string } | null>(null);

    // Cloning feature state
    const [isGeneratingCloneSpec, setIsGeneratingCloneSpec] = useState(false);
    const [cloneSpec, setCloneSpec] = useState<string>('');

    const logEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [logs]);

    const startScrape = async () => {
        if (!url) return;
        setIsScraping(true);
        setLogs(['Initiating pipeline...']);
        setExtractions([]);
        setStats({ snaps: 0, tokens: 0 });
        setFinalSummary('');
        setSceneDoc('');

        try {
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, selector }),
            });

            const reader = response.body?.getReader();
            if (!reader) return;

            const decoder = new TextDecoder();
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(Boolean);

                for (const line of lines) {
                    const event = JSON.parse(line);
                    handleEvent(event);
                }
            }
        } catch (error: any) {
            setLogs(prev => [...prev, `[ERROR] ${error.message}`]);
        } finally {
            setIsScraping(false);
        }
    };

    const generateA11y = async () => {
        if (extractions.length === 0) return;
        setIsGeneratingA11y(true);
        try {
            const response = await fetch('/api/accessibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ states: extractions }),
            });
            const data = await response.json();
            if (data.report) setA11yReport(data.report);
        } catch (error) {
            console.error('Failed to generate a11y report', error);
        } finally {
            setIsGeneratingA11y(false);
        }
    };

    const runQA = async () => {
        if (extractions.length === 0 || !qaQuery) return;
        setIsTestingQA(true);
        setQaResult(null);
        try {
            const response = await fetch('/api/qa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ states: extractions, query: qaQuery }),
            });
            const data = await response.json();
            setQaResult(data);
        } catch (error) {
            console.error('QA request failed', error);
        } finally {
            setIsTestingQA(false);
        }
    };

    const generateCloneSpec = async () => {
        if (extractions.length === 0) return;
        setIsGeneratingCloneSpec(true);
        try {
            const response = await fetch('/api/clone-spec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    states: extractions,
                    videoAnalysis: (extractions[extractions.length - 1] as any)?.videoAnalysis
                }),
            });
            const data = await response.json();
            if (data.spec) setCloneSpec(data.spec);
        } catch (error) {
            console.error('Failed to generate clone spec', error);
        } finally {
            setIsGeneratingCloneSpec(false);
        }
    };

    const handleEvent = (event: any) => {
        switch (event.type) {
            case 'progress':
                setLogs(prev => [...prev, `[LOG] ${event.data.message}`]);
                break;
            case 'snap':
                setStats(prev => ({
                    snaps: event.data.snapCount,
                    tokens: event.data.totalTokens,
                }));
                setExtractions(prev => [...prev, event.data.analysis]);
                setLogs(prev => [...prev, `[SNAP #${event.data.snapCount}] Extraction complete.`]);
                break;
            case 'done':
                setLogs(prev => [...prev, '[SUCCESS] Extraction pipeline complete.']);
                if (event.data.finalAiSummary) setFinalSummary(event.data.finalAiSummary);
                if (event.data.sceneDocument) setSceneDoc(event.data.sceneDocument);
                setIsScraping(false);
                break;
            case 'error':
                setLogs(prev => [...prev, `[ERROR] ${event.data.message}`]);
                setIsScraping(false);
                break;
        }
    };

    return (
        <div className="mx-auto max-w-[1200px] px-5 py-10">
            <header className="text-center mb-[60px]">
                <h1 className="text-[clamp(2.5rem,8vw,4rem)] font-[720] tracking-[-0.05em] text-white m-0">CanvasRead</h1>
                <p className="text-cr-muted text-[1.1rem] sm:text-[1.2rem] mt-2.5">Token-Efficient Scraper for WebGL & Three.js</p>
            </header>

            <main className="bg-[rgba(20,20,20,0.8)] backdrop-blur-[16px] border border-white/10 rounded-[24px] p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        className="flex-[3] bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-[1rem] transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-white/10"
                        placeholder="Enter 3D URL (e.g. threejs.org/examples/...)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isScraping}
                    />
                    <input
                        className="flex-1 min-w-[150px] bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-[1rem] transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-white/10"
                        placeholder="Selector (e.g. #canvas)"
                        value={selector}
                        onChange={(e) => setSelector(e.target.value)}
                        disabled={isScraping}
                    />
                    <button
                        className="bg-white text-black border-none rounded-xl px-8 py-4 font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                        onClick={startScrape}
                        disabled={isScraping || !url}
                    >
                        {isScraping ? 'SCRAPING...' : 'START EXTRACTION'}
                    </button>
                </div>

                <div className="flex gap-4 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
                    <button
                        className={`font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'extract' ? 'bg-white text-black' : 'text-white/50 hover:bg-white/5'}`}
                        onClick={() => setActiveTab('extract')}
                    >
                        Live Extraction
                    </button>
                    <button
                        className={`font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'a11y' ? 'bg-white text-black' : 'text-white/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed'}`}
                        onClick={() => setActiveTab('a11y')}
                        disabled={extractions.length === 0 && !isScraping}
                    >
                        Accessibility & SEO
                    </button>
                    <button
                        className={`font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'qa' ? 'bg-white text-black' : 'text-white/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed'}`}
                        onClick={() => setActiveTab('qa')}
                        disabled={extractions.length === 0 && !isScraping}
                    >
                        QA Testing
                    </button>
                    <button
                        className={`font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'clone' ? 'bg-white text-black' : 'text-white/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed'}`}
                        onClick={() => setActiveTab('clone')}
                        disabled={extractions.length === 0 && !isScraping}
                    >
                        3D Cloning Prompt
                    </button>
                </div>

                {activeTab === 'extract' && (
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                        <div className="h-[500px] overflow-y-auto bg-black rounded-2xl p-5 font-mono text-[0.9rem] border border-white/10 min-w-0">
                            {logs.map((log, i) => (
                                <div
                                    key={i}
                                    className={`mb-1 ${log.startsWith('[ERROR]')
                                        ? 'text-red-500'
                                        : log.startsWith('[SNAP')
                                            ? 'text-white font-bold'
                                            : 'text-zinc-500'
                                        }`}
                                >
                                    {log}
                                </div>
                            ))}
                            <div ref={logEndRef} />
                        </div>

                        <aside className="flex flex-col gap-4 min-w-0">
                            <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
                                <div className="text-[0.8rem] uppercase tracking-[0.1em] text-white/40">Meaningful Snaps</div>
                                <div className="text-[2rem] font-bold mt-2 text-white">{stats.snaps}</div>
                            </div>
                            <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
                                <div className="text-[0.8rem] uppercase tracking-[0.1em] text-white/40">Local ML Cost</div>
                                <div className="text-[2rem] font-bold mt-2 text-white">$0.00</div>
                                <div className="text-[0.7rem] text-white/30 mt-1">
                                    vs ~${(stats.snaps * 0.1).toFixed(2)} on-chain
                                </div>
                            </div>

                            {finalSummary ? (
                                <div className="bg-white/3 border border-white/10 rounded-2xl p-6 flex-1 overflow-y-auto max-h-[250px]">
                                    <div className="text-[0.8rem] uppercase tracking-[0.1em] text-white/40">Final AI Semantic Summary</div>
                                    <div className="text-[0.85rem] text-white mt-3 leading-relaxed whitespace-pre-wrap">
                                        {finalSummary}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/3 border border-white/10 rounded-2xl p-6 flex-1 overflow-y-auto max-h-[250px]">
                                    <div className="text-[0.8rem] uppercase tracking-[0.1em] text-white/40">Live JSON Extraction</div>
                                    <pre className="text-[0.7rem] text-zinc-500 mt-3 whitespace-pre-wrap break-words overflow-x-hidden">
                                        {JSON.stringify(extractions, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </aside>
                    </div>
                )}

                {activeTab === 'a11y' && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Accessibility & SEO Generator</h3>
                                <p className="text-white/60">Generate semantic HTML fallbacks, ARIA labels, and alt text from the 3D scene.</p>
                            </div>
                            <button
                                className="bg-white text-black border-none rounded-xl px-6 py-3 font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={generateA11y}
                                disabled={isGeneratingA11y || extractions.length === 0}
                            >
                                {isGeneratingA11y ? 'GENERATING...' : 'GENERATE REPORT'}
                            </button>
                        </div>
                        {a11yReport && (
                            <div className="bg-black border border-white/10 rounded-2xl p-6 overflow-x-auto">
                                <pre className="text-[0.9rem] text-white/80 whitespace-pre-wrap font-mono leading-relaxed">
                                    {a11yReport}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'qa' && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Natural Language Visual QA Testing</h3>
                                <p className="text-white/60 mb-6">Write assertions in plain English to test the state and presence of objects in the 3D canvas.</p>
                            </div>
                            <div className="flex gap-4">
                                <input
                                    className="flex-1 bg-black border border-white/20 rounded-xl px-6 py-4 text-white text-[1rem] focus:outline-none focus:border-white/40"
                                    placeholder="e.g. 'Assert that the red car model is currently visible'"
                                    value={qaQuery}
                                    onChange={(e) => setQaQuery(e.target.value)}
                                    disabled={isTestingQA}
                                    onKeyDown={(e) => e.key === 'Enter' && runQA()}
                                />
                                <button
                                    className="bg-[#2a7a3e] text-white border border-[#3eac5c]/50 rounded-xl px-8 py-4 font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={runQA}
                                    disabled={isTestingQA || extractions.length === 0 || !qaQuery}
                                >
                                    {isTestingQA ? 'TESTING...' : 'RUN TEST'}
                                </button>
                            </div>
                        </div>

                        {qaResult && (
                            <div className={`border rounded-2xl p-6 flex items-start gap-4 ${qaResult.pass ? 'bg-[#1b2a1f] border-[#2a7a3e]' : 'bg-[#2a1b1b] border-[#7a2a2a]'}`}>
                                <div className={`px-3 py-1 rounded-full font-bold text-sm mt-1 whitespace-nowrap ${qaResult.pass ? 'bg-[#2a7a3e] text-white' : 'bg-[#7a2a2a] text-white'}`}>
                                    {qaResult.pass ? '✅ PASS' : '❌ FAIL'}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-2">Test Reasoning</h4>
                                    <p className="text-white/80 leading-relaxed text-[0.95rem]">
                                        {qaResult.reasoning}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'clone' && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-6 gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">3D Cloning Prompt Generator</h3>
                                <p className="text-white/60 text-sm max-w-2xl">Generate a professional Technical Specification and R3F mega-prompt for ChatGPT, Claude, or Cursor.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    className="bg-white text-black border-none rounded-xl px-6 py-3 font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50"
                                    onClick={generateCloneSpec}
                                    disabled={isGeneratingCloneSpec || extractions.length === 0}
                                >
                                    {isGeneratingCloneSpec ? 'GENERATING...' : 'GENERATE SPEC'}
                                </button>
                                {cloneSpec && (
                                    <button
                                        className="bg-white text-black border-none rounded-xl px-6 py-3 font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                        onClick={() => {
                                            navigator.clipboard.writeText(cloneSpec);
                                            alert("Cloning Spec copied to clipboard!");
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        COPY FULL SPEC
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-black border border-white/10 rounded-2xl p-6 overflow-x-auto relative group">
                            {cloneSpec ? (
                                <pre className="text-[0.9rem] text-white/80 whitespace-pre-wrap font-mono leading-relaxed select-all">
                                    {cloneSpec}
                                </pre>
                            ) : (
                                <div className="py-20 text-center text-white/30 italic">
                                    Click "GENERATE SPEC" to translate the raw JSON into a professional technical prompt.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

