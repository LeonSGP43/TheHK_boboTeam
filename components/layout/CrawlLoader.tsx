/**
 * CrawlLoader - 开屏加载页面（改版）
 *
 * 功能：
 * 1. 每次启动时触发爬虫
 * 2. 显示水晶蝴蝶 Logo（3D 旋转 + 翅膀动画）
 * 3. 透明词云从底部缓缓上升
 * 4. 底部淡化数据流波形（保留实时 SSE 功能）
 * 5. 爬取完成后进入主页面
 *
 * 设计参考：PRD updatePRDv1.md
 * 三层布局结构：
 * - Layer 3 (z-20): 蝴蝶 Logo + 状态文字
 * - Layer 2 (z-10): 透明词云
 * - Layer 1 (z-0): 淡化数据流
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Wifi, Radio, AlertCircle } from "lucide-react";
// 导入统一的环境变量配置
import { BACKEND_URL } from "../../config/env";
// 导入预加载服务（老龚新增的功能）
import { preloadHistoryData } from "../../services/historyCache";
import { preloadPlatformNews } from "../../services/platformNewsCache";

// ============================================
// 配置常量
// ============================================

// 颜色配置
const COLORS = {
  cyan: "#00F0FF",
  purple: "#BD00FF",
  pink: "#FF7E5F",
  bg: "#050505"
};

// 词云热词列表 - 现代科技感词汇
// 分为三组：AI/Gemini 技术词、趋势分析词、现代概念词
const WORD_LIST = [
  // Gemini & AI 核心技术
  "MULTIMODAL", "INFERENCE", "NEURAL", "REASONING", "GENERATIVE", "VECTOR",
  // 趋势与数据洞察
  "VELOCITY", "SENTIMENT", "RESONANCE", "SIGNAL", "PREDICTIVE", "MOMENTUM",
  // 现代科技概念
  "FLUX", "NEXUS", "COGNITIVE", "SPECTRUM", "PULSE", "VISION",
  // 补充词汇
  "GEMINI", "INSIGHT", "PATTERN", "REAL-TIME"
];

// ============================================
// 类型定义
// ============================================

interface CrawlLoaderProps {
  onComplete: () => void;
}

interface StreamDataPoint {
  time: string;
  score: number;
  platform: string;
}

interface ParticleWord {
  id: number;
  text: string;
  left: number;
  scale: number;
  duration: number;
  delay: number;
}

type CrawlPhase = "init" | "connecting" | "crawling" | "receiving" | "complete" | "error";

// 打字机效果的状态文字映射（需要在 CrawlPhase 定义之后）
const TYPEWRITER_TEXTS: Record<CrawlPhase, string> = {
  init: "Initializing system...",
  connecting: "Connecting to data stream...",
  crawling: "Activating crawlers...",
  receiving: "Ingesting social signals...",
  complete: "System Ready",
  error: "Connection failed"
};

// ============================================
// 子组件：透明词云 (Layer 2)
// 响应式：小屏幕显示更少词云，避免视觉拥挤
// 优化：使用 Sans 字体 + 大写 + 字间距 + 景深模糊
// ============================================

interface WordConfig extends ParticleWord {
  blur: number;      // 模糊程度（景深效果）
  opacity: number;   // 透明度层次
}

const FloatingWordCloud: React.FC = () => {
  // 检测是否为小屏幕（手机端）
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 使用 useMemo 避免重复计算，小屏幕只显示一半的词云
  const words: WordConfig[] = useMemo(() => {
    const wordCount = isMobile ? 12 : 22; // 手机端减少词云数量
    return WORD_LIST.slice(0, wordCount).map((text, i) => {
      // 根据位置决定"深度"，离中心越远越模糊
      const depth = Math.random();
      return {
        id: i,
        text,
        left: Math.random() * 80 + 10, // 10% - 90% 水平位置
        scale: isMobile ? (0.55 + Math.random() * 0.35) : (0.65 + Math.random() * 0.5), // 字体大小
        duration: 25 + Math.random() * 20, // 25-45 秒上升时间（更慢更优雅）
        delay: Math.random() * 18, // 0-18 秒延迟
        blur: depth > 0.6 ? 1.5 : (depth > 0.3 ? 0.8 : 0), // 景深模糊
        opacity: depth > 0.6 ? 0.08 : (depth > 0.3 ? 0.15 : 0.25), // 透明度层次
      };
    });
  }, [isMobile]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {words.map((word) => (
        <motion.div
          key={word.id}
          // 使用 Sans 字体 + 大写 + 宽字间距 = 高端科技感
          className="absolute bottom-[-60px] font-sans font-semibold whitespace-nowrap tracking-[0.15em] select-none"
          style={{
            left: `${word.left}%`,
            fontSize: `${word.scale}rem`,
            filter: `blur(${word.blur}px)`,
            // 微妙的渐变色文字
            background: word.opacity > 0.2
              ? 'linear-gradient(135deg, rgba(0,240,255,0.4) 0%, rgba(189,0,255,0.3) 100%)'
              : 'rgba(255,255,255,0.15)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          animate={{
            y: ["0vh", "-120vh"],
            opacity: [0, word.opacity, word.opacity * 0.5, 0]
          }}
          transition={{
            duration: word.duration,
            repeat: Infinity,
            delay: word.delay,
            ease: "linear"
          }}
        >
          {word.text}
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// 子组件：打字机效果文字
// ============================================

const TypewriterText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 当文字改变时重置
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 40); // 每个字符 40ms
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  return (
    <span className={className}>
      {displayText}
      {/* 闪烁光标 */}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-[2px] h-[1em] bg-current ml-0.5 align-middle"
      />
    </span>
  );
};

// ============================================
// 子组件：水晶蝴蝶 Logo (Layer 3)
// ============================================

const CrystalButterfly: React.FC = () => {
  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* 响应式蝴蝶尺寸：手机 w-40，平板 w-48，桌面 w-52 */}
      <svg viewBox="0 0 200 200" className="w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 overflow-visible">
        <defs>
          {/* 彩虹渐变 */}
          <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.cyan} />
            <stop offset="50%" stopColor={COLORS.purple} />
            <stop offset="100%" stopColor={COLORS.pink} />
          </linearGradient>
          {/* 辉光滤镜 */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 左翅膀 - 柔和形态变换动画 */}
        <motion.g style={{ transformOrigin: "100px 100px" }}>
          <motion.path
            d="M100 120 C 100 120, 60 40, 20 60 C 0 80, 20 140, 60 160 C 80 170, 100 170, 100 170"
            fill="url(#wingGradient)"
            fillOpacity="0.5"
            stroke="white"
            strokeWidth="0.5"
            strokeOpacity="0.4"
            filter="url(#glow)"
            animate={{
              d: [
                "M100 120 C 100 120, 60 40, 20 60 C 0 80, 20 140, 60 160 C 80 170, 100 170, 100 170",
                "M100 122 C 100 122, 65 45, 25 65 C 5 85, 25 145, 62 162 C 82 172, 100 172, 100 172",
                "M100 120 C 100 120, 60 40, 20 60 C 0 80, 20 140, 60 160 C 80 170, 100 170, 100 170"
              ]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* 右翅膀 - 柔和形态变换动画 */}
        <motion.g style={{ transformOrigin: "100px 100px" }}>
          <motion.path
            d="M100 120 C 100 120, 140 40, 180 60 C 200 80, 180 140, 140 160 C 120 170, 100 170, 100 170"
            fill="url(#wingGradient)"
            fillOpacity="0.7"
            stroke="white"
            strokeWidth="0.5"
            strokeOpacity="0.5"
            filter="url(#glow)"
            animate={{
              d: [
                "M100 120 C 100 120, 140 40, 180 60 C 200 80, 180 140, 140 160 C 120 170, 100 170, 100 170",
                "M100 122 C 100 122, 135 45, 175 65 C 195 85, 175 145, 138 162 C 118 172, 100 172, 100 172",
                "M100 120 C 100 120, 140 40, 180 60 C 200 80, 180 140, 140 160 C 120 170, 100 170, 100 170"
              ]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* 科技节点连线 (分子覆盖层) */}
        <g className="mix-blend-overlay">
          <motion.line x1="100" y1="120" x2="140" y2="60" stroke={COLORS.cyan} strokeWidth="1"
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.line x1="140" y1="60" x2="180" y2="100" stroke={COLORS.cyan} strokeWidth="1"
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
          />
          <motion.line x1="100" y1="120" x2="60" y2="60" stroke={COLORS.cyan} strokeWidth="1"
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
          />

          {/* 节点圆点 */}
          <motion.circle cx="140" cy="60" r="3" fill="white"
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.circle cx="180" cy="100" r="2" fill={COLORS.cyan}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
          <motion.circle cx="60" cy="60" r="3" fill="white"
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          />
          <motion.circle cx="20" cy="100" r="2" fill={COLORS.cyan}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
          />
        </g>

        {/* 中央躯体 (光源) */}
        <ellipse cx="100" cy="140" rx="4" ry="35" fill="white" opacity="0.6" filter="blur(4px)" />
        <ellipse cx="100" cy="140" rx="2" ry="28" fill="white" />
      </svg>
    </motion.div>
  );
};

// ============================================
// 子组件：实时波形图 (Layer 1 - 淡化数据流)
// ============================================

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

    // 渐变填充
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

    // 线条渐变
    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, COLORS.cyan);
    lineGradient.addColorStop(0.5, COLORS.purple);
    lineGradient.addColorStop(1, COLORS.pink);

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
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();

    // 最后一个点的辉光效果
    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      const lastX = (data.length - 1) * pointWidth;
      const lastY = height - (lastPoint.score / 100) * height * 0.8 - height * 0.1;

      const glowGradient = ctx.createRadialGradient(lastX, lastY, 0, lastX, lastY, 15);
      glowGradient.addColorStop(0, "rgba(0, 240, 255, 0.6)");
      glowGradient.addColorStop(1, "rgba(0, 240, 255, 0)");

      ctx.beginPath();
      ctx.arc(lastX, lastY, 15, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.cyan;
      ctx.fill();
    }
  }, [data]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />;
};

// ============================================
// 主组件：CrawlLoader
// ============================================

export function CrawlLoader({ onComplete }: CrawlLoaderProps) {
  // 状态管理
  const [phase, setPhase] = useState<CrawlPhase>("init");
  const [statusText, setStatusText] = useState("Initializing...");
  const [streamData, setStreamData] = useState<StreamDataPoint[]>([]);
  const [latestScore, setLatestScore] = useState(0);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [dataCount, setDataCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [crawlComplete, setCrawlComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const dataReceivedRef = useRef(false);
  const mountedRef = useRef(true);
  const initCalledRef = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================
  // 初始化：连接 SSE + 触发爬虫
  // ============================================
  useEffect(() => {
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
        setStatusText("Checking server...");

        const healthRes = await fetch(`${BACKEND_URL}/api/crawl/health`);
        const healthData = await healthRes.json();
        console.log("[CrawlLoader] 📡 Health:", healthData);

        if (healthData.spider_server === "offline") {
          setPhase("error");
          setErrorMessage("Spider server not running! Please run: cd spider6p && npm run server");
          return;
        }

        // Step 1.5: 预加载历史数据和平台新闻（老龚新增的功能）
        // 这些请求会在后台并行执行，不阻塞主流程
        console.log("[CrawlLoader] 🚀 Step 1.5: Preloading data in background...");
        preloadHistoryData().catch(err => console.error("[CrawlLoader] ❌ History preload failed:", err));
        preloadPlatformNews().catch(err => console.error("[CrawlLoader] ❌ News preload failed:", err));

        // Step 2: 先连接 SSE
        console.log("[CrawlLoader] 🔌 Step 2: Connecting SSE...");
        setStatusText("Connecting to data stream...");

        const eventSource = new EventSource(`${BACKEND_URL}/api/stream/all`);
        eventSourceRef.current = eventSource;

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
        setStatusText("Starting crawler...");

        const triggerRes = await fetch(
          `${BACKEND_URL}/api/crawl/trigger?tags=AI,trending,viral&mock=true`,
          { method: "POST" }
        );
        const triggerData = await triggerRes.json();
        console.log("[CrawlLoader] 📡 Trigger response:", triggerData);

        if (!triggerData.success) {
          console.log("[CrawlLoader] ⚠️ Trigger not successful, but continuing to poll...");
        }

        setPhase("receiving");
        setStatusText("Receiving data...");

        // Step 4: 轮询状态
        let pollCount = 0;

        const checkStatus = async (): Promise<boolean> => {
          if (!mountedRef.current) return false;
          pollCount++;
          console.log(`[CrawlLoader] 🔍 Poll #${pollCount}`);

          try {
            const [statusRes, historyRes] = await Promise.all([
              fetch(`${BACKEND_URL}/api/crawl/status`),
              fetch(`${BACKEND_URL}/api/history/stats`)
            ]);

            const status = await statusRes.json();
            const historyStats = await historyRes.json().catch(() => ({ total_records: 0 }));

            console.log(`[CrawlLoader] 📡 Poll #${pollCount}: running=${status.is_running}, records=${historyStats.total_records}`);

            if (status.current_platform && status.current_platform !== "IDLE") {
              setCurrentPlatform(status.current_platform);
              setStatusText(`Crawling: ${status.current_platform}`);
            }

            const hasData = historyStats.total_records > 0;

            if (!status.is_running && hasData) {
              console.log("[CrawlLoader] ✅ Crawl complete!");
              setCrawlComplete(true);
              setPhase("complete");
              setStatusText("System ready");
              return true;
            }

            // 超时保护 (60秒)
            if (pollCount >= 30) {
              console.log("[CrawlLoader] ⏰ Timeout, forcing complete");
              setCrawlComplete(true);
              setPhase("complete");
              setStatusText("Timeout complete");
              return true;
            }

            return false;
          } catch (e) {
            console.error("[CrawlLoader] Poll error:", e);
            return false;
          }
        };

        // 立即执行第一次检查
        console.log("[CrawlLoader] 🔄 Starting status polling...");
        const firstCheckComplete = await checkStatus();

        if (!firstCheckComplete && mountedRef.current) {
          console.log("[CrawlLoader] 🔄 Starting interval polling...");
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

  // 完成后进入主页面
  useEffect(() => {
    if (crawlComplete) {
      console.log("[CrawlLoader] 🎉 Entering main page in 1.5s...");
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [crawlComplete, onComplete]);

  // 状态配置
  const phaseConfig: Record<CrawlPhase, { color: string; icon: React.ElementType }> = {
    init: { color: "text-slate-400", icon: Loader2 },
    connecting: { color: "text-yellow-400", icon: Wifi },
    crawling: { color: "text-cyan-400", icon: Radio },
    receiving: { color: "text-purple-400", icon: Radio },
    complete: { color: "text-green-400", icon: CheckCircle2 },
    error: { color: "text-red-400", icon: AlertCircle },
  };

  const PhaseIcon = phaseConfig[phase].icon;

  // ============================================
  // 错误状态渲染
  // ============================================
  if (phase === "error") {
    return (
      <motion.div
        className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center"
        exit={{ opacity: 0 }}
      >
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Startup Failed</h2>
        <p className="text-red-400 text-center max-w-md mb-6">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  // ============================================
  // 主渲染：三层布局
  // ============================================
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* 背景网格 */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(${COLORS.cyan} 1px, transparent 1px)`,
          backgroundSize: "30px 30px"
        }}
      />

      {/* 背景极光 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-gradient-to-tr from-indigo-900/30 to-purple-900/30 rounded-full blur-[120px] pointer-events-none" />

      {/* ===== Layer 1: 底部淡化数据流 (z-0) ===== */}
      <div
        className="absolute bottom-0 w-full h-56 z-0 opacity-25 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%)'
        }}
      >
        <LiveWaveChart data={streamData} />

        {/* 数据流状态标签 */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
          <span className="text-[9px] font-mono text-slate-500">{dataCount} signals</span>
        </div>
      </div>

      {/* ===== Layer 2: 透明词云 (z-10) ===== */}
      <FloatingWordCloud />

      {/* ===== Layer 3: 核心展示区 (z-20) ===== */}
      {/* 使用绝对定位固定核心视觉区域位置，防止动态内容导致布局跳动 */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">

        {/* 玻璃容器 + 蝴蝶 Logo - 固定在视觉中心偏上位置 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateX: 15 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-6 sm:mb-8 pointer-events-auto"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            animate={{ rotateX: [3, -2, 3], rotateY: [-3, 2, -3] }}
            transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
            className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] flex items-center justify-center shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_30px_rgba(255,255,255,0.03)] overflow-hidden"
          >
            {/* 边缘高光 */}
            <div className="absolute inset-0 rounded-[2.5rem] sm:rounded-[3rem] border border-white/15 opacity-60" />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/8 to-transparent pointer-events-none rounded-t-[2.5rem] sm:rounded-t-[3rem]" />

            {/* 蝴蝶 SVG */}
            <CrystalButterfly />
          </motion.div>
        </motion.div>

        {/* 品牌名 */}
        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            TREND<span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">PULSE</span>
          </h1>
          <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono tracking-[0.2em] sm:tracking-[0.25em] mt-1">
            REAL-TIME SOCIAL INTELLIGENCE
          </p>
        </div>

        {/* 状态指示器 */}
        <div className="flex flex-col items-center gap-3">
          {/* 打字机效果状态文字 */}
          <div className="flex items-center gap-2 min-h-[24px]">
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className={`w-2 h-2 rounded-full flex-shrink-0 ${phase === "complete" ? "bg-green-400 shadow-[0_0_10px_#00FF00]" : "bg-cyan-400 shadow-[0_0_10px_#00F0FF]"}`}
            />
            <PhaseIcon
              size={14}
              className={`flex-shrink-0 ${phaseConfig[phase].color} ${phase !== "complete" ? "animate-spin" : ""}`}
            />
            <TypewriterText
              text={TYPEWRITER_TEXTS[phase]}
              className={`text-xs font-mono tracking-wider ${phaseConfig[phase].color}`}
            />
          </div>

          {/* 进度条 - 带脉冲动画 */}
          <div className="w-40 sm:w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
              initial={{ width: "0%" }}
              animate={{
                width: phase === "complete" ? "100%" :
                       phase === "receiving" ? "75%" :
                       phase === "crawling" ? "50%" :
                       phase === "connecting" ? "25%" : "10%"
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {/* 进度条尾部光点 */}
            {phase !== "complete" && (
              <motion.div
                className="absolute top-0 h-full w-4 bg-gradient-to-r from-transparent to-white/50"
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>

          {/* 实时数据统计 - 预留固定高度防止布局跳动 */}
          <div className="h-12 flex items-center justify-center mt-2">
            {(latestScore > 0 || currentPlatform) && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4"
              >
                {latestScore > 0 && (
                  <div className="text-center">
                    <span className="text-[9px] font-mono text-slate-500 block">VKS</span>
                    <span className={`text-lg font-bold ${latestScore > 70 ? "text-green-400" : latestScore > 40 ? "text-yellow-400" : "text-slate-400"}`}>
                      {latestScore}
                    </span>
                  </div>
                )}
                {currentPlatform && (
                  <div className="text-center">
                    <span className="text-[9px] font-mono text-slate-500 block">PLATFORM</span>
                    <span className="text-sm font-bold text-cyan-400">{currentPlatform}</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* 底部文字 - 固定位置 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="mt-4 sm:mt-6 text-[8px] sm:text-[9px] text-slate-600 font-mono tracking-widest"
        >
          POWERED BY CONFLUENT KAFKA + SPIDER6P
        </motion.p>
      </div>
    </motion.div>
  );
}
