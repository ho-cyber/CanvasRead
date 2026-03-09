'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig, Series } from 'remotion';

const bgGradient = 'radial-gradient(circle at 0% 0%, #001a1a 0, #000 70%)';
const nexusTeal = '#43e2f5'; // Vibrant cyan/teal from the screenshot
const nexusBlue = '#0ea5e9';

function Slide({
  title,
  body,
  accent,
  stepNum,
}: {
  title: string;
  body: string;
  accent: string;
  stepNum: number;
}) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const totalSeconds = durationInFrames / fps;

  // Clean fade and slide
  const opacity = interpolate(t, [0, 0.4, totalSeconds - 0.4, totalSeconds], [0, 1, 1, 0], {
    easing: Easing.bezier(0.25, 1, 0.5, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(t, [0, 0.4, totalSeconds - 0.4, totalSeconds], [20, 0, 0, -10], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        padding: '0 80px',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            padding: '6px 14px',
            borderRadius: 4,
            background: 'rgba(67, 226, 245, 0.1)',
            border: `1px solid ${accent}44`,
            color: accent,
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          Step {stepNum}
        </div>
        <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.1)' }} />
      </div>

      <h2
        style={{
          fontSize: 52,
          lineHeight: 1.05,
          fontWeight: 900,
          margin: 0,
          letterSpacing: '-0.03em',
          color: '#fff',
          maxWidth: 700,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          maxWidth: 600,
          fontSize: 22,
          lineHeight: 1.5,
          color: 'rgba(255,255,255,0.6)',
          margin: 0,
          fontWeight: 450,
        }}
      >
        {body}
      </p>

      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        <div style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: '#888' }}>
          Target: nexusai-website.netlify.app
        </div>
      </div>
    </AbsoluteFill>
  );
}

function CanvasReadDemoComposition() {
  const { fps } = useVideoConfig();
  const totalSeconds = 9;
  const slideFrames = Math.floor((totalSeconds / 3) * fps);

  return (
    <AbsoluteFill
      style={{
        background: bgGradient,
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* NexusAI-inspired background glow */}
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        top: '-200px',
        right: '-100px',
        background: `radial-gradient(circle, ${nexusTeal}11 0%, transparent 70%)`,
        filter: 'blur(100px)',
      }} />

      {/* Main UI Frame */}
      <AbsoluteFill
        style={{
          margin: 40,
          borderRadius: 40,
          border: '1px solid rgba(67, 226, 245, 0.15)',
          background: 'rgba(0, 0, 0, 0.4)',
          boxShadow: '0 60px 120px -30px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          backdropFilter: 'blur(30px)',
        }}
      >
        {/* Animated Grid Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${nexusTeal}05 1px, transparent 1px), linear-gradient(90deg, ${nexusTeal}05 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.5,
        }} />

        {/* Top Header Bar */}
        <div
          style={{
            padding: '24px 40px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: nexusTeal, boxShadow: `0 0 15px ${nexusTeal}` }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 2, textTransform: 'uppercase' }}>
              NexusAI Canvas Analysis
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontPadding: '0 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, height: 32, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            nexusai-website.netlify.app/hero-canvas
          </div>
        </div>

        {/* Dynamic Content */}
        <AbsoluteFill style={{ top: 80 }}>
          <Series>
            <Series.Sequence durationInFrames={slideFrames}>
              <Slide
                stepNum={1}
                title="Identify 3D Hero Assets."
                body="CanvasRead hooks into the WebGL buffer to isolate the 'Morphing Orb' and 'Neural Network' background."
                accent={nexusTeal}
              />
            </Series.Sequence>
            <Series.Sequence durationInFrames={slideFrames}>
              <Slide
                stepNum={2}
                title="Semantic Object Extraction."
                body="Detect vertex changes in the translucent mesh to understand scene state without high token vision costs."
                accent={nexusBlue}
              />
            </Series.Sequence>
            <Series.Sequence durationInFrames={slideFrames}>
              <Slide
                stepNum={3}
                title="Structured JSON Publication."
                body="Results delivered as clean, agent-ready JSON. Ready for automated QA or LLM reasoning flows."
                accent={nexusTeal}
              />
            </Series.Sequence>
          </Series>
        </AbsoluteFill>

        {/* Bottom Status Bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 40px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          gap: 24,
          fontSize: 11,
          color: 'rgba(255,255,255,0.3)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <span>FPS: 60.0</span>
          <span>GPU: WebGL 2.0 (Nexus Core)</span>
          <span style={{ color: nexusTeal }}>STATUS: PUBLISHING EXTRACTS...</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export default function CanvasReadDemoVideo() {
  return (
    <Player
      component={CanvasReadDemoComposition}
      durationInFrames={9 * 30}
      compositionWidth={1280}
      compositionHeight={720}
      fps={30}
      style={{
        width: '100%',
        maxWidth: 960,
        aspectRatio: '16 / 9',
        borderRadius: 24,
        overflow: 'hidden',
        border: `1px solid ${nexusTeal}33`,
        boxShadow: `0 30px 60px -12px rgba(0, 0, 0, 0.7), 0 0 40px ${nexusTeal}11`,
        backgroundColor: '#000',
      }}
      controls
      loop
      autoPlay
      clickToPlay
    />
  );
}
