import { TrendItem } from './types';

export const APP_NAME = "TrendPulse AI";

export const CATEGORIES = [
  "Tech & AI",
  "Crypto & Web3",
  "Marketing",
  "YouTube",
  "LinkedIn",
  "Pop Culture",
  "Global News"
];

const RAW_TRENDS: Omit<TrendItem, 'history'>[] = [
  // --- TECH & AI ---
  {
    id: 't1',
    topic: 'Gemini 2.5 Flash Release',
    category: 'Tech & AI',
    volume: 12500,
    velocity: 124,
    sentiment: 'positive',
    platforms: ['Twitter', 'HackerNews'],
    timestamp: Date.now(),
    summary: 'Google releases Gemini 2.5 Flash with sub-millisecond latency and enhanced reasoning.'
  },
  {
    id: 't2',
    topic: 'NVIDIA GTC 2025 Leaks',
    category: 'Tech & AI',
    volume: 9800,
    velocity: 85,
    sentiment: 'positive',
    platforms: ['Reddit', 'Twitter'],
    timestamp: Date.now() - 1200000,
    summary: 'Rumors about the B200 chip performance metrics leaking on Reddit forums.'
  },
  {
    id: 't3',
    topic: 'React 19 Server Actions',
    category: 'Tech & AI',
    volume: 4500,
    velocity: 32,
    sentiment: 'neutral',
    platforms: ['Twitter', 'Dev.to', 'LinkedIn'],
    timestamp: Date.now() - 3600000,
    summary: 'Ongoing debate about the complexity vs benefits of Server Actions in React 19.'
  },
  {
    id: 't5',
    topic: 'Cursor IDE v2',
    category: 'Tech & AI',
    volume: 3200,
    velocity: 45,
    sentiment: 'positive',
    platforms: ['Twitter', 'YouTube'],
    timestamp: Date.now() - 8000000,
    summary: 'Developers praising the new "Composer" feature in Cursor IDE update.'
  },

  // --- CRYPTO & WEB3 ---
  {
    id: 'c1',
    topic: 'Bitcoin Halving Aftermath',
    category: 'Crypto & Web3',
    volume: 15400,
    velocity: 60,
    sentiment: 'positive',
    platforms: ['Twitter', 'Reddit'],
    timestamp: Date.now() - 1000000,
    summary: 'Analysis of miner revenue stability two months post-halving.'
  },
  {
    id: 'c2',
    topic: 'Solana Network Congestion',
    category: 'Crypto & Web3',
    volume: 8900,
    velocity: -15,
    sentiment: 'negative',
    platforms: ['Twitter', 'Discord'],
    timestamp: Date.now() - 2500000,
    summary: 'Users complaining about failed transactions during memecoin frenzy.'
  },
  {
    id: 'c5',
    topic: 'Base Chain TVL All-Time High',
    category: 'Crypto & Web3',
    volume: 6700,
    velocity: 92,
    sentiment: 'positive',
    platforms: ['Twitter', 'Farcaster'],
    timestamp: Date.now() - 600000,
    summary: 'Coinbase L2 "Base" flips Arbitrum in daily active addresses.'
  },

  // --- MARKETING ---
  {
    id: 'm1',
    topic: 'TikTok "Silent Reviews"',
    category: 'Marketing',
    volume: 34000,
    velocity: 210,
    sentiment: 'neutral',
    platforms: ['TikTok', 'Instagram'],
    timestamp: Date.now() - 500000,
    summary: 'Influencers reviewing products using only facial expressions, becoming a viral format.'
  },
  {
    id: 'm2',
    topic: 'LinkedIn Algorithm Change',
    category: 'Marketing',
    volume: 5800,
    velocity: 40,
    sentiment: 'negative',
    platforms: ['LinkedIn', 'Twitter'],
    timestamp: Date.now() - 1500000,
    summary: 'Creators reporting drop in reach for image-only posts.'
  },
  {
    id: 'm3',
    topic: 'UGC vs. AI Ads',
    category: 'Marketing',
    volume: 4500,
    velocity: 18,
    sentiment: 'neutral',
    platforms: ['LinkedIn', 'Twitter'],
    timestamp: Date.now() - 3000000,
    summary: 'Brands A/B testing human UGC against AI-generated avatars for ad creatives.'
  },
  
  // --- YOUTUBE ---
  {
    id: 'y1',
    topic: 'MrBeast Analytics Leak',
    category: 'YouTube',
    volume: 82000,
    velocity: 150,
    sentiment: 'neutral',
    platforms: ['YouTube', 'Twitter'],
    timestamp: Date.now() - 900000,
    summary: 'Leaked retention charts show exactly how MrBeast optimizes the first 30 seconds.'
  },
  {
    id: 'y2',
    topic: 'Shorts vs Long-form Revenue',
    category: 'YouTube',
    volume: 12000,
    velocity: 45,
    sentiment: 'negative',
    platforms: ['YouTube', 'Reddit'],
    timestamp: Date.now() - 3600000,
    summary: 'Creators expressing frustration over low RPM on Shorts despite high views.'
  },
  {
    id: 'y3',
    topic: 'Video Essays 2.0',
    category: 'YouTube',
    volume: 25000,
    velocity: 75,
    sentiment: 'positive',
    platforms: ['YouTube'],
    timestamp: Date.now() - 7200000,
    summary: 'A new wave of highly edited, documentary-style video essays gaining traction.'
  },

  // --- LINKEDIN ---
  {
    id: 'l1',
    topic: 'Founder-led Sales',
    category: 'LinkedIn',
    volume: 5600,
    velocity: 35,
    sentiment: 'positive',
    platforms: ['LinkedIn'],
    timestamp: Date.now() - 1800000,
    summary: 'SaaS founders shifting from SDR teams to personal branding and direct outreach.'
  },
  {
    id: 'l2',
    topic: '"Open to Work" Stigma',
    category: 'LinkedIn',
    volume: 8900,
    velocity: 60,
    sentiment: 'neutral',
    platforms: ['LinkedIn', 'Twitter'],
    timestamp: Date.now() - 4200000,
    summary: 'Recruiters debating whether the green banner helps or hurts candidate chances.'
  },
  {
    id: 'l3',
    topic: 'AI Policy Templates',
    category: 'LinkedIn',
    volume: 4100,
    velocity: 90,
    sentiment: 'positive',
    platforms: ['LinkedIn'],
    timestamp: Date.now() - 5400000,
    summary: 'Viral post sharing enterprise-grade internal AI usage policy templates.'
  },

  // --- POP CULTURE ---
  {
    id: 'p1',
    topic: 'Dune: Prophecy Trailer',
    category: 'Pop Culture',
    volume: 45000,
    velocity: 300,
    sentiment: 'positive',
    platforms: ['YouTube', 'Twitter', 'Reddit'],
    timestamp: Date.now() - 200000,
    summary: 'HBO releases first look at the Bene Gesserit origin story series.'
  },
  {
    id: 'p5',
    topic: 'Viral "Cucumber Guy"',
    category: 'Pop Culture',
    volume: 89000,
    velocity: 450,
    sentiment: 'positive',
    platforms: ['TikTok', 'Instagram'],
    timestamp: Date.now() - 500000,
    summary: 'Logan Moffitt\'s cucumber salad recipes taking over TikTok FYP.'
  },

  // --- GLOBAL NEWS ---
  {
    id: 'g1',
    topic: 'SpaceX Starship IFT-5',
    category: 'Global News',
    volume: 62000,
    velocity: 180,
    sentiment: 'positive',
    platforms: ['Twitter', 'YouTube'],
    timestamp: Date.now() - 800000,
    summary: 'Successful catch of the Super Heavy booster by Mechazilla.'
  },
  {
    id: 'g3',
    topic: 'US Election Debates',
    category: 'Global News',
    volume: 95000,
    velocity: 95,
    sentiment: 'negative',
    platforms: ['Twitter', 'Reddit', 'Facebook'],
    timestamp: Date.now() - 1500000,
    summary: 'Clips from the recent debate circulating with intense polarization.'
  }
];

// Enrich raw trends with sparkline history data
export const INITIAL_TRENDS: TrendItem[] = RAW_TRENDS.map(t => ({
  ...t,
  // Generate 20 data points resembling a volatile trend around the base volume
  history: Array.from({ length: 20 }, (_, i) => {
    const randomFlux = (Math.random() - 0.5) * (t.volume * 0.4);
    return Math.max(100, Math.floor(t.volume + randomFlux));
  })
}));