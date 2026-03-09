'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './dashboard.module.css';

export default function Dashboard() {
    const [url, setUrl] = useState('');
    const [selector, setSelector] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({ snaps: 0, tokens: 0 });
    const [extractions, setExtractions] = useState<any[]>([]);
    const [finalSummary, setFinalSummary] = useState<string>('');
    const [sceneDoc, setSceneDoc] = useState<string>('');
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
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>CanvasRead</h1>
                <p className={styles.subtitle}>Token-Efficient Scraper for WebGL & Three.js</p>
            </header>

            <main className={styles.glassPanel}>
                <div className={styles.inputGroup}>
                    <input
                        className={styles.input}
                        placeholder="Enter 3D URL (e.g. threejs.org/examples/...)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isScraping}
                        style={{ flex: 3 }}
                    />
                    <input
                        className={styles.input}
                        placeholder="Selector (e.g. #canvas)"
                        value={selector}
                        onChange={(e) => setSelector(e.target.value)}
                        disabled={isScraping}
                        style={{ flex: 1, minWidth: '150px' }}
                    />
                    <button
                        className={styles.button}
                        onClick={startScrape}
                        disabled={isScraping || !url}
                    >
                        {isScraping ? 'SCRAPING...' : 'START EXTRACTION'}
                    </button>
                </div>

                <div className={styles.grid}>
                    <div className={styles.logArea}>
                        {logs.map((log, i) => (
                            <div key={i} style={{ color: log.startsWith('[ERROR]') ? '#ff4d4d' : log.startsWith('[SNAP') ? '#00f2ff' : '#888', marginBottom: '4px' }}>
                                {log}
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>

                    <aside className={styles.statsPanel}>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Meaningful Snaps</div>
                            <div className={styles.statValue}>{stats.snaps}</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Local ML Cost</div>
                            <div className={styles.statValue}>$0.00</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                                vs ~${(stats.snaps * 0.1).toFixed(2)} on-chain
                            </div>
                        </div>

                        {finalSummary ? (
                            <div className={styles.statCard} style={{ flex: 1, overflowY: 'auto' }}>
                                <div className={styles.statLabel}>Final AI Semantic Summary</div>
                                <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {finalSummary}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.statCard} style={{ flex: 1, overflowY: 'auto' }}>
                                <div className={styles.statLabel}>Live JSON Extraction</div>
                                <pre style={{ fontSize: '0.7rem', color: '#888', marginTop: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowX: 'hidden' }}>
                                    {JSON.stringify(extractions, null, 2)}
                                </pre>
                            </div>
                        )}
                    </aside>
                </div>
            </main>
        </div>
    );
}
