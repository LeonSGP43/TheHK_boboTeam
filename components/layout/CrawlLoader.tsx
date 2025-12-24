/**
 * CrawlLoader - 爬取加载页面
 *
 * 功能：
 * 1. 每次启动时触发爬虫
 * 2. 显示实时数据折线图（SSE 接收）
 * 3. 爬取完成后进入主页面
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

// 蝴蝶图标
const ButterflyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 60C50 60 70 20 90 30C100 40 90 70 70 80C60 85 50 85 50 85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M50 60C50 60 30 20 10 30C0 40 10 70 30 80C40 85 50 85 50 85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M50 60L50 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <circle cx="90" cy="30" r="4" fill="currentColor" />
    <circle cx="10" cy="30" r="4" fill="currentColor" />
  </svg>
);

// 实时波动图表
const LiveWaveChart: React.FC<{ data: StreamDataPoint[] }> = ({ data }) => {
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

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(0, 240, 255, 0.3)");
    gradient.addColorStop(0.5, "rgba(189, 0, 255, 0.2)");
    gradient.addColorStop(1, "rgba(255, 126, 95, 0.1)");

    ctx.beginPath();
    ctx.moveTo(0, height);

    const pointWidth = width / (data.length - 1);

    data.forEach((point: StreamDataPoint, i: number) => {
      const x = i * pointWidth;
      const y = height - (point.score / 100) * height * 0.8 - height * 0.1;

      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = (i - 1) * pointWidth;
        const prevY = height - (data[i - 1].score / 100) * height * 0.8 - height * 0.1;
        const cpX = (prevX + x) / 2;
        ctx.quadraticCurveTo(cpX, prevY, x, y);
      }
    });

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, "#00F0FF");
    lineGradient.addColorStop(0.5, "#BD00FF");
    lineGradient.addColorStop(1, "#FF7E5F");

    ctx.beginPath();
    data.forEach((point: StreamDataPoint, i: number) => {
      const x = i * pointWidth;
      const y = height - (point.score / 100) * height * 0.8 - height * 0.1;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = (i - 1) * pointWidth;
        const prevY = height - (data[i - 1].score / 100) * height * 0.8 - height * 0.1;
        const cpX = (prevX + x) / 2;
        ctx.quadraticCurveTo(cpX, prevY, x, y);
      }
    });

    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();

    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      const lastX = (data.length - 1) * pointWidth;
      const lastY = height - (lastPoint.score / 100) * height * 0.8 - height * 0.1;

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

  return <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />;
};

type CrawlPhase = "init" | "connecting" | "crawling" | "receiving" | "complete" | "error";

export function CrawlLoader({ onComplete }: CrawlLoaderProps) {
  const [phase, setPhase] = useState<CrawlPhase>("init");
  const [statusText, setStatusText] = useState("初始化...");
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
    // 使用 ref 来跟踪 mounted 状态，避免 StrictMode 问题
    mountedRef.current = true;
    
    if (initCalledRef.current) {
      console.log("[CrawlLoader] ⚠️ Init already called, skipping...");
      return;
    }
    initCalledRef.current = true;

    const init = async () => {
      try {
        // Step 1: 检查爬虫服务器
        console.log("[CrawlLoader] 🔍 Step 1: Checking spider server...");
        setPhase("connecting");
        setStatusText("检查爬虫服务器...");

        const healthRes = await fetch(`${BACKEND_URL}/api/crawl/health`);
        const healthData = await healthRes.json();
        console.log("[CrawlLoader] 📡 Health:", healthData);

        if (healthData.spider_server === "offline") {
          setPhase("error");
          setErrorMessage("爬虫服务器未启动！请运行: cd spider6p && npm run server");
          return;
        }

        // 预加载历史数据（不阻塞主流程）
        preloadHistoryData().catch(console.error);
        
        // 预加载 LinkedIn/Facebook 平台新闻（不阻塞主流程）
        console.log("[CrawlLoader] 🔍 Starting platform news preload (LinkedIn/Facebook)...");
        preloadPlatformNews().catch(console.error);

        // Step 2: 先连接 SSE（在触发爬虫之前！）
        console.log("[CrawlLoader] 🔌 Step 2: Connecting SSE...");
        setStatusText("连接数据流...");
        
        const eventSource = new EventSource(`${BACKEND_URL}/api/stream/all`);
        eventSourceRef.current = eventSource;

        // 等待 SSE 连接
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            console.log("[CrawlLoader] ⚠️ SSE connection timeout, continuing anyway");
            resolve();
          }, 3000);
          
          eventSource.onopen = () => {
            clearTimeout(timeout);
            console.log("[CrawlLoader] ✅ SSE connected!");
            if (mountedRef.current) setIsConnected(true);
            resolve();
          };
        });

        // 设置 SSE 事件处理器
        const handleStreamData = (eventType: string, event: MessageEvent) => {
          if (!mountedRef.current) return;
          try {
            const payload = JSON.parse(event.data);
            
            let score = 0;
            let platform = "UNKNOWN";
            
            if (payload.trend_score !== undefined) {
              score = payload.trend_score;
            } else if (payload.vks_score !== undefined) {
              score = payload.vks_score;
            } else if (payload.views !== undefined) {
              score = Math.min(100, Math.log10((payload.views || 0) + 1) * 10);
            }
            
            platform = payload.platform || "UNKNOWN";

            // 过滤无效数据：UNKNOWN 平台或 score 为 0
            if (platform === "UNKNOWN" || score === 0) {
              return;
            }

            console.log(`[CrawlLoader] 📊 SSE ${eventType}:`, { 
              platform, 
              score: score.toFixed(2), 
              hashtag: payload.hashtag 
            });

            dataReceivedRef.current = true;
            setLatestScore(Math.round(score));
            setCurrentPlatform(platform.toUpperCase());
            setDataCount(prev => prev + 1);

            setStreamData(prev => {
              const newPoint: StreamDataPoint = {
                time: new Date().toLocaleTimeString([], { hour12: false, minute: "2-digit", second: "2-digit" }),
                score: Math.min(100, Math.max(0, score)),
                platform: platform.toUpperCase(),
              };
              const newData = [...prev, newPoint];
              if (newData.length > 60) newData.shift();
              return newData;
            });
          } catch (e) {
            console.error(`[CrawlLoader] Parse error:`, e);
          }
        };

        eventSource.addEventListener("vks_update", (e) => handleStreamData("vks_update", e));
        eventSource.addEventListener("trend_update", (e) => handleStreamData("trend_update", e));
        eventSource.addEventListener("heartbeat", () => {
          console.log("[CrawlLoader] 💓 Heartbeat received");
        });
        
        eventSource.onerror = () => {
          console.log("[CrawlLoader] ❌ SSE error");
          if (mountedRef.current) setIsConnected(false);
        };

        // Step 3: 触发爬虫
        console.log("[CrawlLoader] 🚀 Step 3: Triggering crawler (mock mode)...");
        setPhase("crawling");
        setStatusText("启动爬虫...");

        const triggerRes = await fetch(
          `${BACKEND_URL}/api/crawl/trigger?tags=AI,trending,viral&mock=true`, 
          { method: "POST" }
        );
        const triggerData = await triggerRes.json();
        console.log("[CrawlLoader] 📡 Trigger response:", triggerData);

        // 即使触发失败，也继续轮询（可能爬虫已经在运行或已完成）
        if (!triggerData.success) {
          console.log("[CrawlLoader] ⚠️ Trigger not successful, but continuing to poll...");
        }

        setPhase("receiving");
        setStatusText("正在接收数据...");

        // Step 4: 轮询状态 - 立即执行第一次检查
        let pollCount = 0;
        
        const checkStatus = async (): Promise<boolean> => {
          console.log(`[CrawlLoader] 🔍 checkStatus() called, mounted=${mountedRef.current}`);
          if (!mountedRef.current) {
            console.log(`[CrawlLoader] ⚠️ Component unmounted, skipping check`);
            return false;
          }
          pollCount++;
          console.log(`[CrawlLoader] 🔍 Poll #${pollCount}`);

          try {
            console.log(`[CrawlLoader] 📡 Fetching status from ${BACKEND_URL}...`);
            const [statusRes, historyRes] = await Promise.all([
              fetch(`${BACKEND_URL}/api/crawl/status`),
              fetch(`${BACKEND_URL}/api/history/stats`)
            ]);
            
            console.log(`[CrawlLoader] 📡 Got responses: status=${statusRes.status}, history=${historyRes.status}`);
            
            const status = await statusRes.json();
            const historyStats = await historyRes.json().catch(() => ({ total_records: 0 }));

            console.log(`[CrawlLoader] 📡 Poll #${pollCount}: running=${status.is_running}, records=${historyStats.total_records}`);

            if (status.current_platform && status.current_platform !== "IDLE") {
              setCurrentPlatform(status.current_platform);
              setStatusText(`正在爬取: ${status.current_platform}`);
            }

            // 完成条件：爬虫停止 且 有历史数据（不依赖 SSE）
            const hasData = historyStats.total_records > 0;
            
            if (!status.is_running && hasData) {
              console.log("[CrawlLoader] ✅ Crawl complete!");
              setCrawlComplete(true);
              setPhase("complete");
              setStatusText("爬取完成！");
              return true; // 完成
            }

            // 超时保护 (60秒)
            if (pollCount >= 30) {
              console.log("[CrawlLoader] ⏰ Timeout, forcing complete");
              setCrawlComplete(true);
              setPhase("complete");
              setStatusText("超时完成");
              return true; // 完成
            }
            
            return false; // 继续轮询
          } catch (e) {
            console.error("[CrawlLoader] Poll error:", e);
            return false;
          }
        };
        
        // 立即执行第一次检查
        console.log("[CrawlLoader] 🔄 Starting status polling...");
        let firstCheckComplete = false;
        try {
          console.log("[CrawlLoader] 🔄 Calling checkStatus()...");
          firstCheckComplete = await checkStatus();
          console.log("[CrawlLoader] 🔄 checkStatus() returned:", firstCheckComplete);
        } catch (checkError) {
          console.error("[CrawlLoader] ❌ checkStatus() error:", checkError);
        }
        
        if (!firstCheckComplete && mountedRef.current) {
          console.log("[CrawlLoader] 🔄 Starting interval polling...");
          // 如果第一次检查未完成，启动定时轮询
          pollIntervalRef.current = setInterval(async () => {
            const complete = await checkStatus();
            if (complete && pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }, 2000);
        }

      } catch (error) {
        console.error("[CrawlLoader] Init error:", error);
        if (mountedRef.current) {
          setPhase("error");
          setErrorMessage("初始化失败: " + (error as Error).message);
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

  // 完成后进入主页面
  useEffect(() => {
    console.log(`[CrawlLoader] 🔄 Check: crawlComplete=${crawlComplete}`);
    if (crawlComplete) {
      console.log("[CrawlLoader] 🎉 Entering main page in 1.5s...");
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
        <h2 className="text-xl font-bold text-white mb-2">启动失败</h2>
        <p className="text-red-400 text-center max-w-md mb-6">{errorMessage}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500">
          重试
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `radial-gradient(#00d4ff 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-gradient-to-tr from-indigo-900/40 to-purple-900/40 rounded-full blur-[120px] pointer-events-none" />

      <motion.div className="mb-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="w-24 h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center">
          <motion.div animate={{ rotateY: [0, 10, 0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <ButterflyIcon className="w-14 h-14 text-white drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]" />
          </motion.div>
        </div>
      </motion.div>

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-black text-white">
          TREND<span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">PULSE</span>
        </h1>
        <p className="text-[10px] text-slate-500 font-mono tracking-widest">REAL-TIME SOCIAL INTELLIGENCE</p>
      </div>

      <div className="w-[90%] max-w-3xl h-48 mb-6 relative">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <LiveWaveChart data={streamData} />

          <div className="absolute top-3 left-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
            <span className="text-[10px] font-mono text-slate-400">{isConnected ? "LIVE STREAM" : "CONNECTING..."}</span>
          </div>

          <div className="absolute top-3 right-4 flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block">SCORE</span>
              <span className={`text-xl font-bold ${latestScore > 70 ? "text-green-400" : latestScore > 40 ? "text-yellow-400" : "text-slate-400"}`}>
                {latestScore}
              </span>
            </div>
            {currentPlatform && (
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 block">PLATFORM</span>
                <span className="text-sm font-bold text-cyan-400">{currentPlatform}</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-3 left-4">
            <span className="text-[10px] font-mono text-slate-500">{dataCount} signals received</span>
          </div>

          <div className="absolute bottom-3 right-4">
            <span className={`text-[10px] font-mono px-2 py-1 rounded ${crawlComplete ? "bg-green-900/50 text-green-400 border border-green-500/30" : "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30"}`}>
              {crawlComplete ? "✓ COMPLETE" : "⏳ CRAWLING..."}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <PhaseIcon size={16} className={`${phaseConfig[phase].color} ${phase !== "complete" ? "animate-pulse" : ""}`} />
        <span className={`text-sm font-mono ${phaseConfig[phase].color}`}>{statusText}</span>
      </div>

      <p className="text-[10px] text-slate-600 font-mono">POWERED BY CONFLUENT KAFKA + SPIDER6P</p>
    </motion.div>
  );
}
