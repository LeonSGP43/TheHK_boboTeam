import { useState, useEffect, useRef, useCallback } from 'react';
import { BACKEND_URL } from '../config/env';

export interface VKSDataPoint {
  time: string;
  vks: number;
  velocity: number;
  acceleration: number;
  hashtag?: string;
  platform?: string;
  author?: string;
  description?: string;
  post_id?: string;
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// 全局缓存：存储接收到的真实数据用于回放
let cachedRealData: VKSDataPoint[] = [];

export const useTrendData = () => {
  const [data, setData] = useState<VKSDataPoint[]>([]);
  const [currentVKS, setCurrentVKS] = useState(0);
  const [currentHashtag, setCurrentHashtag] = useState<string>('');
  const [currentPlatform, setCurrentPlatform] = useState<string>('');
  const [currentAuthor, setCurrentAuthor] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [dataSource, setDataSource] = useState<'backend' | 'replay'>('replay');

  const lastVKSRef = useRef<number>(0);
  const lastVelocityRef = useRef<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replayIndexRef = useRef<number>(0);
  const lastRealDataTimeRef = useRef<number>(0);

  // 连接后端 SSE
  const connectToBackend = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus('connecting');
    console.log('[VKS] 正在连接后端 SSE...', `${BACKEND_URL}/api/stream/all`);

    try {
      const eventSource = new EventSource(`${BACKEND_URL}/api/stream/all`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[VKS] ✅ SSE 连接成功');
        setConnectionStatus('connected');
        setDataSource('backend');
      };

      // 处理 VKS 数据
      const handleVKSData = (payload: any) => {
        const newVKS = payload.vks_score || payload.trend_score || 0;
        if (newVKS === 0) return; // 忽略无效数据

        const velocity = newVKS - lastVKSRef.current;
        const acceleration = velocity - lastVelocityRef.current;

        lastVKSRef.current = newVKS;
        lastVelocityRef.current = velocity;
        lastRealDataTimeRef.current = Date.now();

        const normalizedVKS = Math.max(0, Math.min(100, newVKS));

        const newPoint: VKSDataPoint = {
          time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
          vks: Math.round(normalizedVKS),
          velocity: Math.round(velocity * 10) / 10,
          acceleration: Math.round(acceleration * 10) / 10,
          hashtag: payload.hashtag,
          platform: payload.platform,
          author: payload.author,
          description: payload.description,
          post_id: payload.post_id,
          metrics: payload.metrics
        };

        // 缓存真实数据用于回放（最多保存 200 条）
        if (newPoint.vks > 0) {
          cachedRealData.push(newPoint);
          if (cachedRealData.length > 200) {
            cachedRealData = cachedRealData.slice(-200);
          }
        }

        setCurrentVKS(Math.round(normalizedVKS));
        setCurrentHashtag(payload.hashtag || '');
        setCurrentPlatform(payload.platform || '');
        setCurrentAuthor(payload.author || '');
        setDataSource('backend');

        setData((prev: VKSDataPoint[]) => {
          const newData = [...prev, newPoint];
          if (newData.length > 60) newData.shift();
          return newData;
        });
      };

      eventSource.addEventListener('vks_update', (event) => {
        try {
          const payload = JSON.parse(event.data);
          handleVKSData(payload);
        } catch (e) {
          console.error('[VKS] 解析 vks_update 失败:', e);
        }
      });

      eventSource.addEventListener('trend_update', (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.trend_score && payload.trend_score > 0) {
            handleVKSData(payload);
          }
        } catch (e) {
          // 忽略
        }
      });

      eventSource.addEventListener('heartbeat', () => {
        console.log('[VKS] 💓 心跳');
      });

      eventSource.onerror = () => {
        console.error('[VKS] ❌ SSE 连接错误');
        setConnectionStatus('error');
        eventSource.close();
        eventSourceRef.current = null;

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[VKS] 尝试重新连接...');
          connectToBackend();
        }, 5000);
      };

    } catch (error) {
      console.error('[VKS] 创建 SSE 连接失败:', error);
      setConnectionStatus('error');
    }
  }, []);

  // 初始化
  useEffect(() => {
    // 初始化空数据
    const initialData: VKSDataPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      initialData.push({
        time: new Date(now - i * 1000).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        vks: 0,
        velocity: 0,
        acceleration: 0
      });
    }
    setData(initialData);

    // 连接后端
    connectToBackend();

    // 定时器：检查是否需要回放数据
    const tickInterval = setInterval(() => {
      const timeSinceLastData = Date.now() - lastRealDataTimeRef.current;
      
      // 如果超过 2 秒没有新数据，且有缓存数据，则快速回放
      if (timeSinceLastData > 2000 && cachedRealData.length > 0) {
        // 获取回放数据
        const replayPoint = cachedRealData[replayIndexRef.current % cachedRealData.length];
        replayIndexRef.current++;

        // 添加随机波动让图表更生动
        const variation = (Math.random() - 0.5) * 20;
        const vksWithVariation = Math.max(0, Math.min(100, replayPoint.vks + variation));

        // 更新时间戳为当前时间
        const newPoint: VKSDataPoint = {
          ...replayPoint,
          vks: Math.round(vksWithVariation),
          velocity: Math.round((Math.random() - 0.5) * 20),
          acceleration: Math.round((Math.random() - 0.5) * 10),
          time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })
        };

        setCurrentVKS(newPoint.vks);
        setCurrentHashtag(newPoint.hashtag || '');
        setCurrentPlatform(newPoint.platform || '');
        setCurrentAuthor(newPoint.author || '');
        setDataSource('replay');

        setData((prev: VKSDataPoint[]) => {
          const newData = [...prev, newPoint];
          if (newData.length > 60) newData.shift();
          return newData;
        });
      }
    }, 500); // 每 500ms 更新一次，更快的回放速度

    return () => {
      clearInterval(tickInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connectToBackend]);

  return {
    data,
    currentVKS,
    currentHashtag,
    currentPlatform,
    currentAuthor,
    connectionStatus,
    dataSource,
    reconnect: connectToBackend,
    // 缓存数据数量（用于调试）
    cachedCount: cachedRealData.length
  };
};
