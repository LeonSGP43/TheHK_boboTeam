/**
 * CrawlLoader - Crawl Loading Page
 */

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Wifi, Radio, AlertCircle } from "lucide-react";
import { BACKEND_URL } from "../../config/env";
import { preloadHistoryData } from "../../services/historyCache";
import { preloadPlatformNews } from "../../services/platformNewsCache";

interface CrawlLoaderProps {
  onComplete: () => void;
}

interface StreamDataPoint {
  time: string;
  score: number;
  platform: string;
}

// Butterfly icon - simplified animation using CSS instead of framer-motion for better performance
const ButterflyIcon = ({ className, isFlapping }: { className?: string; isFlapping?: boolean }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g className={isFlapping ? "animate-butterfly-left" : ""}>
      <path
        d="M50 60C50 60 30 20 10 30C0 40 10 70 30 80C40 85 50 85 50 85"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="10" cy="30" r="4" fill="currentColor" />
    </g>
    <g className={isFlapping ? "animate-butterfly-right" : ""}>
      <path
        d="M50 60C50 60 70 20 90 30C100 40 90 70 70 80C60 85 50 85 50 85"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="90" cy="30" r="4" fill="currentColor" />
    </g>
    <path d="M50 60L50 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// Bottom wave chart - occupies lower half only
const BottomWaveChart: React.FC<{ data: StreamDataPoint[] }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) return;

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(0, 240, 255, 0.2)");
    gradient.addColorStop(0.5, "rgba(189, 0, 255, 0.1)");
    gradient.addColorStop(1, "rgba(255, 126, 95, 0.02)");

    const pointWidth = width / (data.length - 1);

    ctx.beginPath();
    ctx.moveTo(0, height);
    data.forEach((point: StreamDataPoint, i: number) => {
      const x = i * pointWidth;
      const y = height - (point.score / 100) * height * 0.8 - height * 0.05;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = (i - 1) * pointWidth;
        const prevY = height - (data[i - 1].score / 100) * height * 0.8 - height * 0.05;
        ctx.quadraticCurveTo((prevX + x) / 2, prevY, x, y);
      }
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Gradient line
    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, "#00F0FF");
    lineGradient.addColorStop(0.5, "#BD00FF");
    lineGradient.addColorStop(1, "#FF7E5F");

    ctx.beginPath();
    data.forEach((point: StreamDataPoint, i: number) => {
      const x = i * pointWidth;
      const y = height - (point.score / 100) * height * 0.8 - height * 0.05;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = (i - 1) * pointWidth;
        const prevY = height - (data[i - 1].score / 100) * height * 0.8 - height * 0.05;
        ctx.quadraticCurveTo((prevX + x) / 2, prevY, x, y);
      }
    });
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();

    // Glowing endpoint
    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      const lastX = (data.length - 1) * pointWidth;
      const lastY = height - (lastPoint.score / 100) * height * 0.8 - height * 0.05;
      const glowGradient = ctx.createRadialGradient(lastX, lastY, 0, lastX, lastY, 20);
      glowGradient.addColorStop(0, "rgba(0, 240, 255, 0.8)");
      glowGradient.addColorStop(1, "rgba(0, 240, 255, 0)");
      ctx.beginPath();
      ctx.arc(lastX, lastY, 20, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#00F0FF";
      ctx.fill();
    }
  }, [data]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

type CrawlPhase = "init" | "connecting" | "crawling" | "receiving" | "complete" | "error";

export function CrawlLoader({ onComplete }: CrawlLoaderProps) {
  const [phase, setPhase] = useState<CrawlPhase>("init");
  const [statusText, setStatusText] = useState("Initializing...");
  const [streamData, setStreamData] = useState<StreamDataPoint[]>([]);
  const [latestScore, setLatestScore] = useState(0);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [dataCount, setDataCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [crawlComplete, setCrawlComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const eventSourceRef = useRef<EventSource | null>(null);
  const dataReceivedRef = useRef(false);
  const mountedRef = useRef(true);
  const initCalledRef = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    const init = async () => {
      try {
        setPhase("connecting");
        setStatusText("Checking spider server...");

        const healthRes = await fetch(`${BACKEND_URL}/api/crawl/health`);
        const healthData = await healthRes.json();

        if (healthData.spider_server === "offline") {
          setPhase("error");
          setErrorMessage("Spider server not running! Please run: cd spider6p && npm run server");
          return;
        }

        preloadHistoryData().catch(console.error);
        preloadPlatformNews().catch(console.error);

        setStatusText("Connecting to data stream...");
        const eventSource = new EventSource(`${BACKEND_URL}/api/stream/all`);
        eventSourceRef.current = eventSource;

        await new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, 3000);
          eventSource.onopen = () => {
            clearTimeout(timeout);
            if (mountedRef.current) setIsConnected(true);
            resolve();
          };
        });

        const handleStreamData = (_eventType: string, event: MessageEvent) => {
          if (!mountedRef.current) return;
          try {
            const payload = JSON.parse(event.data);
            let score = payload.trend_score ?? payload.vks_score ?? (payload.views ? Math.min(100, Math.log10((payload.views || 0) + 1) * 10) : 0);
            const platform = payload.platform || "UNKNOWN";
            if (platform === "UNKNOWN" || score === 0) return;

            dataReceivedRef.current = true;
            setLatestScore(Math.round(score));
            setCurrentPlatform(platform.toUpperCase());
            setDataCount((prev: number) => prev + 1);
            setStreamData((prev: StreamDataPoint[]) => {
              const newData = [...prev, {
                time: new Date().toLocaleTimeString([], { hour12: false, minute: "2-digit", second: "2-digit" }),
                score: Math.min(100, Math.max(0, score)),
                platform: platform.toUpperCase(),
              }];
              return newData.length > 60 ? newData.slice(1) : newData;
            });
          } catch {}
        };

        eventSource.addEventListener("vks_update", (e) => handleStreamData("vks_update", e));
        eventSource.addEventListener("trend_update", (e) => handleStreamData("trend_update", e));
        eventSource.onerror = () => { if (mountedRef.current) setIsConnected(false); };

        setPhase("crawling");
        setStatusText("Starting crawler...");

        await fetch(`${BACKEND_URL}/api/crawl/trigger?tags=AI,trending,viral&mock=true`, { method: "POST" });

        setPhase("receiving");
        setStatusText("Receiving data...");

        let pollCount = 0;
        const checkStatus = async (): Promise<boolean> => {
          if (!mountedRef.current) return false;
          pollCount++;
          try {
            const [statusRes, historyRes] = await Promise.all([
              fetch(`${BACKEND_URL}/api/crawl/status`),
              fetch(`${BACKEND_URL}/api/history/stats`)
            ]);
            const status = await statusRes.json();
            const historyStats = await historyRes.json().catch(() => ({ total_records: 0 }));

            if (status.current_platform && status.current_platform !== "IDLE") {
              setCurrentPlatform(status.current_platform);
              setStatusText(`Crawling: ${status.current_platform}`);
            }

            if ((!status.is_running && historyStats.total_records > 0) || pollCount >= 30) {
              setCrawlComplete(true);
              setPhase("complete");
              setStatusText(pollCount >= 30 ? "Timeout Complete" : "Crawl Complete!");
              return true;
            }
            return false;
          } catch { return false; }
        };

        if (!(await checkStatus()) && mountedRef.current) {
          pollIntervalRef.current = setInterval(async () => {
            if (await checkStatus() && pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }, 2000);
        }
      } catch (error) {
        if (mountedRef.current) {
          setPhase("error");
          setErrorMessage("Initialization failed: " + (error as Error).message);
        }
      }
    };

    init();
    return () => {
      mountedRef.current = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (crawlComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [crawlComplete, onComplete]);

  const phaseConfig: Record<CrawlPhase, { color: string; icon: React.ElementType }> = {
    init: { color: "text-slate-400", icon: Loader2 },
    connecting: { color: "text-yellow-400", icon: Wifi },
    crawling: { color: "text-cyan-400", icon: Radio },
    receiving: { color: "text-purple-400", icon: Radio },
    complete: { color: "text-green-400", icon: CheckCircle2 },
    error: { color: "text-red-400", icon: AlertCircle },
  };
  const PhaseIcon = phaseConfig[phase].icon;

  if (phase === "error") {
    return (
      <motion.div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center" exit={{ opacity: 0 }}>
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Startup Failed</h2>
        <p className="text-red-400 text-center max-w-md mb-6">{errorMessage}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500">Retry</button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col overflow-hidden"
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* CSS animation styles */}
      <style>{`
        @keyframes butterfly-left {
          0%, 100% { transform: rotateY(0deg) rotateZ(0deg); }
          50% { transform: rotateY(30deg) rotateZ(5deg); }
        }
        @keyframes butterfly-right {
          0%, 100% { transform: rotateY(0deg) rotateZ(0deg); }
          50% { transform: rotateY(-30deg) rotateZ(-5deg); }
        }
        .animate-butterfly-left {
          transform-origin: 50px 60px;
          animation: butterfly-left 0.6s ease-in-out infinite;
        }
        .animate-butterfly-right {
          transform-origin: 50px 60px;
          animation: butterfly-right 0.6s ease-in-out infinite;
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 30px rgba(0, 240, 255, 0.3); }
          50% { box-shadow: 0 0 50px rgba(189, 0, 255, 0.4); }
        }
        .animate-glow { animation: glow-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#00d4ff 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-gradient-to-tr from-indigo-900/15 to-purple-900/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Upper section: Center content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 pb-8">
        {/* Butterfly icon */}
        <motion.div 
          className="mb-6"
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-28 h-28 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center animate-glow">
            <ButterflyIcon isFlapping className="w-16 h-16 text-white drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div 
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-black text-white mb-1">
            TREND<span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">PULSE</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-[0.3em]">REAL-TIME SOCIAL INTELLIGENCE</p>
        </motion.div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <PhaseIcon size={18} className={`${phaseConfig[phase].color} ${phase !== "complete" ? "animate-pulse" : ""}`} />
          <span className={`text-sm font-mono ${phaseConfig[phase].color}`}>{statusText}</span>
        </div>
      </div>

      {/* Lower section: Chart area */}
      <div className="h-[40vh] relative">
        {/* Data display above chart */}
        <div className="absolute top-0 left-6 right-6 flex justify-between items-center z-10 py-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
            <span className="text-[10px] font-mono text-slate-400">{isConnected ? "LIVE STREAM" : "CONNECTING..."}</span>
            <span className="text-[10px] font-mono text-slate-600 ml-4">{dataCount} signals</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block">SCORE</span>
              <span className={`text-xl font-bold ${latestScore > 70 ? "text-green-400" : latestScore > 40 ? "text-yellow-400" : "text-slate-400"}`}>{latestScore}</span>
            </div>
            {currentPlatform && (
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 block">PLATFORM</span>
                <span className="text-sm font-bold text-cyan-400">{currentPlatform}</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="absolute inset-0 pt-12">
          <BottomWaveChart data={streamData} />
        </div>

        {/* Bottom status bar */}
        <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center z-10">
          <span className={`text-[10px] font-mono px-3 py-1.5 rounded-lg ${crawlComplete ? "bg-green-900/50 text-green-400 border border-green-500/30" : "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30"}`}>
            {crawlComplete ? "✓ COMPLETE" : "⏳ CRAWLING..."}
          </span>
          <span className="text-[10px] text-slate-600 font-mono">POWERED BY CONFLUENT KAFKA + SPIDER6P</span>
        </div>
      </div>
    </motion.div>
  );
}
