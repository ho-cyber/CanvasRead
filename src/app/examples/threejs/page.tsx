'use client';

import Dashboard from '@/components/Dashboard';

export default function DemoPage() {
    return (
        <main>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                background: 'rgba(255, 77, 77, 0.1)',
                color: '#ff4d4d',
                padding: '8px',
                textAlign: 'center',
                fontSize: '0.8rem',
                zIndex: 1000,
                borderBottom: '1px solid rgba(255, 77, 77, 0.2)',
                backdropFilter: 'blur(4px)'
            }}>
                <strong>DEMO MODE:</strong> Strict rate limits apply (2 scrapes per hour).
            </div>
            <Dashboard />
        </main>
    );
}
